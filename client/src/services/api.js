import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle the status field in responses
api.interceptors.response.use(
  (response) => {
    // Check if response has status field set to false
    if (response.data && response.data.status === false) {
      // Transform it into an error
      const error = new Error(response.data.message || 'Request failed');
      error.response = response;
      error.data = response.data;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    // Handle network errors or server errors
    if (error.response) {
      // Server responded with error status
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }
    } else if (error.request) {
      // Request was made but no response
      error.message = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Designation API
export const designationAPI = {
  getAll: () => api.get('/designations'),
  getById: (id) => api.get(`/designations/${id}`),
  create: (data) => api.post('/designations', data),
  update: (id, data) => api.put(`/designations/${id}`, data),
  delete: (id) => api.delete(`/designations/${id}`),
};

// Employee API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Attendance API
export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  getByEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}`),
  getReport: (employeeId, year, month) =>
    api.get(`/attendance/report/${employeeId}/${year}/${month}`),
  getDashboard: () => api.get('/attendance/dashboard'),
};

export default api;