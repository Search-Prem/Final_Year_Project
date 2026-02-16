import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
