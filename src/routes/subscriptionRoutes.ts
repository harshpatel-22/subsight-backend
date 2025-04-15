import express from 'express'
import { authenticate } from '../middleware/auth'
import {
	createSubscription,
	getUserSubscriptions,
	getSubscriptionById,
	deleteSubscription,
	renewSubscription,
} from '../controllers/subscriptionController'

const router = express.Router()

// Protect these routes with authentication middleware
router.post('/subscriptions', authenticate, createSubscription) // Create a subscription
router.get('/subscriptions', authenticate, getUserSubscriptions) // Get all subscriptions
router.get('/subscriptions/:id', authenticate, getSubscriptionById) // Get single subscription
router.delete('/subscriptions/:id', authenticate, deleteSubscription) // Delete a subscription
router.put('/subscriptions/:id/renew', authenticate, renewSubscription) // Renew subscription

export default router
