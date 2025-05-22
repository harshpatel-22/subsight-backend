import { Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { AuthenticatedRequest } from '../middleware/auth'
import { convertInINR } from '../utils/convertInINR'

export const createSubscription = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const {
		name,
		amount,
		currency,
		startDate,
		billingCycle,
		category,
		reminderDaysBefore,
		renewalMethod,
		notes,
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
			res.status(400).json({
				success: false,
				message: 'Missing required fields',
			})
			return
		}

		const userId = req.user?.uid
		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' })
			return
		}

		const cycleMap: Record<string, number> = {
			monthly: 1,
			quarterly: 3,
			yearly: 12,
		}

		const cycleInMonths = cycleMap[billingCycle.toLowerCase()]
		if (!cycleInMonths) {
			res.status(400).json({ message: 'Invalid billing cycle value' })
			return
		}

		//Currency conversion
		let convertedAmountInINR = amount

		if (currency.toUpperCase() !== 'INR') {
			const response = await convertInINR(currency.toUpperCase(), amount)

			if (!response.data || !response.data.result) {
				res.status(400).json({
					success: false,
					message: 'Currency conversion failed',
				})
				return
			}

			convertedAmountInINR = response.data.result
		}

		const start = new Date(startDate)
		const end = new Date(start)
		end.setMonth(end.getMonth() + cycleInMonths)

		const newSubscription = new Subscription({
			user: userId,
			name,
			amount,
			currency: currency.toUpperCase(),
			convertedAmountInINR,
			startDate: start,
			endDate: end,
			billingCycle: cycleInMonths,
			category,
			reminderDaysBefore,
			renewalMethod,
			notes,
		})

		await newSubscription.save()

		res.status(201).json({
			success: true,
			message: 'Subscription created successfully',
			subscription: newSubscription,
		})
		return
	} catch (error) {
		console.error(error)
		res.status(500).json({
			success: false,
			message: 'Error creating subscription',
		})
		return
	}
}

export const updateSubscription = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { id } = req.params
	const userId = req.user?.uid

	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' })
		return
	}

	try {
		const existing = await Subscription.findById(id)

		if (!existing) {
			res.status(404).json({
				success: false,
				message: 'Subscription not found',
			})
			return
		}

		if (existing.user.toString() !== userId) {
			res.status(403).json({ success: false, message: 'Access denied' })
			return
		}

		const {
			name,
			amount,
			currency,
			startDate,
			billingCycle,
			category,
			reminderDaysBefore,
			renewalMethod,
			notes,
		} = req.body

		if (name) existing.name = name
		if (amount) existing.amount = amount
		if (currency) existing.currency = currency
		if (category) existing.category = category
		if (reminderDaysBefore) existing.reminderDaysBefore = reminderDaysBefore
		if (renewalMethod) existing.renewalMethod = renewalMethod
		if (notes) existing.notes = notes

		if (startDate) {
			existing.startDate = new Date(startDate)
		}

		if (billingCycle) {
			const cycleMap: Record<string, number> = {
				monthly: 1,
				quarterly: 3,
				yearly: 12,
			}

			const cycleInMonths = cycleMap[billingCycle.toLowerCase()]
			if (!cycleInMonths) {
				res.status(400).json({
					success: false,
					message: 'Invalid billing cycle',
				})
				return
			}

			existing.billingCycle = cycleInMonths

			const start = startDate
				? new Date(startDate)
				: new Date(existing.startDate)

			const end = new Date(start)
			end.setMonth(end.getMonth() + cycleInMonths)
			existing.endDate = end
		}

		// currency conversion
		if (currency || amount) {
			const originalCurrency = currency || existing.currency
			const originalAmount = amount || existing.amount

			if (originalCurrency.toUpperCase() === 'INR') {
				existing.convertedAmountInINR = originalAmount
			} else {
				const response = await convertInINR(
					originalCurrency.toUpperCase(),
					originalAmount
				)
				if (!response.data || !response.data.result) {
					res.status(400).json({
						success: false,
						message: 'Currency conversion failed',
					})
					return
				}

				existing.convertedAmountInINR = response.data.result
			}
		}

		await existing.save()

		res.status(200).json({
			success: true,
			message: 'Subscription updated successfully',
			subscription: existing,
		})
		return
	} catch (err) {
		console.error('Error updating subscription:', err)
		res.status(500).json({
			success: false,
			message: 'Something went wrong while updating subscription',
		})
		return
	}
}

export const getAllSubscriptions = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const userId = req.user?.uid
		if (!userId) {
			res.status(401).json({ message: 'Unauthorized' })
			return
		}

		const subscriptions = await Subscription.find({ user: userId }).sort({
			createdAt: -1,
		})

		res.status(200).json({
			success: true,
			subscriptions,
		})
		return
	} catch (error) {
		console.error('Error fetching subscriptions:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to fetch subscriptions',
		})
		return
	}
}

export const deleteSubscription = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const subscription = await Subscription.findOneAndDelete({
			_id: req.params.id,
			user: req.user?.uid,
		})

		if (!subscription) {
			res.status(404).json({
				success: false,
				message: 'Subscription not found',
			})
			return
		}

		res.status(200).json({
			success: true,
			message: 'Subscription deleted successfully',
		})
		return
	} catch (error) {
		console.error('Error deleting subscription:', error)
		res.status(500).json({
			success: false,
			message: 'Internal Server Error',
		})
		return
	}
}

export const getSubscriptionById = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const subscription = await Subscription.findOne({
			_id: req.params.id,
			user: req.user?.uid,
		})

		if (!subscription) {
			res.status(404).json({
				success: false,
				message: 'Subscription not found',
			})
			return
		}

		res.status(200).json({
			success: true,
			subscription,
		})
		return
	} catch (error) {
		console.error('Error fetching subscription:', error)
		res.status(500).json({
			success: false,
			message: 'Internal Server Error',
		})
		return
	}
}
