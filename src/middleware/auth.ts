import { Request, Response, NextFunction } from 'express'
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
	const token = req.cookies.token
	if (!token) {
		console.log('not token found')
		return res.status(401).json({ message: 'No token provided' })
	}
    if (process.env.NODE_ENV === 'development') {
		console.log('Token:', {token} , '\n')
	}
	try {
		const decodedCustomToken = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as { userId: string; email: string }
		req.user = {
			uid: decodedCustomToken.userId,
			email: decodedCustomToken.email,
		}
        if (process.env.NODE_ENV === 'development') {
            console.log('Auth middleware passed\n ')
        }
		return next()
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' })
	}
}
