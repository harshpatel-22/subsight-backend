import { Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { AuthenticatedRequest } from '../middleware/auth'


export const getMonthlySpending = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const { month, year } = req.query
		const userId = req.user?.uid

		if (!month || !year) {
			return res.status(400).json({
				success: false,
				message: 'Month and year are required',
			})
		}

		const start = new Date(Number(year), Number(month) - 1, 1) //to get the first day of the month
		const end = new Date(Number(year), Number(month), 0, 23, 59, 59) //to get the last day of the month

		const subscriptions = await Subscription.find({
			user: userId,
			startDate: { $lte: end },
			endDate: { $gte: start },
		})

		const categoryMap: Record<string, number> = {}

		subscriptions.forEach((sub) => {
			const normalizedAmount = sub.convertedAmountInINR / sub.billingCycle //to get the spending per month
			const category = sub.category || 'Other'
			categoryMap[category] =
				(categoryMap[category] || 0) + normalizedAmount //adding in the current total of that category
		})

		//category map will contains the data of the spending per category

		const total = Object.values(categoryMap).reduce(
			(sum, val) => sum + val,
			0
		) //to get the sum of all category spending

		return res.status(200).json({
			success: true,
			total,
			data: categoryMap,
		})
	} catch (error) {
		console.error('Monthly Spending Error:', error)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}


export const getYearlySpending = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid
		const { year } = req.query

		if (!year) {
			return res
				.status(400)
				.json({ success: false, message: 'Year is required' })
		}

		const start = new Date(Number(year), 0, 1) // sets jan 1 at 00:00
		const end = new Date(Number(year), 11, 31, 23, 59, 59) //sets dec 31 at 23:59

		const subscriptions = await Subscription.find({
			user: userId,
			startDate: { $gte: start, $lte: end },
		})

		const monthlySpend: { [key: string]: number } = {}

		for (let i = 0; i < 12; i++) {
			monthlySpend[i + 1] = 0
		}

		for (const sub of subscriptions) {
			const subMonth = new Date(sub.startDate).getMonth() + 1
			monthlySpend[subMonth] += sub.convertedAmountInINR
		}

		const total = Object.values(monthlySpend).reduce((a, b) => a + b, 0)

		return res.status(200).json({
			success: true,
			year: Number(year),
			total,
			monthlySpend,
			// currency: subscriptions[0]?.currency || 'INR',
		})
	} catch (error) {
		console.error(error)
		return res
			.status(500)
			.json({ success: false, message: 'Internal server error' })
	}
}


export const getCategoryWiseSpending = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid
		const subscriptions = await Subscription.find({ user: userId })

		const categoryTotals: Record<string, number> = {}

		subscriptions.forEach((sub) => {
			const monthly = sub.convertedAmountInINR / sub.billingCycle
			categoryTotals[sub.category || ''] =
				(categoryTotals[sub.category || ''] || 0) + monthly
		})

		return res.status(200).json({
			success: true,
			data: categoryTotals,
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const getTopSubscription = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized',
			})
		}

		const subscriptions = await Subscription.find({ user: userId })

		const topSubscriptions = subscriptions
			.map((sub) => ({
				name: sub.name,
				monthlyCost: sub.convertedAmountInINR / sub.billingCycle,
			}))
			.sort((a, b) => b.monthlyCost - a.monthlyCost)
			.slice(0, 5) //to get top 5 costly/month
        
        return res.status(200).json({
			success: true,
			data: topSubscriptions,
        })
        
	} catch (error) {
		console.error(error)
		res.status(500).json({ success: false, message: 'Server error' })
	}
}
