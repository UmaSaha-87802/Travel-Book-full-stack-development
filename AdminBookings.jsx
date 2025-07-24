import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom' 
import { bookingsAPI } from '../../utils/api'
import { formatCurrency, formatDate, getBookingStatusClass, getPaymentStatusClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminBookings = () => {
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [paymentFilter, setPaymentFilter] = useState(searchParams.get('paymentStatus') || '')
  const [updatingBooking, setUpdatingBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [currentPage, statusFilter, paymentFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10
      }
      
      if (statusFilter) params.status = statusFilter
      if (paymentFilter) params.paymentStatus = paymentFilter

      const response = await bookingsAPI.getAllBookings(params)
      setBookings(response.bookings || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingBooking(bookingId)
      await bookingsAPI.updateStatus(bookingId, { status: newStatus })
      toast.success('Booking status updated successfully')
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error('Error updating booking status:', error)
      const message = error.response?.data?.message || 'Failed to update booking status'
      toast.error(message)
    } finally {
      setUpdatingBooking(null)
    }
  }

  const getStatusActions = (booking) => {
    const actions = []
    const currentStatus = booking.status

    if (currentStatus === 'pending') {
      actions.push(
        <button
          key="confirm"
          className="btn btn-sm btn-success"
          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
          disabled={updatingBooking === booking._id}
        >
          <i className="fas fa-check me-1"></i>
          Confirm
        </button>
      )
      actions.push(
        <button
          key="cancel"
          className="btn btn-sm btn-danger"
          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
          disabled={updatingBooking === booking._id}
        >
          <i className="fas fa-times me-1"></i>
          Cancel
        </button>
      )
    } else if (currentStatus === 'confirmed') {
      actions.push(
        <button
          key="complete"
          className="btn btn-sm btn-info"
          onClick={() => handleStatusUpdate(booking._id, 'completed')}
          disabled={updatingBooking === booking._id}
        >
          <i className="fas fa-flag-checkered me-1"></i>
          Complete
        </button>
      )
    }

    return actions
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ]

  const paymentOptions = [
    { value: '', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ]

  return (
    <div className="admin-bookings">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h2 mb-2">
                <i className="fas fa-calendar-check me-3"></i>
                Manage Bookings
              </h1>
              <p className="mb-0 opacity-90">
                Monitor and manage customer bookings
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button 
                className="btn btn-outline-light"
                onClick={() => {
                  setStatusFilter('')
                  setPaymentFilter('')
                  setCurrentPage(1)
                }}
              >
                <i className="fas fa-refresh me-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-lg-3 col-md-6 mb-3">
                <label className="form-label">Booking Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  {paymentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-lg-6 col-md-12 mb-3 text-end">
                <span className="text-muted">
                  Total: {pagination.totalBookings || 0} bookings
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-calendar-times fs-1 text-muted"></i>
                </div>
                <h5>No bookings found</h5>
                <p className="text-muted">
                  {statusFilter || paymentFilter 
                    ? 'No bookings match your filter criteria.'
                    : 'No bookings have been made yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Customer</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>People</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Booked On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div>
                            <div className="fw-medium">{booking.user?.name}</div>
                            <small className="text-muted">{booking.user?.email}</small>
                            <br />
                            <small className="text-muted">
                              Ref: {booking.bookingReference}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">{booking.package?.title}</div>
                            <small className="text-muted">{booking.package?.destination}</small>
                          </div>
                        </td>
                        <td>{formatDate(booking.travelDate)}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {booking.numberOfPeople}
                          </span>
                        </td>
                        <td className="fw-medium">{formatCurrency(booking.totalAmount)}</td>
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
                        <td>{formatDate(booking.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => toast.info('View details feature coming soon!')}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {getStatusActions(booking)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    )
                  })}
                  
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
        </div>

        {/* Summary Stats */}
        <div className="row mt-5">
          <div className="col-md-3 mb-3">
            <div className="card text-center bg-primary text-white">
              <div className="card-body">
                <div className="fs-4 fw-bold">
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <div>Pending</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center bg-success text-white">
              <div className="card-body">
                <div className="fs-4 fw-bold">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </div>
                <div>Confirmed</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center bg-info text-white">
              <div className="card-body">
                <div className="fs-4 fw-bold">
                  {bookings.filter(b => b.status === 'completed').length}
                </div>
                <div>Completed</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center bg-warning text-white">
              <div className="card-body">
                <div className="fs-4 fw-bold">
                  {formatCurrency(
                    bookings
                      .filter(b => b.paymentStatus === 'paid')
                      .reduce((sum, b) => sum + b.totalAmount, 0)
                  )}
                </div>
                <div>Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBookings