import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { packagesAPI } from '../utils/api'
import { formatCurrency, getCategoryIcon, formatRating } from '../utils/helpers'
import toast from 'react-hot-toast'

const Home = () => {
  const [featuredPackages, setFeaturedPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalDestinations: 0,
    happyCustomers: 1250,
    yearsExperience: 10
  })

  useEffect(() => {
    fetchFeaturedPackages()
  }, [])

  const fetchFeaturedPackages = async () => {
    try {
      const response = await packagesAPI.getAll({ limit: 6, sortBy: 'rating' })
      setFeaturedPackages(response.packages || [])
      setStats(prev => ({
        ...prev,
        totalPackages: response.pagination?.totalPackages || 0,
        totalDestinations: new Set(response.packages?.map(p => p.destination)).size || 0
      }))
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load featured packages')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: 'Adventure', icon: 'fa-mountain', color: 'text-danger' },
    { name: 'Beach', icon: 'fa-umbrella-beach', color: 'text-info' },
    { name: 'Cultural', icon: 'fa-landmark', color: 'text-warning' },
    { name: 'Luxury', icon: 'fa-gem', color: 'text-success' },
    { name: 'Family', icon: 'fa-users', color: 'text-primary' },
    { name: 'Romantic', icon: 'fa-heart', color: 'text-danger' }
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title fade-in">
                Discover Amazing
                <span className="d-block text-warning">Travel Experiences</span>
              </h1>
              <p className="hero-subtitle fade-in">
                Explore the world with our carefully curated travel packages. 
                From adventure tours to luxury escapes, find your perfect journey.
              </p>
              <div className="d-flex gap-3 fade-in">
                <Link to="/packages" className="btn btn-warning btn-lg px-4">
                  <i className="fas fa-search me-2"></i>
                  Explore Packages
                </Link>
                <a href="#featured" className="btn btn-outline-light btn-lg px-4">
                  Learn More
                </a>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img 
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop" 
                alt="Travel Hero" 
                className="img-fluid rounded-3 shadow-lg slide-up"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">{stats.totalPackages}+</div>
                <div className="stat-label">Travel Packages</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">{stats.totalDestinations}+</div>
                <div className="stat-label">Destinations</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">{stats.happyCustomers}+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">{stats.yearsExperience}+</div>
                <div className="stat-label">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Travel Categories</h2>
            <p className="text-muted">Choose your preferred travel style</p>
          </div>
          <div className="row">
            {categories.map((category, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-6 mb-4">
                <Link 
                  to={`/packages?category=${category.name.toLowerCase()}`}
                  className="text-decoration-none"
                >
                  <div className="text-center p-3 border rounded-3 h-100 category-card">
                    <div className={`fs-1 ${category.color} mb-3`}>
                      <i className={`fas ${category.icon}`}></i>
                    </div>
                    <h6 className="fw-bold text-dark">{category.name}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section id="featured" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Featured Packages</h2>
            <p className="text-muted">Handpicked destinations for unforgettable experiences</p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {featuredPackages.map((pkg) => (
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
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{pkg.title}</h5>
                      <p className="card-text text-muted flex-grow-1">
                        {pkg.description.substring(0, 100)}...
                      </p>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="package-price">{formatCurrency(pkg.price)}</span>
                          <span className="package-duration">
                            <i className="fas fa-clock me-1"></i>
                            {pkg.duration} days
                          </span>
                        </div>
                        <div className="package-rating mt-2">
                          {formatRating(pkg.rating.average, true, pkg.rating.count)}
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

          <div className="text-center mt-4">
            <Link to="/packages" className="btn btn-primary btn-lg">
              View All Packages
              <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose TravelBook?</h2>
            <p className="text-muted">We make your travel dreams come true</p>
          </div>
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-shield-alt fs-3"></i>
                </div>
                <h5 className="fw-bold">Secure Booking</h5>
                <p className="text-muted">
                  Your payments and personal information are protected with industry-standard security measures.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center">
                <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-headset fs-3"></i>
                </div>
                <h5 className="fw-bold">24/7 Support</h5>
                <p className="text-muted">
                  Our dedicated support team is available round the clock to assist you with any queries.
                </p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-medal fs-3"></i>
                </div>
                <h5 className="fw-bold">Best Prices</h5>
                <p className="text-muted">
                  We guarantee competitive prices and offer the best value for your travel investment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="fw-bold mb-2">Stay Updated with Latest Offers</h3>
              <p className="mb-lg-0">Subscribe to our newsletter and never miss amazing travel deals.</p>
            </div>
            <div className="col-lg-4">
              <div className="input-group">
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter your email"
                />
                <button className="btn btn-warning" type="button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home