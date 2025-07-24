import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Packages from './pages/packages/Packages'
import PackageDetail from './pages/packages/PackageDetail'
import BookingForm from './pages/bookings/BookingForm'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPackages from './pages/admin/AdminPackages'
import AdminBookings from './pages/admin/AdminBookings'
import CreatePackage from './pages/admin/CreatePackage'
import EditPackage from './pages/admin/EditPackage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          
          {/* Protected Routes */}
          <Route path="/book/:id" element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/packages" element={
            <AdminRoute>
              <AdminPackages />
            </AdminRoute>
          } />
          <Route path="/admin/packages/create" element={
            <AdminRoute>
              <CreatePackage />
            </AdminRoute>
          } />
          <Route path="/admin/packages/edit/:id" element={
            <AdminRoute>
              <EditPackage />
            </AdminRoute>
          } />
          <Route path="/admin/bookings" element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App