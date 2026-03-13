import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';

function getAuth() {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { token, user };
}

function ProtectedRoute({ allowRoles, children }) {
  const { token, user } = getAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowRoles?.length && !allowRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { token, user } = getAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'receptionist') return <Navigate to="/receptionist" replace />;
  return <Navigate to="/doctor" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowRoles={['receptionist']}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
