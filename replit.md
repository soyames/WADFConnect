# West African Design Forum (WADF) Platform

## Overview

The West African Design Forum platform is a full-stack event management system for a premier design conference. It serves as the central digital hub for WADF 2025, enabling attendees to purchase tickets, speakers to submit proposals, sponsors to register, and organizers to manage the entire event lifecycle. The platform combines modern web technologies with a culturally-resonant design system inspired by contemporary African design leaders.

**Current Status (Updated October 16, 2025):**
- ✅ Core MVP features operational with PostgreSQL database
- ✅ Paystack payment integration for tickets and sponsorships
- ✅ Admin dashboard with proposal management workflow
- ✅ Session attendance tracking and rating system
- ✅ Certificate generation with PDF download (jsPDF + html2canvas)
- ✅ **PWA capabilities:** Offline support, installable app, service worker caching
- ✅ **Networking features:** Full UI and backend - user directory, connections, messaging
- ✅ **Multi-language support:** English, French, Portuguese with i18next
- ✅ **Calendar integration:** Complete UI with .ics download, Google Calendar & Outlook links
- ✅ **Advanced Analytics Dashboard:** Revenue tracking, engagement metrics, session performance, sponsor ROI with Recharts visualizations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with shadcn/ui styling system
- **Styling:** Tailwind CSS with custom design tokens
- **Build Tool:** Vite

**Design System:**
The application implements a custom design system based on "Modern Africana with Trust-Centric Elements":
- Cultural foundation drawing from African design leaders (Andela, Flutterwave, Paystack)
- Trust layer incorporating Stripe-like clarity and Notion-like organization
- Custom color palette with warm terracotta/amber primary (#25 85% 50%) and deep purple secondary (#280 70% 40%)
- Typography using Inter/DM Sans for body, Playfair Display for headers, and Space Grotesk for metrics
- Dark mode and light mode support through CSS variables

**Component Structure:**
- Modular UI components in `/client/src/components/ui`
- Page-level components in `/client/src/pages`
- Shared layout component for consistent navigation and footer with user dropdown menu
- Context-based authentication state management

**Key Features:**
- **Certificate Generation:** Client-side PDF generation using jsPDF and html2canvas
  - Personalized certificates with WADF branding and Playfair Display typography
  - Displays user name, sessions attended count, and list of attended sessions
  - Professional design with double border, gradient accents, and cultural aesthetics
  - Automatic download functionality with unique filename per user
  - Database record creation for certificate issuance tracking

- **PWA (Progressive Web App):**
  - Service worker with offline caching for static assets and API data
  - Installable app with custom manifest.json
  - Install prompt component for iOS and Android
  - Background sync for offline attendance and rating submissions
  - Offline page with branded design

- **Networking System:**
  - Connection requests with pending/accepted/rejected states
  - Real-time messaging infrastructure with conversations and messages tables
  - User directory with search and filter capabilities
  - API endpoints for connections, conversations, and messages
  - Unread message count tracking

- **Multi-language Support:**
  - i18next integration with English, French, and Portuguese
  - Language switcher in header with flag indicators
  - Persistent language preference in localStorage
  - Comprehensive translations for all UI elements

- **Calendar Integration:**
  - Complete UI on Agenda page with dropdown menu for each session
  - .ics file generation for session downloads
  - Google Calendar deep links for one-click add
  - Outlook Calendar integration
  - Timezone-aware event creation
  - Reminder notifications (30 minutes before session)
  - Utilities in `/client/src/utils/calendar.ts` for export functionality

- **Advanced Analytics Dashboard:**
  - Comprehensive analytics page at `/analytics` with Recharts visualizations
  - Revenue tracking with daily snapshots and trend analysis
  - Engagement metrics: active users, session attendance, connections, messages
  - Session performance metrics: attendance, ratings, completion rates, engagement scores
  - Sponsor ROI tracking: profile views, website clicks, logo impressions, lead capture
  - Analytics database schema with 4 new tables: revenueSnapshots, engagementMetrics, sponsorMetrics, sessionMetrics
  - API endpoints: `/api/analytics/revenue`, `/api/analytics/engagement`, `/api/analytics/sessions`, `/api/analytics/sponsors`
  - Interactive charts: line charts, bar charts, pie charts with responsive design

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express
- **Language:** TypeScript with ES modules
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Neon serverless)
- **Authentication:** Firebase Authentication

**API Design:**
RESTful API with the following resource endpoints:
- `/api/users` - User management and profile data
- `/api/tickets` - Ticket purchasing and management
- `/api/proposals` - Call for Proposals (CFP) submissions
- `/api/sponsorships` - Sponsorship tier registration
- `/api/sessions` - Conference session scheduling
- `/api/attendance` - Session attendance tracking
- `/api/ratings` - Session rating and feedback
- `/api/certificates` - Certificate generation
- `/api/faqs` - FAQ content management

**Data Models:**
- **Users:** Role-based (attendee, speaker, sponsor, organizer, admin) with Firebase UID integration
- **Tickets:** Three tiers (early-bird, regular, VIP) with payment status tracking
- **Proposals:** CFP submissions with review workflow (pending, approved, rejected)
- **Sponsorships:** Four tiers (supporter, gala-dinner, gold, diamond) with benefit tracking
- **Sessions:** Conference sessions with track categorization and scheduling
- **Attendance:** User-session relationship tracking
- **Ratings:** 5-star rating system with comments
- **Certificates:** Auto-generated completion certificates

### Database Architecture

**ORM Choice:** Drizzle ORM selected for:
- Type-safe database queries
- Zero-cost abstractions
- Excellent TypeScript integration
- Lightweight compared to alternatives

**Schema Design:**
- UUID primary keys for all tables
- Referential integrity with foreign key constraints
- Timestamp tracking for audit trails
- JSON fields for flexible metadata storage (benefits, logistics, etc.)
- Text fields for status enums to maintain flexibility

**Migration Strategy:**
- Schema defined in `/shared/schema.ts`
- Migrations stored in `/migrations` directory
- Push-based deployment via `drizzle-kit push`

### Authentication & Authorization

**Authentication Provider:** Firebase Authentication
- Email/password authentication
- User session management via Firebase SDK
- Secure token-based API access

**Authorization Model:**
- Role-Based Access Control (RBAC) with 5 roles: attendee, speaker, sponsor, organizer, admin
- Frontend route protection via AuthContext
- Backend endpoint authorization checks
- User roles stored in database, synced with Firebase UID

### Development & Build Pipeline

**Development Mode:**
- Vite dev server with HMR for frontend
- TSX for running TypeScript backend without compilation
- Middleware-mode Vite integration with Express
- Hot reload for both frontend and backend

**Production Build:**
- Frontend: Vite builds to `/dist/public`
- Backend: esbuild bundles server code to `/dist`
- Static file serving from Express in production
- Environment-based configuration

**Type Safety:**
- Shared types between frontend and backend via `/shared` directory
- Zod schemas for runtime validation derived from Drizzle schemas
- Strict TypeScript configuration

## External Dependencies

### Third-Party Services

**Firebase (Authentication & Storage):**
- Firebase Authentication for user management
- Firebase Firestore (imported but may not be actively used)
- Firebase Storage (imported but may not be actively used)
- Environment variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`

**Neon Database:**
- Serverless PostgreSQL hosting
- Connection via `@neondatabase/serverless` package
- Environment variable: `DATABASE_URL`

**Payment Processing (Integration Planned):**
- Design references Paystack and Flutterwave for African payment processing
- Payment status tracking implemented in ticket and sponsorship models
- Payment reference fields for transaction linking

### Key NPM Packages

**UI & Styling:**
- `@radix-ui/*` - Headless UI primitives for accessibility
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon library

**Data & Forms:**
- `@tanstack/react-query` - Server state management
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation
- `drizzle-zod` - Drizzle to Zod schema conversion

**Utilities:**
- `date-fns` - Date manipulation
- `wouter` - Lightweight routing
- `cmdk` - Command palette component
- `embla-carousel-react` - Carousel component

### Development Tools

**Build & Dev:**
- Vite with React plugin
- esbuild for production bundling
- TypeScript compiler for type checking
- PostCSS with Tailwind and Autoprefixer

**Replit Integration:**
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Dev tooling
- `@replit/vite-plugin-dev-banner` - Development banner