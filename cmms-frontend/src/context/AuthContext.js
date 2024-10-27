import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axiosConfig'; // Import your axios instance configured with withCredentials: true
import Cookies from 'js-cookie'; // Using js-cookie to easily handle cookies

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check authentication status on page load
  useEffect(() => {
    const token = Cookies.get('jwt'); // Get JWT from the cookie

    if (token) {
      // If the token exists, verify the token with the backend
      axios
        .get('/api/auth/verify', { withCredentials: true })
        .then((response) => {
          setUser(response.data.user);
          setIsAuthenticated(true); // Set user as authenticated
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  // Login function
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true); // Set authenticated state
  };

  // Logout function
  const logout = () => {
    axios.post('/api/auth/logout', {}, { withCredentials: true }) // Ensure that the logout clears the cookie
      .then(() => {
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove('jwt'); // Remove JWT cookie
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
