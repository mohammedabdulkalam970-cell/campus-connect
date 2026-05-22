import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

import SplashScreen from '../pages/SplashScreen';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Notes from '../pages/Notes';
import Events from '../pages/Events';
import LostFound from '../pages/LostFound';
import Chat from '../pages/Chat';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" replace />;
};

// Admin route wrapper
const AdminRoute = ({ children }) => {
    const { userProfile } = useAuth();
    if (!userProfile) return <Navigate to="/dashboard" replace />;
    return userProfile.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

// Public-only route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Splash */}
            <Route path="/" element={<SplashScreen />} />

            {/* Auth */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/events" element={<Events />} />
                <Route path="/lost-found" element={<LostFound />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    </ProtectedRoute>
                }
            />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
