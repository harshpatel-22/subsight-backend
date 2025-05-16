import express from 'express'
import { chatController } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

router.post('/', authenticate, chatController)

export default router
