import { Response } from 'express'
import User from '../models/userModel'
import bcrypt from 'bcryptjs'
import cloudinary from '../utils/cloudinary'
import { AuthenticatedRequest } from '../middleware/auth'

//get me
export const getMe = async (req: AuthenticatedRequest, res: Response):Promise<any> => {
	try {
		const user = await User.findById(req.user?.uid).select('-password')
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' })
		}

		res.status(200).json({ success: true, user })
	} catch (err) {
		res.status(500).json({ success: false, message: 'Server error' })
	}
}


export const updateUserProfile = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	try {
		const user = await User.findById(req.user?.uid)
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		const { fullName, phoneNumber } = req.body

		if (fullName) user.fullName = fullName
		if (phoneNumber) user.phoneNumber = phoneNumber

		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path)
			user.profilePicture = result.secure_url
		}

		await user.save()

		return res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			user,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

// email-update
export const updateEmail = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { newEmail, password } = req.body

    try {
        const existingUser = await User.findOne({ email:newEmail })

        if (existingUser) {
            return res
				.status(400)
				.json({ success: false, message: 'Email already in use' })
        }

		const user = await User.findById(req.user?.uid)
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: 'User not found' })

		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid)
			return res
				.status(400)
				.json({ success: false, message: 'Incorrect password' })

		user.email = newEmail
		await user.save()

		return res.status(200).json({
			success: true,
			message: 'Email updated successfully',
			user,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

//change-password
export const updatePassword = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { currentPassword, newPassword } = req.body

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'User not found' })
		}

		const isPasswordValid = await user.comparePassword(currentPassword)
		if (!isPasswordValid) {
			return res
				.status(400)
				.json({ success: false, message: 'Incorrect password' })
		}

		if (currentPassword === newPassword) {
			return res.status(400).json({
				success: false,
				message: 'New password cannot be the same as the old password',
			})
		}

		user.password = newPassword

		await user.save()

		return res.status(200).json({
			success: true,
			user,
			message: 'Password updated successfully',
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
