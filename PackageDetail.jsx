import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { packagesAPI } from '../../utils/api'
import { formatCurrency, formatDate, getCategoryIcon, formatRating, getDifficultyClass } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    fetchPackageDetail()
  }, [id])

  const fetchPackageDetail = async () => {
    try {
      setLoading(true)
      const response = await packagesAPI.getById(id)
      setPackageData(response)
    } catch (error) {
      console.error('Error fetching package:', error)
      if (error.response?.status === 404) {
        toast.error('Package not found')
        navigate('/packages')
      } else {
        toast.error('Failed to load package details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated()) {
      toast.error('Please login to book a package')
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } })
      return
    }
    navigate(`/book/${id}`)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <h4>Package Not Found</h4>
          <p>The package you're looking for doesn't exist or has been removed.</p>
          <Link to="/packages" className="btn btn-primary">
            Browse All Packages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="package-detail-page">
      {/* Hero Section */}
      <section className="bg-light py-4">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/packages" className="text-decoration-none">Packages</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {packageData.title}
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className="container my-5">
        <div className="row">
          {/* Main Content */}
          <div className="col-lg-8 mb-4">
            {/* Package Header */}
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className={`badge bg-${packageData.category === 'luxury' ? 'warning' : 'primary'} fs-6`}>
                  <i className={`fas ${getCategoryIcon(packageData.category)} me-1`}></i>
                  {packageData.category}
                </span>
                <span className={`badge bg-${getDifficultyClass(packageData.difficulty)} fs-6`}>
                  {packageData.difficulty}
                </span>
                <span className="badge bg-info fs-6">
                  <i className="fas fa-users me-1"></i>
                  Max {packageData.maxGroupSize} people
                </span>
              </div>
              <h1 className="display-6 fw-bold mb-3">{packageData.title}</h1>
              <div className="d-flex flex-wrap align-items-center gap-4 mb-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-map-marker-alt text-primary me-2"></i>
                  <span className="fw-medium">{packageData.destination}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="fas fa-clock text-primary me-2"></i>
                  <span>{packageData.duration} days</span>
                </div>
                <div className="package-rating">
                  {formatRating(packageData.rating.average, true, packageData.rating.count)}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mb-5">
              <div className="row g-2">
                <div className="col-12">
                  <img
                    src={packageData.images?.[selectedImageIndex] || 'https://via.placeholder.com/800x400'}
                    className="img-fluid rounded-3 w-100"
                    alt={packageData.title}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                </div>
                {packageData.images?.length > 1 && (
                  <div className="col-12">
                    <div className="d-flex gap-2 overflow-auto pb-2">
                      {packageData.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          className={`img-thumbnail cursor-pointer ${index === selectedImageIndex ? 'border-primary' : ''}`}
                          alt={`${packageData.title} ${index + 1}`}
                          style={{ width: '100px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h3 className="fw-bold mb-3">About This Package</h3>
              <p className="text-muted lh-lg">{packageData.description}</p>
            </div>

            {/* Highlights */}
            {packageData.highlights?.length > 0 && (
              <div className="mb-5">
                <h3 className="fw-bold mb-3">Package Highlights</h3>
                <div className="row">
                  {packageData.highlights.map((highlight, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                        <span>{highlight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className="row mb-5">
              {packageData.inclusions?.length > 0 && (
                <div className="col-md-6 mb-4">
                  <h4 className="fw-bold text-success mb-3">
                    <i className="fas fa-plus-circle me-2"></i>
                    Inclusions
                  </h4>
                  <ul className="list-unstyled">
                    {packageData.inclusions.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {packageData.exclusions?.length > 0 && (
                <div className="col-md-6 mb-4">
                  <h4 className="fw-bold text-danger mb-3">
                    <i className="fas fa-minus-circle me-2"></i>
                    Exclusions
                  </h4>
                  <ul className="list-unstyled">
                    {packageData.exclusions.map((item, index) => (
                      <li key={index} className="mb-2">
                        <i className="fas fa-times text-danger me-2"></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Itinerary */}
            {packageData.itinerary?.length > 0 && (
              <div className="mb-5">
                <h3 className="fw-bold mb-4">Day-by-Day Itinerary</h3>
                <div className="accordion" id="itineraryAccordion">
                  {packageData.itinerary.map((day, index) => (
                    <div key={index} className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header" id={`heading${index}`}>
                        <button
                          className="accordion-button collapsed fw-medium"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse${index}`}
                        >
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-3">Day {day.day}</span>
                            <span>{day.title}</span>
                          </div>
                        </button>
                      </h2>
                      <div
                        id={`collapse${index}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading${index}`}
                        data-bs-parent="#itineraryAccordion"
                      >
                        <div className="accordion-body">
                          <p className="text-muted mb-3">{day.description}</p>
                          {day.meals && (
                            <div className="d-flex gap-3 text-sm">
                              <span className={`badge ${day.meals.breakfast ? 'bg-success' : 'bg-light text-dark'}`}>
                                <i className="fas fa-coffee me-1"></i>
                                Breakfast
                              </span>
                              <span className={`badge ${day.meals.lunch ? 'bg-success' : 'bg-light text-dark'}`}>
                                <i className="fas fa-utensils me-1"></i>
                                Lunch
                              </span>
                              <span className={`badge ${day.meals.dinner ? 'bg-success' : 'bg-light text-dark'}`}>
                                <i className="fas fa-wine-glass-alt me-1"></i>
                                Dinner
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '100px' }}>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="display-4 fw-bold text-primary mb-2">
                    {formatCurrency(packageData.price)}
                  </div>
                  <p className="text-muted mb-0">per person</p>
                </div>

                <div className="mb-4">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="border-end">
                        <div className="fw-bold">{packageData.duration}</div>
                        <small className="text-muted">Days</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="border-end">
                        <div className="fw-bold">{packageData.maxGroupSize}</div>
                        <small className="text-muted">Max Group</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="fw-bold">{packageData.availability?.availableSlots || 0}</div>
                      <small className="text-muted">Available</small>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Availability</h6>
                  <div className="small text-muted">
                    <div className="mb-1">
                      <i className="fas fa-calendar-alt me-2"></i>
                      From: {formatDate(packageData.availability?.startDate)}
                    </div>
                    <div>
                      <i className="fas fa-calendar-alt me-2"></i>
                      To: {formatDate(packageData.availability?.endDate)}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 mb-3"
                  onClick={handleBookNow}
                  disabled={packageData.availability?.availableSlots === 0}
                >
                  {packageData.availability?.availableSlots === 0 ? (
                    <>
                      <i className="fas fa-times-circle me-2"></i>
                      Fully Booked
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check me-2"></i>
                      Book Now
                    </>
                  )}
                </button>

                <div className="text-center">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Secure booking with instant confirmation
                  </small>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card mt-4">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Need Help?</h6>
                <div className="d-flex align-items-center mb-2">
                  <i className="fas fa-phone text-primary me-2"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-envelope text-primary me-2"></i>
                  <span>support@travelbook.com</span>
                </div>
                <button className="btn btn-outline-primary btn-sm w-100">
                  <i className="fas fa-comments me-2"></i>
                  Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageDetail