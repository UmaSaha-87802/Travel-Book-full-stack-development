import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-page min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center text-center">
          <div className="col-lg-6">
            <div className="mb-5">
              <div className="display-1 fw-bold text-primary mb-3">404</div>
              <h2 className="h1 mb-3">Page Not Found</h2>
              <p className="lead text-muted mb-4">
                Oops! The page you're looking for seems to have wandered off on its own adventure. 
                Don't worry, we'll help you find your way back.
              </p>
            </div>

            <div className="mb-5">
              <i className="fas fa-plane text-primary" style={{ fontSize: '8rem', opacity: 0.3 }}></i>
            </div>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Link to="/" className="btn btn-primary btn-lg">
                <i className="fas fa-home me-2"></i>
                Go Home
              </Link>
              <Link to="/packages" className="btn btn-outline-primary btn-lg">
                <i className="fas fa-search me-2"></i>
                Browse Packages
              </Link>
            </div>

            <div className="mt-5">
              <p className="text-muted small">
                If you believe this is an error, please{' '}
                <a href="mailto:support@travelbook.com" className="text-decoration-none">
                  contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound