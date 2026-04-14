import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import EventTypes from './pages/EventTypes';
import Availability from './pages/Availability';
import Bookings from './pages/Bookings';
import PublicProfile from './pages/Public/PublicProfile';
import BookingPage from './pages/Public/BookingPage';
import Login from './pages/Login';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!token && !user) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard/event-types" replace />} />
            <Route path="event-types" element={<EventTypes />} />
            <Route path="availability" element={<Availability />} />
            <Route path="bookings" element={<Bookings />} />
          </Route>

          {/* Public Profile & Booking (we don't protect these) */}
          <Route path="/:username" element={<PublicProfile />} />
          <Route path="/:username/:slug" element={<BookingPage />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard/event-types" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
