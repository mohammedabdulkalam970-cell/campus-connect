import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import { addDocument, deleteDocument } from '../firebase/firestore';
import EventCard from '../components/EventCard';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

const Events = () => {
    const { userProfile } = useAuth();
    const { docs: events, loading } = useFirestore('events', [], { field: 'date', direction: 'asc' });

    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const [showAdd, setShowAdd] = useState(false);
    const [bookmarked, setBookmarked] = useState({});
    const [form, setForm] = useState({ title: '', description: '', venue: '', date: '', category: 'Technical', registrationLink: '', posterURL: '' });

    const filtered = events.filter(e => {
        const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
        const matchCat = cat === 'All' || e.category === cat;
        return matchSearch && matchCat;
    });

    const handleAdd = async (ev) => {
        ev.preventDefault();
        if (!form.title || !form.date || !form.venue) return toast.error('Fill required fields');
        try {
            await addDocument('events', form);
            toast.success('Event created!');
            setShowAdd(false);
            setForm({ title: '', description: '', venue: '', date: '', category: 'Technical', registrationLink: '', posterURL: '' });
        } catch { toast.error('Failed to create event'); }
    };

    const isAdmin = userProfile?.role === 'admin';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Events</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">College events & activities</p>
                </div>
                {isAdmin && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold shadow-lg">
                        <FiPlus className="w-4 h-4" /> Add Event
                    </motion.button>
                )}
            </div>

            <SearchBar value={search} onChange={setSearch} placeholder="Search events..." />

            <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(c => (
                    <button key={c} onClick={() => setCat(c)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${cat === c ? 'gradient-brand text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"><SkeletonLoader count={6} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No events found</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filtered.map(e => (
                            <EventCard key={e.id} event={e} bookmarked={bookmarked[e.id]}
                                onBookmark={id => setBookmarked(p => ({ ...p, [id]: !p[id] }))} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add event modal (admin) */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Event</h2>
                                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><FiX /></button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-3">
                                {[
                                    { key: 'title', placeholder: 'Event Title *', type: 'text' },
                                    { key: 'venue', placeholder: 'Venue *', type: 'text' },
                                    { key: 'registrationLink', placeholder: 'Registration Link', type: 'url' },
                                    { key: 'posterURL', placeholder: 'Poster Image URL', type: 'url' },
                                ].map(f => (
                                    <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                ))}
                                <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm resize-none" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                        {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">Create Event</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Events;
