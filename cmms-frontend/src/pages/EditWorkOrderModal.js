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
  Chip,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AttachmentIcon from '@mui/icons-material/Attachment';
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

const priorityLevels = ['Low', 'Medium', 'High', 'Emergency'];

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Determine if it's mobile or not

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
    priority: 'Medium', // Default priority (added)
  });

  const [originalFormData, setOriginalFormData] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState("Copy Task ID");
  const [tooltipOpen, setTooltipOpen] = useState(false); // Control tooltip state
  const [copied, setCopied] = useState(false); // State to track if the chip was clicked
  const [selectedFiles, setSelectedFiles] = useState([]); // State for file selection

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
        status: workOrder.status || 'new',
        priority: workOrder.priority || 'Medium',
      };

      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [workOrder]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      // Clear the selected files after upload is successful
      setSelectedFiles([]);
      alert('Attachments uploaded successfully!');
    } catch (error) {
      alert('Failed to upload attachments. Please try again.');
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

      setFormData(originalFormData);

      await axios.put(`/api/work-orders/${originalFormData._id}`, originalFormData);

      fetchWorkOrders();
      setSnackbarOpen(false);
    } catch (error) {
      console.error('Failed to undo changes.', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCopyTaskId = async () => {
    if (workOrder?.workOrderId) {
      try {
        await navigator.clipboard.writeText(workOrder.workOrderId);
        setTooltipText("Copied!");
        setTooltipOpen(true);
        setCopied(true);
        setTimeout(() => {
          setTooltipOpen(false);
          setCopied(false);
        }, 1500);
      } catch (error) {
        setTooltipText("Failed to copy");
        setTooltipOpen(true);
        setTimeout(() => setTooltipOpen(false), 1500);
      }
    }
  };

  const handleMouseEnter = () => {
    if (!copied) {
      setTooltipText("Copy Task ID");
      setTooltipOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" fullScreen={isMobile}>
        <DialogTitle>
          Edit Work Order
          {workOrder?.workOrderId && (
            <Tooltip
              title={tooltipText}
              arrow
              open={tooltipOpen}
              onClose={() => setTooltipOpen(false)}
              disableHoverListener={isMobile || copied}
              placement="top"
            >
              <Chip
                label={`Task ID: ${workOrder.workOrderId}`}
                onClick={handleCopyTaskId}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => !isMobile && setTooltipOpen(false)}
                onTouchEnd={handleCopyTaskId}
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
                      value={formData.status || ''}
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
                    <InputLabel>Priority</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority || 'Medium'}
                      onChange={handleChange}
                      label="Priority"
                    >
                      {priorityLevels.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel>Task Type</InputLabel>
                    <Select
                      name="taskType"
                      value={formData.taskType || ''}
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
                    rows={isMobile ? 3 : 6}
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
                rows={isMobile ? 3 : 2}
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleAddNote}>
                Add Note
              </Button>

              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Notes History
              </Typography>
              <Box sx={{ mt: 2 }}>
                {formData.notesHistory.slice().reverse().map((note, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: '#262626',
                      border: '1px solid',
                      borderColor: '#878787',
                      boxShadow: 6,
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" color="#FFBC40">
                        <strong>{note.username}</strong> at {new Date(note.timestamp).toLocaleString()}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                        {note.note}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <IconButton size="small" onClick={() => handleDeleteNote(index)} sx={{ ml: 1 }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
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
                <List>
                  {formData.attachments.map((attachment, index) => (
                    <ListItem key={index} sx={{ mb: 2 }}>
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            component="button"
                            onClick={() => handleDownloadAttachment(attachment)}
                            sx={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#FFBC40',
                              textDecoration: 'none',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {attachment.split('/').pop()}
                          </Typography>
                        }
                      />
                      <IconButton onClick={() => handleDeleteAttachment(attachment.split('/').pop())}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No attachments available.</Typography>
              )}

<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
  Upload New Attachments
</Typography>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <input
    accept="*/*"
    style={{ display: 'none' }}  // Hide the default input
    id="upload-button-file"
    multiple
    type="file"
    onChange={handleFileChange}
  />
  <label htmlFor="upload-button-file">
    <Button variant="contained" component="span" sx={{ backgroundColor: '#FF4081', fontWeight: 'bold', flexShrink: 0 }}>
      Choose Files
    </Button>
  </label>
  <Button variant="contained" color="primary" onClick={handleUploadAttachments} sx={{ flexShrink: 0 }}>
    Upload Attachments
  </Button>
</Box>

{/* Display selected files as a list */}
{selectedFiles.length > 0 && (
  <Box sx={{ mt: 2, maxHeight: '150px', overflowY: 'auto', padding: '10px' }}>
    <List sx={{ overflowY: 'auto' }}>
      {Array.from(selectedFiles).map((file, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0px 13px',
            backgroundColor: '#262626',
            borderRadius: 1,
            border: '1px solid #fff',  // Apply border only to individual attachment
            mb: 1  // Margin between the attachment items
          }}
        >
          <Typography
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '80%',  // Prevents text from overflowing
            }}
          >
            {file.name}
          </Typography>
          <IconButton
            edge="end"
            sx={{ color: '#fff' }}
            onClick={() => {
              const newFiles = Array.from(selectedFiles);
              newFiles.splice(index, 1);
              setSelectedFiles(newFiles);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
    </List>
  </Box>
)}

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
