import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

export const convertInINR = async (originalCurrency: string, originalAmount: number) => {
	const response = await axios.get(`https://api.exchangerate.host/convert`, {
		params: {
			access_key: process.env.EXCHANGE_RATE_API_KEY,
			from: originalCurrency.toUpperCase(),
			to: 'INR',
			amount: originalAmount,
		},
	})
    
    return response;
}
