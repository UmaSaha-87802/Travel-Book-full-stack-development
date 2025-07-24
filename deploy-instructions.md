# 🚀 TRAVELBOOK DEPLOYMENT INSTRUCTIONS

## Prerequisites
- GitHub account
- MongoDB Atlas account  
- Render.com account
- Netlify.com account

## Step 1: GitHub Setup
1. Create repository: `travelbook-system`
2. Run commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/travelbook-system.git
git branch -M main
git push -u origin main
```

## Step 2: MongoDB Atlas Setup
1. Create cluster: `travelbook-cluster`
2. Create user: `traveladmin` 
3. Get connection string: `mongodb+srv://traveladmin:PASSWORD@travelbook-cluster.xxxxx.mongodb.net/travel-booking`

## Step 3: Render Backend Deployment
- **Service Name**: `travelbook-backend`
- **Repository**: `travelbook-system`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://traveladmin:PASSWORD@cluster.mongodb.net/travel-booking
JWT_SECRET=travelbook-super-secure-jwt-secret-production-key-123456789
FRONTEND_URL=https://travelbook-app.netlify.app
```

**Backend URL**: `https://travelbook-backend.onrender.com`

## Step 4: Netlify Frontend Deployment
- **Site Name**: `travelbook-app`
- **Repository**: `travelbook-system`
- **Base Directory**: `client`
- **Build Command**: `npm run build`
- **Publish Directory**: `client/dist`

### Environment Variables:
```
VITE_API_URL=https://travelbook-backend.onrender.com/api
VITE_APP_NAME=TravelBook
VITE_APP_VERSION=1.0.0
```

**Frontend URL**: `https://travelbook-app.netlify.app`

## Step 5: Seed Production Database
After backend deployment:
1. Go to Render dashboard
2. Open your service shell
3. Run: `npm run seed`

## Step 6: Test Your Live App
- **Admin Login**: admin@travel.com / admin123
- **Test Features**: Registration, booking, admin panel

## Final URLs:
- **Live App**: https://travelbook-app.netlify.app
- **API**: https://travelbook-backend.onrender.com
- **Admin Panel**: https://travelbook-app.netlify.app/admin

## Support:
- Check Render logs for backend issues
- Check Netlify deploy logs for frontend issues
- Check MongoDB Atlas for database issues

🎉 Your TravelBook will be live in ~10 minutes after following these steps!