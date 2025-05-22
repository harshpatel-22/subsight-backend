import { AuthenticatedRequest } from '../middleware/auth'
import { Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import User from '../models/userModel'

const context =
	'SubSight is a web app for managing online subscriptions like Netflix and Spotify. It offers secure login/signup (email-password and Google), a Dashboard with insights (total subscriptions, spending by month/year/category, upcoming renewals, top 5 subscriptions), and a Subscriptions page with a grid view to add, view, edit, or delete subscriptions. Each subscription includes fields like name, amount, currency, start date, billing cycle, reminder days, category, renewal method, and notes. Users can export data as CSV from the Export Data page. The Profile page lets users view/edit their profile, manage their plan, and update password (re-login required) or email (email/password change not available for Google users). The top navbar includes profile options (View Profile, Logout) and shows either an "Upgrade" button (₹499/month or ₹4999/year) or "Manage Plan" for premium users. If USER_INPUT is unrelated to SubSight, respond with "Please ask a question related to SubSight." If the user greets, reply with a polite greeting.'

export const chatController = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { message } = req.body

	if (!message) {
		res.status(400).json({ error: 'Message is required' })
		return
	}

	const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.0-flash',
			contents: context + 'USER_INPUT:' + message,
		})

		const reply = response.text

		if (reply?.length === 0) {
			res.status(400).json({ error: 'Failed to generate response' })
			return
		}

		const userId = req.user?.uid
		const user = await User.findById(userId)

		if (!user) {
			res.status(400).json({ error: 'User not found' })
			return
		}
		user.chatCount = user?.chatCount + 1

		user.save()

		res.json({ reply: reply || 'No response received from AI.' })
		return
	} catch (error) {
		console.error('Gemini API error:', error)
		res.status(500).json({ error: 'Error contacting Gemini API' })
		return
	}
}
