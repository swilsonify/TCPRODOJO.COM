# TC Pro Dojo Website - PRD

## Original Problem Statement
1. Add a Media page displaying podcasts, videos, photos, articles in a grid gallery layout
2. Admin ability to change logos and headers from admin panel
3. Store logo links like other Cloudinary assets
4. Cloudinary upload widget for direct uploads from admin
5. Add Newsletter Subscribers database management
6. Add Student database for class change notifications
7. Update address to include "Suite 200"
8. Add Google Maps link to address

## Architecture

### Tech Stack
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT Bearer Tokens
- **Image Storage**: Cloudinary (with direct upload widget)

### Databases/Collections
1. **newsletter_subscriptions** - Email subscribers for newsletter
2. **students** - Student database for class change notifications
3. **media** - Media gallery items (photos, videos, podcasts, articles)
4. **site_settings** - Logo URLs and branding settings

### New Components Added

1. **Public Media Page** (`/media`)
   - Grid gallery with filter tabs (All, Photos, Videos, Podcasts, Articles)

2. **Admin Media Management** (`/admin/media`)
   - CRUD with Cloudinary Upload Widget

3. **Admin Site Settings** (`/admin/site-settings`)
   - Logo management with Cloudinary Upload Widget
   - Quick Add presets

4. **Admin Newsletter Subscribers** (`/admin/newsletter`) - Already existed
   - View/delete subscribers
   - Download CSV
   - Copy all emails

5. **Admin Student Database** (`/admin/students`) - NEW
   - CRUD for students
   - Class enrollment tracking
   - Notification preferences (notify_class_changes toggle)
   - Copy Notify Emails button for class change notifications
   - Download CSV export

6. **CloudinaryUploader Component**
   - Drag & drop upload with progress
   - Preview and auto-fill URL

### Address Updates
- Updated to: **9800 Rue Meilleur, Suite 200, Montréal, QC H3L 3J4**
- Added Google Maps link (clickable in Footer and Contact page)

## What's Been Implemented (Feb 2026)
- [x] Media page with filter tabs
- [x] Admin Media CRUD with Cloudinary upload
- [x] Admin Site Settings for logos
- [x] Cloudinary Upload Widget integration
- [x] Student Database with class notification management
- [x] Newsletter Subscribers (existing)
- [x] Address updated to Suite 200
- [x] Google Maps links added

## Next Tasks
1. Use "Save to Github" to push changes
2. Add students to the database
3. Test Cloudinary uploads for media/logos
