const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  gender: { type: String },
  dateOfBirth: { type: String },
  department: { type: String },
  position: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  hireDate: { type: String },
  status: { type: String, default: 'Dang lam viec' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema, 'employees');