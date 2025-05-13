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
    // console.log('token' , {token})
    
	try {
		const decodedCustomToken = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as { userId: string; email: string } 
		req.user = {
			uid: decodedCustomToken.userId,
			email: decodedCustomToken.email,
        }

        // console.log('\n auth middleware passed \n')
		return next()
	} catch (customError) {
		return res.status(401).json({ message: 'Invalid or expired token' })
    }
    
}
