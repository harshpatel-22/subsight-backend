import { Request, Response, NextFunction } from 'express'
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

    console.log("token:", token)

	if (!token) {
		return res.status(401).json({ message: 'No token provided' })
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
        console.log('auth middleware passed')
		return next()
	} catch (customError) {
		return res.status(401).json({ message: 'Invalid or expired token' })
    }
    
}
