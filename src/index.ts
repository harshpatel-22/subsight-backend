import express, { Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes'
import subscriptionRoutes from './routes/subscriptionRoutes'
import cookieParser from 'cookie-parser'
import analysisRoutes from './routes/analysisRoutes'
import { handleStripeWebhook } from './controllers/paymentController'
import bodyParser from 'body-parser'
import paymentRoutes from './routes/paymentRoutes'
import cron from 'node-cron'
import { sendReminders } from './controllers/reminderController'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// ---------- Middleware ----------
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
	})
)

app.post(
	'/api/payments',
	bodyParser.raw({ type: 'application/json' }),
	handleStripeWebhook
)

app.use(express.json())
app.use('/api', paymentRoutes)

app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/analytics', analysisRoutes)

function logMessage() {
	console.log('cron job executed at:', new Date().toLocaleString())
}

// ---------- Start Server ----------
const startServer = async () => {
	try {
		await connectDB()

		app.listen(PORT, () => {
			console.log(`✅ Server started at http://localhost:${PORT}`)
		})

		cron.schedule('0 9 * * *', async() => {
            logMessage()
            await sendReminders();
        })
        
	} catch (error) {
		console.error('Server failed to start:', error)
		process.exit(1)
	}
}

startServer()