# Firebase Deployment Guide for WADF Platform

## 🏗️ Architecture Overview

This WADF Platform uses a **hybrid Firebase deployment** strategy:

```
┌─────────────────────────────────────────┐
│         FIREBASE HOSTING                │
│     (Static Frontend - React App)       │
│         wadf-platform.web.app           │
└──────────────────┬──────────────────────┘
                   │
                   │ API Requests (/api/*)
                   ↓
┌─────────────────────────────────────────┐
│         CLOUD RUN                       │
│     (Express Backend Server)            │
│      wadf-backend.run.app               │
└──────────────────┬──────────────────────┘
                   │
                   │ Database Queries
                   ↓
┌─────────────────────────────────────────┐
│    POSTGRESQL DATABASE (External)       │
│         Database: wadf                  │
│    (Neon, Cloud SQL, or own server)     │
└─────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### 1. Firebase CLI Installation
```bash
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Google Cloud SDK (for Cloud Run)
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and login
gcloud init
gcloud auth login
```

### 3. Docker (for Cloud Run deployment)
- Install Docker Desktop: https://www.docker.com/products/docker-desktop

---

## 🚀 Step-by-Step Deployment

### Step 1: Initialize Firebase Project

```bash
# Create Firebase project (if not exists)
firebase projects:create wadf-platform --display-name "WADF Platform"

# Or use existing project
firebase use wadf-platform

# Initialize Firebase in project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# Answer:
# - Public directory: dist/public
# - Single-page app: Yes
# - Overwrites: No (we have firebase.json configured)
```

### Step 2: Set Up PostgreSQL Database

Your database is named **"wadf"**. Configure the connection:

#### Option A: Using Neon (Recommended - Free Tier Available)
```bash
# 1. Create account at neon.tech
# 2. Create project "WADF Platform"
# 3. Set database name to: wadf
# 4. Copy connection string
```

#### Option B: Using Google Cloud SQL
```bash
# Create PostgreSQL instance
gcloud sql instances create wadf-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create wadf --instance=wadf-db

# Get connection name
gcloud sql instances describe wadf-db --format='value(connectionName)'
```

#### Option C: Using Existing PostgreSQL Server
- Ensure database named "wadf" exists
- Note connection details (host, port, user, password)

### Step 3: Configure Environment Variables

Create `.env.production` for deployment:

```env
# Database Configuration (Use your "wadf" database)
DATABASE_URL=postgresql://user:password@host:5432/wadf?sslmode=require
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=wadf

# Firebase Authentication (same as development)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=wadf-platform
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Session Secret (Generate new for production!)
SESSION_SECRET=your-production-secret-min-32-chars

# Node Environment
NODE_ENV=production
PORT=8080
```

**Generate production secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Push Database Schema

Before deploying, ensure your database schema is set up:

```bash
# Update DATABASE_URL in .env to point to "wadf" database
# Then push schema
npm run db:push

# If conflicts, force push
npm run db:push --force
```

### Step 5: Build the Application

```bash
# Build frontend and backend
npm run build

# Verify build output
ls -la dist/
# Should show:
# - dist/public/  (frontend files)
# - dist/index.js (backend server)
```

### Step 6: Deploy Backend to Cloud Run

```bash
# Set your Google Cloud project
gcloud config set project wadf-platform

# Build and deploy to Cloud Run
gcloud run deploy wadf-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "$(cat .env.production | grep -v '^#' | xargs)"

# Or using Dockerfile:
docker build -t gcr.io/wadf-platform/backend .
docker push gcr.io/wadf-platform/backend
gcloud run deploy wadf-backend \
  --image gcr.io/wadf-platform/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "$(cat .env.production | grep -v '^#' | xargs)"
```

**Note the Cloud Run URL:** It will be something like:
`https://wadf-backend-xxxxx-uc.a.run.app`

### Step 7: Update Firebase Hosting Configuration

Update `firebase.json` with your Cloud Run service URL if not using the default:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "wadf-backend",
          "region": "us-central1"
        }
      }
    ]
  }
}
```

### Step 8: Deploy Frontend to Firebase Hosting

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your site will be live at:
# https://wadf-platform.web.app
# or
# https://wadf-platform.firebaseapp.com
```

### Step 9: Set Custom Domain (Optional)

```bash
# Add custom domain
firebase hosting:channel:deploy production --only hosting

# Connect custom domain (e.g., wadf.org)
# 1. Go to Firebase Console → Hosting
# 2. Click "Add custom domain"
# 3. Enter: wadf.org
# 4. Follow DNS setup instructions
```

---

## 🔐 Environment Variables for Cloud Run

Set environment variables for Cloud Run:

```bash
# Set all environment variables at once
gcloud run services update wadf-backend \
  --set-env-vars \
    DATABASE_URL="postgresql://user:password@host:5432/wadf" \
    PGDATABASE="wadf" \
    VITE_FIREBASE_API_KEY="your-api-key" \
    VITE_FIREBASE_PROJECT_ID="wadf-platform" \
    VITE_FIREBASE_APP_ID="your-app-id" \
    SESSION_SECRET="your-production-secret" \
    NODE_ENV="production"

# Or set from file
gcloud run services update wadf-backend \
  --env-vars-file .env.production
```

---

## 📊 Database Migration

After deployment, create initial admin user:

```bash
# Connect to your "wadf" database
psql "postgresql://user:password@host:5432/wadf"

# Create admin user
INSERT INTO users (email, name, role) 
VALUES ('admin@wadf.org', 'Administrator', 'admin');

# Exit
\q
```

Then register the Firebase account:
1. Visit: https://wadf-platform.web.app/register
2. Email: admin@wadf.org
3. Password: WADF@2025!SecureAdmin#

---

## ✅ Deployment Verification

### Check Backend (Cloud Run)
```bash
# Get service URL
gcloud run services describe wadf-backend --region=us-central1 --format='value(status.url)'

# Test API endpoint
curl https://wadf-backend-xxxxx-uc.a.run.app/api/users
```

### Check Frontend (Firebase Hosting)
```bash
# Open in browser
firebase open hosting:site

# View deployment
firebase hosting:channel:open production
```

### Verify Database Connection
```bash
# Check database connection from Cloud Run
gcloud run services logs read wadf-backend --region=us-central1 --limit=50
```

---

## 🔄 Update & Redeploy

### Update Frontend Only
```bash
npm run build
firebase deploy --only hosting
```

### Update Backend Only
```bash
npm run build
gcloud run deploy wadf-backend --source .
```

### Update Both
```bash
npm run build
firebase deploy --only hosting
gcloud run deploy wadf-backend --source .
```

---

## 💰 Cost Estimation

### Firebase Hosting (Spark/Free Plan)
- ✅ 10 GB storage
- ✅ 360 MB/day bandwidth
- ✅ SSL certificate included
- ✅ Custom domain supported

### Cloud Run
- ✅ 2 million requests/month free
- ✅ 360,000 GB-seconds compute free
- ✅ 180,000 vCPU-seconds free
- 💵 After free tier: ~$0.00002400 per request

### Database (Neon Free Tier)
- ✅ 0.5 GB storage
- ✅ Unlimited queries
- ✅ Automatic scaling
- 💵 Paid: Starts at $19/month

**Estimated Monthly Cost:**
- Small traffic (<10k users): **FREE** (within limits)
- Medium traffic (10k-100k users): **$20-50/month**
- High traffic (100k+ users): **$100-300/month**

---

## 🛠️ Troubleshooting

### Issue: Cloud Run Connection Timeout
**Solution:** Increase timeout
```bash
gcloud run services update wadf-backend \
  --timeout=300 \
  --region=us-central1
```

### Issue: Database Connection Failed
**Solution:** Check connection string and firewall
```bash
# Verify database is accessible
psql $DATABASE_URL -c "SELECT 1"

# Check Cloud Run logs
gcloud run services logs read wadf-backend --region=us-central1
```

### Issue: Firebase Hosting 404
**Solution:** Ensure SPA rewrite is configured
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Issue: API Routes Not Working
**Solution:** Check Cloud Run service name matches firebase.json
```bash
# Verify service name
gcloud run services list --region=us-central1

# Update firebase.json if needed
```

---

## 🔒 Security Checklist

- [ ] Use production DATABASE_URL with SSL (`?sslmode=require`)
- [ ] Set strong SESSION_SECRET (min 64 chars)
- [ ] Enable Cloud Run authentication if needed
- [ ] Set up Firebase App Check for DDoS protection
- [ ] Configure CORS properly in Express
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable Cloud SQL SSL certificates
- [ ] Set up monitoring and alerts

---

## 📈 Monitoring & Logs

### View Cloud Run Logs
```bash
# Real-time logs
gcloud run services logs tail wadf-backend --region=us-central1

# Recent logs
gcloud run services logs read wadf-backend --region=us-central1 --limit=100
```

### View Firebase Hosting Logs
```bash
firebase hosting:clone
```

### Set Up Monitoring
```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime-checks create https://wadf-backend-xxxxx-uc.a.run.app/api/users
```

---

## 🎯 Production Checklist

Before going live:

- [ ] Database "wadf" is created and schema is pushed
- [ ] All environment variables are set in Cloud Run
- [ ] Admin user is created in database
- [ ] Firebase project is configured correctly
- [ ] Frontend build is optimized (`npm run build`)
- [ ] Backend is deployed to Cloud Run
- [ ] Frontend is deployed to Firebase Hosting
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] API endpoints are working
- [ ] Authentication flow is tested
- [ ] Admin dashboard is accessible
- [ ] Monitoring is set up
- [ ] Backup strategy is in place

---

## 📞 Support Commands

```bash
# Check deployment status
firebase deploy:status

# View hosting channels
firebase hosting:channel:list

# Check Cloud Run services
gcloud run services list

# View project info
firebase projects:list
gcloud projects list

# Delete deployment (if needed)
firebase hosting:channel:delete <channel-id>
gcloud run services delete wadf-backend
```

---

## 🚀 Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🏗️  Building application..."
npm run build

echo "🚀 Deploying backend to Cloud Run..."
gcloud run deploy wadf-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file .env.production

echo "🌐 Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "Frontend: https://wadf-platform.web.app"
echo "Backend: $(gcloud run services describe wadf-backend --region=us-central1 --format='value(status.url)')"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**Your WADF Platform is now ready for Firebase deployment!** 🎉

*Last Updated: October 16, 2025*
