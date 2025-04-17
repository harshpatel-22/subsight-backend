import { Request, Response } from 'express'
import User from '../models/userModel'
import bcrypt from 'bcryptjs'
import cloudinary from '../utils/cloudinary'
import { AuthenticatedRequest } from '../middleware/auth'

// Get full user profile
export const getUserProfile = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
    try {
		const user = await User.findById(req.user?.uid).select('-password')
		if (!user) return res.status(404).json({ message: 'User not found' })

		return res.status(200).json(user)
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'Server error' })
	}
}

// Update full name or other basic info
export const updateUserProfile = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { fullName } = req.body

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) return res.status(404).json({ message: 'User not found' })

		user.fullName = fullName || user.fullName
		await user.save()

		return res.status(200).json({ message: 'Profile updated successfully' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'Server error' })
	}
}

// Update email securely
export const updateEmail = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { email, password } = req.body

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Checking password matches
		const isPasswordValid = await user.comparePassword(password)
		if (!isPasswordValid)
			return res.status(400).json({ message: 'Incorrect password' })

		user.email = email
		await user.save()

		return res.status(200).json({ message: 'Email updated successfully' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'Server error' })
	}
}

// Update password securely
export const updatePassword = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	const { oldPassword, newPassword } = req.body

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Check if old password matches
		const isPasswordValid = await user.comparePassword(oldPassword)
		if (!isPasswordValid)
			return res.status(400).json({ message: 'Incorrect password' })

		// Hash and update password
		user.password = await bcrypt.hash(newPassword, 10)
		await user.save()

		return res
			.status(200)
			.json({ message: 'Password updated successfully' })
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'Server error' })
	}
}

// Update profile avatar using Cloudinary
export const updateAvatar = async (
	req: AuthenticatedRequest,
	res: Response
): Promise<any> => {
	if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

	try {
		const user = await User.findById(req.user?.uid)
		if (!user) return res.status(404).json({ message: 'User not found' })

		// Uploading new image to Cloudinary
		const result = await cloudinary.uploader.upload(req.file.path)

		// Update user's profile picture URL in the database
		user.profilePicture = result.secure_url
		await user.save()

		return res.status(200).json({
			message: 'Avatar updated successfully',
			avatar: result.secure_url,
		})
	} catch (err) {
		console.error(err)
		return res.status(500).json({ message: 'Server error' })
	}
}
