# Torture Chamber Pro Wrestling Dojo - Official Website

A full-stack web application with admin panel for managing events, trainers, testimonials, and contact messages.

## 🏗️ Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT Bearer Tokens

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- Yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/swilsonify/tcprodojo-site.git
   cd tcprodojo-site
   ```

2. **Set up Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Create .env file
   echo "MONGO_URL=mongodb://localhost:27017" > .env
   echo "DB_NAME=tcprodojo" >> .env
   echo "JWT_SECRET=your-secret-key" >> .env
   
   # Initialize admin users
   python init_admins.py
   
   # Run backend
   uvicorn server:app --reload --port 8001
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   yarn install
   
   # Create .env file
   echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
   
   # Run frontend
   yarn start
   ```

4. **Access the application**
   - Website: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin/login
   - Default credentials: `admin` / `tcprodojo2025`

## 📦 Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete manual deployment instructions.

### Quick Deployment Options

**Backend**: Railway, Render, or Heroku  
**Frontend**: Netlify or Vercel  
**Database**: MongoDB Atlas (Free Tier)

### Deployment Files Included
- `Procfile` - Heroku configuration
- `railway.json` - Railway configuration
- `render.yaml` - Render configuration
- `netlify.toml` - Netlify configuration

## 🔐 Admin Panel Features

- **Events Management**: Create, edit, delete events
- **Trainers Management**: Manage trainer profiles with achievements
- **Testimonials**: Manage student testimonials
- **Contact Messages**: View contact form submissions
- **Secure Authentication**: JWT-based login system

## 🌐 Public Pages

- Home
- Training Programs
- Classes Schedule
- Events
- Pro Wrestlers & Trainers
- Shop (Square Online integration)
- Contact

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=tcprodojo
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://tcprodojo.com
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## 🔧 Development Scripts

```bash
# Frontend
cd frontend
yarn start          # Start dev server
yarn build          # Build for production
yarn test           # Run tests

# Backend
cd backend
uvicorn server:app --reload  # Start dev server
python init_admins.py        # Initialize admin users
```

## 📚 Project Structure

```
tcprodojo-site/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── init_admins.py         # Admin user initialization
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   │   ├── admin/        # Admin panel pages
│   │   │   └── ...           # Public pages
│   │   ├── components/       # Reusable components
│   │   └── App.js            # Main React component
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
├── DEPLOYMENT_GUIDE.md       # Detailed deployment guide
└── README.md                 # This file
```

## 🎯 Admin Credentials

**Default Admin Users**:
- Username: `admin` / Password: `tcprodojo2025`
- Username: `rodney` / Password: `tcprodojo2025`

**⚠️ Important**: Change these passwords in production!

## 🤝 Contributing

This is a private project for Torture Chamber Pro Wrestling Dojo.

## 📄 License

All rights reserved © 2025 Torture Chamber Pro Wrestling Dojo

## 🆘 Support

For issues or questions about deployment, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
