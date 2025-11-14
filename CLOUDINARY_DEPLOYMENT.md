# 🚀 DEPLOYMENT INSTRUCTIONS - CLOUDINARY INTEGRATION

## ✅ What Was Done:
- Integrated Cloudinary for permanent cloud photo/video storage
- Updated backend to upload/list/delete from Cloudinary
- Updated Media Library UI to work with Cloudinary URLs
- Photos now persist permanently (no more disappearing!)

## 📋 Deployment Steps:

### Step 1: Add Environment Variables to Render

1. Go to https://dashboard.render.com/
2. Click on your backend service (**tcprodojo-com**)
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add these 3 variables:

**Variable 1:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Value: `dpx8a9k7c`

**Variable 2:**
- Key: `CLOUDINARY_API_KEY`
- Value: `915363814751528`

**Variable 3:**
- Key: `CLOUDINARY_API_SECRET`
- Value: `swMIzE7d3cJ_Z0cVM0K0_HKs820`

6. Click **"Save Changes"**

---

### Step 2: Deploy Backend to Render

1. In Render dashboard, go to your backend service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 3-5 minutes for deployment
4. Check logs for "Application startup complete"

---

### Step 3: Save Code to GitHub

1. Click **"Save to Github"** in Emergent
2. This will push all code changes
3. Netlify will auto-deploy frontend (2-3 minutes)

---

### Step 4: Test Photo Upload

After all deployments complete:

1. Go to https://tcprodojo.com/admin/login
2. Login with elizabeth / Kitch3n3r22
3. Go to **"Media Library"**
4. Click **"Upload Files"** and select a photo
5. Photo will upload to Cloudinary ☁️
6. Click **"Copy URL"** 
7. Use the URL in Success Stories, Coaches, etc.
8. Photo will display permanently!

---

## 🎯 Benefits:
- ✅ Photos stored in cloud (never disappear)
- ✅ Fast CDN delivery
- ✅ Automatic image optimization
- ✅ Videos supported
- ✅ Free tier: 25GB storage, 25GB bandwidth/month

---

## ⚠️ Important:
Make sure to deploy in this order:
1. Add Render environment variables FIRST
2. Deploy Render backend
3. Save to GitHub (deploys frontend automatically)

---

## 🐛 Troubleshooting:
- If photos don't show: Clear browser cache
- If upload fails: Check Render logs for errors
- If credentials wrong: Double-check environment variables in Render
