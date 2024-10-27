const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Technician', 'Tenant'], required: true },
  firstName: { type: String, required: false }, // First name field
  lastName: { type: String, required: false }   // Last name field
});

module.exports = mongoose.model('User', UserSchema);
