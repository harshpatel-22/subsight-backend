import { AuthenticatedRequest } from '../middleware/auth'
import { Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import User from '../models/userModel'
import { context } from '../utils/constants'

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
			config: {
				systemInstruction: context,
			},
			contents: 'USER_INPUT:' + message,
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
