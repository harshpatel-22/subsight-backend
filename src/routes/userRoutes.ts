import express from 'express'
import {
	getUserProfile,
	updateUserProfile,
	updateEmail,
	updatePassword,
	updateAvatar,
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'
import upload from '../middleware/multerMiddleware'

const router = express.Router()

// User profile routes
router.get('/profile', authenticate, getUserProfile)
router.patch('/update-profile', authenticate, updateUserProfile)
router.patch('/update-email', authenticate, updateEmail)
router.patch('/update-password', authenticate, updatePassword)
router.patch(
	'/update-avatar',
	authenticate,
	upload.single('avatar'),
	updateAvatar
)

export default router
