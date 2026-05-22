import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFilter, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import useStorage from '../hooks/useStorage';
import { addDocument } from '../firebase/firestore';
import { getFilePath } from '../firebase/storage';
import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';

const departments = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const Notes = () => {
    const { currentUser, userProfile } = useAuth();
    const { docs: notes, loading } = useFirestore('notes', [], { field: 'createdAt', direction: 'desc' });
    const { upload, progress, uploading } = useStorage();

    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('All');
    const [sem, setSem] = useState('All');
    const [showUpload, setShowUpload] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadForm, setUploadForm] = useState({ title: '', subject: '', semester: '', department: '' });
    const [file, setFile] = useState(null);
    const [liked, setLiked] = useState({});
    const [saved, setSaved] = useState({});

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'], 'application/msword': ['.doc', '.docx'] },
        maxFiles: 1,
        onDrop: accepted => setFile(accepted[0]),
    });

    const filtered = notes.filter(n => {
        const matchSearch = n.title?.toLowerCase().includes(search.toLowerCase()) ||
            n.subject?.toLowerCase().includes(search.toLowerCase());
        const matchDept = dept === 'All' || n.department === dept;
        const matchSem = sem === 'All' || n.semester === sem;
        return matchSearch && matchDept && matchSem;
    });

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Select a file first');
        if (!uploadForm.title || !uploadForm.subject || !uploadForm.semester || !uploadForm.department)
            return toast.error('Fill all fields');
        try {
            const ext = file.name.split('.').pop().toLowerCase();
            const fileType = ext === 'pdf' ? 'pdf' : ['jpg', 'jpeg', 'png'].includes(ext) ? 'image' : 'doc';
            const path = getFilePath('notes', uploadForm.department.toLowerCase(), uploadForm.semester, file.name);
            const fileURL = await upload(file, path);
            await addDocument('notes', {
                ...uploadForm,
                fileURL,
                fileType,
                uploadedBy: currentUser.uid,
                uploaderName: userProfile?.name || 'Student',
                likes: [],
                saves: [],
            });
            toast.success('Notes uploaded successfully! 🎉');
            setShowUpload(false);
            setFile(null);
            setUploadForm({ title: '', subject: '', semester: '', department: '' });
        } catch (err) {
            toast.error('Upload failed: ' + err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Study Notes</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Share and discover study materials</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                >
                    <FiUpload className="w-4 h-4" /> Upload Notes
                </motion.button>
            </div>

            {/* Search + filters */}
            <div className="space-y-3">
                <SearchBar value={search} onChange={setSearch} placeholder="Search by title or subject..." />
                <div className="flex gap-3 overflow-x-auto pb-1">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <FiFilter className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Dept:</span>
                        <div className="flex gap-1.5">
                            {departments.map(d => (
                                <button key={d} onClick={() => setDept(d)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${dept === d ? 'gradient-brand text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">Sem:</span>
                    {semesters.map(s => (
                        <button key={s} onClick={() => setSem(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${sem === s ? 'gradient-brand text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            {s === 'All' ? 'All' : `Sem ${s}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div>
                <p className="text-xs text-slate-400 mb-3">{filtered.length} notes found</p>
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SkeletonLoader count={6} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <FiUpload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No notes found</p>
                        <p className="text-sm mt-1">Be the first to upload!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filtered.map(n => (
                                <NoteCard key={n.id} note={n} onPreview={setPreview}
                                    liked={liked[n.id]} saved={saved[n.id]}
                                    onLike={id => setLiked(p => ({ ...p, [id]: !p[id] }))}
                                    onSave={id => setSaved(p => ({ ...p, [id]: !p[id] }))}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Upload modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setShowUpload(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Upload Notes</h2>
                                <button onClick={() => setShowUpload(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleUpload} className="space-y-3">
                                <input placeholder="Note Title *" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                <input placeholder="Subject *" value={uploadForm.subject} onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                                <div className="grid grid-cols-2 gap-3">
                                    <select value={uploadForm.department} onChange={e => setUploadForm(p => ({ ...p, department: e.target.value }))}
                                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                        <option value="">Department</option>
                                        {departments.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                                    </select>
                                    <select value={uploadForm.semester} onChange={e => setUploadForm(p => ({ ...p, semester: e.target.value }))}
                                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                        <option value="">Semester</option>
                                        {semesters.filter(s => s !== 'All').map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                                {/* Dropzone */}
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                                    <input {...getInputProps()} />
                                    {file ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{file.name}</p>
                                    ) : (
                                        <>
                                            <FiUpload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                            <p className="text-sm text-slate-500">Drop PDF, image, or DOC file</p>
                                        </>
                                    )}
                                </div>
                                {uploading && (
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="h-2 gradient-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                                <button type="submit" disabled={uploading}
                                    className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-bold disabled:opacity-60 hover:opacity-90 transition-all">
                                    {uploading ? `Uploading ${progress}%...` : 'Upload Notes'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PDF Preview modal */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={e => e.target === e.currentTarget && setPreview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden w-full max-w-3xl h-[80vh] shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{preview.title}</h3>
                                <button onClick={() => setPreview(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><FiX /></button>
                            </div>
                            {preview.fileType === 'image' ? (
                                <img src={preview.fileURL} alt={preview.title} className="flex-1 object-contain p-4" />
                            ) : (
                                <iframe src={preview.fileURL} className="flex-1 w-full" title={preview.title} />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Notes;
