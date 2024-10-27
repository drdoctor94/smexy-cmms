import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { Typography, Grid } from '@mui/material';

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [workOrderCount, setWorkOrderCount] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState('');

  useEffect(() => {
    // Fetch the current user's role
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setCurrentUserRole(response.data.user.role);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    // Fetch user count if the current user is an Admin
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('/api/users/count');
        setUserCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch user count:', error);
      }
    };

    // Fetch work order count for all users
    const fetchWorkOrderCount = async () => {
      try {
        const response = await axios.get('/api/work-orders/count');
        setWorkOrderCount(response.data.count);
      } catch (error) {
        console.error('Failed to fetch work order count:', error);
      }
    };

    fetchCurrentUser();
    fetchWorkOrderCount();

    // Only fetch the user count if the current user is an Admin
    if (currentUserRole === 'Admin') {
      fetchUserCount();
    }
  }, [currentUserRole]);

  return (
    <Grid container spacing={3}>
      {/* Conditionally show user count only if the current user is an Admin */}
      {currentUserRole === 'Admin' && (
        <Grid item xs={12}>
          <Typography variant="h6">Total Users: {userCount}</Typography>
        </Grid>
      )}

      {/* Show the work order count for all roles */}
      <Grid item xs={12}>
        <Typography variant="h6">Total Work Orders: {workOrderCount}</Typography>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
