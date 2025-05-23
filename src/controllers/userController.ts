import { Response } from 'express'
import User from '../models/userModel'
import cloudinary from '../utils/cloudinary'
import { AuthenticatedRequest } from '../middleware/auth'

//get me
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const user = await User.findById(req.user?.uid).select('-password')
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' })
			return
		}

		res.status(200).json({ success: true, user })
		return
	} catch (err) {
		res.status(500).json({ success: false, message: 'Server error' })
		return
	}
}

//user profile update
export const updateUserProfile = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const user = await User.findById(req.user?.uid)
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			})
			return
		}

		const { fullName, phoneNumber } = req.body

		if (phoneNumber.length === 0) {
			user.phoneNumber = undefined
		} else {
			user.phoneNumber = phoneNumber
		}

		if (fullName) user.fullName = fullName

		if (!req.file) {
			user.profilePicture = null
		}

		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path)
			user.profilePicture = result.secure_url
		}

		await user.save()

		res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			user,
		})
		return
	} catch (err) {
		console.error(err)
		res.status(500).json({
			success: false,
			message: 'Server error',
		})
		return
	}
}

// email-update
export const updateEmail = async (req: AuthenticatedRequest, res: Response) => {
	const { newEmail, password } = req.body

	try {
		const existingUser = await User.findOne({ email: newEmail })

		if (existingUser) {
			res.status(400).json({
				success: false,
				message: 'Email already in use',
			})
			return
		}

		const user = await User.findById(req.user?.uid)
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' })
			return
		}

		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid) {
			res.status(400).json({
				success: false,
				message: 'Incorrect password',
			})
			return
		}

		user.email = newEmail
		await user.save()

		res.status(200).json({
			success: true,
			message: 'Email updated successfully',
			user,
		})
		return
	} catch (err) {
		console.error(err)
		res.status(500).json({ success: false, message: 'Server error' })
		return
	}
}

//change-password
export const updatePassword = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { currentPassword, newPassword } = req.body

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) {
			res.status(404).json({ success: false, message: 'User not found' })
			return
		}

		const isPasswordValid = await user.comparePassword(currentPassword)
		if (!isPasswordValid) {
			res.status(400).json({
				success: false,
				message: 'Incorrect password',
			})
			return
		}

		if (currentPassword === newPassword) {
			res.status(400).json({
				success: false,
				message: 'New password cannot be the same as the old password',
			})
			return
		}

		user.password = newPassword

		await user.save()

		res.status(200).json({
			success: true,
			user,
			message: 'Password updated successfully',
		})
		return
	} catch (err) {
		console.error(err)
		res.status(500).json({ success: false, message: 'Server error' })
		return
	}
}
