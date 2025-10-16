# Firebase Configuration Guide

## Required Setup Steps

To enable full authentication functionality in this application, you need to configure Firebase Authentication in the Firebase Console:

### 1. Access Firebase Console
Visit [Firebase Console](https://console.firebase.google.com/) and select your project.

### 2. Enable Email/Password Authentication
1. Navigate to **Authentication** in the left sidebar
2. Click on the **Sign-in method** tab
3. Find **Email/Password** in the list of providers
4. Click on it and toggle **Enable**
5. Click **Save**

### 3. Add Authorized Domains
1. Still in **Authentication**, go to **Settings** tab
2. Scroll to **Authorized domains**
3. Add your Replit dev URL (e.g., `your-repl-name.replit.dev`)
4. After deployment, also add your production domain (e.g., `your-app.replit.app` or custom domain)

### 4. Verify Environment Variables
Ensure these secrets are configured in Replit:
- `VITE_FIREBASE_API_KEY` - From Firebase project settings
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_APP_ID` - From Firebase project settings

## Current Status

✅ Firebase SDK is integrated and configured
✅ Authentication code is implemented
✅ Error handling with helpful messages
⚠️ **Email/Password auth method needs to be enabled in Firebase Console**

## Development Notes

- The application includes fallback error messages for configuration issues
- All auth-related errors are caught and displayed to users with clear instructions
- Once Firebase auth is enabled, the full ticket purchase and registration flow will work seamlessly

## Testing Without Firebase

For development/testing without full Firebase setup:
- Navigation and UI components work fully
- Backend API endpoints are functional
- Only authentication signup/signin requires Firebase configuration

## Payment Integration (Future)

The application is prepared for Paystack/Flutterwave integration:
- Ticket purchase flow is ready
- Payment status tracking is implemented
- Webhook handlers can be added in `server/routes.ts`
