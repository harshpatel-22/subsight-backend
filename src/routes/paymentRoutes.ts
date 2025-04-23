import express from 'express'
import { handleStripeWebhook } from '../controllers/paymentController'
import bodyParser from 'body-parser'

const router = express.Router()

// Stripe requires raw body for webhook signature verification
router.post(
	'/',
    bodyParser.raw({ type: 'application/json' }),
	handleStripeWebhook
)

export default router
