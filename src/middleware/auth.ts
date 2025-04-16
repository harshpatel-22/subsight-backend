import { Request, Response, NextFunction } from 'express'
import admin from '../config/firebase'
import Cookies from 'cookies' // Import cookies library

export interface AuthenticatedRequest extends Request {
	user?: {
		uid: string
		email: string
	}
}

export const authenticate = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const cookies = new Cookies(req, res)
	const token = cookies.get('token') // Get token from cookie

	if (!token) {
		res.status(401).json({ message: 'No token provided' })
		return
	}

	try {
		const decodedToken = await admin.auth().verifyIdToken(token)
		req.user = {
			uid: decodedToken.uid,
			email: decodedToken.email || '',
		}
		next()
	} catch (error) {
		console.error('Firebase Auth Error:', error)
		res.status(401).json({ message: 'Invalid or expired token' })
		return
	}
}
