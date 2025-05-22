import { Request, Response } from 'express'
import Stripe from 'stripe'
import User from '../models/userModel'
import { AuthenticatedRequest } from '../middleware/auth'
import dotenv from 'dotenv'
dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-04-30.basil',
})

export const createCheckoutSession = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const userId = req.user?.uid
		if (!userId) {
			res.status(401).send('User not authenticated')
			return
		}

		const { planType } = req.body

		const priceId =
			planType === 'yearly'
				? process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID
				: process.env.STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/cancel`,
			client_reference_id: userId.toString(),
			metadata: {
				planType, //for webhook
			},
		})

		res.json({ sessionId: session.id })
		return
	} catch (error) {
		console.error('Error creating checkout session:', error)
		res.status(500).send('Internal Server Error')
		return
	}
}

export const createPortalSession = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const userId = req.user?.uid
		const user = await User.findById(userId)

		if (!user || !user.stripeSubscriptionId) {
			res.status(400).json({ error: 'User not subscribed to a plan' })
			return
		}

		const subscription = await stripe.subscriptions.retrieve(
			user.stripeSubscriptionId
		)

		const customerId = subscription.customer as string

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: process.env.STRIPE_PORTAL_RETURN_URL,
		})

		res.status(200).json({ url: portalSession.url })
		return
	} catch (error) {
		console.error('Error creating Stripe portal session:', error)
		res.status(500).json({ error: 'Failed to create portal session' })
        return
	}
}

export const handleStripeWebhook = async (
	req: Request,
	res: Response
) => {
	console.log('Webhook route hit')

	const sig = req.headers['stripe-signature']
	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig!,
			process.env.STRIPE_WEBHOOK_SECRET!
		)
	} catch (err) {
		console.error('Error verifying webhook signature:')
		res.status(400).send(`Webhook Error: ${err}`)
        return
	}

	try {
		//Handle checkout.session.completed
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session
			const subscriptionId = session.subscription as string

			const planType = session.metadata?.planType

			if (!session.customer_details?.email) {
				console.error('Email not found in session data')
				res.status(400).send('Email missing in session')
                return
			}

			const email = session.customer_details.email

			console.log(`Processing premium upgrade for: ${email}`)

			const subscription = await stripe.subscriptions.retrieve(
				subscriptionId
			)

			const user = await User.findOne({ email })

			if (!user) {
				console.error(`No user found for email: ${email}`)
				res.status(404).send('User not found')
                return
			}

			user.isPremium = true
			user.stripeSubscriptionId = subscription.id
			user.planType = planType as 'monthly' | 'yearly' | undefined

			const periodEnd = subscription.items.data[0].current_period_end
			if (periodEnd && !isNaN(periodEnd)) {
				user.premiumExpiresAt = new Date(periodEnd * 1000)
			} else {
				console.warn(
					'Invalid current_period_end, falling back to 30-day estimate'
				)
			}

			await user.save()

			console.log(`User upgraded to premium: ${user.email}`)
		} else if (
			event.type === 'customer.subscription.updated' ||
			event.type === 'customer.subscription.deleted'
		) {
			const subscription = event.data.object as Stripe.Subscription

			console.log(`subscription id being process ${subscription.id}`)

			const user = await User.findOne({
				stripeSubscriptionId: subscription.id,
			})

			if (!user) {
				console.error(
					`No user found for subscription ID: ${subscription.id}`
				)
				res.status(404).send('User not found')
                return
			}
			if (
				subscription.status !== 'active' &&
				subscription.status !== 'trialing'
			) {
				user.isPremium = false
				user.premiumExpiresAt = null
				user.planType = undefined
				user.stripeSubscriptionId = ''
				await user.save()
				console.log(
					`User downgraded (subscription is not active): ${user.email}`
				)
			} else {
				//if user upgrade the subscription
				user.isPremium = true

				const priceId = subscription.items.data[0]?.price.id

				//getting plan type from the price id
				const monthlyPriceId =
					process.env.STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID
				const yearlyPriceId =
					process.env.STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID

				const validPriceIds = [monthlyPriceId, yearlyPriceId]

				if (!priceId || !validPriceIds.includes(priceId)) {
					console.error(
						`Invalid or missing price ID ${priceId} for subscription ${subscription.id}`
					)
					res.status(400).send('Invalid price ID')
                    return
				}

				const planTypeMap: { [key: string]: 'monthly' | 'yearly' } = {
					[yearlyPriceId as string]: 'yearly',
					[monthlyPriceId as string]: 'monthly',
				}

				user.planType = planTypeMap[priceId]

				// Log subscription details
				console.log(
					`Subscription update for ${user.email}: priceId=${priceId}, ` +
						`interval=${subscription.items.data[0]?.plan.interval}, ` +
						`currency=${subscription.currency}`
				)

				// Handle period end
				const periodEnd = subscription.items.data[0]?.current_period_end

				user.premiumExpiresAt = new Date(periodEnd * 1000)
				console.log('Period end:', new Date(periodEnd * 1000))

				await user.save()

				console.log(
					`User subscription updated: ${user.email}, planType: ${user.planType}`
				)
			}
		} else {
			console.log(`Unhandled event type: ${event.type}`)
		}

		res.status(200).json({ received: true })
        return
	} catch (error) {
		console.error('Error processing webhook:', error)
		res.status(500).send('Internal server error')
        return
	}
}
