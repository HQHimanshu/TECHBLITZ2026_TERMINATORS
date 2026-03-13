const Appointment = require('../models/Appointment');

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

async function createAppointment(req, res) {
  try {
    const { patientName, phone, doctorId, date, timeSlot } = req.body;

    if (!patientName || !phone || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const conflict = await Appointment.findOne({
      doctorId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (conflict) {
      return res.status(400).json({ message: 'Slot already booked for this doctor' });
    }

    const appointment = await Appointment.create({
      patientName,
      phone,
      doctorId,
      date,
      timeSlot,
    });

    return res.status(201).json(appointment);
  } catch (err) {
    console.error('Create appointment error', err);
    return res.status(500).json({ message: 'Failed to create appointment' });
  }
}

async function getAppointments(req, res) {
  try {
    const filter = {};
    if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name email role')
      .sort({ date: 1, timeSlot: 1 });

    return res.json(appointments);
  } catch (err) {
    console.error('Get appointments error', err);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
}

async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    console.error('Cancel appointment error', err);
    return res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}

async function getAvailability(req, res) {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: 'doctorId and date are required' });
    }

    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot -_id');

    return res.json({
      doctorId,
      date,
      bookedSlots: booked.map((b) => b.timeSlot),
    });
  } catch (err) {
    console.error('Get availability error', err);
    return res.status(500).json({ message: 'Failed to fetch availability' });
  }
}

function startOfWeekIso(dateIso) {
  const d = new Date(`${dateIso}T00:00:00.000Z`);
  const day = d.getUTCDay(); // 0(Sun)-6
  const diff = (day + 6) % 7; // Monday as start
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(dateIso, days) {
  const d = new Date(`${dateIso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getReceptionistInsights(req, res) {
  try {
    const date = (req.query.date || new Date().toISOString().slice(0, 10)).toString();
    const weekStart = startOfWeekIso(date);
    const weekEnd = addDaysIso(weekStart, 7); // exclusive

    const [todayTotal, todayCancelled, weekTotal, weekCancelled, busiest] = await Promise.all([
      Appointment.countDocuments({ date }),
      Appointment.countDocuments({ date, status: 'cancelled' }),
      Appointment.countDocuments({ date: { $gte: weekStart, $lt: weekEnd } }),
      Appointment.countDocuments({ date: { $gte: weekStart, $lt: weekEnd }, status: 'cancelled' }),
      Appointment.aggregate([
        { $match: { date, status: { $ne: 'cancelled' } } },
        { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const busiestSlot = busiest?.[0]?._id || null;
    const busiestCount = busiest?.[0]?.count || 0;

    return res.json({
      date,
      today: { total: todayTotal, cancelled: todayCancelled },
      week: { start: weekStart, total: weekTotal, cancelled: weekCancelled },
      busiest: { timeSlot: busiestSlot, count: busiestCount },
      cancellationRateWeek: weekTotal ? Math.round((weekCancelled / weekTotal) * 100) : 0,
    });
  } catch (err) {
    console.error('Get receptionist insights error', err);
    return res.status(500).json({ message: 'Failed to fetch insights' });
  }
}

async function getDoctorInsights(req, res) {
  try {
    const date = (req.query.date || new Date().toISOString().slice(0, 10)).toString();
    const doctorId = req.user.id;

    const appts = await Appointment.find({
      doctorId,
      date,
      status: { $ne: 'cancelled' },
    })
      .select('timeSlot patientName phone')
      .sort({ timeSlot: 1 });

    const booked = new Set(appts.map((a) => a.timeSlot));
    const remaining = TIME_SLOTS.filter((t) => !booked.has(t));

    return res.json({
      date,
      patientsToday: appts.length,
      nextAppointment: appts[0]
        ? { timeSlot: appts[0].timeSlot, patientName: appts[0].patientName, phone: appts[0].phone }
        : null,
      freeSlotsRemaining: remaining.length,
      nextAvailableSlot: remaining[0] || null,
    });
  } catch (err) {
    console.error('Get doctor insights error', err);
    return res.status(500).json({ message: 'Failed to fetch doctor insights' });
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  cancelAppointment,
  getAvailability,
  getReceptionistInsights,
  getDoctorInsights,
};

