# West African Design Forum (WADF) Platform

## Overview
The West African Design Forum platform is a full-stack event management system for a premier design conference. It serves as the central digital hub for WADF 2025, enabling attendees to purchase tickets, speakers to submit proposals, sponsors to register, and organizers to manage the entire event lifecycle. The platform combines modern web technologies with a culturally-resonant design system inspired by contemporary African design leaders.

Key capabilities include:
- Core MVP features with MongoDB/Firestore database and Paystack integration.
- Comprehensive Admin Dashboard with 11 sections for event management.
- Multi-evaluator proposal evaluation system.
- PWA capabilities and multi-language support (English, French, Portuguese).
- **Twitter/X-like Social Networking Platform** with integrated messaging, posts, likes, comments, and connection management.
- Calendar integration, advanced analytics dashboard, and a team member system with role-based access.

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

**Design System:** "Modern Africana with Trust-Centric Elements," featuring a custom color palette (warm terracotta/amber primary, deep purple secondary), specific typography (Inter/DM Sans, Playfair Display, Space Grotesk), and dark/light mode support.

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
- **Comprehensive Admin Dashboard:** Restricted `/admin` access with 11 management sections for proposals, tickets, sessions, sponsorships, users, team members, page visibility, CFP settings, and proposal evaluations.
- **Proposal Evaluation System:** Admins assign multiple evaluators per proposal; evaluators use a 5-criteria scoring system (Relevance, Quality, Innovation, Impact, Feasibility) and provide recommendations.
- **CFP Activation & Placeholder System:** Admin controls for CFP submission periods with dynamic content display when inactive.
- **Team Member Invitation System:** Admins invite members via email with role assignments (organizer, evaluator, volunteer, content-manager) and role-based access.

### Backend
**Technology Stack:** Node.js with Express, TypeScript, MongoDB driver, Google Firestore (MongoDB-compatible), and Firebase Authentication.

**API Design:** RESTful API with endpoints for users, tickets, proposals, sponsorships, sessions, attendance, ratings, certificates, FAQs, posts, likes, comments, connections, conversations, and messages.

**Data Models:** 
- Core: Role-based users, ticket tiers, proposal workflow, sponsorship tiers, session scheduling, attendance tracking, 5-star ratings, and auto-generated certificates.
- Social: Posts (with content, likes/comments counts), PostLikes (user-post relationships), PostComments (threaded comments), Connections (peer-to-peer networking), Conversations (1-on-1 messaging), Messages (chat history).

### Database
**Database:** Google Firestore with MongoDB compatibility layer.
**Driver:** Official MongoDB Node.js driver for database operations.
**Schema Design:** ObjectId primary keys, embedded documents, timestamp tracking, flexible JSON documents.
**Storage Implementation:** MongoDB-based storage layer in `/server/mongodb-storage.ts` implementing the IStorage interface.

### Authentication & Authorization
**Authentication:** Firebase Authentication for email/password and session management.
**User Registration:** Users are automatically registered when they purchase tickets (no separate registration page). Ticket purchase creates both Firebase auth account and database record.
**Authorization:** Role-Based Access Control (RBAC) with roles: attendee, speaker, sponsor, organizer, admin; frontend route protection and backend endpoint checks.

## External Dependencies

### Third-Party Services
- **Firebase:** Authentication and Firestore database (MongoDB-compatible).
- **Google Cloud:** Firestore database hosting with MongoDB API.
- **Payment Processing:** Designed with references to Paystack and Flutterwave for African payment processing.

### Key NPM Packages
- **UI & Styling:** `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `lucide-react`.
- **Data & Forms:** `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `drizzle-zod`.
- **Utilities:** `date-fns`, `wouter`, `cmdk`, `embla-carousel-react`.

### Development Tools
- **Build & Dev:** Vite, esbuild, TypeScript, PostCSS.
- **Replit Integration:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.