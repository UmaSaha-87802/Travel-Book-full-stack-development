import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { packagesAPI } from '../../utils/api'
import { validateForm, formatDateInput } from '../../utils/helpers'
import toast from 'react-hot-toast'

const EditPackage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: '',
    price: '',
    category: 'adventure',
    difficulty: 'easy',
    maxGroupSize: '',
    images: [''],
    inclusions: [''],
    exclusions: [''],
    highlights: [''],
    availability: {
      startDate: '',
      endDate: '',
      availableSlots: ''
    }
  })

  useEffect(() => {
    fetchPackage()
  }, [id])

  const fetchPackage = async () => {
    try {
      setLoading(true)
      const response = await packagesAPI.getById(id)
      const pkg = response
      
      setFormData({
        title: pkg.title || '',
        description: pkg.description || '',
        destination: pkg.destination || '',
        duration: pkg.duration?.toString() || '',
        price: pkg.price?.toString() || '',
        category: pkg.category || 'adventure',
        difficulty: pkg.difficulty || 'easy',
        maxGroupSize: pkg.maxGroupSize?.toString() || '',
        images: pkg.images?.length > 0 ? pkg.images : [''],
        inclusions: pkg.inclusions?.length > 0 ? pkg.inclusions : [''],
        exclusions: pkg.exclusions?.length > 0 ? pkg.exclusions : [''],
        highlights: pkg.highlights?.length > 0 ? pkg.highlights : [''],
        availability: {
          startDate: pkg.availability?.startDate ? formatDateInput(pkg.availability.startDate) : '',
          endDate: pkg.availability?.endDate ? formatDateInput(pkg.availability.endDate) : '',
          availableSlots: pkg.availability?.availableSlots?.toString() || ''
        }
      })
    } catch (error) {
      console.error('Error fetching package:', error)
      toast.error('Package not found')
      navigate('/admin/packages')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('availability.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? value : item
      )
    }))
  }

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }))
  }

  const removeArrayItem = (arrayName, index) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validationRules = {
      title: { required: true, minLength: 3, maxLength: 100 },
      description: { required: true, minLength: 10, maxLength: 2000 },
      destination: { required: true },
      duration: { required: true, min: 1 },
      price: { required: true, min: 0 },
      maxGroupSize: { required: true, min: 1 },
      'availability.availableSlots': { required: true, min: 0 }
    }
    
    const validation = validateForm(formData, validationRules)
    
    // Additional validations
    const startDate = new Date(formData.availability.startDate)
    const endDate = new Date(formData.availability.endDate)
    
    if (endDate <= startDate) {
      validation.isValid = false
      validation.errors['availability.endDate'] = 'End date must be after start date'
    }
    
    // Validate arrays have at least one non-empty item
    const requiredArrays = ['images', 'inclusions', 'highlights']
    requiredArrays.forEach(arrayName => {
      const nonEmptyItems = formData[arrayName].filter(item => item.trim() !== '')
      if (nonEmptyItems.length === 0) {
        validation.isValid = false
        validation.errors[arrayName] = `At least one ${arrayName.slice(0, -1)} is required`
      }
    })
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error('Please fix the errors in the form')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      // Clean up data before sending
      const cleanedData = {
        ...formData,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        maxGroupSize: parseInt(formData.maxGroupSize),
        availability: {
          ...formData.availability,
          availableSlots: parseInt(formData.availability.availableSlots)
        },
        images: formData.images.filter(img => img.trim() !== ''),
        inclusions: formData.inclusions.filter(inc => inc.trim() !== ''),
        exclusions: formData.exclusions.filter(exc => exc.trim() !== ''),
        highlights: formData.highlights.filter(hl => hl.trim() !== '')
      }
      
      await packagesAPI.update(id, cleanedData)
      toast.success('Package updated successfully!')
      navigate('/admin/packages')
    } catch (error) {
      console.error('Update package error:', error)
      const message = error.response?.data?.message || 'Failed to update package'
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

  return (
    <div className="edit-package">
      {/* Header */}
      <div className="admin-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="h2 mb-2">
                <i className="fas fa-edit me-3"></i>
                Edit Package
              </h1>
              <p className="mb-0 opacity-90">
                Update package information and details
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/admin/packages" className="btn btn-outline-light">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Packages
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Basic Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label htmlFor="title" className="form-label">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="destination" className="form-label">
                    Destination *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.destination ? 'is-invalid' : ''}`}
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.destination && (
                    <div className="invalid-feedback">{errors.destination}</div>
                  )}
                </div>
                <div className="col-12 mb-3">
                  <label htmlFor="description" className="form-label">
                    Description *
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description}</div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="duration" className="form-label">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    disabled={submitting}
                    min="1"
                  />
                  {errors.duration && (
                    <div className="invalid-feedback">{errors.duration}</div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="price" className="form-label">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={submitting}
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <div className="invalid-feedback">{errors.price}</div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="adventure">Adventure</option>
                    <option value="beach">Beach</option>
                    <option value="cultural">Cultural</option>
                    <option value="luxury">Luxury</option>
                    <option value="budget">Budget</option>
                    <option value="family">Family</option>
                    <option value="romantic">Romantic</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="difficulty" className="form-label">
                    Difficulty Level
                  </label>
                  <select
                    className="form-select"
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="maxGroupSize" className="form-label">
                    Maximum Group Size *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.maxGroupSize ? 'is-invalid' : ''}`}
                    id="maxGroupSize"
                    name="maxGroupSize"
                    value={formData.maxGroupSize}
                    onChange={handleChange}
                    disabled={submitting}
                    min="1"
                  />
                  {errors.maxGroupSize && (
                    <div className="invalid-feedback">{errors.maxGroupSize}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-images me-2 text-primary"></i>
                Package Images *
              </h5>
            </div>
            <div className="card-body">
              {formData.images.map((image, index) => (
                <div key={index} className="row mb-3">
                  <div className="col-md-10">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Enter image URL"
                      value={image}
                      onChange={(e) => handleArrayChange('images', index, e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-2">
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger me-2"
                        onClick={() => removeArrayItem('images', index)}
                        disabled={submitting}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                    {index === formData.images.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => addArrayItem('images')}
                        disabled={submitting}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {errors.images && (
                <div className="text-danger small">{errors.images}</div>
              )}
            </div>
          </div>

          {/* Inclusions, Exclusions, Highlights */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-check text-success me-2"></i>
                    Inclusions *
                  </h6>
                </div>
                <div className="card-body">
                  {formData.inclusions.map((inclusion, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-9">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="What's included"
                          value={inclusion}
                          onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <div className="col-3">
                        {formData.inclusions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() => removeArrayItem('inclusions', index)}
                            disabled={submitting}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        {index === formData.inclusions.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addArrayItem('inclusions')}
                            disabled={submitting}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.inclusions && (
                    <div className="text-danger small">{errors.inclusions}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-times text-danger me-2"></i>
                    Exclusions
                  </h6>
                </div>
                <div className="card-body">
                  {formData.exclusions.map((exclusion, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-9">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="What's not included"
                          value={exclusion}
                          onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <div className="col-3">
                        {formData.exclusions.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() => removeArrayItem('exclusions', index)}
                            disabled={submitting}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        {index === formData.exclusions.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addArrayItem('exclusions')}
                            disabled={submitting}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-star text-warning me-2"></i>
                    Highlights *
                  </h6>
                </div>
                <div className="card-body">
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-9">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Package highlight"
                          value={highlight}
                          onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                      <div className="col-3">
                        {formData.highlights.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger me-1"
                            onClick={() => removeArrayItem('highlights', index)}
                            disabled={submitting}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                        {index === formData.highlights.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addArrayItem('highlights')}
                            disabled={submitting}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {errors.highlights && (
                    <div className="text-danger small">{errors.highlights}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-calendar me-2 text-primary"></i>
                Availability
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="availability.startDate" className="form-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors['availability.startDate'] ? 'is-invalid' : ''}`}
                    id="availability.startDate"
                    name="availability.startDate"
                    value={formData.availability.startDate}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors['availability.startDate'] && (
                    <div className="invalid-feedback">{errors['availability.startDate']}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="availability.endDate" className="form-label">
                    End Date *
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors['availability.endDate'] ? 'is-invalid' : ''}`}
                    id="availability.endDate"
                    name="availability.endDate"
                    value={formData.availability.endDate}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors['availability.endDate'] && (
                    <div className="invalid-feedback">{errors['availability.endDate']}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label htmlFor="availability.availableSlots" className="form-label">
                    Available Slots *
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors['availability.availableSlots'] ? 'is-invalid' : ''}`}
                    id="availability.availableSlots"
                    name="availability.availableSlots"
                    value={formData.availability.availableSlots}
                    onChange={handleChange}
                    disabled={submitting}
                    min="0"
                  />
                  {errors['availability.availableSlots'] && (
                    <div className="invalid-feedback">{errors['availability.availableSlots']}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <Link to="/admin/packages" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating Package...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Update Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPackage