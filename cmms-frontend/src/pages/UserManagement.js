import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import EditUserModal from './EditUserModal'; // Import the edit modal component
import AddUserModal from './AddUserModal'; // Import the add modal component
import axios from '../api/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // To store the user selected for editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false); // To open add modal
  const [currentUserRole, setCurrentUserRole] = useState(''); // To store the current user's role
  const [isAuthorized, setIsAuthorized] = useState(false); // To check if user is authorized
  const [isLoading, setIsLoading] = useState(true); // To show loading state
  const [error, setError] = useState(''); // To display errors

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const { role } = response.data.user; // Extract user role
      setCurrentUserRole(role);
      setIsAuthorized(role === 'Admin');
      setIsLoading(false); // Data has been loaded, stop loading
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setError('Failed to fetch current user.');
      setIsLoading(false); // Stop loading even in case of error
    }
  };

  useEffect(() => {
    fetchCurrentUser(); // Fetch the current user info when the component mounts
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers(); // Fetch users only if the current user is an Admin
    }
  }, [isAuthorized]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true); // Open the modal when clicking the edit button
  };

  const handleAddUser = () => {
    setAddModalOpen(true); // Open the add modal when clicking the add button
  };

  // Close the edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null); // Clear the selected user after closing
  };

  // Close the add modal
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  // Callback function to refresh the user list after editing or adding a user
  const handleRefreshUsers = () => {
    fetchUsers(); // Refresh the user list
  };

  // Show loading state until user role is fetched
  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  // Show access denied message if the user is not an admin
  if (!isAuthorized) {
    return <Typography>{error || 'You do not have access to view this page.'}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Button variant="contained" color="primary" onClick={handleAddUser}>
        Add New User
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>
                <Button variant="contained" color="secondary" onClick={() => handleEditUser(user)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit User Modal */}
      {editModalOpen && selectedUser && (
        <EditUserModal
          open={editModalOpen}
          handleClose={handleCloseEditModal}
          user={selectedUser}
          onSave={handleRefreshUsers} // Pass the refresh function to trigger after save
        />
      )}

      {/* Add User Modal */}
      {addModalOpen && (
        <AddUserModal
          open={addModalOpen}
          handleClose={handleCloseAddModal}
          onSave={handleRefreshUsers} // Pass the refresh function to trigger after adding
        />
      )}
    </TableContainer>
  );
};

export default UserManagement;
