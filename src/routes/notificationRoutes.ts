import express from 'express'
import {
    markAllAsRead,
    markAsRead,
} from '../controllers/notificationController'

import { authenticate } from '../middleware/auth'

const router = express.Router()


router.post('/mark-as-read', authenticate, markAsRead)
router.patch('/mark-all-as-read',  authenticate , markAllAsRead)

export default router
