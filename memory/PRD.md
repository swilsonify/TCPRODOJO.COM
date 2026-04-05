# TC Pro Dojo Website - PRD

## Original Problem Statement
Make all the photos in the galleries on the site clickable so that they can be expanded.

## Project Overview
Torture Chamber Pro Wrestling Dojo - Official Website
A full-stack web application with admin panel for managing events, trainers, testimonials, and contact messages.

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT Bearer Tokens

## User Personas
1. **Visitors**: People interested in pro wrestling training, viewing events, and learning about the dojo
2. **Students**: Current/prospective students checking class schedules and training info
3. **Admin**: Staff managing content (events, trainers, testimonials, media)

## Core Requirements
- Public pages: Home, Training, Classes, Events, Pros (Success), Media, Shop, Contact
- Admin panel for content management
- Responsive design with blue/black wrestling-themed aesthetic

## What's Been Implemented

### January 2026 - Image Lightbox Feature
**Date**: January 5, 2026

Added clickable/expandable photo galleries across all site pages:

1. **Created ImageLightbox Component** (`/app/frontend/src/components/ImageLightbox.js`)
   - Full-screen lightbox overlay with dark background
   - Close button (X) and Escape key support
   - Zoom in/out capability with click toggle
   - Navigation arrows for multiple images (left/right)
   - Keyboard navigation (Arrow keys)
   - Image counter showing position (1/5, etc.)
   - Hover effect showing ZoomIn icon on images

2. **Pages Updated**:
   - **Media.js**: Photos in media gallery clickable with gallery navigation
   - **Home.js**: Testimonial photos and home bottom photo clickable
   - **Events.js**: Event posters, past event thumbnails, events photo row all clickable
   - **Pros.js**: Success story photos, coach photos, page photos clickable
   - **Training.js**: Featured photo and grid photos clickable with gallery navigation
   - **Classes.js**: Header and schedule photos clickable

3. **UX Features**:
   - Hover overlay with ZoomIn icon for all clickable images
   - Smooth transitions and animations
   - Proper test IDs for automation (`data-testid`)
   - Gallery navigation maintains context within photo groups

## P0/P1/P2 Features Remaining

### P0 (Critical)
- None currently identified

### P1 (Important)
- Image optimization for faster loading
- Lazy loading for gallery images

### P2 (Nice to Have)
- Swipe gestures for mobile lightbox navigation
- Image download option in lightbox
- Slideshow/auto-play mode

## Next Tasks
1. Test lightbox functionality with actual uploaded images via admin panel
2. Consider adding image captions to lightbox view
3. Optimize image loading performance

## Admin Credentials
- Default: `admin` / `tcprodojo2025`
- Secondary: `rodney` / `tcprodojo2025`
