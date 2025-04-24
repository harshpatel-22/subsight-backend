import express from 'express'
import { handleStripeWebhook } from '../controllers/paymentController'
import { createCheckoutSession } from '../controllers/paymentController'
import bodyParser from 'body-parser'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Stripe requires raw body for webhook signature verification
router.post(
	'/payments',
    bodyParser.raw({ type: 'application/json' }),
	handleStripeWebhook
)
router.post('/create-checkout-session', authenticate ,createCheckoutSession)

export default router
