import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { packagesAPI, bookingsAPI } from '../../utils/api'
import { formatCurrency, formatDate, validateForm, formatDateInput } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const BookingForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    travelDate: '',
    numberOfPeople: 1,
    contactInfo: {
      phone: '',
      email: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    travelerDetails: [
      {
        name: '',
        age: '',
        gender: '',
        passportNumber: '',
        nationality: ''
      }
    ],
    paymentMethod: 'credit_card',
    specialRequests: ''
  })

  useEffect(() => {
    fetchPackageDetail()
  }, [id])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: user.email,
          phone: user.phone || ''
        }
      }))
    }
  }, [user])

  useEffect(() => {
    // Update traveler details array when numberOfPeople changes
    const currentCount = formData.travelerDetails.length
    const newCount = parseInt(formData.numberOfPeople)
    
    if (newCount !== currentCount) {
      const newTravelerDetails = [...formData.travelerDetails]
      
      if (newCount > currentCount) {
        // Add new traveler objects
        for (let i = currentCount; i < newCount; i++) {
          newTravelerDetails.push({
            name: '',
            age: '',
            gender: '',
            passportNumber: '',
            nationality: ''
          })
        }
      } else {
        // Remove excess traveler objects
        newTravelerDetails.splice(newCount)
      }
      
      setFormData(prev => ({
        ...prev,
        travelerDetails: newTravelerDetails
      }))
    }
  }, [formData.numberOfPeople])

  const fetchPackageDetail = async () => {
    try {
      setLoading(true)
      const response = await packagesAPI.getById(id)
      setPackageData(response)
      
      // Set minimum travel date to package start date
      const minDate = new Date(response.availability.startDate)
      const today = new Date()
      const startDate = minDate > today ? minDate : today
      
      setFormData(prev => ({
        ...prev,
        travelDate: formatDateInput(startDate)
      }))
    } catch (error) {
      console.error('Error fetching package:', error)
      toast.error('Package not found')
      navigate('/packages')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]
      if (field === 'emergencyContact') {
        const emergencyField = name.split('.')[2]
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            emergencyContact: {
              ...prev.contactInfo.emergencyContact,
              [emergencyField]: value
            }
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [field]: value
          }
        }))
      }
    } else if (name.startsWith('traveler.')) {
      const [, index, field] = name.split('.')
      const travelerIndex = parseInt(index)
      
      setFormData(prev => ({
        ...prev,
        travelerDetails: prev.travelerDetails.map((traveler, i) =>
          i === travelerIndex ? { ...traveler, [field]: value } : traveler
        )
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validationRules = {
      travelDate: { required: true },
      numberOfPeople: { required: true, min: 1, max: packageData?.maxGroupSize },
      'contactInfo.phone': { required: true, phone: true },
      'contactInfo.email': { required: true, email: true }
    }

    // Add validation for traveler details
    formData.travelerDetails.forEach((_, index) => {
      validationRules[`traveler.${index}.name`] = { required: true, minLength: 2 }
      validationRules[`traveler.${index}.age`] = { required: true, min: 1, max: 120 }
    })

    const validation = validateForm(formData, validationRules)
    
    // Additional validations
    const travelDate = new Date(formData.travelDate)
    const packageStartDate = new Date(packageData.availability.startDate)
    const packageEndDate = new Date(packageData.availability.endDate)
    
    if (travelDate < packageStartDate || travelDate > packageEndDate) {
      validation.isValid = false
      validation.errors.travelDate = 'Travel date must be within package availability period'
    }
    
    if (formData.numberOfPeople > packageData.availability.availableSlots) {
      validation.isValid = false
      validation.errors.numberOfPeople = `Only ${packageData.availability.availableSlots} slots available`
    }
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error('Please fix the errors in the form')
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const bookingData = {
        package: packageData._id,
        ...formData,
        numberOfPeople: parseInt(formData.numberOfPeople)
      }
      
      const response = await bookingsAPI.create(bookingData)
      
      toast.success('Booking created successfully!')
      navigate('/dashboard', { 
        state: { 
          bookingSuccess: true, 
          bookingId: response.booking._id 
        } 
      })
    } catch (error) {
      console.error('Booking error:', error)
      const message = error.response?.data?.message || 'Failed to create booking'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
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
          <Link to="/packages" className="btn btn-primary">Browse Packages</Link>
        </div>
      </div>
    )
  }

  const totalAmount = packageData.price * parseInt(formData.numberOfPeople)

  return (
    <div className="booking-page">
      {/* Header */}
      <section className="bg-primary text-white py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h3 mb-2">Complete Your Booking</h1>
              <p className="mb-0">You're just one step away from your amazing journey!</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to={`/packages/${packageData._id}`} className="btn btn-outline-light">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Package
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container my-5">
        <div className="row">
          {/* Booking Form */}
          <div className="col-lg-8 mb-4">
            <form onSubmit={handleSubmit}>
              {/* Package Summary */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-suitcase-rolling me-2 text-primary"></i>
                    Package Details
                  </h5>
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <img
                        src={packageData.images?.[0] || 'https://via.placeholder.com/200x120'}
                        className="img-fluid rounded"
                        alt={packageData.title}
                        style={{ height: '120px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-9">
                      <h6 className="fw-bold">{packageData.title}</h6>
                      <p className="text-muted mb-2">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {packageData.destination}
                      </p>
                      <div className="row">
                        <div className="col-sm-4">
                          <small className="text-muted">Duration:</small>
                          <div className="fw-medium">{packageData.duration} days</div>
                        </div>
                        <div className="col-sm-4">
                          <small className="text-muted">Price per person:</small>
                          <div className="fw-medium text-primary">{formatCurrency(packageData.price)}</div>
                        </div>
                        <div className="col-sm-4">
                          <small className="text-muted">Available slots:</small>
                          <div className="fw-medium">{packageData.availability.availableSlots}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                    Travel Details
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="travelDate" className="form-label">
                        Travel Date *
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors.travelDate ? 'is-invalid' : ''}`}
                        id="travelDate"
                        name="travelDate"
                        value={formData.travelDate}
                        onChange={handleChange}
                        min={formatDateInput(packageData.availability.startDate)}
                        max={formatDateInput(packageData.availability.endDate)}
                        disabled={submitting}
                      />
                      {errors.travelDate && (
                        <div className="invalid-feedback">{errors.travelDate}</div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="numberOfPeople" className="form-label">
                        Number of People *
                      </label>
                      <select
                        className={`form-select ${errors.numberOfPeople ? 'is-invalid' : ''}`}
                        id="numberOfPeople"
                        name="numberOfPeople"
                        value={formData.numberOfPeople}
                        onChange={handleChange}
                        disabled={submitting}
                      >
                        {Array.from({ length: Math.min(packageData.maxGroupSize, packageData.availability.availableSlots) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Person' : 'People'}
                          </option>
                        ))}
                      </select>
                      {errors.numberOfPeople && (
                        <div className="invalid-feedback">{errors.numberOfPeople}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-address-book me-2 text-primary"></i>
                    Contact Information
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="contactInfo.email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors['contactInfo.email'] ? 'is-invalid' : ''}`}
                        id="contactInfo.email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                      {errors['contactInfo.email'] && (
                        <div className="invalid-feedback">{errors['contactInfo.email']}</div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="contactInfo.phone" className="form-label">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors['contactInfo.phone'] ? 'is-invalid' : ''}`}
                        id="contactInfo.phone"
                        name="contactInfo.phone"
                        value={formData.contactInfo.phone}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                      {errors['contactInfo.phone'] && (
                        <div className="invalid-feedback">{errors['contactInfo.phone']}</div>
                      )}
                    </div>
                  </div>
                  
                  <h6 className="fw-bold mt-4 mb-3">Emergency Contact</h6>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="contactInfo.emergencyContact.name" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="contactInfo.emergencyContact.name"
                        name="contactInfo.emergencyContact.name"
                        value={formData.contactInfo.emergencyContact.name}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="contactInfo.emergencyContact.phone" className="form-label">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="contactInfo.emergencyContact.phone"
                        name="contactInfo.emergencyContact.phone"
                        value={formData.contactInfo.emergencyContact.phone}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="contactInfo.emergencyContact.relationship" className="form-label">
                        Relationship
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="contactInfo.emergencyContact.relationship"
                        name="contactInfo.emergencyContact.relationship"
                        value={formData.contactInfo.emergencyContact.relationship}
                        onChange={handleChange}
                        placeholder="e.g., Spouse, Parent, Friend"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler Details */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-users me-2 text-primary"></i>
                    Traveler Details
                  </h5>
                  {formData.travelerDetails.map((traveler, index) => (
                    <div key={index} className={`${index > 0 ? 'border-top pt-4 mt-4' : ''}`}>
                      <h6 className="fw-bold mb-3">Traveler {index + 1}</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor={`traveler.${index}.name`} className="form-label">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors[`traveler.${index}.name`] ? 'is-invalid' : ''}`}
                            id={`traveler.${index}.name`}
                            name={`traveler.${index}.name`}
                            value={traveler.name}
                            onChange={handleChange}
                            disabled={submitting}
                          />
                          {errors[`traveler.${index}.name`] && (
                            <div className="invalid-feedback">{errors[`traveler.${index}.name`]}</div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor={`traveler.${index}.age`} className="form-label">
                            Age *
                          </label>
                          <input
                            type="number"
                            className={`form-control ${errors[`traveler.${index}.age`] ? 'is-invalid' : ''}`}
                            id={`traveler.${index}.age`}
                            name={`traveler.${index}.age`}
                            value={traveler.age}
                            onChange={handleChange}
                            min="1"
                            max="120"
                            disabled={submitting}
                          />
                          {errors[`traveler.${index}.age`] && (
                            <div className="invalid-feedback">{errors[`traveler.${index}.age`]}</div>
                          )}
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor={`traveler.${index}.gender`} className="form-label">
                            Gender
                          </label>
                          <select
                            className="form-select"
                            id={`traveler.${index}.gender`}
                            name={`traveler.${index}.gender`}
                            value={traveler.gender}
                            onChange={handleChange}
                            disabled={submitting}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor={`traveler.${index}.passportNumber`} className="form-label">
                            Passport Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id={`traveler.${index}.passportNumber`}
                            name={`traveler.${index}.passportNumber`}
                            value={traveler.passportNumber}
                            onChange={handleChange}
                            disabled={submitting}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor={`traveler.${index}.nationality`} className="form-label">
                            Nationality
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id={`traveler.${index}.nationality`}
                            name={`traveler.${index}.nationality`}
                            value={traveler.nationality}
                            onChange={handleChange}
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Additional Info */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-credit-card me-2 text-primary"></i>
                    Payment & Additional Information
                  </h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="paymentMethod" className="form-label">
                        Payment Method
                      </label>
                      <select
                        className="form-select"
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        disabled={submitting}
                      >
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="specialRequests" className="form-label">
                      Special Requests
                    </label>
                    <textarea
                      className="form-control"
                      id="specialRequests"
                      name="specialRequests"
                      rows="3"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      placeholder="Any special dietary requirements, accessibility needs, or other requests..."
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-flex gap-3">
                <Link
                  to={`/packages/${packageData._id}`}
                  className="btn btn-outline-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary flex-grow-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing Booking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Confirm Booking - {formatCurrency(totalAmount)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '100px' }}>
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="fas fa-receipt me-2"></i>
                  Booking Summary
                </h5>
                
                <div className="mb-3">
                  <h6 className="fw-bold">{packageData.title}</h6>
                  <p className="text-muted small mb-0">{packageData.destination}</p>
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Price per person:</span>
                  <span>{formatCurrency(packageData.price)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Number of people:</span>
                  <span>{formData.numberOfPeople}</span>
                </div>
                {formData.travelDate && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Travel date:</span>
                    <span>{formatDate(formData.travelDate)}</span>
                  </div>
                )}

                <hr />

                <div className="d-flex justify-content-between mb-3">
                  <strong>Total Amount:</strong>
                  <strong className="text-primary fs-5">{formatCurrency(totalAmount)}</strong>
                </div>

                <div className="alert alert-info small">
                  <i className="fas fa-info-circle me-2"></i>
                  Your booking will be confirmed instantly after payment. You'll receive a confirmation email with all details.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingForm