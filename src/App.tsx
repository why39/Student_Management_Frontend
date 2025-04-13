import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { client } from './apollo/client';
import './App.css';

// Import pages (to be created later)
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Auth context provider (to be created later)
const AuthProvider = React.lazy(() => 
  import('./context/AuthProvider').then(module => ({
    default: module.AuthProvider
  }))
);

// Import the status checker
const BackendStatusCheck = React.lazy(() => import('./components/common/BackendStatusCheck'));

function App() {
  return (
    <ApolloProvider client={client}>
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <AuthProvider>
          <BrowserRouter>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BackendStatusCheck />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </React.Suspense>
    </ApolloProvider>
  );
}

export default App;
