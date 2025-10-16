# WADF Platform Design Guidelines

## Design Approach: Modern Africana with Trust-Centric Elements

**Selected Approach:** Hybrid - Cultural Reference + Trust System
- **Cultural Foundation:** Draw from contemporary African design leaders (Andela, Flutterwave, Paystack brands)
- **Trust Layer:** Incorporate Stripe-like clarity for payment flows and Notion-like organization for content
- **Guiding Principle:** Celebrate African creativity while building absolute confidence in security

---

## Core Design Elements

### A. Color Palette

**Primary Colors (Dark Mode):**
- **Brand Primary:** 25 85% 50% (vibrant terracotta/amber - warm, culturally resonant)
- **Brand Secondary:** 280 70% 40% (deep purple - sophistication, premium feel)
- **Neutral Base:** 220 15% 12% (warm dark background)
- **Surface:** 220 12% 18% (elevated cards/panels)

**Primary Colors (Light Mode):**
- **Brand Primary:** 25 75% 45% 
- **Brand Secondary:** 280 60% 35%
- **Neutral Base:** 30 5% 98% (warm white)
- **Surface:** 0 0% 100% (pure white cards)

**Functional Colors:**
- **Success:** 140 65% 45% (payment confirmation, approved proposals)
- **Warning:** 45 90% 55% (pending actions, session starting soon)
- **Error:** 0 75% 55% (payment failures, form validation)
- **Info:** 210 70% 50% (notifications, announcements)

**Accent Strategy:**
- Use **gold/amber accents (40 85% 60%)** sparingly for premium sponsors (Diamond, Gold tiers) and certificate highlights
- Cultural pattern overlays in subtle opacity (5-10%) on hero sections

### B. Typography

**Font Families:**
```
Primary: 'Inter' or 'DM Sans' (Google Fonts) - clean, professional, excellent readability
Display: 'Playfair Display' or 'Cormorant' - elegant headers, cultural sophistication
Accent: 'Space Grotesk' - modern technical feel for stats/metrics
```

**Type Scale:**
- **Hero Headlines:** 3.5rem (desktop) / 2rem (mobile), Display font, font-weight: 700
- **Section Headers:** 2.25rem (desktop) / 1.5rem (mobile), Primary font, font-weight: 600
- **Subsections:** 1.5rem, Primary font, font-weight: 600
- **Body Large:** 1.125rem, Primary font, font-weight: 400
- **Body:** 1rem, Primary font, font-weight: 400, line-height: 1.7
- **Small/Meta:** 0.875rem, Primary font, font-weight: 500

### C. Layout System

**Spacing Primitives:** Consistent use of Tailwind units: **4, 8, 12, 16, 24, 32**
- Component padding: `p-4` (mobile), `p-8` (tablet), `p-12` (desktop)
- Section spacing: `py-16` (mobile), `py-24` (tablet), `py-32` (desktop)
- Card spacing: `gap-6` for grids, `space-y-4` for vertical stacks

**Container Strategy:**
- Full-width sections: `w-full` with inner `max-w-7xl mx-auto px-4`
- Content sections: `max-w-6xl`
- Text-heavy areas: `max-w-4xl` (optimal reading)
- Forms: `max-w-2xl` (focused interaction)

**Grid Patterns:**
- Feature cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Sponsor tiers: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Two-column layouts: `grid-cols-1 lg:grid-cols-2` (CFP form, payment pages)

### D. Component Library

**Navigation:**
- Sticky header with blur backdrop (`backdrop-blur-xl bg-neutral/80`)
- Multi-level nav: Home, About, Speakers, Agenda, Tickets, Sponsors, CFP
- Mobile: Slide-in drawer with cultural pattern accent
- User menu with role badge (Attendee/Speaker/Sponsor badge in brand colors)

**Cards:**
- **Default:** Soft shadow, rounded-2xl corners, subtle border in brand color at 10% opacity
- **Interactive (hover):** Lift effect with increased shadow, subtle scale transform
- **Premium (Sponsors):** Gold border gradient, elevated shadow
- **Speaker Cards:** Profile image with African pattern border overlay

**Buttons:**
- **Primary:** Brand primary fill, white text, rounded-lg, px-8 py-3
- **Secondary:** Brand secondary outline, transparent bg with subtle blur when on images
- **Ghost:** Transparent with border, hover fills with brand color at 10% opacity
- **Destructive:** Error color for cancellations
- Size variants: sm (px-4 py-2), default (px-6 py-3), lg (px-8 py-4)

**Forms & Inputs:**
- Consistent dark mode: `bg-surface` with lighter border on focus
- Payment forms: Extra visual trust indicators (lock icons, secure badges, PCI DSS logo)
- Multi-step indicators with cultural pattern fill for completed steps
- Inline validation with immediate feedback

**Data Displays:**
- **Agenda Timeline:** Vertical line with session cards, color-coded by track
- **Sponsorship Tiers:** Card-based pricing table with feature comparison
- **Rating System:** Star icons with cultural sunburst pattern fill
- **Statistics Dashboard:** Large numbers with context, subtle data viz

**Modals & Overlays:**
- Dark backdrop with `backdrop-blur-sm`
- White/surface panel with rounded corners
- Clear close actions, escape key support
- Payment modals: Extra padding, security badges visible

### E. Animations

**Use Sparingly:**
- Page transitions: Subtle fade-in for route changes (200ms)
- Card hover: Scale 1.02 with shadow increase (150ms ease-out)
- Success states: Gentle checkmark animation on payment success
- Loading: Skeleton screens with subtle shimmer (cultural pattern overlay)
- **Avoid:** Excessive scroll animations, distracting micro-interactions

---

## Cultural Visual Elements

**African Pattern Integration:**
- Geometric Adinkra-inspired patterns as subtle background textures (5% opacity)
- Use in certificate borders, section dividers, and card accents
- Never overwhelming - modern interpretation, not literal reproduction

**Photography & Imagery:**
- **Hero Section:** Large, vibrant image of West African designers collaborating (workshop/creative space)
- **Speaker Profiles:** Circular frames with subtle pattern border
- **Sponsor Logos:** On clean white/dark cards with ample breathing room
- **Cultural Icons:** Custom icon set with African geometric influence (use Font Awesome as base, custom where needed)

**Trust & Security Visuals:**
- Secure payment pages: Lock icons, "256-bit encryption" badges, payment provider logos (Paystack/Flutterwave)
- Certificate previews: Professional layout with WADF branding and cultural border
- Admin dashboard: Clean, data-forward design (Linear/Notion inspired) with WADF color accents

---

## Page-Specific Layouts

**Landing Page (Public):**
- Hero: Full-viewport with stunning image, large headline, dual CTA (Buy Tickets + View Agenda)
- Features: 3-column grid showcasing platform benefits
- Speakers: Horizontal scroll carousel with profile cards
- Sponsors: Tiered logo display (Diamond → Supporter)
- FAQ: Accordion with cultural accent dividers
- Footer: Newsletter, social links, quick nav, trust badges

**Ticket Purchase Flow:**
- Clean, focused design (Stripe checkout inspired)
- Progress indicator (3 steps: Select → Details → Payment)
- Large ticket cards with clear pricing
- Secure payment form with trust indicators
- Success page with confetti animation, account creation confirmation

**Agenda (Authenticated):**
- Full-width timeline layout
- Filters: Track, day, speaker (sticky sidebar on desktop)
- Session cards: Speaker photo, title, time, rating preview, "Mark Attendance" button
- Personalized view toggle: "My Agenda" shows only marked sessions
- Offline indicator when cached

**Admin Dashboard:**
- Sidebar navigation with role indicator
- Stats cards: Revenue, attendees, proposals (with trend indicators)
- Data tables: Sortable, filterable, with bulk actions
- Task management: Kanban-style board for organizer workflows

---

## Accessibility & Performance

- High contrast ratios (WCAG AAA for text, AA for UI)
- Focus indicators with brand color glow
- Keyboard navigation throughout
- Lazy loading for images with skeleton screens
- Service worker for offline agenda caching
- Optimized images (WebP with fallbacks, responsive sizing)

---

**Design Philosophy Summary:** Celebrate African creative excellence through modern, professional design that builds trust, especially in financial interactions. Balance cultural authenticity with universal usability. Every pixel should inspire confidence and showcase the vibrant spirit of West African design.