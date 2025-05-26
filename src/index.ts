import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes'
import notificationRoutes from './routes/notificationRoutes'
import subscriptionRoutes from './routes/subscriptionRoutes'
import cookieParser from 'cookie-parser'
import analysisRoutes from './routes/analysisRoutes'
import { handleStripeWebhook } from './controllers/paymentController'
import bodyParser from 'body-parser'
import paymentRoutes from './routes/paymentRoutes'
import cron from 'node-cron'
import { sendReminders } from './controllers/reminderController'
import chatRoutes from './routes/chatRoutes'

import http from 'http'
import { initSocket } from './utils/socket' 
dotenv.config()


console.log('Running in:', process.env.NODE_ENV)

const app: Application = express()
const PORT = process.env.PORT

const server = http.createServer(app)
const { emitToUser } = initSocket(server)

// ---------- Middleware ----------
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'development'
				? process.env.FRONTEND_DEV_URL
				: process.env.FRONTEND_PROD_URL,
		credentials: true,
	})
)

app.post(
	'/api/payments',
	bodyParser.raw({ type: 'application/json' }),
	handleStripeWebhook
)

app.use(express.json())

app.get('/', () => {
	console.log('getting response on /')
})

app.use(cookieParser())

app.use('/api', paymentRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/analytics', analysisRoutes)
app.use('/api/notification',notificationRoutes)

app.use('/api/chat',chatRoutes)

function logMessage() {
	console.log('cron job executed at:', new Date().toLocaleString())
}

// ---------- Start Server ----------
const startServer = async () => {
	try {
		await connectDB()

		server.listen(PORT, () => {
			console.log(`Server started on port ${PORT}`)
		})

		cron.schedule('0 9 * * *', async () => {
			logMessage()
			await sendReminders(emitToUser) // pass emit function
		})
	} catch (error) {
		console.error('Server failed to start:', error)
		process.exit(1)
	}
}

startServer()
