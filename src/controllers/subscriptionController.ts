import { Request, Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { AuthenticatedRequest } from '../middleware/auth'

// Create a subscription
export const createSubscription = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const {
			name,
			amount,
			currency,
			startDate,
			billingCycle,
			category,
			reminderDaysBefore,
		} = req.body

		const endDate = new Date(startDate)
		endDate.setMonth(endDate.getMonth() + billingCycle) // Add billing cycle months to the start date

		const newSubscription = new Subscription({
			user: req.user?.uid,
			name,
			amount,
			currency,
			startDate,
			endDate,
			billingCycle,
			category,
			reminderDaysBefore,
			isActive: true,
		})

		await newSubscription.save()

        res.status(201).json({
            newSubscription,
            message: 'Subscription created successfully'
        })
	} catch (error) {
		console.error('Error creating subscription:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

// Get all subscriptions of the authenticated user
export const getUserSubscriptions = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const subscriptions = await Subscription.find({ user: req.user?.uid })
		res.status(200).json(subscriptions)
	} catch (error) {
		console.error('Error fetching subscriptions:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

// Get a single subscription by ID
export const getSubscriptionById = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const subscription = await Subscription.findOne({
			_id: req.params.id,
			user: req.user?.uid,
		})

		if (!subscription) {
			return res.status(404).json({ message: 'Subscription not found' })
		}

		res.status(200).json(subscription)
	} catch (error) {
		console.error('Error fetching subscription:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

// Delete a subscription
export const deleteSubscription = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const subscription = await Subscription.findOneAndDelete({
			_id: req.params.id,
			user: req.user?.uid,
		})

		if (!subscription) {
			return res.status(404).json({ message: 'Subscription not found' })
		}

		res.status(200).json({ message: 'Subscription deleted successfully' })
	} catch (error) {
		console.error('Error deleting subscription:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}

// Renew a subscription (update end date based on new cycle)
export const renewSubscription = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const { billingCycle } = req.body // User selects new billing cycle (1 month, 12 months, etc.)

		// Find the subscription
		const subscription = await Subscription.findOne({
			_id: req.params.id,
			user: req.user?.uid,
		})

		if (!subscription) {
			return res.status(404).json({ message: 'Subscription not found' })
		}

		// Calculate new end date based on billing cycle
		const newEndDate = new Date(subscription.endDate)
		newEndDate.setMonth(newEndDate.getMonth() + billingCycle)

		// Update the subscription's end date and isActive status
		subscription.endDate = newEndDate
		subscription.isActive = true

		await subscription.save()

		res.status(200).json({
			subscription,
			message: 'Renewal successful',
		})
	} catch (error) {
		console.error('Error renewing subscription:', error)
		res.status(500).json({ message: 'Internal Server Error' })
	}
}
