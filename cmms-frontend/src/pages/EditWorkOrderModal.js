import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Tooltip,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from '../api/axiosConfig';

const statusMapping = {
  new: 'New',
  pending: 'Pending',
  delayed: 'Delayed',
  closed: 'Closed',
  excluded: 'Excluded',
  're-opened': 'Re-Opened',
};

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

const EditWorkOrderModal = ({ open, handleClose, workOrder, fetchWorkOrders }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    status: '',
    taskType: '',
    roomNumber: '',
    description: '',
    notes: '',
    submittedBy: '',
    notesHistory: [],
    newNote: '',
    createdDate: '',
    attachments: [],
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tooltipText, setTooltipText] = useState("Copy Task ID"); // New state for tooltip

  useEffect(() => {
    if (workOrder) {
      const initialData = {
        _id: workOrder._id || '',
        taskType: workOrder.taskType || '',
        roomNumber: workOrder.roomNumber || '',
        description: workOrder.details || '',
        notesHistory: workOrder.notesHistory || [],
        createdDate: new Date(workOrder.createdDate).toLocaleString(),
        attachments: workOrder.attachments || [],
        submittedBy: workOrder.submittedBy
          ? `${workOrder.submittedBy.firstName} ${workOrder.submittedBy.lastName}`
          : 'N/A',
        newNote: '',
      };

      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [workOrder]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadAttachments = async () => {
    if (!workOrder._id) {
      alert('Work order ID is missing');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    const uploadData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      uploadData.append('files', selectedFiles[i]);
    }

    try {
      const response = await axios.post(`/api/work-orders/${workOrder._id}/attachments`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData({
        ...formData,
        attachments: response.data.attachments,
      });

      alert('Attachments uploaded successfully!');
    } catch (error) {
      alert('Failed to upload attachments. Please try again.');
    }
  };

  const handleDownloadAttachment = (attachmentPath) => {
    const url = `${process.env.REACT_APP_API_URL}/${attachmentPath}`;
    window.open(url, '_blank');
  };

  const handleDeleteAttachment = async (filename) => {
    try {
      const response = await axios.delete(`/api/work-orders/${workOrder._id}/attachments/${filename}`);
      setFormData({
        ...formData,
        attachments: response.data.attachments,
      });
    } catch (error) {
      alert('Failed to delete attachment.');
    }
  };

  const handleAddNote = async () => {
    if (formData.newNote.trim() === '') {
      return;
    }

    try {
      const newNote = { note: formData.newNote };

      const response = await axios.put(`/api/work-orders/${workOrder._id}/add-note`, newNote);

      setFormData({
        ...formData,
        notesHistory: response.data.notesHistory,
        newNote: '',
      });
    } catch (error) {
      alert('Failed to add the note. Please try again.');
    }
  };

  const handleDeleteNote = async (index) => {
    const updatedNotesHistory = formData.notesHistory.filter((_, i) => i !== index);

    try {
      await axios.put(`/api/work-orders/${workOrder._id}`, {
        notesHistory: updatedNotesHistory,
      });

      setFormData({
        ...formData,
        notesHistory: updatedNotesHistory,
      });
    } catch (error) {
      alert('Failed to delete the note. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!workOrder || !workOrder._id) {
      return;
    }

    try {
      const updatedData = {
        status: formData.status,
        taskType: formData.taskType,
        roomNumber: formData.roomNumber,
        details: formData.description,
        priority: formData.priority,
        notesHistory: formData.notesHistory,
      };

      await axios.put(`/api/work-orders/${workOrder._id}`, updatedData);

      setSnackbarOpen(true);
      fetchWorkOrders();
      handleClose();
    } catch (error) {
      alert('Failed to update the work order. Please try again.');
    }
  };

  const handleUndo = async () => {
    try {
      if (!originalFormData || !originalFormData._id) {
        return;
      }

      setUndoing(true);

      setFormData(originalFormData);

      await axios.put(`/api/work-orders/${originalFormData._id}`, originalFormData);

      fetchWorkOrders();
      setSnackbarOpen(false);
      setUndoing(false);
    } catch (error) {
      setUndoing(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway' || undoing) {
      return;
    }
    setSnackbarOpen(false);
  };

  const dialogStyle = {
    fullWidth: true,
    maxWidth: 'md',
    ...(isMobile && { fullScreen: true }), // Fullscreen on mobile devices
  };

  // Function to copy Task ID to clipboard
  const handleCopyTaskId = async () => {
    if (workOrder?.workOrderId) {
      try {
        await navigator.clipboard.writeText(workOrder.workOrderId);
        setTooltipText("Copied!"); // Set tooltip to "Copied!"
        setTimeout(() => {
          setTooltipText("Copy Task ID"); // Revert tooltip after a delay
        }, 1500); // Tooltip will reset after 1.5 seconds
      } catch (error) {
        setTooltipText("Failed to copy");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} {...dialogStyle}>
        <DialogTitle>
          Edit Work Order
          {workOrder?.workOrderId && (
            <Tooltip title={tooltipText} arrow>
              <Chip
                label={`Task ID: ${workOrder.workOrderId}`}
                onClick={handleCopyTaskId}
                sx={{ float: 'right', cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}
              />
            </Tooltip>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>Update the work order details below:</DialogContentText>

          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable" 
            scrollButtons={false} 
          >
            <Tab label="Work Order Details" />
            <Tab label="Notes and Updates" />
            <Tab label="Attachments" />
          </Tabs>

          {selectedTab === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      label="Status"
                    >
                      {Object.keys(statusMapping).map((status) => (
                        <MenuItem key={status} value={status}>
                          {statusMapping[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>Task Type</InputLabel>
                    <Select
                      name="taskType"
                      value={formData.taskType}
                      onChange={handleChange}
                      label="Task Type"
                    >
                      {taskTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Room Number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />

                  <TextField
                    label="Submitted By"
                    name="submittedBy"
                    value={formData.submittedBy || 'N/A'}
                    disabled
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />

                  <TextField
                    label="Date Created"
                    name="createdDate"
                    value={formData.createdDate}
                    fullWidth
                    margin="normal"
                    disabled
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Original Description"
                    name="description"
                    value={formData.description}
                    fullWidth
                    multiline
                    rows={isMobile ? 3 : 6} // Responsive rows for mobile
                    margin="normal"
                    disabled
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Add new note
              </Typography>
              <TextField
                label="Add new note"
                name="newNote"
                value={formData.newNote}
                onChange={handleChange}
                fullWidth
                multiline
                rows={isMobile ? 3 : 5} // Responsive text field rows
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleAddNote}>
                Add Note
              </Button>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Notes History
              </Typography>
              <Box sx={{ mt: 2 }}>
                {formData.notesHistory.map((note, index) => (
                  <Box key={index} sx={{ mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
                    <Typography variant="body2">
                      <strong>{note.username}</strong> at{' '}
                      {new Date(note.timestamp).toLocaleString()}:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {note.note}
                    </Typography>
                    <IconButton size="small" onClick={() => handleDeleteNote(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Existing Attachments
              </Typography>
              {formData.attachments.length > 0 ? (
                <Box>
                  {formData.attachments.map((attachment, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography>
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          style={{ background: 'none', border: 'none', padding: 0, color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {attachment.split('/').pop()}
                        </button>
                      </Typography>
                      <IconButton onClick={() => handleDeleteAttachment(attachment.split('/').pop())}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography>No attachments available.</Typography>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Upload New Attachments
              </Typography>
              <input type="file" multiple onChange={handleFileChange} />
              <Button variant="contained" color="primary" onClick={handleUploadAttachments}>
                Upload Attachments
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7500}
        onClose={handleCloseSnackbar}
        message="Work order updated"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleUndo}>
              Undo
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          </>
        }
      />
    </>
  );
};

export default EditWorkOrderModal;