import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
	createUser,
	
	updateUser,
	deleteUser,
    getUser,
} from '../controllers/userController'

const router = Router()

// POST /api/user – Create or get user
router.post('/user', authenticate, createUser)

// GET /api/user – Get user
router.get('/user', authenticate, getUser)

// PUT /api/user/:uid – Update user profile (email, profile picture)
router.put('/user/:uid', authenticate, updateUser)

// DELETE /api/user/:uid – Delete user
router.delete('/user/:uid', authenticate, deleteUser)

export default router
