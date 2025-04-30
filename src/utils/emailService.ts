import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

export const sendReminderEmail = async ({
	to,
	name,
	endDate,
	subscriptionName,
	billingCycle,
	notes,
	renewalMethod,
}: {
	to: string
	name: string
	endDate: Date
	subscriptionName: string
	billingCycle: number
	notes?: string
	renewalMethod: string
}) => {
	const formattedEndDate = new Date(endDate).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	const html = `
    <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f7f7f7;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color:rgb(0, 47, 255); margin-top: 0; margin-bottom: 20px;">Hi ${name},</h2>
            <p style="margin-bottom: 15px;">Just a friendly reminder that your subscription for <strong style="color:rgb(0, 47, 255);">${subscriptionName}</strong> is due on <strong style="color:rgb(230, 43, 43);">${formattedEndDate}</strong>.</p>
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
                <p style="margin-top: 0; margin-bottom: 5px;"><strong style="color: #555;">Billing Cycle:</strong> ${billingCycle} month(s)</p>
                <p style="margin-bottom: 5px;"><strong style="color: #555;">Renewal Method:</strong> ${renewalMethod}</p>
                <p style="margin-bottom: 0;"><strong style="color: #555;">Notes:</strong> ${
					notes || '—'
				}</p>
            </div>
            <p style="margin-bottom: 20px;">Please review your subscription details and take any necessary action before the renewal date.</p>
            <hr style="border: 1px solid #eee; margin-bottom: 20px;">
            <p style="font-size: 0.9em; color: #777; margin-top: 20px; margin-bottom: 0;">Best regards,<br>The <strong style="color: rgb(0, 47, 255);">SubSight</strong> Team</p>
        </div>
    </body>
    `

	await transporter.sendMail({
		from: `"SubSight" <${process.env.EMAIL_USER}>`,
		to,
		subject: `Reminder: ${subscriptionName} is renewing soon!`,
		html,
	})
}
