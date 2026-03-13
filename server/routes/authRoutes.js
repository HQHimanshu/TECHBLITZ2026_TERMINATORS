const express = require('express');
const { register, login, listDoctors } = require('../controllers/authController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper for seeding demo users in hackathon
router.post('/register', register);

// Login returns JWT
router.post('/login', login);

// List doctors for receptionist when booking
router.get('/users/doctors', authMiddleware, requireRole(['receptionist']), listDoctors);

module.exports = router;

