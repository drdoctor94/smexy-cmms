const mongoose = require('mongoose');

// Function to generate a random 9-digit work order ID
function generateWorkOrderId() {
  return Math.floor(100000000 + Math.random() * 900000000); // Generates a random 9-digit number
}

// Define the schema for work orders
const WorkOrderSchema = new mongoose.Schema({
  workOrderId: {
    type: Number,
    unique: true, // Ensure the custom ID is unique
    required: true,
  },
  taskType: {
    type: String,
    enum: [
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
      'Waste Issues'
    ],
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  notesHistory: [
    {
      note: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ], // Array to store note history
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Low',
  },
  attachments: {
    type: [String], // Array of URLs or file paths
    default: [],    // Initialize it as an empty array

  },
  status: {
    type: String,
    enum: ['new', 'pending', 'delayed', 'closed', 'excluded', 're-opened'],
    default: 'new',
  },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } }); // Add these options to include virtuals in JSON and object responses

// Middleware to check and assign unique workOrderId before saving
WorkOrderSchema.pre('validate', async function (next) {
  const workOrder = this;

  // Only generate a new workOrderId for new work orders
  if (!workOrder.workOrderId) {
    let isUnique = false;

    // Try generating a new ID until it's unique
    while (!isUnique) {
      const newId = generateWorkOrderId();
      const existingWorkOrder = await mongoose.model('WorkOrder').findOne({ workOrderId: newId });

      if (!existingWorkOrder) {
        workOrder.workOrderId = newId; // Set the new unique work order ID
        isUnique = true;
      }
    }
  }

  next();
});

// Virtual field for computing the age of the work order
WorkOrderSchema.virtual('age').get(function () {
  const now = new Date();
  const diff = Math.floor((now - this.createdDate) / (1000 * 60 * 60 * 24)); // Difference in days
  return diff;
});

// Middleware to update the modified date on save
WorkOrderSchema.pre('save', function (next) {
  this.modifiedDate = new Date();
  next();
});

module.exports = mongoose.model('WorkOrder', WorkOrderSchema);
