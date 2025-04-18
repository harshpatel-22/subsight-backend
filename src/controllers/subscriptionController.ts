import { Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { AuthenticatedRequest } from '../middleware/auth'


export const createSubscription = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const {
		name,
		amount,
		currency,
		startDate,
		billingCycle,
		category,
		reminderDaysBefore,
		renewalMethod,
	} = req.body

	try {
		if (
			!name ||
			!amount ||
			!currency ||
			!startDate ||
			!billingCycle ||
			!reminderDaysBefore ||
			!renewalMethod
		) {
			return res.status(400).json({ success:false, message: 'Missing required fields' })
		}

		const userId = req.user?.uid
		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' })
        }
        
		
	    const cycleMap: Record<string, number> = {
			'monthly': 1,
			'quarterly': 3,
			'yearly': 12,
		}

		const cycleInMonths = cycleMap[billingCycle.toLowerCase()]
		if (!cycleInMonths) {
			return res
				.status(400)
				.json({ message: 'Invalid billing cycle value' })
		}

		const start = new Date(startDate)
		const end = new Date(start)
		end.setMonth(end.getMonth() + cycleInMonths)

		const newSubscription = new Subscription({
			user: userId,
			name,
			amount,
			currency,
			startDate: start,
			endDate: end,
			billingCycle:cycleInMonths,
			category,
			reminderDaysBefore,
			renewalMethod,
		})

		await newSubscription.save()

		res.status(201).json({
			success: true,
			message: 'Subscription created successfully',
			subscription: newSubscription,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({
			success: false,
			message: 'Error creating subscription',
		})
	}
}

export const getAllSubscriptions = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid
        console.log(userId)
		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' })
		}

		const subscriptions = await Subscription.find({ user: userId }).sort({
			createdAt: -1,
		})

		res.status(200).json({
			success: true,
			subscriptions,
		})
	} catch (error) {
		console.error('Error fetching subscriptions:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to fetch subscriptions',
		})
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
