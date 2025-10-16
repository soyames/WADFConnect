# West African Design Forum (WADF) Platform

## Overview
The West African Design Forum platform is a full-stack event management system for a premier design conference. It serves as the central digital hub for WADF 2025, enabling attendees to purchase tickets, speakers to submit proposals, sponsors to register, and organizers to manage the entire event lifecycle. The platform combines modern web technologies with a culturally-resonant design system inspired by contemporary African design leaders.

Key capabilities include:
- Core MVP features with PostgreSQL database and Paystack integration.
- Comprehensive Admin Dashboard with 11 sections for event management.
- Multi-evaluator proposal evaluation system.
- PWA capabilities, networking features, and multi-language support (English, French, Portuguese).
- Calendar integration, advanced analytics dashboard, and a team member system with role-based access.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
**Technology Stack:** React 18 with TypeScript, Wouter for routing, TanStack Query for state management, Radix UI with shadcn/ui for components, Tailwind CSS for styling, and Vite for building.

**Design System:** "Modern Africana with Trust-Centric Elements," featuring a custom color palette (warm terracotta/amber primary, deep purple secondary), specific typography (Inter/DM Sans, Playfair Display, Space Grotesk), and dark/light mode support.

**Key Features:**
- **Certificate Generation:** Client-side PDF generation using jsPDF and html2canvas, personalized with WADF branding.
- **PWA:** Service worker for offline caching, installable app, and background sync for submissions.
- **Networking System:** Connection requests, real-time messaging, and a user directory.
- **Multi-language Support:** i18next integration for English, French, Portuguese with a language switcher.
- **Calendar Integration:** UI for session schedules, .ics file generation, Google Calendar and Outlook links.
- **Advanced Analytics Dashboard:** Comprehensive analytics page with Recharts visualizations for revenue, engagement, session performance, and sponsor ROI.
- **Comprehensive Admin Dashboard:** Restricted `/admin` access with 11 management sections for proposals, tickets, sessions, sponsorships, users, team members, page visibility, CFP settings, and proposal evaluations.
- **Proposal Evaluation System:** Admins assign multiple evaluators per proposal; evaluators use a 5-criteria scoring system (Relevance, Quality, Innovation, Impact, Feasibility) and provide recommendations.
- **CFP Activation & Placeholder System:** Admin controls for CFP submission periods with dynamic content display when inactive.
- **Team Member Invitation System:** Admins invite members via email with role assignments (organizer, evaluator, volunteer, content-manager) and role-based access.

### Backend
**Technology Stack:** Node.js with Express, TypeScript, Drizzle ORM, PostgreSQL (Neon serverless), and Firebase Authentication.

**API Design:** RESTful API with endpoints for users, tickets, proposals, sponsorships, sessions, attendance, ratings, certificates, and FAQs.

**Data Models:** Role-based users, ticket tiers, proposal workflow, sponsorship tiers, session scheduling, attendance tracking, 5-star ratings, and auto-generated certificates.

### Database
**ORM:** Drizzle ORM for type-safe queries and TypeScript integration.
**Schema Design:** UUID primary keys, foreign key constraints, timestamp tracking, JSON fields for metadata, and text fields for status enums.
**Migration:** Schema defined in `/shared/schema.ts` with migrations in `/migrations`.

### Authentication & Authorization
**Authentication:** Firebase Authentication for email/password and session management.
**Authorization:** Role-Based Access Control (RBAC) with roles: attendee, speaker, sponsor, organizer, admin; frontend route protection and backend endpoint checks.

## External Dependencies

### Third-Party Services
- **Firebase:** Authentication.
- **Neon Database:** Serverless PostgreSQL hosting.
- **Payment Processing:** Designed with references to Paystack and Flutterwave for African payment processing.

### Key NPM Packages
- **UI & Styling:** `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `lucide-react`.
- **Data & Forms:** `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `drizzle-zod`.
- **Utilities:** `date-fns`, `wouter`, `cmdk`, `embla-carousel-react`.

### Development Tools
- **Build & Dev:** Vite, esbuild, TypeScript, PostCSS.
- **Replit Integration:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.