import express from 'express'
import {
    getCategoryWiseSpending,
	getMonthlySpending,
	getTopSubscription,
	getYearlySpending,
} from '../controllers/analysisController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

//with query ?month=4&year=2025
router.get('/monthly', authenticate, getMonthlySpending)

//with query ?year=2025
router.get('/yearly', authenticate, getYearlySpending)

//without query
router.get('/category', authenticate, getCategoryWiseSpending)

//without query
router.get('/top-subscriptions', authenticate, getTopSubscription)

export default router
