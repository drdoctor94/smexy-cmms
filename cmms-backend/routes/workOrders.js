const express = require('express');
const router = express.Router();
const WorkOrder = require('../models/WorkOrder');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');  // Import role check middleware
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer to save files with their original filenames and extensions
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Set destination to your uploads directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    cb(null, uniqueSuffix + '-' + originalName); // Maintain original extension
  }
});

const upload = multer({ storage: storage });

// Get all work orders (accessible by Admins, Technicians, and Tenants)
router.get('/', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate('submittedBy', 'firstName lastName') // Include firstName and lastName fields
      .sort({ createdDate: -1 });
    res.json(workOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new work order
router.post('/', auth, roleCheck(['Technician', 'Tenant']), upload.single('attachments'), async (req, res) => {
  const { taskType, roomNumber, details, priority } = req.body;

  try {
    const workOrder = new WorkOrder({
      taskType,
      roomNumber,
      details,
      submittedBy: req.user._id,
      priority,
      attachments: req.file ? `uploads/${req.file.filename}` : null, // Save relative path with filename
    });

    await workOrder.save();
    res.status(201).json(workOrder);
  } catch (err) {
    console.error('Error creating work order:', err);
    res.status(500).json({ error: err.message });
  }
});

// Other routes (allow access to Technicians and Tenants as well as Admins)
router.get('/count', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    const workOrderCount = await WorkOrder.countDocuments();
    res.json({ count: workOrderCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new note to a work order
router.put('/:id/add-note', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store firstName and lastName, or fallback to username if they are unavailable
    const userNameDisplay = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username;

    workOrder.notesHistory.push({
      note,
      username: userNameDisplay, // Use the full name if available, otherwise fallback to username
      timestamp: new Date(),
    });

    await workOrder.save();
    res.json(workOrder);
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(500).json({ error: err.message });
  }
});


// Update a work order by ID
router.put('/:id', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    const workOrder = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, modifiedDate: Date.now() }, // Update the modified date and other fields
      { new: true }
    );
    res.json(workOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a work order by ID
router.delete('/:id', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    await WorkOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Work order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload attachments to a work order
router.post('/:id/attachments', auth, roleCheck(['Technician', 'Tenant']), upload.array('files'), async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    if (!workOrder.attachments) {
      workOrder.attachments = [];
    }

    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => `uploads/${file.filename}`);
      workOrder.attachments.push(...filePaths);
      await workOrder.save();
    }

    res.status(200).json({ message: 'Files uploaded successfully!', attachments: workOrder.attachments });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ message: 'Failed to upload attachments', error });
  }
});

// Delete an attachment from a work order
router.delete('/:id/attachments/:filename', auth, roleCheck(['Technician', 'Tenant']), async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);

    if (!workOrder) {
      return res.status(404).json({ message: 'Work order not found' });
    }

    const { filename } = req.params;
    const updatedAttachments = workOrder.attachments.filter(attachment => !attachment.includes(filename));

    const filePath = path.join(__dirname, '../uploads', filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to delete file:', unlinkErr);
          }
        });
      }
    });

    workOrder.attachments = updatedAttachments;
    await workOrder.save();

    res.status(200).json({ message: 'Attachment deleted successfully', attachments: updatedAttachments });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Failed to delete attachment', error });
  }
});

module.exports = router;
