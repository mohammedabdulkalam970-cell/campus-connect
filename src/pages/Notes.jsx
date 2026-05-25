import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFilter, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

import {
    addDoc,
    collection,
    serverTimestamp
} from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';

import { db } from '../firebase';

import NoteCard from '../components/NoteCard';
import SearchBar from '../components/SearchBar';
import SkeletonLoader from '../components/SkeletonLoader';

import toast from 'react-hot-toast';

const departments = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];

const Notes = () => {

    const { currentUser, userProfile } = useAuth();

    const {
        docs: notes,
        loading
    } = useFirestore(
        'notes',
        [],
        {
            field: 'createdAt',
            direction: 'desc'
        }
    );

    const [search, setSearch] = useState('');

    const [dept, setDept] = useState('All');

    const [sem, setSem] = useState('All');

    const [showUpload, setShowUpload] = useState(false);

    const [preview, setPreview] = useState(null);

    const [uploading, setUploading] = useState(false);

    const [uploadForm, setUploadForm] = useState({
        title: '',
        subject: '',
        semester: '',
        department: ''
    });

    const [file, setFile] = useState(null);

    const [liked, setLiked] = useState({});

    const [saved, setSaved] = useState({});

    const { getRootProps, getInputProps, isDragActive } =
        useDropzone({

            accept: {
                'application/pdf': ['.pdf'],
                'image/*': ['.jpg', '.jpeg', '.png'],
                'application/msword': ['.doc', '.docx']
            },

            maxFiles: 1,

            onDrop: accepted =>
                setFile(accepted[0]),

        });

    const filtered = notes.filter(n => {

        const matchSearch =
            n.title?.toLowerCase().includes(search.toLowerCase()) ||
            n.subject?.toLowerCase().includes(search.toLowerCase());

        const matchDept =
            dept === 'All' || n.department === dept;

        const matchSem =
            sem === 'All' || n.semester === sem;

        return matchSearch && matchDept && matchSem;

    });

    // CLOUDINARY UPLOAD
    const uploadToCloudinary = async (file) => {

        const data = new FormData();

        data.append("file", file);

        data.append(
            "upload_preset",
            "campus_notes"
        );

        data.append(
            "cloud_name",
            "dpredkdvg"
        );

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dpredkdvg/auto/upload",
            {
                method: "POST",
                body: data
            }
        );

        const uploaded = await res.json();

        return uploaded.secure_url;

    };

    const handleUpload = async (e) => {

        e.preventDefault();

        if (!file)
            return toast.error('Select a file first');

        if (
            !uploadForm.title ||
            !uploadForm.subject ||
            !uploadForm.semester ||
            !uploadForm.department
        ) {
            return toast.error('Fill all fields');
        }

        try {

            setUploading(true);

            const ext =
                file.name
                    .split('.')
                    .pop()
                    .toLowerCase();

            const fileType =
                ext === 'pdf'
                    ? 'pdf'
                    : ['jpg', 'jpeg', 'png'].includes(ext)
                        ? 'image'
                        : 'doc';

            // UPLOAD TO CLOUDINARY
            const fileURL =
                await uploadToCloudinary(file);

            // SAVE TO FIRESTORE
            await addDoc(
                collection(db, 'notes'),
                {

                    ...uploadForm,

                    fileURL,

                    fileType,

                    uploadedBy: currentUser.uid,

                    uploaderName:
                        userProfile?.name || 'Student',

                    likes: [],

                    saves: [],

                    createdAt: serverTimestamp(),

                }
            );

            toast.success(
                'Notes uploaded successfully 🎉'
            );

            setShowUpload(false);

            setFile(null);

            setUploadForm({
                title: '',
                subject: '',
                semester: '',
                department: ''
            });

        } catch (err) {

            console.error(err);

            toast.error(
                'Upload failed: ' + err.message
            );

        } finally {

            setUploading(false);

        }

    };

    return (

        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        Study Notes
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Share and discover study materials
                    </p>

                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-semibold shadow-lg"
                >

                    <FiUpload className="w-4 h-4" />

                    Upload Notes

                </motion.button>

            </div>

            {/* SEARCH */}
            <div className="space-y-3">

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by title or subject..."
                />

            </div>

            {/* NOTES */}
            <div>

                <p className="text-xs text-slate-400 mb-3">
                    {filtered.length} notes found
                </p>

                {loading ? (

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <SkeletonLoader count={6} />

                    </div>

                ) : filtered.length === 0 ? (

                    <div className="text-center py-16 text-slate-400">

                        <FiUpload className="w-12 h-12 mx-auto mb-3 opacity-30" />

                        <p className="font-medium">
                            No notes found
                        </p>

                    </div>

                ) : (

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <AnimatePresence>

                            {filtered.map(n => (

                                <NoteCard
                                    key={n.id}
                                    note={n}
                                    onPreview={setPreview}
                                    liked={liked[n.id]}
                                    saved={saved[n.id]}
                                    onLike={id =>
                                        setLiked(p => ({
                                            ...p,
                                            [id]: !p[id]
                                        }))
                                    }
                                    onSave={id =>
                                        setSaved(p => ({
                                            ...p,
                                            [id]: !p[id]
                                        }))
                                    }
                                />

                            ))}

                        </AnimatePresence>

                    </div>

                )}

            </div>

            {/* UPLOAD MODAL */}
            <AnimatePresence>

                {showUpload && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >

                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg"
                        >

                            <div className="flex items-center justify-between mb-5">

                                <h2 className="text-lg font-bold">
                                    Upload Notes
                                </h2>

                                <button
                                    onClick={() => setShowUpload(false)}
                                >

                                    <FiX />

                                </button>

                            </div>

                            <form
                                onSubmit={handleUpload}
                                className="space-y-3"
                            >

                                <input
                                    placeholder="Note Title *"
                                    value={uploadForm.title}
                                    onChange={e =>
                                        setUploadForm(p => ({
                                            ...p,
                                            title: e.target.value
                                        }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border"
                                />

                                <input
                                    placeholder="Subject *"
                                    value={uploadForm.subject}
                                    onChange={e =>
                                        setUploadForm(p => ({
                                            ...p,
                                            subject: e.target.value
                                        }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border"
                                />

                                <div className="grid grid-cols-2 gap-3">

                                    <select
                                        value={uploadForm.department}
                                        onChange={e =>
                                            setUploadForm(p => ({
                                                ...p,
                                                department: e.target.value
                                            }))
                                        }
                                        className="px-4 py-3 rounded-xl border"
                                    >

                                        <option value="">
                                            Department
                                        </option>

                                        {departments
                                            .filter(d => d !== 'All')
                                            .map(d => (
                                                <option key={d}>
                                                    {d}
                                                </option>
                                            ))}

                                    </select>

                                    <select
                                        value={uploadForm.semester}
                                        onChange={e =>
                                            setUploadForm(p => ({
                                                ...p,
                                                semester: e.target.value
                                            }))
                                        }
                                        className="px-4 py-3 rounded-xl border"
                                    >

                                        <option value="">
                                            Semester
                                        </option>

                                        {semesters
                                            .filter(s => s !== 'All')
                                            .map(s => (
                                                <option
                                                    key={s}
                                                    value={s}
                                                >
                                                    Sem {s}
                                                </option>
                                            ))}

                                    </select>

                                </div>

                                {/* DROPZONE */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                        isDragActive
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-slate-200'
                                    }`}
                                >

                                    <input {...getInputProps()} />

                                    {file ? (

                                        <p className="text-sm font-medium">
                                            {file.name}
                                        </p>

                                    ) : (

                                        <>
                                            <FiUpload className="w-8 h-8 mx-auto mb-2 text-slate-300" />

                                            <p className="text-sm text-slate-500">
                                                Drop PDF, image, or DOC file
                                            </p>
                                        </>

                                    )}

                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-bold"
                                >

                                    {uploading
                                        ? 'Uploading...'
                                        : 'Upload Notes'}

                                </button>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>

        </div>

    );

};

export default Notes;