import { Request, Response, NextFunction } from 'express'
import admin from '../config/firebase'
import Cookies from 'cookies'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
	[x: string]: any
	user?: {
		uid: string
		email: string
	}
}

export const authenticate = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<any> => {
	const cookies = new Cookies(req, res)
	const token = cookies.get('token') 

	if (!token) {
		return res.status(401).json({ message: 'No token provided' }) 
	}


	try {
		const decodedFirebaseToken = await admin.auth().verifyIdToken(token) 
		req.user = {
			uid: decodedFirebaseToken.uid,
			email: decodedFirebaseToken.email || '',
		}
	
		return next() 
	} catch (firebaseError) {
		console.error('Firebase token verification failed:', firebaseError)

		
		try {
			const decodedCustomToken = jwt.verify(
				token,
				process.env.JWT_SECRET as string
			) as { userId: string; email: string }
			req.user = {
				uid: decodedCustomToken.userId, 
				email: decodedCustomToken.email,
			}
			return next() 
		} catch (customError) {
			console.error('JWT token verification failed:', customError)
			return res.status(401).json({ message: 'Invalid or expired token' }) 
		}
	}
}
