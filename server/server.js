const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Clinic API running' });
});

app.use('/api', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      // Keep alive - ping every 10 minutes to prevent Render sleeping
      setInterval(() => {
        https.get('https://clinic-backend-uyk1.onrender.com/');
      }, 10 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });