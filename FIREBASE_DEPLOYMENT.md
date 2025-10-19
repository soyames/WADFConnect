# Firebase Hosting Deployment Guide

This guide will help you deploy the WADF Platform frontend to Firebase Hosting while keeping the backend on Replit.

## Architecture Overview

- **Frontend**: Deployed to Firebase Hosting (Static React App)
- **Backend**: Running on Replit (Express API + PostgreSQL)
- **Database**: PostgreSQL on Replit (or your preferred provider)

## Prerequisites

1. Firebase CLI installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase project already configured (✅ You have: wadf-platform)

3. Replit backend deployed and accessible via HTTPS

## Step 1: Get Your Replit Backend URL

First, you need to publish your Replit backend to get a permanent URL:

1. In Replit, click the "Publish" or "Deploy" button
2. Your backend will be available at a URL like:
   ```
   https://your-project-name.replit.app
   ```
3. **Copy this URL** - you'll need it for the next step

## Step 2: Configure Environment Variables

You need to set the API URL for the production build. You have two options:

### Option A: Command Line (Recommended)
Run the build with the API URL as an environment variable:

```bash
VITE_API_URL=https://your-replit-app.replit.app npm run build
```

### Option B: Create .env.production file locally
Create a file named `.env.production` in the root directory:

```env
VITE_API_URL=https://your-replit-app.replit.app
```

Then run:
```bash
npm run build
```

**Important**: Replace `https://your-replit-app.replit.app` with your actual Replit backend URL!

## Step 3: Build the Frontend

Build the production-ready frontend:

```bash
npm run build
```

This will create optimized files in the `dist/public` directory.

## Step 4: Deploy to Firebase

1. **Login to Firebase** (if not already logged in):
   ```bash
   firebase login
   ```

2. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

3. **Wait for deployment** - Firebase will upload and deploy your files

## Step 5: Verify Deployment

After deployment completes, Firebase will show you the URLs:
- **Primary**: https://wadf-platform.web.app
- **Secondary**: https://wadf-platform.firebaseapp.com

Visit these URLs to verify your app is working!

## Testing the Deployed App

1. Open https://wadf-platform.web.app
2. Try navigating to different pages
3. Test ticket purchase functionality
4. Check browser console for any errors

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Make sure your Replit backend is running
- Verify the CORS configuration includes your Firebase domains
- The backend should already be configured to allow:
  - `https://wadf-platform.web.app`
  - `https://wadf-platform.firebaseapp.com`

### API Not Found Errors
If API calls return 404:
- Double-check the `VITE_API_URL` environment variable
- Rebuild with the correct URL: `VITE_API_URL=https://... npm run build`
- Redeploy: `firebase deploy --only hosting`

### Firebase Authentication
Your Firebase config is already set up in the app with these credentials:
```javascript
{
  apiKey: "AIzaSyAZTnSDLRARth_71WguXzYunMyMNq-EZeE",
  authDomain: "wadf-platform.firebaseapp.com",
  projectId: "wadf-platform",
  storageBucket: "wadf-platform.firebasestorage.app",
  messagingSenderId: "156036553011",
  appId: "1:156036553011:web:5e9fb1cc539244cbbe8646"
}
```

## Updating Your Deployment

Whenever you make changes:

1. **Update the code** in Replit
2. **Rebuild** the frontend:
   ```bash
   VITE_API_URL=https://your-replit-app.replit.app npm run build
   ```
3. **Redeploy** to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Environment-Specific Behavior

The app automatically detects which environment it's in:

- **Local Development**: API calls go to `localhost:5000`
- **Production (Firebase)**: API calls go to your Replit backend URL

This is handled automatically through the `VITE_API_URL` environment variable.

## Quick Reference Commands

```bash
# Build with API URL
VITE_API_URL=https://your-replit-app.replit.app npm run build

# Deploy to Firebase
firebase deploy --only hosting

# View deployment URL
firebase hosting:sites:list

# Test locally before deploying
npm run dev
```

## Important Notes

1. **Backend must be running**: Your Replit backend must be published and running for the Firebase frontend to work
2. **HTTPS required**: Both URLs must use HTTPS (automatically handled by Firebase and Replit)
3. **Cookies/Sessions**: Make sure `credentials: 'include'` is working for authenticated requests
4. **Database**: The PostgreSQL database stays on Replit or wherever you're hosting the backend

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Replit backend logs
3. Verify the API URL is correct
4. Ensure CORS is configured properly
5. Test the backend API directly using a tool like Postman

---

## Configuration Files

The following files are already configured for Firebase deployment:

- ✅ `firebase.json` - Firebase hosting configuration
- ✅ `.firebaserc` - Project ID (wadf-platform)
- ✅ `vite.config.ts` - Build configuration
- ✅ `client/src/config.ts` - API URL configuration
- ✅ `server/index.ts` - CORS configuration

You're all set to deploy! 🚀
