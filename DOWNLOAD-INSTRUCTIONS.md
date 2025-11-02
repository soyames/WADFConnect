# WADF Platform - Download & Local Installation Guide

## 📦 Project Export

Your WADF Platform project has been exported and is ready for local installation.

---

## 🔽 Download the Project

### **Archived File Available:**
- **File:** `wadf-platform.tar.gz`
- **Size:** ~17 MB (compressed)
- **Location:** Root of this Replit workspace

### **How to Download from Replit:**

#### Method 1: Direct Download (Recommended)
1. Click on the **Files** panel in Replit
2. Find `wadf-platform.tar.gz` in the file list
3. Right-click on the file
4. Select **"Download"**
5. Save to your local machine

#### Method 2: Using Replit Shell
```bash
# The file is already created at:
/home/runner/workspace/wadf-platform.tar.gz
```

#### Method 3: Clone from GitHub (If you pushed to GitHub)
```bash
git clone https://github.com/soyames/WADFConnect.git
cd WADFConnect
```

---

## 📋 What's Included in the Archive

The archive contains all project files **EXCEPT**:
- ❌ `node_modules/` (dependencies - will be installed locally)
- ❌ `dist/` (build output - will be generated)
- ❌ `.git/` (git history)
- ❌ `.cache/`, `.vite/` (temporary files)
- ❌ Log files

### **Included Files & Folders:**

**Source Code:**
- ✅ `client/` - Frontend React application
- ✅ `server/` - Backend Express server
- ✅ `shared/` - Shared TypeScript types and schemas
- ✅ `db/` - Database migrations (if any)

**Configuration Files:**
- ✅ `package.json` - Dependencies and scripts
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `vite.config.ts` - Vite build configuration
- ✅ `tailwind.config.ts` - Tailwind CSS configuration
- ✅ `drizzle.config.ts` - Database ORM configuration
- ✅ `postcss.config.js` - PostCSS configuration

**Documentation:**
- ✅ `README.md` - Project overview
- ✅ `INSTALLATION.md` - Detailed setup guide
- ✅ `replit.md` - Architecture documentation
- ✅ `DOWNLOAD-INSTRUCTIONS.md` - This file

**Public Assets:**
- ✅ `public/` - Static files and PWA assets
- ✅ `attached_assets/` - User-uploaded assets (if any)

---

## 🚀 Local Installation Steps

### **Step 1: Extract the Archive**

```bash
# Navigate to your desired directory
cd ~/Projects

# Extract the archive
tar -xzf wadf-platform.tar.gz

# Navigate to the project
cd wadf-platform
```

**Or on Windows:**
- Right-click `wadf-platform.tar.gz`
- Extract using 7-Zip, WinRAR, or Windows built-in extractor
- Navigate to the extracted folder

### **Step 2: Install Dependencies**

```bash
npm install
```

This will install all required packages (~200+ dependencies).

### **Step 3: Set Up Environment Variables**

Create a `.env` file in the root directory:

```bash
# Copy the example below or use your own values
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/wadf_platform
PGHOST=localhost
PGPORT=5432
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=wadf_platform

# Firebase Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secure-random-secret-min-32-chars

# Node Environment
NODE_ENV=development
PORT=5000
EOF
```

**Important:** See `INSTALLATION.md` for detailed instructions on:
- Setting up PostgreSQL database
- Configuring Firebase Authentication
- Generating secure session secrets

### **Step 4: Set Up Database**

```bash
# Option A: Using Neon (Cloud PostgreSQL)
# 1. Create account at neon.tech
# 2. Create project "WADF Platform"
# 3. Copy connection string to .env

# Option B: Using Local PostgreSQL
# 1. Install PostgreSQL
# 2. Create database: createdb wadf_platform
# 3. Update .env with local connection string

# Push database schema
npm run db:push
```

### **Step 5: Create Admin User**

After database setup, create an admin account:

```sql
-- Using psql or any PostgreSQL client
INSERT INTO users (email, name, role) 
VALUES ('admin@wadf.org', 'Administrator', 'admin');
```

Then register this user in Firebase:
1. Go to `/register` in your app
2. Use email: `admin@wadf.org`
3. Set password: `WADF@2025!SecureAdmin#` (or your choice)
4. The user will be linked automatically

### **Step 6: Run the Application**

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

**Access the application:**
- Local: http://localhost:5000
- Admin Dashboard: http://localhost:5000/admin

---

## 📁 Project Structure

```
wadf-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── lib/           # Utilities and configs
│   │   ├── i18n/          # Multi-language translations
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── index.html         # Entry HTML
│
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage layer
│   └── vite.ts            # Vite middleware
│
├── shared/                 # Shared code
│   └── schema.ts          # Database schema & types
│
├── *.config.ts            # Configuration files
├── package.json           # Dependencies
├── INSTALLATION.md        # Detailed setup guide
└── README.md              # Project documentation
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 5000)

# Building
npm run build            # Build for production
npm start                # Run production server

# Database
npm run db:push          # Push schema to database
npm run db:push --force  # Force push (if conflicts)

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint            # ESLint (if configured)
```

---

## ⚙️ System Requirements

### **Minimum Requirements:**
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **RAM:** 2GB minimum (4GB recommended)
- **Disk Space:** 500MB for dependencies + database
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+

### **Recommended Setup:**
- **Node.js:** v20.x (LTS)
- **Database:** PostgreSQL 14+ or Neon
- **RAM:** 8GB
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

---

## 🔐 Important Security Notes

### **After Extraction:**

1. **Never commit `.env` file to Git**
   ```bash
   # Already in .gitignore, but verify:
   cat .gitignore | grep .env
   ```

2. **Generate New Secrets:**
   ```bash
   # Generate secure SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update Firebase Config:**
   - Create your own Firebase project
   - Replace the placeholder API keys
   - See `INSTALLATION.md` for Firebase setup

4. **Database Security:**
   - Use strong database passwords
   - Don't use default credentials
   - Enable SSL for production databases

---

## 🌐 Deployment Options

The project can be deployed to:

- **Vercel** - Serverless deployment
- **Heroku** - Traditional hosting
- **DigitalOcean** - App Platform
- **AWS** - EC2 + RDS
- **Firebase** - Hosting + Functions
- **Replit** - Current platform

See `INSTALLATION.md` for detailed deployment guides for each platform.

---

## 📚 Documentation Files

After extraction, refer to these guides:

1. **INSTALLATION.md** - Complete setup and deployment guide
2. **replit.md** - Technical architecture and system design
3. **README.md** - Project overview and features
4. **DOWNLOAD-INSTRUCTIONS.md** - This file

---

## ✅ Verification Checklist

After local installation, verify everything works:

- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created with all required variables
- [ ] Database created and schema pushed
- [ ] Admin user created in database
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Application accessible at http://localhost:5000
- [ ] Can register/login with Firebase
- [ ] Admin dashboard accessible at `/admin`
- [ ] All pages load without errors

---

## 🆘 Troubleshooting

### Common Issues:

**1. Dependencies Installation Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**2. Database Connection Error:**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

**3. Firebase Auth Error:**
- Verify all VITE_FIREBASE_* variables are set
- Check Firebase project is active
- Enable Email/Password in Firebase Console

**4. Port Already in Use:**
```bash
# Use different port
PORT=3000 npm run dev
```

**5. Build Errors:**
```bash
# Clean and rebuild
rm -rf dist .vite
npm run build
```

---

## 📞 Support

If you encounter issues:

1. Check `INSTALLATION.md` for detailed troubleshooting
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set
5. Ensure database is accessible

---

## 🎉 You're All Set!

Once installed locally, you have full control of the WADF Platform:
- Customize features and design
- Add new functionality
- Deploy to your preferred hosting
- Scale as needed

Happy coding! 🚀

---

*Last Updated: October 16, 2025*
*Project: West Africa Design Forum Platform v1.3.0*
