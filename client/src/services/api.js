import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email, password) {
  const res = await api.post('/login', { email, password });
  return res.data;
}

export async function fetchDoctors() {
  const res = await api.get('/users/doctors');
  return res.data;
}

export async function fetchAppointments() {
  const res = await api.get('/appointments');
  return res.data;
}

export async function fetchReceptionistInsights(date) {
  const res = await api.get('/appointments/insights', { params: date ? { date } : {} });
  return res.data;
}

export async function fetchDoctorInsights(date) {
  const res = await api.get('/appointments/doctor/insights', { params: date ? { date } : {} });
  return res.data;
}

export async function createAppointment(payload) {
  const res = await api.post('/appointments', payload);
  return res.data;
}

export async function fetchAvailability(doctorId, date) {
  const res = await api.get('/appointments/availability', { params: { doctorId, date } });
  return res.data;
}

export async function cancelAppointment(id) {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
}

