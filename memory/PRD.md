# TC Pro Dojo - Product Requirements Document

## Original Problem Statement
Build and manage a full-stack website for "Torture Chamber Pro Wrestling Dojo" - a martial arts/pro wrestling training school. The site requires public-facing pages, an admin dashboard for content management, and integrations with Cloudinary (media), Resend (email), Stripe (payments), and MongoDB (data).

## Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Integrations:** Cloudinary, Resend, Stripe, Google Maps
- **Deployment:** Render (user's production host)

## Core Architecture
```
/app/backend/server.py          - All API endpoints (~1870 lines)
/app/frontend/src/App.js        - Route definitions
/app/frontend/src/pages/        - Public pages (Home, Training, Classes, Events, Pros, Media, Shop, Contact)
/app/frontend/src/pages/admin/  - Admin pages (Dashboard, ClassSchedule, Media, Products, SiteSettings, etc.)
/app/frontend/src/components/   - Shared components (AdminNav, CloudinaryUploader, Footer)
```

## Admin Credentials
- Username: `admin` / Password: `tcprodojo2025`

## What's Been Implemented

### Public Pages
- Home (dynamic logos, testimonials, video)
- Training (curriculum, tips, photo grid from media gallery)
- Classes (weekly schedule with multi-day/multi-time recurring + one-time classes)
- Events (past events with YouTube embeds, photo rows)
- Success/Coaches (success stories, endorsements, coaches, configurable photos)
- Media (gallery of podcasts, videos, photos, articles)
- Shop (product grid, cart, checkout with Stripe, shipping zones)
- Contact (FAQs, contact form with Resend notifications)

### Admin Dashboard Features
- Coaches, Events, Pros/Success Stories, Endorsements, Testimonials, Tips management
- Class Schedule (recurring multi-day/multi-time + one-time special classes)
- Class cancellation/reschedule with student email notifications
- Media management (CRUD with Cloudinary uploads, category system)
- Site Settings (logos, branding, dozens of page photo spots)
- Student database with email list export
- Newsletter subscribers + compose/send newsletters via Resend
- Contact form submissions viewer
- Product management (CRUD for shop inventory)
- Order viewing

### Key Features
- Multi-day/multi-time class scheduling (e.g., Mon @ 6PM, Wed @ 7:30PM)
- Stripe Checkout integration for shop payments
- Flat-rate shipping: QC $10, Canada $15, International $25
- Order confirmation emails (admin + customer)
- Cache-busting: No-cache middleware + axios interceptor with timestamp
- Paragraph rendering (whitespace-pre-line) across all text
- YouTube URL auto-conversion to embed format

## Completed Tasks

### Feb 2026
- Media page (public + admin), Site Settings admin panel, Cloudinary integration
- Student database, address update with Google Maps, Resend email integration
- Newsletter compose/send, one-time class scheduling, FAQ updates
- Training page photo grid, classes/coaches page photo spots
- Media category system ("general" vs "grid")

### Mar 2026
- Multi-day/multi-time class scheduling (schedule: [{day, time}])
- Classes page redesign: day-card layout, only active days shown
- Same-time classes displayed side-by-side
- Email notifications: enrolled students notified on cancel/reschedule
- Admin email preview (cancellation + reschedule)
- Global no-cache middleware + axios interceptor for cache-busting
- Shop page with Stripe Checkout, cart drawer, shipping zones
- Admin Products CRUD, Admin Orders viewer
- Order confirmation emails (admin notification + customer receipt)
- Fixed requirements.txt with --extra-index-url for production deployment

## DB Schema (Key Collections)
- `class_schedules`: {id, title, instructor, level, spots, type, description, is_one_time, one_time_date, day, days, time, schedule: [{day, time}]}
- `products`: {id, name, description, price, imageUrl, sizes, category, active, displayOrder}
- `orders`: {id, customer_name, customer_email, items, shipping_address, shipping_zone, shipping_cost, subtotal, total, stripe_session_id, payment_status}
- `media`: {id, title, description, mediaType, mediaUrl, thumbnailUrl, externalLink, category, displayOrder}
- `site_settings`: {id, settingKey, settingValue, settingType, description}

## Upcoming/Future Tasks
- (P1) Wire up media categories to respective pages (Events, Coaches, Classes, Home photo galleries) — currently no media uploaded
- (P2) Refactor server.py into modular route files (currently ~1870 lines)
- (P2) Create useSiteSettings() custom hook to reduce code duplication
- (P2) Group AdminSiteSettings.js predefined settings by page

## Known Issues
- Git history divergence when using "Save to Github" — advise user to create new branch if conflicts arise
- User routinely tests on production domain instead of preview URL — always remind them to "Save to Github" and redeploy

## Testing Status
- iteration_5.json: 100% backend (21/21), 100% frontend — Multi-day scheduling, Shop, Products all verified
