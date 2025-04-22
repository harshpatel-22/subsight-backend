import { Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { AuthenticatedRequest } from '../middleware/auth'
import axios from 'axios'

//working fine
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
			return res
				.status(400)
				.json({ success: false, message: 'Missing required fields' })
		}

		const userId = req.user?.uid
		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: 'Unauthorized' })
		}

		const cycleMap: Record<string, number> = {
			monthly: 1,
			quarterly: 3,
			yearly: 12,
		}

		const cycleInMonths = cycleMap[billingCycle.toLowerCase()]
		if (!cycleInMonths) {
			return res
				.status(400)
				.json({ message: 'Invalid billing cycle value' })
		}

		//Currency conversion
		let convertedAmountInINR = amount

		if (currency.toUpperCase() !== 'INR') {
			const response = await axios.get(
				`https://api.exchangerate.host/convert`,
				{
					params: {
						access_key: 'f84281dcf2352f6d524a8033060cb638',
						from: currency.toUpperCase(),
						to: 'INR',
						amount,
					},
				}
			)

			if (!response.data || !response.data.result) {
				return res
					.status(400)
					.json({
						success: false,
						message: 'Currency conversion failed',
					})
			}

			convertedAmountInINR = response.data.result
		}

		const start = new Date(startDate)
		const end = new Date(start)
		end.setMonth(end.getMonth() + cycleInMonths)

		const newSubscription = new Subscription({
			user:userId,
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
	} catch (error) {
		console.error(error)
		res.status(500).json({
			success: false,
			message: 'Error creating subscription',
		})
	}
}

// working fine
export const updateSubscription = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { id } = req.params
	const userId = req.user?.uid

	if (!userId) {
		return res.status(401).json({ success: false, message: 'Unauthorized' })
	}

	try {
		const existing = await Subscription.findById(id)

		if (!existing) {
			return res
				.status(404)
				.json({ success: false, message: 'Subscription not found' })
		}

		if (existing.user.toString() !== userId) {
			return res
				.status(403)
				.json({ success: false, message: 'Access denied' })
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
				return res
					.status(400)
					.json({ success: false, message: 'Invalid billing cycle' })
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
				const response = await axios.get(
					`https://api.exchangerate.host/convert`,
					{
						params: {
							access_key: 'f84281dcf2352f6d524a8033060cb638',
							from: originalCurrency.toUpperCase(),
							to: 'INR',
							amount: originalAmount,
						},
					}
				)

				if (!response.data || !response.data.result) {
					return res.status(400).json({
						success: false,
						message: 'Currency conversion failed',
					})
				}

				existing.convertedAmountInINR = response.data.result
			}
		}

		await existing.save()

		return res.status(200).json({
			success: true,
			message: 'Subscription updated successfully',
			subscription: existing,
		})
	} catch (err) {
		console.error('Error updating subscription:', err)
		return res.status(500).json({
			success: false,
			message: 'Something went wrong while updating subscription',
		})
	}
}

//working fine
export const getAllSubscriptions = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid
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

//working fine
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
			return res.status(404).json({ success:false , message: 'Subscription not found' })
		}

		res.status(200).json({ success:true , message: 'Subscription deleted successfully' })
	} catch (error) {
		console.error('Error deleting subscription:', error)
		res.status(500).json({
			success: false,
			message: 'Internal Server Error',
		})
	}
}

//working fine
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
            return res.status(404).json({
                success:false,
                message: 'Subscription not found'
            })
		}

        res.status(200).json({
            success: true,
            subscription
        })
	} catch (error) {
		console.error('Error fetching subscription:', error)
		res.status(500).json({
			success: false,
			message: 'Internal Server Error',
		})
	}
}
