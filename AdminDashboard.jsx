import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { packagesAPI, bookingsAPI } from '../../utils/api'
import { formatCurrency, formatDate, getBookingStatusClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats and recent data in parallel
      const [packagesResponse, bookingsResponse, statsResponse] = await Promise.all([
        packagesAPI.getAll({ limit: 1 }),
        bookingsAPI.getAllBookings({ limit: 5 }),
        bookingsAPI.getStats().catch(() => ({ statusStats: [], totalBookings: 0, totalRevenue: 0 }))
      ])

      // Calculate stats
      const totalPackages = packagesResponse.pagination?.totalPackages || 0
      const totalBookings = statsResponse.totalBookings || 0
      const totalRevenue = statsResponse.totalRevenue || 0
      const pendingBookings = statsResponse.statusStats?.find(s => s._id === 'pending')?.count || 0

      setStats({
        totalPackages,
        totalBookings,
        totalRevenue,
        pendingBookings
      })

      setRecentBookings(bookingsResponse.bookings || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      icon: 'fa-box',
      color: 'primary',
      link: '/admin/packages'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: 'fa-calendar-check',
      color: 'success',
      link: '/admin/bookings'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: 'fa-dollar-sign',
      color: 'warning',
      link: '/admin/bookings?paymentStatus=paid'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: 'fa-clock',
      color: 'danger',
      link: '/admin/bookings?status=pending'
    }
  ]

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h2 mb-2">
                <i className="fas fa-tachometer-alt me-3"></i>
                Admin Dashboard
              </h1>
              <p className="mb-0 opacity-90">
                Welcome to the administrative control panel
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/admin/packages/create" className="btn btn-warning">
                <i className="fas fa-plus me-2"></i>
                Add New Package
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Stats Cards */}
        <div className="row mb-5">
          {statCards.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <Link to={stat.link} className="text-decoration-none">
                <div className={`stat-card bg-${stat.color} text-white h-100`}>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon me-3">
                      <i className={`fas ${stat.icon} fs-2`}></i>
                    </div>
                    <div>
                      <div className="stat-number">{stat.value}</div>
                      <div className="stat-label">{stat.title}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="row">
          {/* Recent Bookings */}
          <div className="col-lg-8 mb-4">
            <div className="card">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-check me-2 text-primary"></i>
                  Recent Bookings
                </h5>
                <Link to="/admin/bookings" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body p-0">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times fs-2 text-muted mb-3"></i>
                    <p className="text-muted">No recent bookings</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Customer</th>
                          <th>Package</th>
                          <th>Travel Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr key={booking._id}>
                            <td>
                              <div>
                                <div className="fw-medium">{booking.user?.name}</div>
                                <small className="text-muted">{booking.user?.email}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-medium">{booking.package?.title}</div>
                                <small className="text-muted">{booking.package?.destination}</small>
                              </div>
                            </td>
                            <td>{formatDate(booking.travelDate)}</td>
                            <td className="fw-medium">{formatCurrency(booking.totalAmount)}</td>
                            <td>
                              <span className={`badge bg-${getBookingStatusClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-4 mb-4">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-bolt me-2 text-primary"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/admin/packages/create" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Add New Package
                  </Link>
                  <Link to="/admin/packages" className="btn btn-outline-primary">
                    <i className="fas fa-box me-2"></i>
                    Manage Packages
                  </Link>
                  <Link to="/admin/bookings" className="btn btn-outline-success">
                    <i className="fas fa-calendar-check me-2"></i>
                    Manage Bookings
                  </Link>
                  <button 
                    className="btn btn-outline-info"
                    onClick={() => toast.info('Analytics feature coming soon!')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card mt-4">
              <div className="card-header bg-white">
                <h6 className="mb-0">
                  <i className="fas fa-server me-2 text-success"></i>
                  System Status
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Database</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>API Server</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Email Service</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Payment Gateway</span>
                  <span className="badge bg-success">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row (Placeholder) */}
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-line me-2 text-primary"></i>
                  Revenue Trends
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-chart-line fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Revenue chart coming soon</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-pie me-2 text-primary"></i>
                  Booking Status Distribution
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-chart-pie fs-1 text-muted mb-3"></i>
                  <p className="text-muted">Status distribution chart coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard