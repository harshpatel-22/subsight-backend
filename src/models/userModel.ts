import mongoose, { Document, Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
	_id: mongoose.Types.ObjectId
	email: string
	password: string
	fullName: string
	phoneNumber: string
	subscriptions: mongoose.Types.ObjectId[]
	profilePicture?: string
	isPremium: boolean
	stripeSubscriptionId: string
	premiumExpiresAt: Date | null
	createdAt: Date
	updatedAt: Date
	comparePassword: (enteredPassword: string) => Promise<boolean>
	isGoogleSignIn?: boolean
	resetPasswordToken?: string
	resetPasswordExpires?: Date | null
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
				validator: function (this: IUser, value: string) {
					if (this.isGoogleSignIn) return true // Allow empty password for Google sign-ins
					return value.length >= 6 // Ensure password is at least 6 characters long for regular sign-ins
				},
				message: 'Password must be at least 6 characters long',
			},
			required: function (this: IUser) {
				return !this.isGoogleSignIn
			},
		},
		fullName: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
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
		stripeSubscriptionId: {
			type: String,
			default: null,
		},
		premiumExpiresAt: {
			type: Date,
			default: null,
		},
		isGoogleSignIn: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: {
			type: String,
			default: undefined,
		},
		resetPasswordExpires: {
			type: Date,
			default: null,
		},
	},
	{ timestamps: true }
)

// Pre-save hook to hash password if it's modified and not Google sign-in
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isGoogleSignIn) {
        return next()
    }
	this.password = await bcrypt.hash(this.password, 10)
	next()
})

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword: string) {
	return await bcrypt.compare(enteredPassword, this.password)
}

const User = model<IUser>('User', userSchema)
export default User
