import mongoose, { Document, Schema, model } from 'mongoose'

export interface ISubscription extends Document {
	user: mongoose.Types.ObjectId
	name: string
	amount: number
	currency: string
	startDate: Date
	renewalDate: Date
	endDate?: Date
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
		renewalDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
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
