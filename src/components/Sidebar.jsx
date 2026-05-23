import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome,
    FiBook,
    FiCalendar,
    FiSearch,
    FiMessageSquare,
    FiUser,
    FiLogOut,
    FiShield,
    FiMenu,
    FiX,
    FiSun,
    FiMoon
} from 'react-icons/fi';

import { auth } from "../firebase";
import { signOut } from "firebase/auth";

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/notes', icon: FiBook, label: 'Notes' },
    { to: '/events', icon: FiCalendar, label: 'Events' },
    { to: '/lost-found', icon: FiSearch, label: 'Lost & Found' },
    { to: '/chat', icon: FiMessageSquare, label: 'Chat' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { userProfile } = useAuth();
    const { isDark, toggle } = useTheme();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);

            toast.success('Logged out successfully');

            navigate('/login');
        } catch (error) {
            console.error(error);

            toast.error('Failed to logout');
        }
    };

    const renderSidebarContent = (isMobile = false) => (
        <div className="flex flex-col h-full">

            <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">CC</span>
                </div>

                {(!collapsed || isMobile) && (
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">
                            Campus Connect
                        </p>

                        <p className="text-blue-300 text-xs">
                            NECN
                        </p>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

                {navItems.map(({ to, icon: Icon, label }) => (

                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-white/20 text-white font-semibold shadow-lg'
                                : 'text-blue-200 hover:bg-white/10 hover:text-white'}
                            ${collapsed && !isMobile ? 'justify-center' : ''}`
                        }
                    >

                        <Icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />

                        {(!collapsed || isMobile) && (
                            <span className="text-sm">
                                {label}
                            </span>
                        )}

                    </NavLink>

                ))}

                {userProfile?.role === 'admin' && (

                    <NavLink
                        to="/admin"
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-amber-500/30 text-amber-300 font-semibold'
                                : 'text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-300'}
                            ${collapsed && !isMobile ? 'justify-center' : ''}`
                        }
                    >

                        <FiShield className="w-4 h-4 flex-shrink-0" />

                        {(!collapsed || isMobile) && (
                            <span className="text-sm">
                                Admin Panel
                            </span>
                        )}

                    </NavLink>

                )}

            </nav>

            <div className="p-3 border-t border-white/10 space-y-1">

                <button
                    onClick={toggle}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
                >

                    {isDark
                        ? <FiSun className="w-4 h-4" />
                        : <FiMoon className="w-4 h-4" />
                    }

                    {(!collapsed || isMobile) && (
                        <span className="text-sm">
                            {isDark ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    )}

                </button>

                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
                >

                    <FiLogOut className="w-4 h-4" />

                    {(!collapsed || isMobile) && (
                        <span className="text-sm">
                            Logout
                        </span>
                    )}

                </button>

            </div>

        </div>
    );

    return (
        <>
            <motion.aside
                animate={{ width: collapsed ? 64 : 220 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col h-screen gradient-brand sticky top-0 flex-shrink-0 overflow-hidden shadow-2xl"
            >

                <button
                    onClick={() => setCollapsed(p => !p)}
                    className="absolute top-4 right-3 z-10 text-white/60 hover:text-white transition-colors"
                >
                    <FiMenu className="w-4 h-4" />
                </button>

                {renderSidebarContent()}

            </motion.aside>

            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl gradient-brand text-white shadow-lg"
            >
                <FiMenu className="w-5 h-5" />
            </button>

            <AnimatePresence>

                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        />

                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="lg:hidden fixed left-0 top-0 h-full w-64 gradient-brand z-50 shadow-2xl"
                        >

                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white"
                            >
                                <FiX className="w-5 h-5" />
                            </button>

                            {renderSidebarContent(true)}

                        </motion.aside>
                    </>
                )}

            </AnimatePresence>
        </>
    );
};

export default Sidebar;