import express from 'express'
import {
	createCheckoutSession,
	createPortalSession,
} from '../controllers/paymentController'

import { authenticate } from '../middleware/auth'

const router = express.Router()


router.post('/create-checkout-session', authenticate, createCheckoutSession)
router.post('/create-portal-session',  authenticate , createPortalSession)

export default router
