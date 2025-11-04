# Photo & Video Upload Guide for TC Pro Dojo Admin

## ✅ Photo & Video Fields Added!

Your admin panel now has photo and video fields for:
- **Events**: Event image + video highlight
- **Trainers**: Trainer photo + training video
- **Testimonials**: Person photo + video testimonial

---

## 📸 How to Upload Photos

### **Option 1: Imgur (Recommended - No Account Needed)**

1. Go to: https://imgur.com
2. Click **"New post"** (top left)
3. Drag and drop your photo OR click to browse
4. Wait for upload to complete
5. **Right-click the uploaded image** → **"Copy image address"**
6. Paste the URL into your admin form

**Example URL**: `https://i.imgur.com/abc123.jpg`

---

### **Option 2: Cloudinary (Free Account)**

1. Go to: https://cloudinary.com/users/register/free
2. Sign up for free account
3. Upload images to Media Library
4. Click image → Copy URL
5. Paste into admin form

---

### **Option 3: Store in GitHub Repository**

1. Go to your GitHub repository
2. Navigate to: `frontend/public/images/`
3. Click **"Add file"** → **"Upload files"**
4. Upload your images
5. Use relative path in admin: `/images/your-photo.jpg`

---

## 🎥 How to Add Videos

### **YouTube (Recommended)**

1. Upload video to YouTube
2. Click **"Share"** button
3. Copy the URL (e.g., `https://www.youtube.com/watch?v=abc123`)
4. Paste into admin form video field

**The website will automatically convert it to an embedded player!**

---

### **Vimeo**

1. Upload video to Vimeo
2. Click **"Share"**
3. Copy the URL
4. Paste into admin form

---

## 💡 Tips

### **For Photos:**
- Use **JPG** for photos (smaller file size)
- Use **PNG** for logos/graphics (better quality)
- Recommended size: **1920x1080** or smaller
- Keep file size under 5MB

### **For Videos:**
- YouTube is best for long videos (no limits)
- Keep videos under 5 minutes for best engagement
- Add captions/subtitles for accessibility

---

## 🎯 Quick Workflow

**Adding an Event with Photo:**

1. Login to admin: https://tcprodojo.com/admin/login
2. Go to **Events Manager**
3. Click **"Add Event"**
4. Fill in: Title, Date, Time, Location, Description
5. Upload event poster to Imgur
6. Copy image URL from Imgur
7. Paste into **"Event Image URL"** field
8. (Optional) Add YouTube video in **"Event Video URL"**
9. Click **"Create Event"**

✅ Done! The event now shows the image on your website!

---

## 📝 Example URLs

**Valid Photo URLs:**
```
https://i.imgur.com/abc123.jpg
https://res.cloudinary.com/demo/image/upload/sample.jpg
/images/event-poster.jpg
```

**Valid Video URLs:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://vimeo.com/123456789
```

---

## ⚠️ Common Issues

**Image not showing?**
- Make sure URL starts with `https://` or `/`
- Check if image is publicly accessible
- Try opening URL in browser to verify

**Video not playing?**
- Use YouTube or Vimeo URLs (not uploaded files)
- Make sure video is set to **"Public"** not "Private"
- Copy the full watch URL from YouTube

---

## 🚀 Next Steps

1. Upload a test photo to Imgur
2. Add it to an event in your admin panel
3. Visit your website to see it live!

Need help? The fields show placeholder text with example URLs.
