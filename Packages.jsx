import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { packagesAPI } from '../../utils/api'
import { formatCurrency, getCategoryIcon, formatRating, debounce } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  
  const [filters, setFilters] = useState({
    destination: searchParams.get('destination') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minDuration: searchParams.get('minDuration') || '',
    maxDuration: searchParams.get('maxDuration') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  })
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1)

  useEffect(() => {
    fetchPackages()
  }, [currentPage, filters])

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    if (currentPage > 1) params.set('page', currentPage)
    setSearchParams(params)
  }, [filters, currentPage, setSearchParams])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        page: currentPage,
        limit: 9
      }
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
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

  const handleFilterChange = debounce((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }, 300)

  const handleSortChange = (sortBy, sortOrder) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      destination: '',
      category: '',
      difficulty: '',
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setCurrentPage(1)
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

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' }
  ]

  const sortOptions = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'createdAt_asc', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'duration_asc', label: 'Duration: Short to Long' },
    { value: 'duration_desc', label: 'Duration: Long to Short' },
    { value: 'rating_desc', label: 'Highest Rated' }
  ]

  return (
    <div className="packages-page">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">Travel Packages</h1>
              <p className="lead mb-0">
                Discover amazing destinations and create unforgettable memories with our curated travel packages.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="bg-white bg-opacity-10 rounded-3 p-3">
                <div className="d-flex justify-content-between text-center">
                  <div>
                    <div className="fs-4 fw-bold">{pagination.totalPackages || 0}</div>
                    <small>Total Packages</small>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{packages.length}</div>
                    <small>Showing</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container my-5">
        {/* Filters Section */}
        <div className="filter-section">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-3">
              <label className="form-label fw-bold">Destination</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search destination..."
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
              />
            </div>
            
            <div className="col-lg-2 col-md-6 mb-3">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-2 col-md-6 mb-3">
              <label className="form-label fw-bold">Difficulty</label>
              <select
                className="form-select"
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-lg-2 col-md-6 mb-3">
              <label className="form-label fw-bold">Price Range</label>
              <div className="row g-1">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-3">
              <label className="form-label fw-bold">Duration (Days)</label>
              <div className="row g-1">
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={filters.minDuration}
                    onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={filters.maxDuration}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-1 col-md-6 mb-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Sort and Results Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="mb-0">
              {pagination.totalPackages ? (
                <>
                  Showing {((currentPage - 1) * 9) + 1}-{Math.min(currentPage * 9, pagination.totalPackages)} of {pagination.totalPackages} packages
                </>
              ) : (
                'No packages found'
              )}
            </h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 me-2">Sort by:</label>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_')
                handleSortChange(sortBy, sortOrder)
              }}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Packages Grid */}
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
              <i className="fas fa-search fs-1 text-muted"></i>
            </div>
            <h4>No packages found</h4>
            <p className="text-muted mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="row">
            {packages.map((pkg) => (
              <div key={pkg._id} className="col-lg-4 col-md-6 mb-4">
                <div className="card package-card h-100">
                  <div className="position-relative">
                    <img 
                      src={pkg.images?.[0] || 'https://via.placeholder.com/400x250'} 
                      className="card-img-top" 
                      alt={pkg.title}
                    />
                    <span className={`badge bg-${pkg.category === 'luxury' ? 'warning' : 'primary'} position-absolute`}>
                      <i className={`fas ${getCategoryIcon(pkg.category)} me-1`}></i>
                      {pkg.category}
                    </span>
                    {pkg.difficulty && (
                      <span className={`badge bg-${pkg.difficulty === 'easy' ? 'success' : pkg.difficulty === 'moderate' ? 'warning' : 'danger'} position-absolute`} style={{ top: '15px', left: '15px' }}>
                        {pkg.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{pkg.title}</h5>
                    <p className="text-muted mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {pkg.destination}
                    </p>
                    <p className="card-text text-muted flex-grow-1">
                      {pkg.description.substring(0, 120)}...
                    </p>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="package-price">{formatCurrency(pkg.price)}</span>
                        <span className="package-duration">
                          <i className="fas fa-clock me-1"></i>
                          {pkg.duration} days
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="package-rating">
                          {formatRating(pkg.rating.average, true, pkg.rating.count)}
                        </div>
                        <small className="text-muted">
                          <i className="fas fa-users me-1"></i>
                          Max {pkg.maxGroupSize}
                        </small>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/packages/${pkg._id}`} 
                        className="btn btn-outline-primary flex-grow-1"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/book/${pkg._id}`} 
                        className="btn btn-primary"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <nav aria-label="Packages pagination">
            <ul className="pagination justify-content-center">
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
        )}
      </div>
    </div>
  )
}

export default Packages