import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Update if your backend is on a different port
  withCredentials: true, // Ensure that cookies (including JWT) are sent with every request
});

// You can still keep interceptors for any other custom logic if needed
instance.interceptors.request.use(
  (config) => {
    // No need to manually attach token anymore since cookies are handled automatically by the browser
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
