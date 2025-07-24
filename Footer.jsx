import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="fw-bold mb-3">
              <i className="fas fa-plane me-2"></i>
              TravelBook
            </h5>
            <p className="text-muted">
              Your trusted travel companion for amazing adventures around the world. 
              Book your dream vacation with our carefully curated travel packages.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light fs-5">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/packages" className="text-muted text-decoration-none">
                  Packages
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none">
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Categories</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/packages?category=adventure" className="text-muted text-decoration-none">
                  Adventure Tours
                </a>
              </li>
              <li className="mb-2">
                <a href="/packages?category=beach" className="text-muted text-decoration-none">
                  Beach Holidays
                </a>
              </li>
              <li className="mb-2">
                <a href="/packages?category=cultural" className="text-muted text-decoration-none">
                  Cultural Trips
                </a>
              </li>
              <li className="mb-2">
                <a href="/packages?category=luxury" className="text-muted text-decoration-none">
                  Luxury Travel
                </a>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Contact Info</h6>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                123 Travel Street, Adventure City
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                +1 (555) 123-4567
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                info@travelbook.com
              </li>
              <li className="mb-2">
                <i className="fas fa-clock me-2"></i>
                Mon - Fri: 9:00 AM - 6:00 PM
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-muted mb-0">
              &copy; 2024 TravelBook. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-md-end gap-4">
              <a href="#" className="text-muted text-decoration-none small">
                Privacy Policy
              </a>
              <a href="#" className="text-muted text-decoration-none small">
                Terms of Service
              </a>
              <a href="#" className="text-muted text-decoration-none small">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer