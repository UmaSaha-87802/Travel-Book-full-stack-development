import axios from 'axios'

// Create axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
})

// Add auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/me'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  changePassword: (passwordData) => API.post('/auth/change-password', passwordData)
}

// Packages API
export const packagesAPI = {
  getAll: (params = {}) => API.get('/packages', { params }),
  getById: (id) => API.get(`/packages/${id}`),
  create: (packageData) => API.post('/packages', packageData),
  update: (id, packageData) => API.put(`/packages/${id}`, packageData),
  delete: (id) => API.delete(`/packages/${id}`),
  search: (term) => API.get(`/packages/search/${term}`)
}

// Bookings API
export const bookingsAPI = {
  getUserBookings: (params = {}) => API.get('/bookings', { params }),
  getAllBookings: (params = {}) => API.get('/bookings/all', { params }),
  getById: (id) => API.get(`/bookings/${id}`),
  create: (bookingData) => API.post('/bookings', bookingData),
  updateStatus: (id, statusData) => API.put(`/bookings/${id}/status`, statusData),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { cancellationReason: reason }),
  getStats: () => API.get('/bookings/stats/dashboard')
}

export default API