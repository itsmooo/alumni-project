# Alumni Network Backend

A comprehensive backend API for the Alumni Network Management System built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for alumni and students
- **Email System**: SMTP-based email sending with Nodemailer
- **SMS Integration**: Twilio integration for SMS notifications
- **Payment Processing**: Stripe integration for donations and payments
- **File Upload**: Cloudinary integration for image uploads
- **Real-time Notifications**: Socket.io for real-time updates
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, and input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Vercel account (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-backend-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment to Vercel

### 1. Prepare for Deployment

The backend is configured for Vercel deployment with the following files:
- `vercel.json`: Vercel configuration
- `server.js`: Main application entry point
- `package.json`: Dependencies and scripts

### 2. Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   In your Vercel dashboard, add all required environment variables from `env.example`.

### 3. Environment Variables for Production

Set these in your Vercel project settings:

#### Required Variables:
```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

#### Optional Variables:
```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 📚 API Documentation

Once deployed, access the API documentation at:
```
https://your-backend-domain.vercel.app/api-docs
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Emails
- `POST /api/emails/send` - Send emails to users

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin, alumni, and student roles
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Prevents abuse with rate limiting
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers with Helmet
- **Data Sanitization**: Input sanitization and validation

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String, // 'admin', 'alumni', 'student'
  phone: String,
  graduationYear: Number,
  department: String,
  isActive: Boolean
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  date: Date,
  location: String,
  organizer: String,
  isActive: Boolean
}
```

### Announcement Model
```javascript
{
  title: String,
  content: String,
  author: String,
  isActive: Boolean,
  createdAt: Date
}
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run build` - Build for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository. 