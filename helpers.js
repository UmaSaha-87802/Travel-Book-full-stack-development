// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount)
}

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-US', {
    ...defaultOptions,
    ...options
  })
}

// Format date for input fields
export const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

// Get days difference
export const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1))
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get days until date
export const getDaysUntil = (date) => {
  const today = new Date()
  const targetDate = new Date(date)
  const diffTime = targetDate - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

// Generate random booking reference
export const generateBookingRef = () => {
  return 'TB' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase()
}

// Get package category icon
export const getCategoryIcon = (category) => {
  const icons = {
    adventure: 'fa-mountain',
    beach: 'fa-umbrella-beach',
    cultural: 'fa-landmark',
    luxury: 'fa-gem',
    budget: 'fa-coins',
    family: 'fa-users',
    romantic: 'fa-heart',
    business: 'fa-briefcase'
  }
  return icons[category] || 'fa-map-marker-alt'
}

// Get difficulty badge class
export const getDifficultyClass = (difficulty) => {
  const classes = {
    easy: 'success',
    moderate: 'warning',
    challenging: 'danger'
  }
  return classes[difficulty] || 'secondary'
}

// Get booking status badge class
export const getBookingStatusClass = (status) => {
  const classes = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info'
  }
  return classes[status] || 'secondary'
}

// Get payment status badge class
export const getPaymentStatusClass = (status) => {
  const classes = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'info'
  }
  return classes[status] || 'secondary'
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const value = data[field]
    const fieldRules = rules[field]
    
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`
      return
    }
    
    if (value && fieldRules.minLength && value.toString().length < fieldRules.minLength) {
      errors[field] = `${field} must be at least ${fieldRules.minLength} characters`
      return
    }
    
    if (value && fieldRules.maxLength && value.toString().length > fieldRules.maxLength) {
      errors[field] = `${field} cannot exceed ${fieldRules.maxLength} characters`
      return
    }
    
    if (value && fieldRules.email && !isValidEmail(value)) {
      errors[field] = 'Please enter a valid email address'
      return
    }
    
    if (value && fieldRules.phone && !isValidPhone(value)) {
      errors[field] = 'Please enter a valid phone number'
      return
    }
    
    if (value && fieldRules.min && Number(value) < fieldRules.min) {
      errors[field] = `${field} must be at least ${fieldRules.min}`
      return
    }
    
    if (value && fieldRules.max && Number(value) > fieldRules.max) {
      errors[field] = `${field} cannot exceed ${fieldRules.max}`
      return
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Format rating
export const formatRating = (rating, showCount = true, count = 0) => {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
  return showCount ? `${stars} (${rating}/5) ${count} reviews` : `${stars} ${rating}/5`
}

// Get relative time
export const getRelativeTime = (date) => {
  const now = new Date()
  const diffTime = now - new Date(date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}