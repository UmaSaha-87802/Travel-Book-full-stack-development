import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateForm } from '../../utils/helpers'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setProfileData(prev => ({
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateForm(profileData, {
      name: { required: true, minLength: 2, maxLength: 50 },
      phone: { required: true, phone: true }
    })
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateForm(passwordData, {
      currentPassword: { required: true },
      newPassword: { required: true, minLength: 6 },
      confirmPassword: { required: true }
    })
    
    // Check password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      validation.isValid = false
      validation.errors.confirmPassword = 'Passwords do not match'
    }
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('Password changed successfully!')
      }
    } catch (error) {
      console.error('Password change error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center">
                <div className="profile-avatar me-4">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h1 className="h2 mb-2">{user?.name}</h1>
                  <p className="mb-0 opacity-90">
                    <i className="fas fa-envelope me-2"></i>
                    {user?.email}
                  </p>
                  <p className="mb-0 opacity-90">
                    <i className="fas fa-calendar me-2"></i>
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <span className={`badge bg-${user?.role === 'admin' ? 'warning' : 'light'} fs-6`}>
                <i className={`fas ${user?.role === 'admin' ? 'fa-shield-alt' : 'fa-user'} me-2`}></i>
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card">
              <div className="card-body p-0">
                <div className="nav nav-pills flex-column" id="profile-tabs" role="tablist">
                  <button
                    className={`nav-link text-start ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="fas fa-user me-2"></i>
                    Personal Information
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'password' ? 'active' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="fas fa-lock me-2"></i>
                    Change Password
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('preferences')
                      toast.info('Preferences feature coming soon!')
                    }}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Personal Information Tab */}
            {activeTab === 'profile' && (
              <div className="card">
                <div className="card-header">
                  <h4 className="mb-0">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Personal Information
                  </h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                        {errors.name && (
                          <div className="invalid-feedback">{errors.name}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={user?.email}
                          disabled
                        />
                        <small className="text-muted">
                          Email cannot be changed. Contact support if needed.
                        </small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phone" className="form-label">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                      </div>
                    </div>

                    <h6 className="fw-bold mt-4 mb-3">Address Information</h6>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label htmlFor="address.street" className="form-label">
                          Street Address
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address.street"
                          name="address.street"
                          value={profileData.address.street}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.city" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address.city"
                          name="address.city"
                          value={profileData.address.city}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.state" className="form-label">
                          State/Province
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address.state"
                          name="address.state"
                          value={profileData.address.state}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.zipCode" className="form-label">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address.zipCode"
                          name="address.zipCode"
                          value={profileData.address.zipCode}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="address.country" className="form-label">
                          Country
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address.country"
                          name="address.country"
                          value={profileData.address.country}
                          onChange={handleProfileChange}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="card">
                <div className="card-header">
                  <h4 className="mb-0">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Change Password
                  </h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      {errors.currentPassword && (
                        <div className="invalid-feedback">{errors.currentPassword}</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">
                        New Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      {errors.newPassword && (
                        <div className="invalid-feedback">{errors.newPassword}</div>
                      )}
                      <small className="text-muted">
                        Password must be at least 6 characters long.
                      </small>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={loading}
                      />
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>

                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Security Tip:</strong> Choose a strong password with a mix of letters, numbers, and special characters.
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Changing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key me-2"></i>
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="card">
                <div className="card-header">
                  <h4 className="mb-0">
                    <i className="fas fa-cog me-2 text-primary"></i>
                    Preferences
                  </h4>
                </div>
                <div className="card-body">
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="fas fa-tools fs-1 text-muted"></i>
                    </div>
                    <h5>Coming Soon!</h5>
                    <p className="text-muted">
                      Preference settings will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile