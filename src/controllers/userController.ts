import { Request, Response } from 'express'
import User from '../models/userModel'
import cloudinary from '../utils/cloudinary'

// Create User
export const createUser = async (req: any, res: Response) => {
	const { uid, email } = req.body

	try {
		let user = await User.findOne({ uid })

		if (!user) {
			user = new User({
				uid,
				email,
				subscriptions: [],
				isPremium: false,
				profilePicture: '',
			})

			await user.save()
		}

        res.status(201).json({
            user,
            message: 'User created successfully'
        })
	} catch (error) {
		console.error('Error creating user:', error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Get User by UID
export const getUser = async (req: any, res: Response): Promise<void> => {
	const { uid } = req.user

	try {
		const user = await User.findOne({ uid })

		if (!user) {
			res.status(404).json({ message: 'User not found' })
			return
		}

		res.status(200).json(user)
	} catch (error) {
		console.error('Error getting user:', error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Update User Profile (email, profile picture)
export const updateUser = async (req: any, res: Response): Promise<void> => {
	const { uid } = req.params
	const { email, isPremium } = req.body
	let profilePictureUrl = req.body.profilePicture

	try {
		const user = await User.findOne({ uid })

		if (!user) {
			res.status(404).json({ message: 'User not found' })
            return;
		}

		if (email) user.email = email
		if (isPremium !== undefined) user.isPremium = isPremium

		// If there's a new profile picture
		if (profilePictureUrl) {
			// Upload the new image to Cloudinary if not already done
			const uploadedResponse = await cloudinary.uploader.upload(
				profilePictureUrl,
				{
					folder: 'user_profiles', // Optional folder in Cloudinary
				}
			)

			user.profilePicture = uploadedResponse.secure_url
		}

		await user.save()
        res.status(200).json({
            user,
            message: 'User updated successfully'
        })
	} catch (error) {
		console.error('Error updating user:', error)
		res.status(500).json({ message: 'Server error' })
	}
}

// Delete User
export const deleteUser = async (req: any, res: Response): Promise<void> => {
	const { uid } = req.params

	try {
		const user = await User.findOneAndDelete({ uid })

		if (!user) {
			res.status(404).json({ message: 'User not found' })
            return;
		}

		res.status(200).json({ message: 'User deleted successfully' })
	} catch (error) {
		console.error('Error deleting user:', error)
		res.status(500).json({ message: 'Server error' })
	}
}
