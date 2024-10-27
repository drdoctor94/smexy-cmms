import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from '../api/axiosConfig';

const AddUserModal = ({ open, handleClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    password: ''
  });

  const [error, setError] = useState(null); // For error handling

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setError(null); // Reset error before saving
    try {
      // Send a request to add the new user
      await axios.post('/api/users', formData);
      onSave(); // Trigger the refresh function passed from UserManagement
      handleClose(); // Close the modal after saving
    } catch (error) {
      setError('Failed to add user. Please try again.'); // Set error message if there's an issue
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New User</DialogTitle>
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
        <FormControl fullWidth margin="normal">
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </FormControl>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if exists */}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
