#!/bin/bash

# Alumni Network Backend - Vercel Deployment Script

echo "🚀 Starting Alumni Network Backend Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one based on env.example"
    echo "📝 Copy env.example to .env and update the values"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure MongoDB Atlas connection"
echo "3. Set up email credentials"
echo "4. Test your API endpoints"
echo ""
echo "📚 Documentation: https://your-backend-domain.vercel.app/api-docs" 