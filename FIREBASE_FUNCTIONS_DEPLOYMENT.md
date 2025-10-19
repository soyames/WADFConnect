# Firebase Functions & Indexes Deployment Guide

This guide explains how to deploy Firebase Cloud Functions and Firestore indexes for the WADF Platform.

## Overview

The project now includes:
- **Firestore Indexes** (`firestore.indexes.json`) - Optimized database queries
- **Firestore Security Rules** (`firestore.rules`) - Database access control
- **Firebase Functions** (`functions/`) - Serverless backend operations

## Prerequisites

1. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase project configured: `wadf-platform`

3. Logged into Firebase CLI:
   ```bash
   firebase login
   ```

## Project Structure

```
├── firestore.indexes.json    # Database indexes configuration
├── firestore.rules           # Security rules
├── firebase.json             # Firebase project configuration
└── functions/
    ├── package.json          # Functions dependencies
    ├── tsconfig.json         # TypeScript config
    └── src/
        └── index.ts          # Cloud Functions code
```

## Step 1: Install Functions Dependencies

Navigate to the functions directory and install packages:

```bash
cd functions
npm install
cd ..
```

## Step 2: Deploy Firestore Indexes

Firestore indexes optimize query performance. Deploy them with:

```bash
firebase deploy --only firestore:indexes
```

This deploys 45+ indexes for collections like:
- Users (email, firebaseUid, role)
- Tickets (userId, status)
- Proposals (userId, status, submittedAt)
- Sessions (scheduledDate, track)
- Attendance (userId, sessionId)
- And many more...

**Note:** Index creation can take 5-15 minutes for large datasets.

## Step 3: Deploy Firestore Security Rules

Security rules control who can read/write data:

```bash
firebase deploy --only firestore:rules
```

Rules include:
- User authentication checks
- Role-based access (admin, organizer, evaluator)
- Owner-only access for personal data
- Public read for sessions, FAQs, settings

## Step 4: Deploy Firebase Functions

Deploy all cloud functions:

```bash
firebase deploy --only functions
```

### Available Functions

**Trigger Functions (Firestore):**
- `onTeamMemberInvited` - Sends invitation emails
- `onTicketPurchased` - Sends ticket confirmations
- `onProposalStatusChange` - Notifies submitters
- `onAttendanceMarked` - Triggers certificate generation
- `onConnectionRequest` - Notifies about new connections
- `onNewMessage` - Sends message notifications

**Scheduled Functions:**
- `aggregateDailyAnalytics` - Runs daily at midnight UTC to calculate:
  - Daily revenue and ticket sales
  - Active users and engagement metrics
  - Connections and messages sent

**Callable Functions (HTTPS):**
- `generateCertificate` - Generates certificates on demand
- `sendTestEmail` - Admin tool for testing email integration

## Step 5: Deploy Everything Together

Deploy all Firebase resources at once:

```bash
firebase deploy
```

This deploys:
- Hosting (frontend)
- Firestore indexes
- Firestore rules
- Functions

## Testing Functions Locally

Use Firebase Emulators for local testing:

```bash
firebase emulators:start
```

This starts:
- Functions emulator (port 5001)
- Firestore emulator (port 8080)
- Hosting emulator (port 5000)
- Emulator UI (http://localhost:4000)

## Monitoring Functions

### View Function Logs

```bash
firebase functions:log
```

### View Specific Function

```bash
firebase functions:log --only onTicketPurchased
```

### Real-time Logs

```bash
firebase functions:log --follow
```

## Environment Variables for Functions

Set configuration for functions:

```bash
firebase functions:config:set email.api_key="YOUR_SENDGRID_KEY"
firebase functions:config:set email.from="noreply@wadf.com"
```

Access in functions:
```typescript
const apiKey = functions.config().email.api_key;
```

## Cost Considerations

### Firestore Indexes
- No additional cost
- Improves query performance
- Required for compound queries

### Cloud Functions Pricing (Free Tier)
- 2 million invocations/month
- 400,000 GB-seconds/month
- 200,000 CPU-seconds/month

Your functions are optimized to stay within free tier for typical usage.

### Scheduled Functions
- `aggregateDailyAnalytics` runs once daily = 30 invocations/month
- Well within free tier limits

## Email Integration (TODO)

Functions are ready for email integration. Add your preferred service:

### Option 1: SendGrid
```bash
npm install @sendgrid/mail --prefix functions
```

### Option 2: Mailgun
```bash
npm install mailgun-js --prefix functions
```

### Option 3: AWS SES
```bash
npm install aws-sdk --prefix functions
```

Update functions in `functions/src/index.ts` to send actual emails.

## Troubleshooting

### Functions Won't Deploy

**Issue:** Build errors during deployment

**Solution:**
```bash
cd functions
npm run build
# Fix any TypeScript errors
cd ..
firebase deploy --only functions
```

### Index Creation Fails

**Issue:** Conflicting indexes

**Solution:**
```bash
# Delete existing indexes in Firebase Console
# Then redeploy
firebase deploy --only firestore:indexes
```

### Functions Timeout

**Issue:** Function execution exceeds time limit (60s default)

**Solution:** Increase timeout in `functions/src/index.ts`:
```typescript
export const myFunction = functions
  .runWith({ timeoutSeconds: 300 }) // 5 minutes
  .https.onCall(async (data, context) => {
    // ...
  });
```

## Security Best Practices

1. **Never commit API keys** - Use Firebase Functions config or Secret Manager
2. **Validate all inputs** - Functions validate data before processing
3. **Use TypeScript** - Catch errors at compile time
4. **Test locally first** - Use emulators before deploying
5. **Monitor usage** - Check Firebase Console regularly

## Next Steps

1. **Set up email service** - Integrate SendGrid/Mailgun for notifications
2. **Configure storage** - Set up Firebase Storage for certificates
3. **Add monitoring** - Set up error alerts in Firebase Console
4. **Test functions** - Verify each trigger works correctly
5. **Optimize costs** - Monitor function invocations

## Useful Commands

```bash
# Deploy only specific function
firebase deploy --only functions:onTicketPurchased

# Delete a function
firebase functions:delete onOldFunction

# View function config
firebase functions:config:get

# View active functions
firebase functions:list

# Run tests
cd functions && npm test
```

## Support

For issues with:
- **Firestore Indexes:** Check Firebase Console > Firestore > Indexes
- **Security Rules:** Use Rules Playground in Firebase Console
- **Functions:** Check Functions logs in Firebase Console

## Summary

You now have:
- ✅ 45+ optimized Firestore indexes
- ✅ Comprehensive security rules
- ✅ 9 serverless cloud functions
- ✅ Daily analytics aggregation
- ✅ Email notifications (ready for integration)
- ✅ Certificate generation on demand

Deploy with:
```bash
firebase deploy
```

Happy coding! 🚀
