import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Select, InputLabel, FormControl, DialogContentText } from '@mui/material';
import axios from '../api/axiosConfig';

const EditUserModal = ({ open, handleClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    role: user?.role || '',
  });

  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // For showing the confirm delete dialog

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setError(null);
    try {
      await axios.put(`/api/users/${user._id}`, formData);
      onSave(); // Trigger refresh of the user list
      handleClose(); // Close modal
    } catch (error) {
      setError('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/users/${user._id}`);
      onSave(); // Trigger refresh of the user list
      handleClose(); // Close modal after deletion
    } catch (error) {
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleDeleteConfirmation = () => {
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Technician">Technician</MenuItem>
              <MenuItem value="Tenant">Tenant</MenuItem>
            </Select>
          </FormControl>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmation} color="secondary">Delete User</Button>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={showConfirmDelete} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this user? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteUser} color="primary">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditUserModal;
