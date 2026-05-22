import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiBook, FiTag, FiSend, FiTrash2, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import { deleteDocument, setDocument, addDocument } from '../firebase/firestore';
import toast from 'react-hot-toast';

const statCards = [
    { label: 'Total Students', icon: FiUsers, field: 'users', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
    { label: 'Total Events', icon: FiCalendar, field: 'events', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
    { label: 'Notes Shared', icon: FiBook, field: 'notes', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
    { label: 'Lost & Found Posts', icon: FiTag, field: 'lostfound', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
];

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const { docs: users } = useFirestore('users');
    const { docs: notes } = useFirestore('notes');
    const { docs: events } = useFirestore('events');
    const { docs: lostItems } = useFirestore('lostfound');

    const [announcement, setAnnouncement] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    const counts = { users: users.length, events: events.length, notes: notes.length, lostfound: lostItems.length };

    const handleDeleteNote = async (id) => {
        if (!confirm('Delete this note?')) return;
        try { await deleteDocument('notes', id); toast.success('Note deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Remove this user?')) return;
        try { await deleteDocument('users', id); toast.success('User removed'); }
        catch { toast.error('Failed to remove user'); }
    };

    const handleMakeAdmin = async (uid) => {
        try {
            await setDocument('users', uid, { role: 'admin' });
            toast.success('User promoted to admin!');
        } catch { toast.error('Failed to update role'); }
    };

    const handleAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcement.trim()) return toast.error('Enter an announcement');
        try {
            await addDocument('notifications', {
                message: announcement,
                type: 'announcement',
                userId: 'all',
                createdBy: currentUser.uid,
            });
            toast.success('Announcement sent to all users!');
            setAnnouncement('');
        } catch { toast.error('Failed to send announcement'); }
    };

    const tabs = ['users', 'notes', 'events'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                    <FiShield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Admin Panel</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Campus Connect NECN Management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{counts[s.field]}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Announcement */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <FiSend className="w-4 h-4 text-blue-500" /> Send Announcement
                </h2>
                <form onSubmit={handleAnnouncement} className="flex gap-3">
                    <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type an announcement for all students..."
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                    <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="px-5 py-3 gradient-brand text-white rounded-xl text-sm font-bold shadow-md">
                        Send
                    </motion.button>
                </form>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    {tabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${activeTab === t ? 'gradient-brand text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            {t} ({counts[t] ?? lostItems.length})
                        </button>
                    ))}
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {activeTab === 'users' && (
                        <div className="space-y-2">
                            {users.map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                        {u.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.email} • {u.department}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {u.role || 'student'}
                                    </span>
                                    <div className="flex gap-1">
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleMakeAdmin(u.uid || u.id)} className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all" title="Make Admin">
                                                <FiShield className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {users.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No users yet.</p>}
                        </div>
                    )}
                    {activeTab === 'notes' && (
                        <div className="space-y-2">
                            {notes.map(n => (
                                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                                        <p className="text-xs text-slate-500">{n.subject} • {n.department} • Sem {n.semester}</p>
                                    </div>
                                    <button onClick={() => handleDeleteNote(n.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {notes.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No notes yet.</p>}
                        </div>
                    )}
                    {activeTab === 'events' && (
                        <div className="space-y-2">
                            {events.map(ev => (
                                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{ev.title}</p>
                                        <p className="text-xs text-slate-500">{ev.venue} • {ev.category}</p>
                                    </div>
                                    <button onClick={() => deleteDocument('events', ev.id).then(() => toast.success('Event deleted'))} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            {events.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No events yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
