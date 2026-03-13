const express = require('express');
const {
  createAppointment,
  getAppointments,
  cancelAppointment,
  getAvailability,
  getReceptionistInsights,
  getDoctorInsights,
} = require('../controllers/appointmentController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All appointment routes require a valid JWT
router.use(authMiddleware);

// Availability for a doctor on a date (receptionist only)
router.get('/availability', requireRole(['receptionist']), getAvailability);

// Receptionist analytics cards
router.get('/insights', requireRole(['receptionist']), getReceptionistInsights);

// Doctor productivity insights (uses doctor JWT)
router.get('/doctor/insights', requireRole(['doctor']), getDoctorInsights);

router.get('/', getAppointments);

router.post('/', requireRole(['receptionist']), createAppointment);

router.delete('/:id', requireRole(['receptionist']), cancelAppointment);

module.exports = router;

