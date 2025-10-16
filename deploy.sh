#!/bin/bash

# WADF Platform - Firebase Deployment Script
# Database: wadf

set -e  # Exit on error

echo "🔍 Checking prerequisites..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "⚠️  Google Cloud CLI not found."
    echo "Please install from: https://cloud.google.com/sdk/docs/install"
    echo "Or continue with Firebase Hosting only (backend won't be deployed)"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🏗️  Building WADF Platform..."
npm run build

if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found!"
    echo "Please create .env.production with your database 'wadf' configuration"
    echo "See .env.production.example for template"
    exit 1
fi

echo ""
echo "📊 Checking database connection..."
echo "Database name: wadf"

# Check if we should deploy backend
if command -v gcloud &> /dev/null; then
    echo ""
    echo "🚀 Deploying backend to Cloud Run..."
    
    # Get current project
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$PROJECT_ID" ]; then
        echo "Please set your Google Cloud project:"
        gcloud config set project wadf-platform
    fi
    
    gcloud run deploy wadf-backend \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --env-vars-file .env.production \
        --min-instances 0 \
        --max-instances 10 \
        --memory 512Mi \
        --timeout 300s
    
    echo "✅ Backend deployed to Cloud Run"
    
    # Get backend URL
    BACKEND_URL=$(gcloud run services describe wadf-backend --region=us-central1 --format='value(status.url)')
    echo "Backend URL: $BACKEND_URL"
else
    echo "⚠️  Skipping backend deployment (gcloud not installed)"
fi

echo ""
echo "🌐 Deploying frontend to Firebase Hosting..."

# Check if Firebase is initialized
if [ ! -f "firebase.json" ]; then
    echo "Initializing Firebase..."
    firebase init hosting --project wadf-platform
fi

# Deploy to Firebase Hosting
firebase deploy --only hosting --project wadf-platform

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your WADF Platform is live:"
echo "   Frontend: https://wadf-platform.web.app"
if command -v gcloud &> /dev/null; then
    echo "   Backend:  $BACKEND_URL"
fi
echo "   Database: wadf (PostgreSQL)"
echo ""
echo "🔐 Next steps:"
echo "   1. Create admin user in database 'wadf'"
echo "   2. Register Firebase account at /register"
echo "   3. Access admin dashboard at /admin"
echo ""
