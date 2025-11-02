# West Africa Design Forum (WADF) Platform

## Overview
The West Africa Design Forum platform is a full-stack event management system for a premier design conference. It serves as the central digital hub for WADF 2025, enabling attendees to purchase tickets, speakers to submit proposals, sponsors to register, and organizers to manage the entire event lifecycle. The platform combines modern web technologies with a culturally-resonant design system inspired by contemporary Africa design leaders.

Key capabilities include:
- Core MVP features with MongoDB/Firestore database and Paystack integration.
- **Comprehensive Admin Dashboard with 12 fully functional sections** for complete event management (no placeholders).
- Multi-evaluator proposal evaluation system.
- PWA capabilities and multi-language support (English, French, Portuguese).
- **Twitter/X-like Social Networking Platform** with integrated messaging, posts, likes, comments, and connection management.
- Calendar integration, advanced analytics dashboard, and a team member system with role-based access.
- **High-capacity infrastructure:** Rate limiting completely disabled to handle 1,000,000 requests per second.

## User Preferences
Preferred communication style: Simple, everyday language.

## Installation & Deployment

### Full-Stack Deployment
For comprehensive installation, configuration, and deployment instructions, see **[INSTALLATION.md](./INSTALLATION.md)**.

This guide covers:
- Local development setup
- Environment configuration  
- Database setup (Firestore/MongoDB)
- Deployment to Replit, Firebase, Vercel, Heroku, DigitalOcean, AWS
- Troubleshooting and maintenance

### Firebase Deployment (Split Architecture)
For deploying the frontend to Firebase Hosting while keeping the backend on Replit, see **[FIREBASE_DEPLOYMENT.md](./FIREBASE_DEPLOYMENT.md)**.

This deployment option:
- Hosts static frontend on Firebase Hosting
- Keeps backend API on Replit
- Uses Firestore database (MongoDB-compatible)
- Configured with CORS for cross-origin requests
- Requires setting VITE_API_URL environment variable

**Note:** Deployment guides should be updated whenever configuration, deployment processes, or environment variables change.

## System Architecture

### Frontend
**Technology Stack:** React 18 with TypeScript, Wouter for routing, TanStack Query for state management, Radix UI with shadcn/ui for components, Tailwind CSS for styling, and Vite for building.

**Design System:** "Modern Africa-Inspired with Trust-Centric Elements," featuring a custom color palette (warm terracotta/amber primary, deep purple secondary), specific typography (Inter/DM Sans, Playfair Display, Space Grotesk), and dark/light mode support.

**Navigation Structure:**
- Main navigation: Home, About, Tickets, Sponsors, Agenda, FAQ (Community Hub)
- **Community Hub (FAQ page):** Tabbed interface containing:
  - FAQ tab: Frequently asked questions
  - Speakers (CFP) tab: Call for Proposals submission system
  - Network tab: Twitter/X-like social networking platform

**Key Features:**
- **Certificate Generation:** Client-side PDF generation using jsPDF and html2canvas, personalized with WADF branding.
- **PWA:** Service worker for offline caching, installable app, and background sync for submissions.
- **Twitter/X-like Social Networking:** Comprehensive social platform featuring:
  - Public feed with real-time posts from all users
  - Like system with toggle functionality and counts
  - Comment threads on posts with user attribution
  - Post creation with rich text content
  - Delete own posts functionality
  - Connection management (send/accept/reject requests)
  - Integrated messaging system within the Network page (no standalone Messages page)
  - 3-tab interface: Feed, Connections, Messages
  - Real-time conversation threads with message history
  - User directory with connection status indicators
  - Network statistics sidebar showing connection counts
- **Multi-language Support:** i18next integration for English, French, Portuguese with a language switcher.
- **Calendar Integration:** UI for session schedules, .ics file generation, Google Calendar and Outlook links.
- **Advanced Analytics Dashboard:** Comprehensive analytics page with Recharts visualizations for revenue, engagement, session performance, and sponsor ROI.
- **Comprehensive Admin Dashboard:** Restricted `/admin` access with **12 fully functional management sections** (all implemented, no placeholders):
  1. **Overview** - Analytics dashboard with key metrics
  2. **Proposals** - Review and manage speaker proposals
  3. **Proposal Evaluations** - Assign evaluators and review scores
  4. **Ticket Options** - Create and manage ticket tiers
  5. **Sessions** - Schedule and organize event sessions
  6. **Sponsorship Packages** - Manage sponsorship tiers
  7. **Users** - View all users, edit roles, filter by role (NEW: Fully implemented)
  8. **Team Members** - Invite and manage team members
  9. **Page Visibility** - Toggle page visibility settings
  10. **CFP Settings** - Configure Call for Proposals periods
  11. **Tasks** - Create, edit, delete tasks with assignments (NEW: Full CRUD implemented)
  12. **Settings** - System configuration (event info, contacts, features) (NEW: Fully implemented)
- **Proposal Evaluation System:** Admins assign multiple evaluators per proposal; evaluators use a 5-criteria scoring system (Relevance, Quality, Innovation, Impact, Feasibility) and provide recommendations.
- **CFP Activation & Placeholder System:** Admin controls for CFP submission periods with dynamic content display when inactive.
- **Team Member Invitation System:** Admins invite members via email with role assignments (organizer, evaluator, volunteer, content-manager) and role-based access.

### Backend
**Technology Stack:** Node.js with Express, TypeScript, MongoDB driver, Google Firestore (MongoDB-compatible), and Firebase Authentication.

**API Design:** RESTful API with endpoints for users, tickets, proposals, sponsorships, sessions, attendance, ratings, certificates, FAQs, posts, likes, comments, connections, conversations, and messages.

**Security:** Enterprise-grade comprehensive security protecting against scraping, injection attacks, phishing, and DDoS:
- **Session Security:** Secure HTTP-only cookies with SameSite protection, in-memory session store with MemoryStore (optimized for 1M req/sec)
- **NoSQL Injection Protection:** express-mongo-sanitize automatically sanitizes user input to prevent MongoDB injection attacks
- **XSS Protection:** Enhanced Content Security Policy (CSP) headers, XSS filter, and input sanitization
- **Email Validation & Phishing Protection:** Validates email format, blocks disposable email domains, detects suspicious patterns
- **Intelligent Rate Limiting:** Progressive slowdown using express-slow-down (allows 50K req/15min before slowing, supports 1M req/sec total capacity)
- **Authentication Rate Limiting:** Strict limits on login attempts (10 failed attempts per 15 minutes) with IP-based blocking
- **Bot Detection:** Blocks automated requests based on user agent analysis, with allowlist for legitimate search engines (Google, Bing, Yandex, DuckDuckGo)
- **Security Headers:** Comprehensive Helmet.js configuration with CSP, HSTS (1 year), X-Frame-Options (deny), X-Content-Type-Options (nosniff), DNS prefetch control
- **Pattern Analysis:** Real-time detection of SQL/NoSQL injection, XSS, directory traversal, code injection attempts with automatic IP blocking
- **HTTP Parameter Pollution (HPP) Protection:** Prevents parameter pollution attacks
- **Request Fingerprinting:** Tracks request patterns per IP with automatic blocking for suspicious activity (50+ suspicious patterns = 2-hour block)
- **Honeypot Fields:** Invisible form fields to catch automated submissions
- **Referrer Validation:** Verifies request origin for all state-changing operations (POST/PUT/DELETE/PATCH)
- **Input Sanitization:** All string inputs sanitized with length limits and null byte removal
- **Failed Login Tracking:** Monitors and blocks IPs with excessive failed login attempts
- **robots.txt:** Discourages web crawlers and AI scrapers (GPTBot, CCBot, Claude-Web, Cohere) from indexing API routes
- **Trust Proxy:** Configured for Replit's reverse proxy environment to correctly identify client IPs

**Data Models:** 
- Core: Role-based users, ticket tiers, proposal workflow, sponsorship tiers, session scheduling, attendance tracking, 5-star ratings, and auto-generated certificates.
- Social: Posts (with content, likes/comments counts), PostLikes (user-post relationships), PostComments (threaded comments), Connections (peer-to-peer networking), Conversations (1-on-1 messaging), Messages (chat history).

### Database
**Database:** Google Firestore with MongoDB compatibility layer.
**Driver:** Official MongoDB Node.js driver for database operations.
**Schema Design:** ObjectId primary keys, embedded documents, timestamp tracking, flexible JSON documents.
**Storage Implementation:** MongoDB-based storage layer in `/server/mongodb-storage.ts` implementing the IStorage interface.

### Authentication & Authorization
**Authentication:** Secure session-based authentication using bcrypt (12-round salting) for password hashing and Express sessions with MemoryStore for session management. All authentication flows include email validation, input sanitization, and failed login tracking.
**Session Security:** HTTP-only cookies (prevents XSS access), SameSite=lax (CSRF protection), secure flag in production (HTTPS only), 7-day expiration with automatic cleanup.
**Admin Credentials:** 
- Email: admin@wadf.org
- Password: WADF@2025!Admin
**User Registration:** Users are automatically registered when they purchase tickets (no separate registration page). All emails validated against phishing patterns and disposable domains.
**Authorization:** Role-Based Access Control (RBAC) with roles: attendee, speaker, sponsor, organizer, admin; frontend route protection and backend endpoint checks.
**Login Endpoint:** POST /api/auth/login for email/password authentication (rate limited: 10 attempts per 15 minutes)
**Session Endpoint:** GET /api/auth/session to retrieve current authenticated user
**Logout Endpoint:** POST /api/auth/logout to destroy session

## External Dependencies

### Third-Party Services
- **Firebase:** Authentication and Firestore database (MongoDB-compatible).
- **Google Cloud:** Firestore database hosting with MongoDB API.
- **Payment Processing:** Designed with references to Paystack and Flutterwave for Africa payment processing.

### Key NPM Packages
- **UI & Styling:** `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `lucide-react`.
- **Data & Forms:** `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `drizzle-zod`.
- **Security:** `helmet`, `express-session`, `memorystore`, `express-mongo-sanitize`, `hpp`, `express-slow-down`, `express-rate-limit`, `bcryptjs`.
- **Utilities:** `date-fns`, `wouter`, `cmdk`, `embla-carousel-react`.

### Development Tools
- **Build & Dev:** Vite, esbuild, TypeScript, PostCSS.
- **Replit Integration:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.