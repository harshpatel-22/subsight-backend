import express from 'express'
import { authenticate } from '../middleware/auth'
import {
	createSubscription,
	getSubscriptionById,
	deleteSubscription,
	renewSubscription,
    getAllSubscriptions,
} from '../controllers/subscriptionController'

const router = express.Router()

router.post('/', authenticate, createSubscription) 
router.get('/', authenticate, getAllSubscriptions) 
router.get('/:id', authenticate, getSubscriptionById)
router.delete('/:id', authenticate, deleteSubscription) 
router.put('/:id/renew', authenticate, renewSubscription) 

export default router
