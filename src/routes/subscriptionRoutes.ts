import express from 'express'
import { authenticate } from '../middleware/auth'
import {
	createSubscription,
	getSubscriptionById,
	deleteSubscription,
	getAllSubscriptions,
	updateSubscription,
} from '../controllers/subscriptionController'
import { exportSubscriptionData } from '../controllers/exportController'

const router = express.Router()

router.get('/export-data',authenticate , exportSubscriptionData)
router.post('/', authenticate, createSubscription) 
router.get('/', authenticate, getAllSubscriptions) 
router.get('/:id', authenticate, getSubscriptionById)
router.delete('/:id', authenticate, deleteSubscription)
router.put('/:id',authenticate , updateSubscription)
export default router
