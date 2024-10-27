import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axiosConfig';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, login } = useContext(AuthContext);  // Fetch user and login method from context
  const [loading, setLoading] = useState(true);  // Loading state to handle async auth check

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get('/api/auth/verify', { withCredentials: true });
        if (response.data.user) {
          login(response.data.user);  // Login and set the user in context if token is valid
        }
      } catch (error) {
        console.error('User verification failed:', error);  // Handle errors if the user is not authenticated
      } finally {
        setLoading(false);  // Stop loading after verification is complete
      }
    };

    if (!user) {
      verifyUser();  // If the user is not in context, verify the user via the backend
    } else {
      setLoading(false);  // If user is already in context, stop loading
    }
  }, [user, login]);

  // Show a loading state with Material-UI's CircularProgress while the user is being verified
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if user is not authenticated
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
