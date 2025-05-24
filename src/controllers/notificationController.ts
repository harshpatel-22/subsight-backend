import { Response } from 'express'
import { AuthenticatedRequest } from '../middleware/auth'
import User from '../models/userModel'

export const markAsRead = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?.uid
		const { id: notificationId } = req.body

		if (!notificationId) {
			res.status(400).json({ message: 'Notification ID is required' })
            return
		}

		const user = await User.findOneAndUpdate(
			{ _id: userId, 'notifications._id': notificationId },
			{ $set: { 'notifications.$.unread': false } },
			{ new: true }
		)

		if (!user) {
			res.status(404).json({ message: 'Notification not found' })
            return
        }
        
        await User.findByIdAndUpdate(userId, {
			$pull: { notifications: { _id: notificationId } },
        })
        
		res.status(200).json({ message: 'Notification marked as read' })
	} catch (error) {
		res.status(500).json({ message: 'Server error', error })
	}
}
export const markAllAsRead = async (
	req: AuthenticatedRequest,
	res: Response
):Promise<void> => {
	try {
		const userId = req.user?.uid

		const user = await User.findById(userId)

		if (!user) {
			res.status(404).json({ message: 'User not found' })
            return
		}

		user.notifications = user.notifications.map((n) => ({
			...n,
			unread: false,
		}))

        user.notifications = []

		await user.save()

		res.status(200).json({ message: 'All notifications marked as read' })
	} catch (error) {
		res.status(500).json({ message: 'Server error', error })
	}
}
