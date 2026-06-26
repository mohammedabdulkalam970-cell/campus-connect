import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBook, FiCalendar, FiSearch, FiMessageSquare, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import NoteCard from '../components/NoteCard';
import EventCard from '../components/EventCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AttendanceCard from '../components/AttendanceCard';

const stats = [
    { label: 'Notes Shared', icon: FiBook, value: '1,240', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Students', icon: FiUsers, value: '860', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Events This Month', icon: FiCalendar, value: '12', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Chat Messages', icon: FiMessageSquare, value: '5.2k', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
];

const quickLinks = [
    { to: '/notes', icon: FiBook, label: 'Notes', desc: 'Upload & download study materials', gradient: 'from-blue-500 to-blue-600' },
    { to: '/events', icon: FiCalendar, label: 'Events', desc: 'Upcoming college events', gradient: 'from-purple-500 to-purple-600' },
    { to: '/lost-found', icon: FiSearch, label: 'Lost & Found', desc: 'Report or find lost items', gradient: 'from-amber-500 to-amber-600' },
    { to: '/chat', icon: FiMessageSquare, label: 'Chat', desc: 'Connect with classmates', gradient: 'from-emerald-500 to-emerald-600' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
    const { userProfile, currentUser } = useAuth();
    const { docs: notes, loading: notesLoading } = useFirestore('notes', [], { field: 'createdAt', direction: 'desc' });
    const { docs: events, loading: eventsLoading } = useFirestore('events', [], { field: 'date', direction: 'asc' });

    const displayName = userProfile?.name || currentUser?.displayName || 'Student';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-6">
            {/* Welcome banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gradient-brand rounded-2xl p-6 lg:p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium">{greeting} 👋</p>
                    <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">{displayName}</h1>
                    <p className="text-blue-200/70 text-sm mt-1">
                        {userProfile?.department && `${userProfile.department} • `}
                        {userProfile?.year && `${userProfile.year} • `}
                        NECN
                    </p>
                    <div className="flex gap-3 mt-4">
                        <Link to="/notes" className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-sm font-semibold transition-all">
                            Browse Notes
                        </Link>
                        <Link to="/events" className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-all">
                            View Events
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <motion.div key={s.label} variants={item} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{s.value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Links */}
            <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-blue-500" /> Quick Access
                </h2>
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickLinks.map(l => (
                        <motion.div key={l.to} variants={item}>
                            <Link to={l.to} className="group block bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${l.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <l.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{l.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{l.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Main content grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left side: Notes & Events */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FiBook className="w-4 h-4 text-blue-500" /> Recent Notes
                            </h2>
                            <Link to="/notes" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {notesLoading ? (
                                <SkeletonLoader count={2} />
                            ) : notes.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">No notes yet. Be the first to share!</p>
                            ) : (
                                notes.slice(0, 2).map(n => <NoteCard key={n.id} note={n} />)
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <FiCalendar className="w-4 h-4 text-purple-500" /> Upcoming Events
                            </h2>
                            <Link to="/events" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {eventsLoading ? (
                                <SkeletonLoader count={2} />
                            ) : events.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">No events scheduled.</p>
                            ) : (
                                events.slice(0, 2).map(e => <EventCard key={e.id} event={e} />)
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Attendance Widget */}
                <div className="lg:col-span-1">
                    <AttendanceCard />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
