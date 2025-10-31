# Manual Deployment Guide for TC Pro Dojo

This guide will help you deploy the Torture Chamber Pro Wrestling Dojo website manually across different platforms.

## Architecture

- **Frontend**: React app (static files)
- **Backend**: FastAPI Python server
- **Database**: MongoDB

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new cluster (Free Tier M0 is fine)

### 1.2 Configure Database Access
1. Go to "Database Access" → Add New Database User
2. Create a username and password (save these!)
3. Set permissions to "Read and write to any database"

### 1.3 Configure Network Access
1. Go to "Network Access" → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0) for now

### 1.4 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Save this as your `MONGO_URL`

---

## Step 2: Deploy Backend (FastAPI)

### Option A: Railway (Recommended - Easy & Free Tier)

1. **Sign up at https://railway.app**
2. **Create New Project** → Deploy from GitHub
3. **Connect your repository**: `swilsonify/tcprodojo-site`
4. **Configure Environment Variables**:
   - Click on your service → Variables tab
   - Add these variables:
     ```
     MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     DB_NAME=tcprodojo
     JWT_SECRET=your-secret-key-here-make-it-random
     CORS_ORIGINS=https://tcprodojo.com,https://www.tcprodojo.com
     PORT=8001
     ```
5. **Railway will auto-detect and deploy**
6. **Get your backend URL**: It will be something like `https://tcprodojo-backend-production.up.railway.app`
7. **Save this URL** - you'll need it for the frontend

### Option B: Render (Alternative)

1. **Sign up at https://render.com**
2. **New Web Service** → Connect GitHub repository
3. **Configure**:
   - Name: `tcprodojo-backend`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables** (same as Railway above)
5. **Deploy** - Render will build and deploy
6. **Get your backend URL** from Render dashboard

### Option C: Heroku

1. **Sign up at https://heroku.com**
2. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
3. **Deploy**:
   ```bash
   heroku login
   heroku create tcprodojo-backend
   
   # Set environment variables
   heroku config:set MONGO_URL="your-mongodb-url"
   heroku config:set DB_NAME="tcprodojo"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set CORS_ORIGINS="https://tcprodojo.com"
   
   # Deploy
   git push heroku main
   ```

---

## Step 3: Deploy Frontend (React)

### 3.1 Update Frontend Environment Variables

Before deploying, you need to update the frontend to point to your backend:

**Option 1: Update `.env` file locally**
```bash
# In frontend/.env
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

**Option 2: Set on hosting platform (recommended)**

### 3.2 Deploy to Netlify

1. **Build the frontend locally first**:
   ```bash
   cd frontend
   yarn install
   yarn build
   ```

2. **Sign in to Netlify**: https://app.netlify.com
3. **New site from Git** → Connect GitHub
4. **Configure Build Settings**:
   - Base directory: `frontend`
   - Build command: `yarn build`
   - Publish directory: `frontend/build`
5. **Add Environment Variable**:
   - Go to Site Settings → Environment Variables
   - Add: `REACT_APP_BACKEND_URL` = `https://your-backend-url.railway.app`
6. **Deploy**

### 3.3 Configure Custom Domain (tcprodojo.com)

1. **In Netlify**:
   - Go to Domain Settings
   - Add custom domain: `tcprodojo.com` and `www.tcprodojo.com`
   - Netlify will provide DNS settings

2. **Update Your Domain Registrar**:
   - Go to where you bought tcprodojo.com
   - Update DNS settings with Netlify's nameservers or:
     - A Record: `@` → Netlify IP
     - CNAME: `www` → your-site.netlify.app

3. **Wait for DNS propagation** (can take 24-48 hours)

---

## Step 4: Initialize Admin Users

After backend is deployed, you need to create admin users:

1. **SSH into your backend server** or run locally:
   ```bash
   cd backend
   python init_admins.py
   ```

2. **Or manually insert into MongoDB Atlas**:
   - Go to your cluster → Browse Collections
   - Create collection: `admins`
   - Insert documents with hashed passwords

---

## Step 5: Test Your Deployment

1. **Visit your site**: https://tcprodojo.com
2. **Test admin login**: https://tcprodojo.com/admin/login
   - Username: `admin`
   - Password: `tcprodojo2025`
3. **Test all features**: Events, Trainers, Testimonials, etc.

---

## Troubleshooting

### Frontend can't connect to backend
- Check `REACT_APP_BACKEND_URL` is set correctly
- Verify CORS_ORIGINS includes your frontend domain
- Check browser console for errors

### Backend 500 errors
- Check MongoDB connection string is correct
- Verify environment variables are set
- Check backend logs on Railway/Render

### Admin login not working
- Ensure `init_admins.py` was run
- Check MongoDB has `admins` collection
- Verify JWT_SECRET is set

---

## Environment Variables Summary

**Backend**:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=tcprodojo
JWT_SECRET=your-random-secret-key-here
CORS_ORIGINS=https://tcprodojo.com,https://www.tcprodojo.com
PORT=8001
```

**Frontend**:
```
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

---

## Cost Estimate

- **MongoDB Atlas**: Free (M0 tier, 512MB storage)
- **Railway**: Free tier (500 hours/month, $5 credit)
- **Netlify**: Free (100GB bandwidth, unlimited sites)
- **Custom Domain**: You already own tcprodojo.com

**Total: $0/month** (on free tiers)

---

## Need Help?

If you run into issues:
1. Check the logs on your hosting platform
2. Verify all environment variables are set
3. Test the backend API directly: `https://your-backend.railway.app/api/`
4. Check MongoDB connection in Atlas dashboard
