import mongoose, { Document, Schema, model } from 'mongoose'

export interface IUser extends Document {
	uid: string
	email: string
	subscriptions: mongoose.Types.ObjectId[]
	profilePicture?: string
	isPremium: boolean
	createdAt: Date
	updatedAt: Date
}

const userSchema = new Schema<IUser>(
	{
		uid: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
		},
		subscriptions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Subscription',
			},
		],
		profilePicture: {
			type: String,
		},
		isPremium: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
)

const User = model<IUser>('User', userSchema)
export default User
