import express, { Application, Request, Response } from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRoutes from './routes/userRoutes'
import subscriptionRoutes from './routes/subscriptionRoutes'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// ---------- Middleware ----------
app.use(express.json())
app.use('/api', userRoutes)
app.use('/api', subscriptionRoutes)

// ---------- Routes ----------
app.get('/', (_req: Request, res: Response) => {
	res.send('Subscription Tracker API is running')
})


// ---------- Start Server ----------
const startServer = async () => {
	await connectDB()

	app.listen(PORT, () => {
		console.log(`✅ Server started at http://localhost:${PORT}`)
	})
}

startServer();