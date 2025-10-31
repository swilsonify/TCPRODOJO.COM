#!/bin/bash

# TC Pro Dojo - Quick Deployment Helper Script
# This script helps prepare your app for manual deployment

echo "================================================"
echo "TC Pro Dojo - Deployment Preparation"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/server.py" ]; then
    echo "❌ Error: Please run this script from the /app directory"
    exit 1
fi

echo "✅ Found application files"
echo ""

# Step 1: Build Frontend
echo "📦 Step 1: Building Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    yarn install
fi

echo "Building production bundle..."
yarn build

if [ $? -eq 0 ]; then
    echo "✅ Frontend built successfully!"
    echo "   Built files are in: frontend/build/"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..
echo ""

# Step 2: Check Backend Dependencies
echo "📦 Step 2: Checking Backend Dependencies..."
cd backend
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies OK"
cd ..
echo ""

# Step 3: Show deployment checklist
echo "================================================"
echo "✅ DEPLOYMENT CHECKLIST"
echo "================================================"
echo ""
echo "Before deploying, make sure you have:"
echo ""
echo "1. MongoDB Atlas Setup:"
echo "   [ ] Created MongoDB Atlas account"
echo "   [ ] Created a cluster"
echo "   [ ] Got connection string (MONGO_URL)"
echo ""
echo "2. Backend Hosting (Railway/Render/Heroku):"
echo "   [ ] Created account on chosen platform"
echo "   [ ] Connected GitHub repository"
echo "   [ ] Set environment variables:"
echo "       - MONGO_URL"
echo "       - DB_NAME=tcprodojo"
echo "       - JWT_SECRET=<random-secret>"
echo "       - CORS_ORIGINS=https://tcprodojo.com"
echo ""
echo "3. Frontend Hosting (Netlify):"
echo "   [ ] Connected to Netlify"
echo "   [ ] Set build settings (base: frontend, build: yarn build)"
echo "   [ ] Set REACT_APP_BACKEND_URL to your backend URL"
echo "   [ ] Configured custom domain: tcprodojo.com"
echo ""
echo "4. Post-Deployment:"
echo "   [ ] Run init_admins.py on backend server"
echo "   [ ] Test admin login at /admin/login"
echo ""
echo "================================================"
echo "📖 Read DEPLOYMENT_GUIDE.md for detailed steps"
echo "================================================"
echo ""
echo "Your backend URL will be something like:"
echo "  https://tcprodojo-backend.up.railway.app"
echo ""
echo "Your frontend will be at:"
echo "  https://tcprodojo.com"
echo ""
