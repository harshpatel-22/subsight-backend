import { Request, Response } from 'express'
import User from '../models/userModel'
import jwt from 'jsonwebtoken'
import admin from '../config/firebase'

const generateToken = (userId: string) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET!, {
		expiresIn: '7d',
	})
}

export const logout = async (req: Request, res: Response): Promise<any> => {
	try {
		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		})

		res.status(200).json({
			success: true,
			message: 'Logged out successfully',
		})
	} catch (error) {
		console.error('Logout Error:', error)
		res.status(500).json({
			success: false,
			message: 'Server error during logout',
			error,
		})
	}
}

export const signup = async (req: Request, res: Response): Promise<any> => {
	try {
		const { fullName, email, password } = req.body

		if (password.length < 6) {
			return res.status(401).json({ message: 'Password should be greater than six character' })
		}

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return res.status(400).json({ message: 'Email already in use' })
		}

		const newUser = await User.create({ fullName, email, password })

		// Generate JWT token
		const token = generateToken(newUser._id.toString())

		// Set cookie and send response
		res.status(201)
			.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				success: true,
				message: 'User registered successfully',
				user: newUser,
			})
	} catch (error: any) {
		console.error('Signup Error:', error)
		res.status(500).json({
			success: false,
			message: 'Error creating user',
			error: error,
		})
	}
}

export const login = async (req: Request, res: Response): Promise<any> => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email })

		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const token = generateToken(user._id.toString())

		res.status(200)
			.cookie('token', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				success: true,
				message: 'Login successful',
				user,
			})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error',
			error,
		})
	}
}

// Google sign-in handler
export const googleSignIn = async (
	req: Request,
	res: Response
): Promise<any> => {
	try {
		const { token } = req.body

		// Verify the token
		const decodedToken = await admin.auth().verifyIdToken(token)
		const { email, name, picture } = decodedToken

		let user = await User.findOne({ email })
		if (!user) {
			user = new User({
				email,
				fullName: name,
				password: '',
				profilePicture: picture,
				isGoogleSignIn: true,
			})
			await user.save()
		}

		const jwtToken = generateToken(user._id.toString())

		res.status(200)
			.cookie('token', jwtToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				success: true,
				message: 'Google sign-in successful',
				user,
			})
	} catch (error) {
		console.error('Google Sign-In Error:', error)
		res.status(500).json({
			success: false,
			message: 'Google sign-in failed',
			error: error,
		})
	}
}
