import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes'
import subscriptionRoutes from './routes/subscriptionRoutes'
import cookieParser from 'cookie-parser'
import analysisRoutes from './routes/analysisRoutes'
import nodemailer from 'nodemailer'
import paymentRoutes from './routes/paymentRoutes'
import morgan from 'morgan'
import { MailtrapTransport } from 'mailtrap'
dotenv.config()

import Stripe from 'stripe'
import { authenticate } from './middleware/auth'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-03-31.basil",
})

const app: Application = express()
const PORT = process.env.PORT || 5000

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "3b059fcf2e105a",
    pass: "1128c40858228f"
  }
});

// ---------- Middleware ----------
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true, 
	})
)

// app.use(morgan('dev'))

app.use('/api', paymentRoutes)

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth' , authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/analytics', analysisRoutes)

// app.get('/', (_req: Request, res: Response) => {
//    transport
// 		.sendMail({
// 			from: 'reminder.help@subsight.com.com',
// 			to: 'user@gmail.com ',
// 			subject: 'Reminder',
// 			text: 'this is the reminder that your subscription will expires at 12-1-2025',
// 		})
// 		.then(console.log, console.error)
// 	res.send('Subscription Tracker API is running')
// })


// ---------- Start Server ----------
const startServer = async () => {
	await connectDB()

	app.listen(PORT, () => {
		console.log(`✅ Server started at http://localhost:${PORT}`)
	})
}

startServer();