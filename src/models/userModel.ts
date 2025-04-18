import mongoose, { Document, Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
	email: string
	password: string
	fullName: string
	subscriptions: mongoose.Types.ObjectId[]
	profilePicture?: string
	isPremium: boolean
	createdAt: Date
	updatedAt: Date
	comparePassword: (enteredPassword: string) => Promise<boolean>
	isGoogleSignIn?: boolean // Optional property to check if it's a Google sign-in
}

const userSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			validate: {
				// Custom validator to ensure password is either empty (for Google) or meets length requirements
				validator: function (this: IUser, value: string) {
					if (this.isGoogleSignIn) return true // Allow empty password for Google sign-ins
					return value.length >= 6 // Ensure password is at least 6 characters long for regular sign-ins
				},
				message: 'Password must be at least 6 characters long',
			},
			required: function (this: IUser) {
				// Only require password if it's not a Google sign-in
				return !this.isGoogleSignIn
			},
		},
		fullName: {
			type: String,
			required: true,
		},
		subscriptions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Subscription',
			},
		],
		profilePicture: String,
		isPremium: {
			type: Boolean,
			default: false,
		},
		isGoogleSignIn: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
)

// Pre-save hook to hash password if it's modified and not Google sign-in
userSchema.pre('save', async function (next) {
	if (!this.isModified('password') || this.isGoogleSignIn) return next() // Skip hashing for Google sign-ins
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password)
}

const User = model<IUser>('User', userSchema)
export default User
