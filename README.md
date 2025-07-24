# Full Stack Travel Package Booking System

A complete travel package booking system built with React.js, Node.js, Express, and MongoDB.

## Features

### User Features
- User registration and login with JWT authentication
- Browse travel packages with filters (location, price, duration)
- Book travel packages (authenticated users only)
- User dashboard to view personal bookings
- Responsive design for all devices

### Admin Features
- Add new travel packages
- Edit existing packages
- Delete packages
- View all bookings

## Tech Stack

### Frontend
- React.js 18
- React Router for navigation
- Axios for API calls
- JWT token management
- Responsive CSS/Bootstrap

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Project Structure

```
fullstack development/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── styles/        # CSS files
│   │   └── App.js
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React app:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

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

## Deployment

### Backend (Render)
1. Create account on Render.com
2. Connect your GitHub repository
3. Create new Web Service
4. Set environment variables in Render dashboard
5. Deploy

### Frontend (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder to Netlify or Vercel
3. Set environment variables for production API URL

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster and database
3. Get connection string
4. Update MONGODB_URI in production environment

## Default Admin Account
- Email: admin@travel.com
- Password: admin123

## Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License
MIT License