import { Request, Response } from 'express'
import User from '../models/userModel'
import admin from '../config/firebase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendEmail } from '../utils/emailService'
import dotenv from 'dotenv'
import { sendToken } from '../utils/sendToken'

dotenv.config()

console.log(process.env.NODE_ENV) // 'development'

export const logout = async (req: Request, res: Response) => {
	try {
		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

export const signup = async (req: Request, res: Response) => {
	try {
		const { fullName, password } = req.body
		const email = req.body.email.toLowerCase()

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			res.status(400).json({ message: 'Email already in use' })
			return
		}

		const newUser = await User.create({ fullName, email, password })

		sendToken(res, newUser._id.toString())

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			user: newUser,
		})
		return
	} catch (error) {
		console.error('Signup Error:', error)
		res.status(500).json({
			success: false,
			message: 'Error creating user',
			error,
		})
		return
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { password } = req.body
		const email = req.body.email.toLowerCase()

		const user = await User.findOne({ email })

		if (!user) {
			res.status(400).json({
				message:
					'No account found with this email. Please sign up to create one.',
			})
			return
		}

		if (user?.password.length === 0) {
			res.status(400).json({
				message:
					'This email is already registered with Google. Please log in using Google.',
			})
			return
		}

		if (!(await user.comparePassword(password))) {
			res.status(401).json({ message: 'Invalid credentials' })
			return
		}

		sendToken(res, user._id.toString())

		res.status(200).json({
			success: true,
			message: 'Login successful',
			user,
		})
		return
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error',
			error,
		})
		return
	}
}

export const googleSignIn = async (req: Request, res: Response) => {
	try {
		const { token } = req.body

		const decodedToken = await admin.auth().verifyIdToken(token)
		const { email, name, picture } = decodedToken

		let user = await User.findOne({ email })

		if (user?.password.length) {
			res.status(400).json({
				message: 'Email already in use login with password instead',
			})
			return
		}

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

		sendToken(res, user._id.toString())

		res.status(200).json({
			success: true,
			message: 'Google sign-in successful',
			user,
		})
		return
	} catch (error) {
		console.error('Google Sign-In Error:', error)
		res.status(500).json({
			success: false,
			message: 'Google sign-in failed',
			error,
		})
		return
	}
}

export const forgotPassword = async (
	req: Request,
	res: Response
) => {
	try {
		const { email } = req.body

		const user = await User.findOne({ email })
		if (!user) {
			res.status(404).json({ message: 'User with this email not found' })
			return
		}

		if (user.isGoogleSignIn) {
			res.status(400).json({
				message:
					'This email is associated with Google Sign-In. You can log in directly with your Google account.',
			})
			return
		}

		const resetToken = crypto.randomBytes(20).toString('hex')

		user.resetPasswordToken = await bcrypt.hash(resetToken, 10)
		user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour expiry
		await user.save()

		const resetLink = `${req.headers.origin}/reset-password?token=${resetToken}&email=${user.email}`

		const emailOptions = {
			to: user.email,
			subject: 'Password Reset Request',
			html: `
            <!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Request</title>
            </head>
            <body style="font-family: 'Arial', sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #333333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #0004E8; margin-top: 0; margin-bottom: 20px; font-size: 24px; text-align: center;">Password Reset Request</h1>
                    <p style="margin-bottom: 15px; font-size: 16px;">Dear User,</p>
                    <p style="margin-bottom: 15px; font-size: 16px;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                    <p style="margin-bottom: 20px; font-size: 16px; text-align: center;">
                        <a href="${resetLink}" style="background-color: #0004E8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">Reset Your Password</a>
                    </p>
                    <p style="margin-bottom: 15px; font-size: 16px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
                    <p style="margin-bottom: 15px; font-size: 14px; word-break: break-all;"><a href="${resetLink}" style="color: #0004E8; text-decoration: none;">${resetLink}</a></p>
                    <p style="margin-bottom: 15px; font-size: 16px;">If you did not request this, please ignore this email and your password will remain unchanged. This link will expire in 1 hour.</p>
                    <div style="margin-top: 30px; text-align: left; color: #777777; font-size: 14px;">
                        <p style="margin-bottom: 5px; font-size: 14px;">Sincerely,</p>
                        <p style="margin-bottom: 0; font-size: 14px;">The SubSight Team</p>
                    </div>
                </div>
            </body>
            </html>
            `,
		}

		await sendEmail(emailOptions)

		res.status(200).json({
			message: 'Password reset link has been sent to your email address',
		})
	} catch (error) {
		console.error('Forgot Password Error:', error)
		res.status(500).json({
			message: 'Server error during forgot password process',
			error,
		})
		return
	}
}

export const resetPassword = async (
	req: Request,
	res: Response
) => {
	try {
		const { token, email, newPassword } = req.body

		const user = await User.findOne({ email })

		if (!user) {
			res.status(400).json({ message: 'Invalid email' })
			return
		}

		if (
			!user.resetPasswordExpires ||
			user.resetPasswordExpires <= new Date()
		) {
			res.status(400).json({ message: 'Reset token expired' })
			return
		}

		const isMatch = await bcrypt.compare(
			token,
			user.resetPasswordToken as string
		)

		if (!isMatch) {
			res.status(400).json({ message: 'Invalid reset token' })
			return
		}

		if (user.isGoogleSignIn) {
			res.status(400).json({
				message:
					'This email is associated with Google Sign-In. Password reset is not applicable.',
			})
			return
		}

		user.password = newPassword

		user.resetPasswordToken = undefined
		user.resetPasswordExpires = null

		await user.save()

		const emailOptions = {
			to: user.email,
			subject: 'Your Password Has Been Reset',
			html: `
            <!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset Confirmation</title>
            </head>
            <body style="font-family: 'Arial', sans-serif; background-color: #f7f7f7; margin: 0; padding: 20px; color: #333333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #0004E8; margin-top: 0; margin-bottom: 20px; font-size: 24px; text-align: center;">Password Reset Successful</h1>
                    <p style="margin-bottom: 15px; font-size: 16px;">Dear User,</p>
                    <p style="margin-bottom: 15px; font-size: 16px;">This is a confirmation that the password for your account associated with the email address <strong>${user.email}</strong> has been successfully reset.</p>
                    <p style="margin-bottom: 15px; font-size: 16px;">You can now log in to your account using your new password.</p>
                    <p style="margin-bottom: 15px; font-size: 16px;">If you did not initiate this password reset, please contact us immediately at <a href="mailto:support@yourdomain.com" style="color: #0004E8; text-decoration: none;">support@subsightapp.com</a>.</p>
                    <p style="margin-bottom: 15px; font-size: 16px;">Thank you for using our service!</p>
                    <div style="margin-top: 30px; text-align: left; color: #777777; font-size: 14px;">
                        <p style="margin-bottom: 5px; font-size: 14px;">Sincerely,</p>
                        <p style="margin-bottom: 0; font-size: 14px;">The SubSight Team</p>
                    </div>
                </div>
            </body>
            </html>
        `,
		}

		await sendEmail(emailOptions)

		res.status(200).json({
			message: 'Your password has been successfully reset',
		})
		return
	} catch (error) {
		console.error('Reset Password Error:', error)
		res.status(500).json({
			message: 'Server error during password reset',
			error,
		})
		return
	}
}
