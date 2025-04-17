import { Request, Response } from 'express'
import User from '../models/userModel'
import jwt from 'jsonwebtoken'
import admin from '../config/firebase' 

const generateToken = (userId: string) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET!, {
		expiresIn: '7d',
	})
}

export const signup = async (req: Request, res: Response):Promise<any> => {
	try {
		const { fullName, email, password } = req.body
		

		// Check for existing user
		const existingUser = await User.findOne({ email })
		if (existingUser) {
		
			return res.status(400).json({ message: 'Email already in use' })
		}

		// Create user
		const newUser = await User.create({ fullName, email, password })

		// Generate JWT token
		const token = generateToken((newUser._id).toString())
		

		// Set cookie and send response
		res.status(201)
			.cookie('token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				message: 'User registered successfully',
				user: {
					id: newUser._id,
					email: newUser.email,
					fullName: newUser.fullName,
					isPremium: newUser.isPremium,
				},
			})
	} catch (error: any) {
		console.error('Signup Error:', error)
		res.status(500).json({
			message: 'Server error',
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

		const token = generateToken((user._id).toString())

		res.status(200)
			.cookie('token', token, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				message: 'Login successful',
				user: {
					id: user._id,
					email: user.email,
					fullName: user.fullName,
					isPremium: user.isPremium,
				},
			})
	} catch (error) {
		res.status(500).json({ message: 'Server error', error })
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
		const { email, uid, name, picture } = decodedToken

		let user = await User.findOne({ email })
		if (!user) {
			user = new User({
				email,
				fullName: name,
				password: '',
				profilePicture: picture,
				isPremium: false,
				isGoogleSignIn: true, 
			})
			await user.save()
		}

	
		const jwtToken = generateToken((user._id).toString())


		res.status(200)
			.cookie('token', jwtToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			})
			.json({
				message: 'Google sign-in successful',
				user: {
					id: user._id,
					email: user.email,
					fullName: user.fullName,
					profilePicture: user.profilePicture,
					isPremium: user.isPremium,
				},
			})
	} catch (error) {
		console.error('Google Sign-In Error:', error)
		res.status(500).json({
			message: 'Google sign-in failed',
			error: error,
		})
	}
}
