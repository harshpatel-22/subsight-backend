import express from 'express'
import {
    getMe,
	updateEmail,
	updatePassword,
	updateUserProfile,
	
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'
import upload from '../middleware/multerMiddleware'

const router = express.Router()

// User profile routes

router.get('/me',authenticate , getMe)
router.patch('/update-email', authenticate, updateEmail)
router.patch('/update-password', authenticate, updatePassword)
router.patch(
	'/update-profile',
	authenticate,
	upload.single('avatar'),
	updateUserProfile
)

export default router
