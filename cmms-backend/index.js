const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const path = require('path');


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN, // Replace with your frontend's URL if different
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // This enables sending cookies cross-origin
}));

// Use cookie-parser to parse cookies
app.use(cookieParser()); // Add cookie-parser middleware

// Parse incoming JSON requests
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workOrderRoutes = require('./routes/workOrders'); // Ensure this path is correct

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/work-orders', workOrderRoutes); // Work Orders route is correctly used here

// Serve Static Files in Express: This will allow the files in the uploads folder to be publicly accessible via the browser.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 5151;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
