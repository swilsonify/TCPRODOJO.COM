# Quick Backend Deployment on Railway

## Step-by-Step Railway Deployment

### 1. Sign Up for Railway
Go to: https://railway.app
Click "Start a New Project" → "Deploy from GitHub repo"

### 2. Connect Your Repository
- Authorize Railway to access GitHub
- Select: tcprodojo-site
- Railway will auto-detect it's a Python app

### 3. Configure Root Directory
After connecting, click on your service → Settings:
- **Root Directory**: `backend`
- **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 4. Add Environment Variables
Click "Variables" tab and add these:

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=tcprodojo
JWT_SECRET=make-this-a-random-32-character-string
CORS_ORIGINS=https://your-netlify-site.netlify.app
PORT=8001
```

**Important**: 
- For MONGO_URL, you need MongoDB Atlas (see Step 5)
- For JWT_SECRET, use a random string (or generate with: `openssl rand -hex 32`)
- For CORS_ORIGINS, use your Netlify URL (you'll get this after Netlify deploys)

### 5. Set Up MongoDB Atlas (Free)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a cluster (M0 Free tier)
4. Create Database User:
   - Go to "Database Access"
   - Add new user with username/password
   - Save the password!
5. Whitelist all IPs:
   - Go to "Network Access"
   - Add IP: 0.0.0.0/0 (allow from anywhere)
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - This is your `MONGO_URL`

### 6. Initialize Admin Users

After backend deploys on Railway:
1. Go to your Railway project
2. Click on your service
3. Go to "Deployments" tab
4. Find the latest deployment
5. You need to run: `python init_admins.py`

**Option A: Use Railway CLI**
```bash
railway login
railway link
railway run python backend/init_admins.py
```

**Option B: Add to deployment**
In Railway settings, temporarily change start command to:
```
cd backend && python init_admins.py && uvicorn server:app --host 0.0.0.0 --port $PORT
```
Then deploy, then change it back.

### 7. Get Your Backend URL

After deployment completes:
- Railway will show you a URL like: `https://tcprodojo-backend-production.up.railway.app`
- Copy this URL - you'll need it for Netlify!

### 8. Update Netlify Environment Variable

Go back to Netlify:
1. Site settings → Environment variables
2. Edit `REACT_APP_BACKEND_URL`
3. Change from `http://localhost:8001` to your Railway URL
4. Click "Save"
5. Trigger a new deploy: Deploys → Trigger deploy → Deploy site

### 9. Update Railway CORS

Go back to Railway:
1. Variables tab
2. Update `CORS_ORIGINS` with your Netlify URL
3. Example: `https://tcprodojo.netlify.app,https://your-custom-domain.com`

---

## Your URLs After Deployment

**Frontend (Netlify)**: https://your-site-name.netlify.app
**Backend (Railway)**: https://tcprodojo-backend-production.up.railway.app
**Database**: MongoDB Atlas (connection string in Railway env vars)

**Admin Login**: https://your-site-name.netlify.app/admin/login
- Username: admin
- Password: tcprodojo2025

---

## Testing Your Deployment

1. Visit your Netlify URL
2. Check if the homepage loads
3. Try navigating to different pages
4. Test admin login at: /admin/login
5. Try creating an event in the admin panel

If something doesn't work:
- Check Railway logs for backend errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Make sure MongoDB connection string is correct

---

## Costs

- **Railway**: Free tier (500 hours/month, $5 credit)
- **Netlify**: Free (100GB bandwidth)
- **MongoDB Atlas**: Free (M0 tier, 512MB)

**Total: $0/month** on free tiers!
