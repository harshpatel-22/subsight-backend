import { Request, Response, NextFunction } from 'express'
import admin from '../config/firebase'

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
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
	}

	const token = authHeader.split(' ')[1]

	try {
		const decodedToken = await admin.auth().verifyIdToken(token)
		req.user = {
			uid: decodedToken.uid,
			email: decodedToken.email || '',
		}
		next()
	} catch (error) {
		console.error('Firebase Auth Error:', error)
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
	}
}
