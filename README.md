# Subscription Tracker App - Backend

## Overview

This is the backend service for the Subscription Tracker application, providing a robust API for managing user subscriptions, sending reminders, handling payments, and generating analytics. Built with Express.js and MongoDB, it supports all the core functionality needed for the Subscription Tracker frontend, including the new AI-powered website assistant feature.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT + Firebase Admin
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Scheduled Tasks**: Node-cron
- **Payment Processing**: Stripe
- **Language**: TypeScript
- **AI Integration**: Gemini AI

## Features

### 🤖 AI Website Assistant
- Integrated Gemini AI for providing contextual help

### 🔐 Authentication System
- JWT-based authentication
- Firebase integration for Google authentication
- Password reset functionality
- Token-based session management

### 📊 Subscription Management
- Create, read, update, and delete subscriptions
- Subscription categorization
- Currency conversion (via Exchange Rate API)

### 📈 Analytics API
- Monthly spending calculations
- Yearly spending analytics
- Category-wise spending breakdowns
- Top subscription reporting

### 🔔 Reminder System
- Automated email reminders using node-cron
- Configurable reminder timing (1-3 days before renewal)
- Email templating for notifications

### 💰 Payment Processing
- Stripe integration for subscription plans
- Webhook handling for payment events
- Customer portal integration

### 📤 Data Export
- CSV export functionality for subscriptions
- Data formatting for export

### 👤 User Management
- Profile updates
- Email and password changes
- Subscription plan management

## Getting Started

### Prerequisites
- Node.js 16+ 
- MongoDB instance
- Stripe account
- Firebase project
- Cloudinary account
- Gemini AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harshpatel-22/subsight-backend.git
   cd subsight-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=4000
   NODE_ENV='development'

   # Database
   MONGO_URI=your_mongodb_connection_string

   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Currency Conversion
   EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID=your_stripe_monthly_price_id
   STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID=your_stripe_yearly_price_id
   STRIPE_PORTAL_RETURN_URL=http://localhost:3000/dashboard

   # Frontend URLs
   CLIENT_URL=http://localhost:3000
   PAYMENT_URL=your_payment_url
   FRONTEND_DEV_URL=http://localhost:3000
   FRONTEND_PROD_URL=https://subsight.vercel.app

   # Nodemailer
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   
   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will be running at `http://localhost:4000`

## Project Structure

```
📁 src                         // Main source directory for the backend code
 ├── 📁 config                // Configuration files (e.g., database, Firebase)
 ├── 📁 controllers           // Business logic for handling various features (auth, payment, etc.)
 ├── 📁 middleware            // Custom middleware (e.g., auth checks, file uploads)
 ├── 📁 models                // Mongoose schemas/models for MongoDB collections
 ├── 📁 routes                // Express route handlers for different modules
 ├── 📁 utils                 // Utility/helper functions (e.g., email service, token handling)
 └── index.ts                // Entry point of the backend application

```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/google` - Google authentication
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/logout` - Logout user

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions for a user
- `POST /api/subscriptions` - Create a new subscription
- `GET /api/subscriptions/:id` - Get a specific subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete a subscription

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/update-profile` - Update user profile
- `PUT /api/users/update-password` - Change user password
- `PUT /api/users/update-email` - Change user email

### Analytics
- `GET /api/analysis/monthly` - Get monthly spending analysis
- `GET /api/analysis/yearly` - Get yearly spending analysis
- `GET /api/analysis/category` - Get category-wise spending
- `GET /api/analysis/top-subscriptions` - Get top subscriptions by cost

### Payments
- `POST /api/create-checkout-session` - Create a Stripe subscription
- `POST /api/payments` - Handle Stripe webhooks
- `POST /api/create-portal-session` - Create customer portal session

### Data Export
- `GET /api/subscriptions/export-data` - Export subscriptions data as CSV

## Gemini AI Integration

The backend integrates with Google's Gemini AI to power the website assistant feature:

- Processes natural language queries about subscription management
- Provides personalized subscription recommendations based on user data
- Answers questions about application features and functionality
- Assists with troubleshooting common issues
- Stores and analyzes query history to improve assistant performance

### Assistant Context Data

The Gemini AI integration leverages several data points to provide contextual assistance:

- Application usage patterns
- Common user queries and issues
- Subscription service knowledge base

## Deployment

### Build for Production

```bash
npm run build
```

This will compile TypeScript into JavaScript in the `dist` directory.

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Ensure these environment variables are set in your production environment:

- Server configuration: `PORT`, `NODE_ENV='production'`
- Database: `MONGO_URI`
- Firebase Admin SDK: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Authentication: `JWT_SECRET`
- Currency conversion: `EXCHANGE_RATE_API_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUBSCRIPTION_MONTHLY_PRICE_ID`, `STRIPE_SUBSCRIPTION_YEARLY_PRICE_ID`, `STRIPE_PORTAL_RETURN_URL`
- Frontend URLs: `CLIENT_URL`, `PAYMENT_URL`, `FRONTEND_DEV_URL`, `FRONTEND_PROD_URL`
- Email service: `EMAIL_USER`, `EMAIL_PASS`
- Gemini AI: `GEMINI_API_KEY`

## Cron Jobs

The application uses node-cron to schedule reminder emails:

- `reminderController.ts` - Sets up daily checks for subscriptions due for renewal and sends email reminders

## Error Handling

The API has consistent error handling with appropriate HTTP status codes and error messages.

## Security Measures

- JWT authentication
- CORS configuration
- Firebase admin security
- Environment variable protection
- Input validation
- AI query sanitization and validation

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Stripe API](https://stripe.com/docs/api)
- [Nodemailer](https://nodemailer.com/)
- [Node-cron](https://github.com/node-cron/node-cron)
- [Gemini AI](https://ai.google.dev/gemini-api)
