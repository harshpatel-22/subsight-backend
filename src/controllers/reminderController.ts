import Subscription from '../models/subscriptionModel'
import { sendReminderEmail } from '../utils/emailService'
import dayjs from 'dayjs'

export const sendReminders = async () => {
	try {
		const today = dayjs().startOf('day')

		const subscriptions = await Subscription.find().populate('user')

		for (const sub of subscriptions) {
			const reminderDate = dayjs(sub.endDate)
				.subtract(sub.reminderDaysBefore, 'day')
				.startOf('day')

			if (today.isSame(reminderDate)) {
				const user: any = sub.user
				if (!user || !user.email) continue

				console.log(
					`Sending reminder to ${user.email} for "${sub.name}"`
				)

				await sendReminderEmail({
					to: user.email,
					name: user.fullName,
					endDate: sub.endDate ?? new Date(),
					subscriptionName: sub.name,
					billingCycle: sub.billingCycle,
					notes: sub.notes,
					renewalMethod: sub.renewalMethod,
				})
			}
		}
	} catch (err) {
		console.error('Error sending reminders:', err)
	}
}
