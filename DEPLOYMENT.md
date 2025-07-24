# Deployment Guide - Travel Package Booking System

This guide covers deploying your Full Stack Travel Package Booking System to production using popular hosting services.

## Deployment Architecture

- **Frontend**: Netlify or Vercel (Static hosting)
- **Backend**: Render or Railway (Node.js hosting)
- **Database**: MongoDB Atlas (Cloud database)

## Prerequisites

- GitHub account (for connecting repositories)
- Accounts on chosen hosting platforms
- MongoDB Atlas account

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new organization and project

### Step 2: Create Database Cluster

1. Click "Build a Database"
2. Choose "Shared" (free tier)
3. Select your preferred cloud provider and region
4. Choose cluster tier M0 (Free)
5. Name your cluster (e.g., "travel-booking-cluster")
6. Click "Create Cluster"

### Step 3: Configure Database Access

1. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password
   - Set built-in role to "Atlas admin"
   - Click "Add User"

2. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for production, use specific IPs)
   - Confirm

### Step 4: Get Connection String

1. Go to "Databases" → "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `travel-booking`

Example connection string:
```
mongodb+srv://username:password@travel-booking-cluster.xxxxx.mongodb.net/travel-booking?retryWrites=true&w=majority
```

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Your Code

1. Ensure your code is pushed to GitHub
2. Make sure your `package.json` has the correct start script:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: travel-booking-api
   - **Environment**: Node
   - **Region**: Choose nearest to your users
   - **Branch**: main (or your default branch)
   - **Root Directory**: server (if your backend is in server folder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Render dashboard, go to "Environment" and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_super_secret_production_jwt_key_make_it_very_long_and_random
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://travel-booking-api.onrender.com`)

### Step 5: Seed Database (Optional)

Once deployed, you can seed your production database:

1. In Render dashboard, go to "Shell"
2. Run: `node utils/seeder.js`

## Part 3: Frontend Deployment (Netlify)

### Step 1: Prepare Frontend for Production

1. Update your `client/.env` file for production:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_APP_NAME=TravelBook
   VITE_APP_VERSION=1.0.0
   ```

2. Test the build locally:
   ```bash
   cd client
   npm run build
   ```

### Step 2: Deploy to Netlify

**Option A: Drag and Drop (Quick)**
1. Build your app: `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area

**Option B: GitHub Integration (Recommended)**
1. Go to [Netlify](https://netlify.com) and sign up
2. Click "New site from Git"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: client
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

### Step 3: Set Environment Variables

In Netlify dashboard, go to "Site settings" → "Environment variables":

```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=TravelBook
VITE_APP_VERSION=1.0.0
```

### Step 4: Configure Redirects

Create `client/public/_redirects` file:
```
/*    /index.html   200
```

This ensures React Router works properly on Netlify.

## Alternative: Vercel Deployment

### For Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) and sign up
2. Import your project from GitHub
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy

## Alternative: Railway Deployment

### For Backend (Railway)

1. Go to [Railway](https://railway.app) and sign up
2. Create new project from GitHub
3. Select your repository
4. Add environment variables
5. Deploy

## Part 4: Custom Domain (Optional)

### For Netlify:
1. Go to "Domain settings"
2. Add custom domain
3. Follow DNS configuration instructions

### For Render:
1. Go to "Settings" → "Custom Domains"
2. Add your domain
3. Configure DNS records

## Part 5: SSL Certificate

Both Netlify and Render provide free SSL certificates automatically. Make sure to:

1. Use HTTPS in your API URLs
2. Update CORS settings if needed
3. Test all functionality with HTTPS

## Environment Variables Summary

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-booking
JWT_SECRET=your_production_jwt_secret_very_long_and_random_string
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=TravelBook
VITE_APP_VERSION=1.0.0
```

## Post-Deployment Checklist

- [ ] Backend health check: `GET https://your-backend-url.onrender.com/`
- [ ] Frontend loads: `https://your-frontend-url.netlify.app/`
- [ ] User registration works
- [ ] User login works  
- [ ] Package browsing works
- [ ] Booking creation works
- [ ] Admin login works (admin@travel.com / admin123)
- [ ] Admin package management works
- [ ] All API endpoints respond correctly
- [ ] Images load properly
- [ ] Mobile responsiveness works

## Monitoring and Maintenance

### 1. Backend Monitoring (Render)
- Check logs in Render dashboard
- Set up health checks
- Monitor resource usage

### 2. Frontend Monitoring (Netlify)
- Check build logs
- Monitor site analytics
- Set up form handling if needed

### 3. Database Monitoring (MongoDB Atlas)
- Monitor connection metrics
- Set up alerts for usage
- Regular backups (automatic in Atlas)

## Troubleshooting Common Issues

### 1. CORS Errors
Ensure your backend CORS configuration includes your frontend domain:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 2. 404 Errors on Refresh
Make sure `_redirects` file is in place for Netlify or configure similar for other platforms.

### 3. Environment Variables Not Loading
- Check variable names (VITE_ prefix for frontend)
- Redeploy after adding variables
- Check build logs for errors

### 4. Database Connection Issues
- Verify connection string is correct
- Check network access whitelist
- Ensure database user has correct permissions

### 5. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for memory issues in build process

## Performance Optimization

### Backend:
1. Enable gzip compression
2. Implement caching for static data
3. Add database indexing
4. Use CDN for images

### Frontend:
1. Optimize images
2. Implement lazy loading
3. Use code splitting
4. Enable service worker for caching

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly
4. **JWT Secrets**: Use long, random strings
5. **Database**: Use strong passwords and network restrictions
6. **Rate Limiting**: Implement API rate limiting
7. **Input Validation**: Validate all user inputs

## Backup Strategy

1. **Database**: MongoDB Atlas provides automatic backups
2. **Code**: Keep code in GitHub with proper branching
3. **Environment Variables**: Document all variables securely
4. **Images**: Consider backing up user-uploaded images

## Scaling Considerations

### For High Traffic:
1. **Backend**: Consider upgrading Render plan or using multiple instances
2. **Database**: MongoDB Atlas can scale automatically
3. **Frontend**: Netlify/Vercel handle scaling automatically
4. **CDN**: Implement CDN for global content delivery

That's it! Your Travel Package Booking System should now be live and accessible to users worldwide.