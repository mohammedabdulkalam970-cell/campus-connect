import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { subscribeToCollection } from '../firebase/firestore';

const Navbar = () => {
    const { currentUser, userProfile } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [search, setSearch] = useState('');
    const notifRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Placeholder notification subscription
    useEffect(() => {
        if (!currentUser) return;
        const unsub = subscribeToCollection(
            'notifications',
            (docs) => setNotifications(docs.slice(0, 5)),
            [{ field: 'userId', operator: '==', value: currentUser.uid }],
            { field: 'createdAt', direction: 'desc' }
        );
        return unsub;
    }, [currentUser]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const displayName = userProfile?.name || currentUser?.displayName || 'Student';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-xs lg:max-w-md ml-12 lg:ml-0">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search notes, events..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:text-slate-200 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <FiX className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* Notification bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifs(p => !p)}
                            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            <FiBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifs && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-slate-400 text-sm py-6">No notifications</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                    <p className="text-xs text-slate-700 dark:text-slate-300">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Avatar */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 rounded-xl gradient-brand text-white font-bold text-sm flex items-center justify-center shadow-md hover:shadow-blue-500/30 transition-all hover:scale-105"
                    >
                        {userProfile?.profileImage ? (
                            <img src={userProfile.profileImage} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            initials
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
