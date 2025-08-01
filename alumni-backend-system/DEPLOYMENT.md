# 🚀 Vercel Deployment Guide

This guide will walk you through deploying the Alumni Network Backend to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **Git Repository**: Your code should be in a Git repository

## 🛠️ Step-by-Step Deployment

### 1. Prepare Your Database

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster (free tier works)
   - Set up database access (username/password)
   - Set up network access (allow all IPs: 0.0.0.0/0)
   - Get your connection string

2. **Test Database Connection**
   ```bash
   # Update your .env file with MongoDB Atlas URI
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-network
   ```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Backend Directory**
   ```bash
   cd alumni-backend-system
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name
   - Confirm deployment settings

#### Option B: Using Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Set root directory to `alumni-backend-system`

2. **Configure Build Settings**
   - Framework Preset: `Node.js`
   - Build Command: `npm run build`
   - Output Directory: `.`
   - Install Command: `npm install`

### 3. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

#### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alumni-network
JWT_SECRET=your-super-secret-jwt-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
NODE_ENV=production
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

### 4. Set Up Email (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. **Use the app password** in `SMTP_PASS`

### 5. Test Your Deployment

1. **Check Health Endpoint**
   ```
   https://your-backend-domain.vercel.app/api/health
   ```

2. **Check API Documentation**
   ```
   https://your-backend-domain.vercel.app/api-docs
   ```

3. **Test Email Endpoint**
   ```bash
   curl -X POST https://your-backend-domain.vercel.app/api/emails/send \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "subject": "Test Email",
       "message": "This is a test email",
       "recipientType": "all",
       "sendEmail": true,
       "sendNotification": true
     }'
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check MongoDB Atlas network access
   - Verify connection string format
   - Ensure database user has correct permissions

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure `FROM_EMAIL` matches `SMTP_USER`

3. **CORS Errors**
   - Update `FRONTEND_URL` in environment variables
   - Check CORS configuration in `server.js`

4. **Build Failures**
   - Check `package.json` for correct scripts
   - Verify all dependencies are in `dependencies` (not `devDependencies`)
   - Check Node.js version compatibility

### Debug Steps:

1. **Check Vercel Logs**
   ```bash
   vercel logs your-project-name
   ```

2. **Test Locally**
   ```bash
   npm install
   npm start
   ```

3. **Verify Environment Variables**
   - Check Vercel dashboard
   - Ensure no typos in variable names
   - Verify all required variables are set

## 🔄 Updating Deployment

### Automatic Updates (Git Integration)
- Push changes to your Git repository
- Vercel automatically redeploys

### Manual Updates
```bash
vercel --prod
```

## 📊 Monitoring

1. **Vercel Analytics**: Monitor performance in Vercel dashboard
2. **Error Tracking**: Check function logs for errors
3. **Database Monitoring**: Use MongoDB Atlas monitoring

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses SSL
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] Environment variables are secure

## 📞 Support

If you encounter issues:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Review Logs**: Use `vercel logs` command
3. **Community**: [Vercel Community](https://github.com/vercel/vercel/discussions)

## 🎉 Success!

Once deployed, your backend will be available at:
```
https://your-project-name.vercel.app
```

Update your frontend's API URL to point to this new backend URL. 