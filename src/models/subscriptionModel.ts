import mongoose, { Document, Schema, model } from 'mongoose'

export interface ISubscription extends Document {
	user: mongoose.Types.ObjectId
	name: string
	amount: number
	currency: string
	startDate: Date
	endDate: Date
	billingCycle: number // Store cycle length in months (e.g., 1 for monthly, 12 for yearly)
	category?: string
	reminderDaysBefore: number
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

const subscriptionSchema = new Schema<ISubscription>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		billingCycle: {
			type: Number, // Store cycle in months (1, 3, 6, 12, etc.)
			required: true,
		},
		category: {
			type: String,
		},
		reminderDaysBefore: {
			type: Number,
			default: 3,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
)

const Subscription = model<ISubscription>('Subscription', subscriptionSchema)
export default Subscription
