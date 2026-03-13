const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // ISO date string (YYYY-MM-DD)
    timeSlot: { type: String, required: true }, // e.g. '09:30'
    status: {
      type: String,
      enum: ['scheduled', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

