import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
} from '@mui/material';
import axios from '../api/axiosConfig'; // Ensure this is the correct import for making API requests

const taskTypes = [
  'Clean Up / Spill',
  'Cooling Issue',
  'Electrical Issue',
  'Equipment Repairs',
  'Fire Safety',
  'General Maintenance Request',
  'Health and Safety',
  'Heating Issues',
  'Lighting Issues',
  'Mechanical Issues',
  'Painting / Touch Ups',
  'Pest Control',
  'Plumbing Issues',
  'Waste Issues',
];

const priorities = ['Low', 'Medium', 'High', 'Emergency'];

const WorkOrderFormModal = ({ open, handleClose, onWorkOrderSubmit }) => {  // Include onWorkOrderSubmit prop
  const [formData, setFormData] = useState({
    taskType: '',
    roomNumber: '',
    details: '',
    priority: '',
    attachments: null,
  });

  // Function to handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachments: e.target.files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Perform validation (you can add more validation logic here)
    if (!formData.roomNumber || !formData.details || !formData.priority) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('taskType', formData.taskType);
      formDataToSend.append('roomNumber', formData.roomNumber);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('priority', formData.priority);
      if (formData.attachments) {
        formDataToSend.append('attachments', formData.attachments);
      }

      // POST request to backend to create a new work order
      await axios.post('/api/work-orders', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Handle success
      alert('Work order created successfully!');
      handleClose(); // Close the modal
      onWorkOrderSubmit(); // Refresh work orders list after submission
    } catch (error) {
      console.error('Error submitting the work order:', error);
      alert('Failed to create the work order. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Work Order</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the form to create a new work order.
        </DialogContentText>

        {/* Task Type */}
        <TextField
          select
          label="Task Type"
          name="taskType"
          value={formData.taskType}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {taskTypes.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {/* Room Number */}
        <TextField
          label="Room Number"
          name="roomNumber"
          value={formData.roomNumber}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />

        {/* Details */}
        <TextField
          label="Details"
          name="details"
          value={formData.details}
          onChange={handleChange}
          required
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />

        {/* Priority */}
        <TextField
          select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        >
          {priorities.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {/* Attachments */}
        <input
          type="file"
          name="attachments"
          onChange={handleFileChange}
          style={{ marginTop: '15px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkOrderFormModal;
