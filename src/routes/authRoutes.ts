import express from 'express'
import {
	signup,
	login,
	googleSignIn,
	logout,
	forgotPassword,
    resetPassword,
} from '../controllers/authController'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/google', googleSignIn)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
