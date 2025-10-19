# WADF Platform - Firebase Cloud Functions

This directory contains serverless functions for the West African Design Forum platform.

## Functions Overview

### Firestore Triggers

**onTeamMemberInvited**
- Triggers when a team member is invited
- Sends email notification with invitation details
- TODO: Integrate with email service

**onTicketPurchased**
- Triggers when a ticket is purchased
- Creates user account if needed
- Sends ticket confirmation email
- TODO: Integrate with email service

**onProposalStatusChange**
- Triggers when proposal status changes
- Notifies submitter about status updates
- Sends different emails based on status (accepted, rejected, etc.)

**onAttendanceMarked**
- Triggers when attendance is recorded
- Checks if user qualifies for certificate
- Automatically generates certificate for completed sessions

**onConnectionRequest**
- Triggers when a connection request is created
- Notifies addressee about new connection request

**onNewMessage**
- Triggers when a message is sent
- Sends push notification to recipient if offline

### Scheduled Functions

**aggregateDailyAnalytics**
- Runs daily at midnight UTC
- Calculates daily revenue and ticket sales
- Tracks active users and engagement
- Stores analytics snapshots

### Callable Functions (HTTPS)

**generateCertificate**
- Generates attendance certificate on demand
- Verifies attendance before generating
- Returns certificate ID
- Requires authentication

**sendTestEmail**
- Admin-only function for testing email integration
- Useful for debugging email setup

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Test Locally

```bash
npm run serve
```

This starts the Firebase emulator with your functions.

### Deploy

```bash
npm run deploy
```

Or from project root:
```bash
firebase deploy --only functions
```

## Environment Configuration

Set environment variables:

```bash
firebase functions:config:set email.api_key="YOUR_KEY"
firebase functions:config:set email.from="noreply@wadf.com"
```

Access in code:
```typescript
const config = functions.config();
const apiKey = config.email.api_key;
```

## Email Integration

Functions are ready for email integration. Choose a service:

### SendGrid (Recommended)

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(functions.config().email.api_key);

await sgMail.send({
  to: user.email,
  from: 'noreply@wadf.com',
  subject: 'Welcome to WADF 2025',
  html: '<strong>Your ticket is confirmed!</strong>',
});
```

### Mailgun

```bash
npm install mailgun-js
```

### AWS SES

```bash
npm install aws-sdk
```

## Testing

Run unit tests:

```bash
npm test
```

## Monitoring

View logs:

```bash
npm run logs
```

Or for specific function:

```bash
firebase functions:log --only onTicketPurchased
```

## Cost Optimization

- Functions are optimized for Firebase free tier
- Scheduled function runs once daily (30 invocations/month)
- Trigger functions only run on specific events
- Keep within 2M invocations/month free tier

## Security

- All callable functions require authentication
- Admin functions verify user role
- Never expose API keys in client code
- Use Firebase Functions config for secrets

## Next Steps

1. Integrate email service (SendGrid recommended)
2. Set up Firebase Storage for certificate PDFs
3. Add push notifications for mobile app
4. Implement SMS notifications (optional)
5. Add error monitoring (Sentry, etc.)
