import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { bookingsAPI } from '../../utils/api'
import { formatCurrency, formatDate, getBookingStatusClass, getPaymentStatusClass, getDaysUntil } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0
  })

  useEffect(() => {
    fetchBookings()
  }, [currentPage, statusFilter])

  useEffect(() => {
    // Show success message if redirected from booking
    if (location.state?.bookingSuccess) {
      toast.success('🎉 Booking confirmed! Check your email for details.')
    }
  }, [location.state])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 6
      }
      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await bookingsAPI.getUserBookings(params)
      setBookings(response.bookings || [])
      setPagination(response.pagination || {})
      
      // Calculate stats
      if (currentPage === 1 && !statusFilter) {
        const allBookings = response.bookings || []
        const stats = {
          totalBookings: response.pagination?.totalBookings || 0,
          upcomingTrips: allBookings.filter(b => 
            ['confirmed', 'pending'].includes(b.status) && 
            new Date(b.travelDate) > new Date()
          ).length,
          completedTrips: allBookings.filter(b => b.status === 'completed').length,
          totalSpent: allBookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalAmount, 0)
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await bookingsAPI.cancel(bookingId, 'Cancelled by user')
      toast.success('Booking cancelled successfully')
      fetchBookings() // Refresh bookings
    } catch (error) {
      console.error('Error cancelling booking:', error)
      const message = error.response?.data?.message || 'Failed to cancel booking'
      toast.error(message)
    }
  }

  const canCancelBooking = (booking) => {
    const travelDate = new Date(booking.travelDate)
    const now = new Date()
    const daysUntilTravel = Math.ceil((travelDate - now) / (1000 * 60 * 60 * 24))
    
    return (
      booking.status === 'confirmed' || booking.status === 'pending'
    ) && daysUntilTravel > 0
  }

  const getBookingActions = (booking) => {
    const actions = []
    
    actions.push(
      <Link
        key="view"
        to={`/bookings/${booking._id}`}
        className="btn btn-sm btn-outline-primary"
      >
        <i className="fas fa-eye me-1"></i>
        View
      </Link>
    )

    if (canCancelBooking(booking)) {
      actions.push(
        <button
          key="cancel"
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleCancelBooking(booking._id)}
        >
          <i className="fas fa-times me-1"></i>
          Cancel
        </button>
      )
    }

    if (booking.status === 'confirmed' && getDaysUntil(booking.travelDate) <= 0) {
      actions.push(
        <button
          key="review"
          className="btn btn-sm btn-outline-warning"
          onClick={() => toast.info('Review feature coming soon!')}
        >
          <i className="fas fa-star me-1"></i>
          Review
        </button>
      )
    }

    return actions
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h2 mb-2">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="mb-0 opacity-90">
                Manage your bookings and discover new adventures
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/packages" className="btn btn-warning">
                <i className="fas fa-plus me-2"></i>
                Book New Trip
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Stats Cards */}
        <div className="row mb-5">
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="stat-card bg-primary text-white">
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-calendar-check fs-2"></i>
                </div>
                <div>
                  <div className="stat-number">{stats.totalBookings}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="stat-card bg-success text-white">
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-plane-departure fs-2"></i>
                </div>
                <div>
                  <div className="stat-number">{stats.upcomingTrips}</div>
                  <div className="stat-label">Upcoming Trips</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="stat-card bg-info text-white">
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-check-circle fs-2"></i>
                </div>
                <div>
                  <div className="stat-number">{stats.completedTrips}</div>
                  <div className="stat-label">Completed Trips</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="stat-card bg-warning text-white">
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <i className="fas fa-dollar-sign fs-2"></i>
                </div>
                <div>
                  <div className="stat-number">{formatCurrency(stats.totalSpent)}</div>
                  <div className="stat-label">Total Spent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="card">
          <div className="card-header bg-white">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h4 className="mb-0">
                  <i className="fas fa-list me-2 text-primary"></i>
                  My Bookings
                </h4>
              </div>
              <div className="col-lg-6">
                <div className="d-flex justify-content-lg-end">
                  <select
                    className="form-select"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option value="">All Bookings</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-suitcase-rolling fs-1 text-muted"></i>
                </div>
                <h5>No bookings found</h5>
                <p className="text-muted mb-4">
                  {statusFilter 
                    ? `No ${statusFilter} bookings found.`
                    : "You haven't made any bookings yet. Start exploring amazing destinations!"
                  }
                </p>
                <Link to="/packages" className="btn btn-primary">
                  <i className="fas fa-search me-2"></i>
                  Explore Packages
                </Link>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Package</th>
                        <th>Travel Date</th>
                        <th>People</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={booking.package?.images?.[0] || 'https://via.placeholder.com/60x40'}
                                className="me-3 rounded"
                                alt={booking.package?.title}
                                style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                              />
                              <div>
                                <div className="fw-medium">{booking.package?.title}</div>
                                <small className="text-muted">
                                  {booking.package?.destination}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(booking.travelDate)}</div>
                            <small className="text-muted">
                              {getDaysUntil(booking.travelDate) > 0 
                                ? `${getDaysUntil(booking.travelDate)} days to go`
                                : getDaysUntil(booking.travelDate) === 0
                                ? 'Today!'
                                : 'Past date'
                              }
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {booking.numberOfPeople} 
                              {booking.numberOfPeople === 1 ? ' person' : ' people'}
                            </span>
                          </td>
                          <td>
                            <div className="fw-medium">{formatCurrency(booking.totalAmount)}</div>
                            <small className="text-muted">
                              Ref: {booking.bookingReference}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${getBookingStatusClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge bg-${getPaymentStatusClass(booking.paymentStatus)}`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {getBookingActions(booking)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="card-footer bg-white">
                    <nav aria-label="Bookings pagination">
                      <ul className="pagination justify-content-center mb-0">
                        <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                        
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                          <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!pagination.hasNext}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mt-5">
          <div className="col-md-4 mb-3">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="text-primary mb-3">
                  <i className="fas fa-search fs-1"></i>
                </div>
                <h5>Explore New Destinations</h5>
                <p className="text-muted">Discover amazing travel packages around the world</p>
                <Link to="/packages" className="btn btn-primary">
                  Browse Packages
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="text-success mb-3">
                  <i className="fas fa-user-edit fs-1"></i>
                </div>
                <h5>Update Profile</h5>
                <p className="text-muted">Keep your personal information up to date</p>
                <Link to="/profile" className="btn btn-success">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card text-center h-100">
              <div className="card-body">
                <div className="text-info mb-3">
                  <i className="fas fa-headset fs-1"></i>
                </div>
                <h5>Need Help?</h5>
                <p className="text-muted">Contact our support team for assistance</p>
                <button 
                  className="btn btn-info"
                  onClick={() => toast.info('Support chat coming soon!')}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard