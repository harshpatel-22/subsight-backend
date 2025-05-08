import { Response } from 'express'
import Subscription from '../models/subscriptionModel'
import { Parser as Json2csvParser } from '@json2csv/plainjs'
import { AuthenticatedRequest } from '../middleware/auth'

export const exportSubscriptionData = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const userId = req.user?.uid
		if (!userId) {
			return res
				.status(401)
				.json({ message: 'Unauthorized: User not authenticated.' })
		}

		const subscriptions = await Subscription.find({ user: userId }).lean()

		if (!subscriptions || subscriptions.length === 0) {
			return res.status(404).json({ message: 'No subscriptions found.' })
		}

		const formattedSubscriptions = subscriptions.map((sub) => ({
			...sub,
			startDate: sub.startDate
				? new Date(sub.startDate).toISOString().split('T')[0]
				: '',
			endDate: sub.endDate
				? new Date(sub.endDate).toISOString().split('T')[0]
				: '',
		}))

		const fields = [
			{ label: 'NAME', value: 'name' },
			{ label: 'AMOUNT', value: 'amount' },
			{ label: 'CURRENCY', value: 'currency' },
			{ label: 'START DATE', value: 'startDate' },
			{ label: 'END DATE', value: 'endDate' },
			{ label: 'BILLING CYCLE(IN MONTHS)', value: 'billingCycle' },
			{ label: 'CATEGORY', value: 'category' },
			{ label: 'NOTES', value: 'notes' },
			{ label: 'REMINDER DAYS BEFORE', value: 'reminderDaysBefore' },
			{ label: 'RENEWAL METHOD', value: 'renewalMethod' },
		]

		const parser = new Json2csvParser({ fields })
		const csv = parser.parse(formattedSubscriptions)

		res.header('Content-Type', 'text/csv')
		res.attachment('subscriptions.csv')
		res.send(csv)
	} catch (error) {
		console.error('Error exporting subscription data:', error)
		res.status(500).json({ message: 'Failed to export data.' })
	}
}
