import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = 'https://codecollab-backend-zcwv.onrender.com';

// Add credentials to enable cookies
axios.defaults.withCredentials = true;

// Add interceptor to handle token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
