import mongoose, { Document, Schema, model } from 'mongoose'

export interface ISubscription extends Document {
	user: mongoose.Types.ObjectId
	name: string
	amount: number
	currency: string
	startDate: Date
	billingCycle: number //in months
	endDate?: Date 
	category?: string
	notes?: string
	reminderDaysBefore: number
	renewalMethod: 'auto' | 'manual'
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
			trim: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
			default: 'USD',
		},
		startDate: {
			type: Date,
			required: true,
		},
		billingCycle: {
			type: Number, //monthly => 1
			required: true,
		},
		endDate: {
			type: Date, //only for manual renewals or first calculation for auto
		},
		category: {
			type: String,
			trim: true,
		},
		notes: {
			type: String,
			trim: true,
		},
		reminderDaysBefore: {
			type: Number,
			default: 3,
		},
		renewalMethod: {
			type: String,
			enum: ['auto', 'manual'],
			required: true,
		},
	},
	{ timestamps: true }
)

// Pre-save hook to calculate endDate for both auto and manual renewals
subscriptionSchema.pre('save', function (next) {
	if (this.renewalMethod === 'auto' || this.renewalMethod === 'manual') {
		// Calculate endDate based on startDate + billingCycle (in months)
		const calculatedEndDate = new Date(this.startDate)
		calculatedEndDate.setMonth(
			calculatedEndDate.getMonth() + this.billingCycle
		)

		// Set calculated endDate for both methods (initially for manual too)
		this.endDate = calculatedEndDate
	}
	next()
})

const Subscription = model<ISubscription>('Subscription', subscriptionSchema)

export default Subscription
