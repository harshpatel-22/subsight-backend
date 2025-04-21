import express from 'express'
import { authenticate } from '../middleware/auth'
import {
	createSubscription,
	getSubscriptionById,
	deleteSubscription,
	getAllSubscriptions,
	updateSubscription,
} from '../controllers/subscriptionController'

const router = express.Router()

router.post('/', authenticate, createSubscription) 
router.get('/', authenticate, getAllSubscriptions) 
router.get('/:id', authenticate, getSubscriptionById)
router.delete('/:id', authenticate, deleteSubscription)
router.put('/:id',authenticate , updateSubscription)

export default router
