import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

// Import role-specific components (to be created later)
const StudentDashboard = React.lazy(() => import('../components/dashboard/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('../components/dashboard/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('../components/dashboard/AdminDashboard'));

// Import other dashboard pages (to be created later)
const Profile = React.lazy(() => import('../components/dashboard/Profile'));
const NotFound = React.lazy(() => import('./NotFound'));

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'STUDENT':
        return <StudentDashboard />;
      case 'TEACHER':
        return <TeacherDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Student Management System</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/dashboard"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/dashboard/profile"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {user.firstName} {user.lastName} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={renderDashboard()} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;