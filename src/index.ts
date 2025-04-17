import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRoutes from './routes/userRoutes'
import authRoutes from './routes/authRoutes'
import subscriptionRoutes from './routes/subscriptionRoutes'
import cookieParser from 'cookie-parser'

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

app.use(cookieParser())
app.use(express.json())
app.use('/api/auth' , authRoutes)
app.use('/api/user', userRoutes)
app.use('/api', subscriptionRoutes)


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