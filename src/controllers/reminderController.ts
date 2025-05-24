import Subscription from '../models/subscriptionModel'
import User from '../models/userModel'
import { sendReminderEmail } from '../utils/emailService'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

export const sendReminders = async (
	emitToUser?: (id: string, event: string, data: any) => void
) => {
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

				let notificationTitle
				if (sub.renewalMethod === 'auto') {
					notificationTitle = `Reminder: Your "${sub.name}" subscription will renew soon.`
				} else {
					notificationTitle = `Reminder: Your "${sub.name}" subscription will expire soon.`
				}

				const notification = {
					_id: uuidv4(),
					title: notificationTitle,
					unread: true,
					createdAt: new Date(),
				}
				if (emitToUser) {
					emitToUser(user._id.toString(), 'newReminder', notification)
				}

				await User.findByIdAndUpdate(user._id, {
					$push: {
						notifications: notification,
					},
				})
			}
		}
	} catch (err) {
		console.error('Error sending reminders:', err)
	}
}
