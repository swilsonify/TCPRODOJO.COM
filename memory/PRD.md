# TC Pro Dojo - Product Requirements Document

## Original Problem Statement
Build and manage a full-stack website for "Torture Chamber Pro Wrestling Dojo" - a martial arts/pro wrestling training school. The site requires public-facing pages, an admin dashboard for content management, and integrations with Cloudinary (media), Resend (email), and MongoDB (data).

## Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Integrations:** Cloudinary, Resend, Google Maps
- **Deployment:** Render

## Core Architecture
```
/app/backend/server.py          - All API endpoints
/app/frontend/src/App.js        - Route definitions
/app/frontend/src/pages/        - Public pages
/app/frontend/src/pages/admin/  - Admin pages
/app/frontend/src/components/   - Shared components
```

## Admin Credentials
- Username: `admin` / Password: `tcprodojo2025`

## What's Been Implemented

### Public Pages
- Home (dynamic logos, testimonials, video)
- Training (curriculum, tips, 12-photo grid from media gallery)
- Classes (schedule with recurring + one-time classes, photo spot)
- Events
- Success/Coaches (success stories, endorsements, coaches, configurable photo spot)
- Media (gallery of podcasts, videos, photos, articles)
- Contact (FAQs, contact form with Resend notifications)
- Shop

### Admin Dashboard Features
- Coaches, Events, Pros/Success Stories, Endorsements, Testimonials, Tips management
- Class Schedule (recurring + one-time special classes)
- Media management (CRUD with Cloudinary uploads)
- Site Settings (logos, branding, page photos - all configurable)
- Student database with email list export
- Newsletter subscribers + compose/send newsletters via Resend
- Contact form submissions viewer

### Key Features
- Cloudinary Upload Widget for admin media uploads
- Resend email integration (contact notifications, newsletter signups, newsletter sending)
- Dynamic site settings for logos and page photos
- Address with Google Maps link ("Suite 200" included)
- One-time/special class scheduling

## Completed Tasks (Feb 2026)
- [x] Media page (public + admin)
- [x] Site Settings admin panel
- [x] Cloudinary integration
- [x] Student database + admin
- [x] Address update with Google Maps link
- [x] Resend email integration (contacts + signups)
- [x] Newsletter compose/send feature
- [x] One-time class scheduling
- [x] Testimonial image cropping fix
- [x] FAQ content update
- [x] Classes page photo spot
- [x] Coaches page photo spot (above CTA, via Site Settings)
- [x] Training page 12-photo grid (from Media gallery, above "How It Works")

## Upcoming/Future Tasks
- None specified by user

## Known Issues
- Git history divergence when using "Save to Github" - advise user to create new branch if conflicts arise
