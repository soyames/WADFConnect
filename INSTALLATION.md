# WADF Platform - Installation & Deployment Guide

## Table of Contents
- [Local Installation](#local-installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Local Installation

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: v14 or higher (or Neon account)
- **Firebase Account**: For authentication
- **Git**: For version control

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React 18 + TypeScript
- Express.js
- Drizzle ORM
- Firebase Authentication
- Vite build tool
- All UI libraries (Radix UI, shadcn/ui, Tailwind CSS)

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

#### Database Configuration
```env
# PostgreSQL Database (Neon or local)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
PGHOST=your-db-host.neon.tech
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=wadf_platform
```

#### Firebase Authentication
```env
# Firebase Configuration (Client-side - prefix with VITE_)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

#### Session Management
```env
# Express Session Secret
SESSION_SECRET=your-secure-random-string-min-32-characters
```

#### Server Configuration
```env
# Node Environment
NODE_ENV=development

# Port Configuration (Replit specific)
PORT=5000
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-replit-domain.replit.dev
```

### Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name: "WADF Platform" (or your choice)
   - Follow the setup wizard

2. **Enable Authentication:**
   - Navigate to Authentication → Sign-in method
   - Enable "Email/Password" provider
   - Save changes

3. **Get Configuration:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click on Web app icon (</>)
   - Copy the config values to your `.env` file

4. **Firebase Config Object:**
```javascript
// This is configured in client/src/lib/firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "auto-generated-id",
};
```

---

## Database Setup

### Using Neon (Recommended for Production)

1. **Create Neon Account:**
   - Go to [Neon.tech](https://neon.tech)
   - Sign up for free account
   - Create new project: "WADF Platform"

2. **Get Connection String:**
   - Copy the connection string from Neon dashboard
   - Add to `.env` as `DATABASE_URL`

3. **Database Name:**
   - Default database name: `wadf_platform`
   - Can be customized in Neon dashboard

### Using Local PostgreSQL

1. **Install PostgreSQL:**
```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-14
sudo systemctl start postgresql

# Windows
# Download installer from postgresql.org
```

2. **Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wadf_platform;

# Create user (optional)
CREATE USER wadf_admin WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE wadf_platform TO wadf_admin;
```

3. **Update .env:**
```env
DATABASE_URL=postgresql://wadf_admin:secure_password@localhost:5432/wadf_platform
```

### Database Schema Migration

The project uses Drizzle ORM for database management. Schema is defined in `shared/schema.ts`.

#### Push Schema to Database:
```bash
# Standard push (checks for data loss)
npm run db:push

# Force push (if data loss warning appears)
npm run db:push --force
```

#### Database Tables:
- **users** - User accounts with roles (admin, organizer, speaker, sponsor, attendee)
- **tickets** - Ticket purchases and payment tracking
- **proposals** - CFP submissions and review workflow
- **sponsorships** - Sponsorship registrations and tiers
- **sessions** - Conference sessions and scheduling
- **attendance** - Session attendance tracking
- **ratings** - Session ratings and feedback
- **certificates** - Generated completion certificates
- **teamMembers** - Admin team members and roles
- **cfpSettings** - Call for Proposals configuration
- **ticketOptions** - Admin-managed ticket types
- **sponsorshipPackages** - Admin-managed sponsorship packages
- **pageSettings** - Page visibility controls
- **tasks** - Task management system
- **proposalEvaluators** - Evaluator assignments
- **proposalEvaluations** - Proposal evaluations and scores
- **connections** - User networking connections
- **conversations** - Messaging conversations
- **messages** - Chat messages
- **revenueSnapshots** - Analytics revenue data
- **engagementMetrics** - Analytics engagement data
- **sponsorMetrics** - Analytics sponsor data
- **sessionMetrics** - Analytics session data
- **faqs** - FAQ content management

### Initial Admin User Setup

After database migration, create an admin user:

```bash
# Using database client (psql, pgAdmin, etc.)
INSERT INTO users (email, name, role) 
VALUES ('admin@wadf.org', 'Administrator', 'admin');
```

**Default Admin Credentials:**
- Email: `admin@wadf.org`
- Password: `WADF@2025!SecureAdmin#` (set during first Firebase login)
- Role: `admin`

---

## Running the Application

### Development Mode

#### Start Development Server:
```bash
npm run dev
```

This command:
- Starts Express backend server
- Starts Vite frontend dev server with HMR
- Binds to `http://0.0.0.0:5000`
- Enables hot module replacement for both frontend and backend

#### Access the Application:
- **Local:** http://localhost:5000
- **Replit:** https://your-repl-name.replit.dev

#### Key Pages:
- **Home:** `/`
- **About:** `/about`
- **Call for Proposals:** `/cfp`
- **Tickets:** `/tickets`
- **Sponsors:** `/sponsors`
- **Agenda:** `/agenda`
- **Analytics:** `/analytics`
- **Network:** `/network`
- **Messages:** `/messages`
- **Admin Dashboard:** `/admin` (admin/organizer only)
- **Evaluator Dashboard:** `/evaluator` (evaluator role only)
- **Login:** `/login`

### Production Build

#### Build for Production:
```bash
npm run build
```

This creates:
- Frontend build in `/dist/public`
- Backend bundle in `/dist`

#### Start Production Server:
```bash
npm start
```

### Server Configuration

#### Backend Server (Express):
- **Port:** 5000 (configurable via PORT env variable)
- **Host:** 0.0.0.0 (binds to all interfaces)
- **Protocol:** HTTP (HTTPS via reverse proxy in production)

#### Frontend Server (Vite):
- Integrated with Express in development
- Served as static files in production
- All routing handled client-side (SPA)

---

## Deployment

### Deploying on Replit (Current Platform)

The application is already configured for Replit deployment.

#### Automatic Deployment:
1. **Push to Replit:**
   - Code changes are automatically detected
   - Workflow restarts automatically
   - Hot reload enabled

2. **Configure Secrets:**
   - Go to Tools → Secrets
   - Add all environment variables from `.env`
   - Secrets are automatically injected

3. **Run Configuration:**
   - Run command: `npm run dev`
   - Port: 5000
   - Auto-configured in `.replit` file

#### Publishing to Production:
1. Click "Publish" button in Replit
2. Configure domain (optional)
3. Application will be available at `.replit.app` domain

### Deploying on Firebase Hosting + Cloud Functions

#### Prerequisites:
```bash
npm install -g firebase-tools
firebase login
```

#### Firebase Configuration:

1. **Initialize Firebase:**
```bash
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Functions: Configure Cloud Functions
```

2. **Update firebase.json:**
```json
{
  "hosting": {
    "public": "dist/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

3. **Create Cloud Function:**
Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const express = require('express');
const app = require('../dist/index.js'); // Your built Express app

exports.api = functions.https.onRequest(app);
```

4. **Deploy:**
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting

# Or deploy only functions
firebase deploy --only functions
```

5. **Environment Variables in Firebase:**
```bash
# Set environment variables for Cloud Functions
firebase functions:config:set \
  database.url="your-database-url" \
  firebase.api_key="your-api-key" \
  session.secret="your-session-secret"
```

### Deploying on Vercel

#### Prerequisites:
```bash
npm install -g vercel
```

#### Deployment Steps:

1. **Create vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "dist/public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ]
}
```

2. **Deploy:**
```bash
# Build first
npm run build

# Deploy
vercel

# Or deploy to production
vercel --prod
```

3. **Environment Variables:**
   - Add via Vercel dashboard
   - Or use: `vercel env add <KEY>`

### Deploying on Heroku

#### Prerequisites:
```bash
# Install Heroku CLI
npm install -g heroku
heroku login
```

#### Deployment Steps:

1. **Create Procfile:**
```
web: npm start
```

2. **Create Heroku App:**
```bash
heroku create wadf-platform
```

3. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables:**
```bash
heroku config:set VITE_FIREBASE_API_KEY=your-api-key
heroku config:set VITE_FIREBASE_PROJECT_ID=your-project-id
heroku config:set SESSION_SECRET=your-session-secret
```

5. **Deploy:**
```bash
git push heroku main
```

6. **Run Database Migration:**
```bash
heroku run npm run db:push
```

### Deploying on DigitalOcean App Platform

1. **Connect GitHub Repository:**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure Build:**
   - Build Command: `npm run build`
   - Run Command: `npm start`

3. **Add Database:**
   - Create managed PostgreSQL database
   - Add connection string to environment variables

4. **Deploy:**
   - Click "Deploy"
   - Application will be built and deployed automatically

### Deploying on AWS (EC2 + RDS)

#### EC2 Instance Setup:

1. **Launch EC2 Instance:**
   - Amazon Linux 2 or Ubuntu 22.04
   - t3.small or larger
   - Configure security group (ports 22, 80, 443, 5000)

2. **Install Dependencies:**
```bash
# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# or
sudo apt install -y nodejs  # Ubuntu

# Install PM2
sudo npm install -g pm2
```

3. **Deploy Application:**
```bash
# Clone repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "wadf" -- start
pm2 save
pm2 startup
```

#### RDS PostgreSQL Setup:

1. **Create RDS Instance:**
   - Engine: PostgreSQL 14
   - Instance class: db.t3.micro or larger
   - Storage: 20GB SSD
   - Enable public access (or use VPC)

2. **Configure Security Group:**
   - Allow PostgreSQL (5432) from EC2 security group

3. **Update Environment Variables:**
   - Add RDS connection string to `.env`

4. **Run Migration:**
```bash
npm run db:push
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error:** `Connection refused` or `ECONNREFUSED`

**Solution:**
- Check DATABASE_URL is correct
- Verify database is running
- Check firewall/security group settings
- For Neon: Ensure IP is whitelisted

#### 2. Firebase Authentication Error
**Error:** `Firebase: Error (auth/...)`

**Solution:**
- Verify Firebase configuration in `.env`
- Check Firebase project is active
- Ensure Email/Password provider is enabled
- Clear browser cache and cookies

#### 3. Build Errors
**Error:** `Module not found` or `Cannot find module`

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
rm -rf dist
npm run build
```

#### 4. Migration Errors
**Error:** `relation does not exist` or `column does not exist`

**Solution:**
```bash
# Force push schema
npm run db:push --force

# Or reset database (WARNING: deletes all data)
# Then re-run migration
```

#### 5. Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
lsof -ti:5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

#### 6. Admin Dashboard Access Denied
**Error:** Redirected to home page when accessing `/admin`

**Solution:**
- Ensure user has `admin` or `organizer` role in database
- Check x-user-id header is being sent
- Verify Firebase authentication token is valid
- Update user role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Performance Optimization

#### Database:
- Add indexes for frequently queried columns
- Use connection pooling (already configured)
- Regular VACUUM and ANALYZE operations

#### Frontend:
- Enable code splitting (already configured in Vite)
- Optimize images and assets
- Use lazy loading for routes

#### Backend:
- Enable compression middleware (add `compression` package)
- Implement caching for static API responses
- Use CDN for static assets

### Monitoring & Logging

#### Development:
- Backend logs: Console output
- Frontend logs: Browser console
- Network requests: Browser DevTools

#### Production:
- Use PM2 for process management and logs
- Implement application logging (Winston, Pino)
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance

---

## Maintenance

### Regular Updates

#### Dependencies:
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update <package-name>
```

#### Database Backups:
```bash
# Neon: Automatic backups (check dashboard)

# Local PostgreSQL:
pg_dump -U wadf_admin wadf_platform > backup_$(date +%Y%m%d).sql

# Restore:
psql -U wadf_admin wadf_platform < backup_20251016.sql
```

### Security Updates

1. **Rotate Secrets:**
   - Update SESSION_SECRET every 90 days
   - Rotate Firebase API keys annually
   - Update database passwords regularly

2. **Update Dependencies:**
   - Run `npm audit` weekly
   - Fix vulnerabilities: `npm audit fix`

3. **Review Access:**
   - Audit admin users quarterly
   - Remove inactive team members
   - Review Firebase authentication logs

---

## Additional Resources

### Documentation:
- **React:** https://react.dev
- **Express:** https://expressjs.com
- **Drizzle ORM:** https://orm.drizzle.team
- **Firebase:** https://firebase.google.com/docs
- **Vite:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com

### Support:
- **Issues:** Create issue in repository
- **Email:** admin@wadf.org
- **Documentation:** See `replit.md` for architecture details

---

## Version History

- **v1.0.0** (Oct 2025): Initial release with core MVP
- **v1.1.0** (Oct 2025): Admin dashboard and evaluation system
- **v1.2.0** (Oct 2025): PWA, networking, multi-language support
- **v1.3.0** (Oct 2025): Analytics dashboard and calendar integration

---

*Last Updated: October 16, 2025*
*For latest updates, see repository commits and changelog.*
