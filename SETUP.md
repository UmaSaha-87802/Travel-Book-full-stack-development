# Full Stack Travel Package Booking System - Setup Guide

This guide will help you set up and run the Travel Package Booking System locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation) OR **MongoDB Atlas** account - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

## Project Structure

```
fullstack development/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env.example
├── README.md
└── SETUP.md
```

## Step-by-Step Setup

### 1. Clone the Repository

If you haven't already, navigate to your project directory:

```bash
cd "c:/Users/HP/OneDrive/Desktop/fullstack development"
```

### 2. Backend Setup

#### 2.1 Install Backend Dependencies

```bash
cd server
npm install
```

#### 2.2 Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one)
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/travel-booking

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-booking?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
```

#### 2.3 Database Setup

**Option A: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace `MONGODB_URI` in your `.env` file

#### 2.4 Seed the Database (Optional)

To populate your database with sample data:

```bash
node utils/seeder.js
```

This will create:
- Sample travel packages
- An admin user (email: admin@travel.com, password: admin123)

#### 2.5 Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend server should start on `http://localhost:5000`

### 3. Frontend Setup

#### 3.1 Install Frontend Dependencies

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
```

#### 3.2 Environment Configuration

Create a `.env` file in the client directory:

```bash
cp .env.example .env
```

The default configuration should work for local development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TravelBook
VITE_APP_VERSION=1.0.0
```

#### 3.3 Start the Frontend Development Server

```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

### 4. Verify the Setup

1. **Backend Health Check**: Visit `http://localhost:5000` - you should see a JSON response
2. **Frontend**: Visit `http://localhost:3000` - you should see the TravelBook homepage
3. **Database Connection**: Check the backend console for "MongoDB connected successfully"

### 5. Default Admin Account

After seeding the database, you can login with:
- **Email**: admin@travel.com
- **Password**: admin123

## Available Scripts

### Backend (server directory)

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `node utils/seeder.js` - Seed database with sample data

### Frontend (client directory)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Packages
- `GET /api/packages` - Get all packages (with filters)
- `GET /api/packages/:id` - Get single package
- `POST /api/packages` - Create package (Admin only)
- `PUT /api/packages/:id` - Update package (Admin only)
- `DELETE /api/packages/:id` - Delete package (Admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/all` - Get all bookings (Admin only)
- `PUT /api/bookings/:id/status` - Update booking status (Admin only)
- `PUT /api/bookings/:id/cancel` - Cancel booking

## Features Overview

### User Features
- ✅ User registration and login
- ✅ Browse travel packages with filters
- ✅ View package details
- ✅ Book packages with traveler details
- ✅ View booking history
- ✅ Cancel bookings
- ✅ Update profile information

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Manage travel packages (CRUD)
- ✅ View and manage all bookings
- ✅ Update booking statuses
- ✅ View revenue and booking analytics

### Technical Features
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string
   - Verify network access (for Atlas)

2. **Port Already in Use**
   - Change the PORT in your `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **CORS Errors**
   - Ensure backend CORS is configured
   - Check API URL in frontend `.env`

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear npm cache: `npm cache clean --force`

### Environment Variables Not Loading

Make sure your `.env` files are:
- In the correct directories (server/.env and client/.env)
- Not committed to git (check .gitignore)
- Have the correct variable names (VITE_ prefix for client)

## Deployment

### Backend Deployment (Render)

1. Create account on [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard
7. Deploy

### Frontend Deployment (Netlify/Vercel)

**Netlify:**
1. Build the app: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

**Vercel:**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Update MONGODB_URI in production

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check the network connectivity

For additional help, please check the documentation or create an issue in the repository.

## License

This project is licensed under the MIT License.