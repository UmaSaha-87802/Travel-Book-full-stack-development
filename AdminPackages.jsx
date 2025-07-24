import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { packagesAPI } from '../../utils/api'
import { formatCurrency, getCategoryIcon, getDifficultyClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const AdminPackages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [currentPage, categoryFilter])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }
      
      if (categoryFilter) {
        params.category = categoryFilter
      }
      
      if (searchTerm) {
        params.destination = searchTerm
      }

      const response = await packagesAPI.getAll(params)
      setPackages(response.packages || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPackages()
  }

  const handleDelete = async (packageId, packageTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${packageTitle}"?`)) {
      return
    }

    try {
      await packagesAPI.delete(packageId)
      toast.success('Package deleted successfully')
      fetchPackages() // Refresh the list
    } catch (error) {
      console.error('Error deleting package:', error)
      const message = error.response?.data?.message || 'Failed to delete package'
      toast.error(message)
    }
  }

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'beach', label: 'Beach' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'budget', label: 'Budget' },
    { value: 'family', label: 'Family' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'business', label: 'Business' }
  ]

  return (
    <div className="admin-packages">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h2 mb-2">
                <i className="fas fa-box me-3"></i>
                Manage Packages
              </h1>
              <p className="mb-0 opacity-90">
                Create, edit, and manage travel packages
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
        {/* Filters and Search */}
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row align-items-end">
                <div className="col-lg-4 col-md-6 mb-3">
                  <label className="form-label">Search Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-lg-3 col-md-6 mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-md-6 mb-3">
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="fas fa-search me-2"></i>
                    Search
                  </button>
                </div>
                <div className="col-lg-3 col-md-6 mb-3 text-end">
                  <span className="text-muted">
                    Total: {pagination.totalPackages || 0} packages
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Packages Table */}
        <div className="card">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="fas fa-box-open fs-1 text-muted"></i>
                </div>
                <h5>No packages found</h5>
                <p className="text-muted mb-4">
                  {searchTerm || categoryFilter 
                    ? 'No packages match your search criteria.'
                    : 'Start by creating your first travel package.'
                  }
                </p>
                <Link to="/admin/packages/create" className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>
                  Create Package
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Package</th>
                      <th>Destination</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Available Slots</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr key={pkg._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={pkg.images?.[0] || 'https://via.placeholder.com/60x40'}
                              className="me-3 rounded"
                              alt={pkg.title}
                              style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-medium">{pkg.title}</div>
                              <small className="text-muted">
                                ID: {pkg._id.slice(-6)}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{pkg.destination}</td>
                        <td>
                          <span className={`badge bg-${pkg.category === 'luxury' ? 'warning' : 'primary'}`}>
                            <i className={`fas ${getCategoryIcon(pkg.category)} me-1`}></i>
                            {pkg.category}
                          </span>
                        </td>
                        <td className="fw-medium">{formatCurrency(pkg.price)}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {pkg.duration} days
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${pkg.availability?.availableSlots > 10 ? 'bg-success' : pkg.availability?.availableSlots > 0 ? 'bg-warning' : 'bg-danger'}`}>
                            {pkg.availability?.availableSlots || 0} slots
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${pkg.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link
                              to={`/packages/${pkg._id}`}
                              className="btn btn-sm btn-outline-info"
                              title="View Package"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link
                              to={`/admin/packages/edit/${pkg._id}`}
                              className="btn btn-sm btn-outline-warning"
                              title="Edit Package"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Package"
                              onClick={() => handleDelete(pkg._id, pkg.title)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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
              <nav aria-label="Packages pagination">
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
      </div>
    </div>
  )
}

export default AdminPackages