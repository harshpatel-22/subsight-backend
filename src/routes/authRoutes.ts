import express from 'express'
import { signup, login ,googleSignIn , logout} from '../controllers/authController'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/google', googleSignIn)
router.post('/logout', logout)

export default router
