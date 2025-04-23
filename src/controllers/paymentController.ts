import { Request, Response } from 'express'
import Stripe from 'stripe'
import User from '../models/userModel'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-03-31.basil',
})

export const handleStripeWebhook = async (req: Request, res: Response) :Promise<any>=> {
	console.log('✅ Webhook route hit')

	const sig = req.headers['stripe-signature']
	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(
			req.body,
			sig!,
			process.env.STRIPE_WEBHOOK_SECRET!
		)
	} catch (err: any) {
		console.error('Error verifying webhook signature:', err.message)
		return res.status(400).send(`Webhook Error: ${err.message}`)
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session
		console.log('✅ Payment Success Session:', session)

		const email = session?.customer_details?.email

		if (!email) {
			console.error(' Email not found in session')
			return res.status(400).send('Email not found in session')
		}

		try {
			const user = await User.findOneAndUpdate(
				{ email },
				{ $set: { isPremium: true } },
				{ new: true }
			)

			if (!user) {
				console.error('User not found')
				return res.status(404).send('User not found')
			}

			console.log('User upgraded to premium:', user.email)
			return res.status(200).json({ received: true })
		} catch (error) {
			console.error(' Error updating user:', error)
			return res.status(500).send('Server error')
		}
	}

	console.log(`Unhandled event type: ${event.type}`)
	return res.status(200).json({ received: true })
}
