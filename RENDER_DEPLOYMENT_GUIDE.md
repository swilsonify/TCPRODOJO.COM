# TC Pro Dojo - Render + MongoDB Atlas Deployment Guide

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Choose "Free Shared" cluster (M0)
4. Select cloud provider: AWS
5. Region: Choose closest to Oregon (e.g., us-west-2)
6. Cluster Name: tcprodojo-cluster
7. Click "Create Cluster" (takes 1-3 minutes)

### 1.2 Create Database User
1. In Atlas dashboard, click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `tcprodojo_admin`
5. Password: Generate secure password (SAVE THIS!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Whitelist IP Addresses
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect
   - For production, you can restrict to Render IPs later
4. Click "Confirm"

### 1.4 Get Connection String
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Python, Version: 3.12 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://tcprodojo_admin:<password>@tcprodojo-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with the actual password you created
7. **SAVE THIS CONNECTION STRING** - you'll need it for Render

---

## Step 2: Configure Render Deployment

### 2.1 Fix Current Render Settings
**IMPORTANT: You need to change these settings in your current Render form:**

1. **Language**: Change from "Node" to **"Python 3"**
   
2. **Root Directory**: Leave blank OR set to `backend` if Render asks
   
3. **Build Command**: 
   ```
   pip install -r requirements.txt
   ```
   
4. **Start Command**:
   ```
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

5. **Branch**: `main` (keep as is)

6. **Region**: Oregon (US West) - keep as is

### 2.2 Set Environment Variables
After creating the service, go to "Environment" tab and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGO_URL` | `mongodb+srv://...` | Paste your MongoDB Atlas connection string |
| `DB_NAME` | `tcprodojo` | Database name |
| `JWT_SECRET` | `your-random-secure-key-here` | Generate a secure random string |
| `CORS_ORIGINS` | `*` | Allow all origins (or specify frontend URL) |
| `PYTHON_VERSION` | `3.11.0` | Python version |

**Generate JWT_SECRET:**
Run this in terminal to generate a secure key:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Step 3: Initialize Admin Users in MongoDB Atlas

After deployment, you need to create admin users in the MongoDB Atlas database.

### Option A: Use MongoDB Atlas Web Interface
1. Go to Atlas dashboard
2. Click "Browse Collections"
3. Create database: `tcprodojo`
4. Create collection: `admins`
5. Click "Insert Document"
6. Switch to JSON view and paste:

```json
{
  "username": "elizabeth",
  "password_hash": "$2b$12$YOUR_BCRYPT_HASH_HERE",
  "created_at": "2025-11-03T00:00:00Z"
}
```

**To generate password hash:**
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'Kitch3n3r22', bcrypt.gensalt()).decode('utf-8'))"
```

### Option B: Run Script After Deployment (Recommended)
1. After Render deploys successfully
2. Go to "Shell" tab in Render dashboard
3. Run:
```bash
cd backend
python auto_init_admins.py
```

---

## Step 4: Deploy and Test

### 4.1 Complete Render Deployment
1. Click "Create Web Service" at bottom of form
2. Wait for build to complete (5-10 minutes)
3. Look for "Live" status with green checkmark
4. Copy your Render URL: `https://tcprodo-ojcom.onrender.com`

### 4.2 Update Frontend
1. Update `/app/frontend/.env`:
   ```
   REACT_APP_BACKEND_URL=https://tcprodo-ojcom.onrender.com
   ```
2. Restart frontend:
   ```bash
   sudo supervisorctl restart frontend
   ```

### 4.3 Test Backend
Test if backend is working:
```bash
curl https://tcprodo-ojcom.onrender.com/api/
```

Should return:
```json
{"message": "Hello World"}
```

### 4.4 Test Admin Login
```bash
curl -X POST https://tcprodo-ojcom.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"elizabeth","password":"Kitch3n3r22"}'
```

Should return JWT token.

---

## Troubleshooting

### Build Fails
- Check "Logs" tab in Render
- Verify requirements.txt exists in backend folder
- Ensure Python version is compatible

### Database Connection Fails
- Verify MongoDB connection string is correct
- Check password has no special characters that need URL encoding
- Ensure Network Access allows 0.0.0.0/0

### Admin Login Fails
- Run `auto_init_admins.py` in Render shell
- Check MongoDB Atlas "Browse Collections" to verify admins exist

### CORS Errors
- Add your frontend URL to CORS_ORIGINS environment variable
- Or keep as `*` for development

---

## Next Steps After Deployment

1. ✅ Backend deployed on Render
2. ✅ Database on MongoDB Atlas
3. 🔄 Update frontend REACT_APP_BACKEND_URL
4. 🔄 Test all admin functionality
5. 🔄 Consider deploying frontend to Netlify for production

---

## Important Notes

- **Free Tier Limitations**: Render free tier spins down after 15 mins of inactivity (first request will be slow)
- **MongoDB Atlas Free Tier**: 512MB storage, sufficient for this app
- **Security**: Change JWT_SECRET and admin passwords for production
- **Backups**: MongoDB Atlas has automatic backups on free tier

## Need Help?
If you encounter issues during deployment, let me know at which step you're stuck!
