import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import CarListing from './pages/CarListing';
import CarDetail from './pages/CarDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import CmsPage from './pages/CmsPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminBrands from './pages/admin/AdminBrands';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminQueries from './pages/admin/AdminQueries';
import AdminSubscribers from './pages/admin/AdminSubscribers';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/cars" element={<PublicLayout><CarListing /></PublicLayout>} />
          <Route path="/cars/:id" element={<PublicLayout><CarDetail /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/page/:type" element={<PublicLayout><CmsPage /></PublicLayout>} />

          {/* Protected user routes */}
          <Route path="/my-bookings" element={
            <ProtectedRoute><PublicLayout><MyBookings /></PublicLayout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><PublicLayout><Profile /></PublicLayout></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="queries" element={<AdminQueries />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
