import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

import {
    FiEdit2,
    FiSave,
    FiCamera,
    FiBook,
    FiMail,
    FiPhone,
    FiHash,
    FiShield
} from 'react-icons/fi';

import { updateProfile } from 'firebase/auth';

import { setDoc, doc } from 'firebase/firestore';

import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from 'firebase/storage';

import {
    auth,
    db,
    storage
} from '../firebase';

import { useAuth } from '../context/AuthContext';

import useFirestore from '../hooks/useFirestore';

import NoteCard from '../components/NoteCard';

import toast from 'react-hot-toast';

const departments = [
    'CSE',
    'ECE',
    'EEE',
    'MECH',
    'CIVIL',
    'IT',
    'MBA',
    'MCA'
];

const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
];

const Profile = () => {

    const {
        currentUser,
        userProfile,
        setUserProfile
    } = useAuth();

    const {
        docs: myNotes
    } = useFirestore(
        'notes',
        [
            {
                field: 'uploadedBy',
                operator: '==',
                value: currentUser?.uid
            }
        ]
    );

    const [editing, setEditing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [form, setForm] = useState({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        department: userProfile?.department || '',
        year: userProfile?.year || ''
    });

    const fileRef = useRef();

    const displayName =
        userProfile?.name ||
        currentUser?.displayName ||
        'Student';

    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const isAdmin =
        userProfile?.role === 'admin';

    // SAVE PROFILE
    const handleSave = async () => {

        if (!form.name) {

            return toast.error(
                'Name is required'
            );

        }

        setSaving(true);

        try {

            await setDoc(
                doc(
                    db,
                    'users',
                    currentUser.uid
                ),
                form,
                { merge: true }
            );

            await updateProfile(
                auth.currentUser,
                {
                    displayName: form.name
                }
            );

            setUserProfile(p => ({
                ...p,
                ...form
            }));

            setEditing(false);

            toast.success(
                'Profile updated!'
            );

        } catch {

            toast.error(
                'Failed to save changes'
            );

        } finally {

            setSaving(false);

        }

    };

    // AVATAR UPLOAD
    const handleAvatarChange = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setUploadingAvatar(true);

        try {

            const path =
                `profiles/${currentUser.uid}/${Date.now()}_${file.name}`;

            const storageRef =
                ref(storage, path);

            const uploadTask =
                uploadBytesResumable(
                    storageRef,
                    file
                );

            const url =
                await new Promise(
                    (resolve, reject) => {

                        uploadTask.on(
                            'state_changed',

                            () => {},

                            (err) => reject(err),

                            async () => {

                                try {

                                    resolve(
                                        await getDownloadURL(
                                            storageRef
                                        )
                                    );

                                } catch (err) {

                                    reject(err);

                                }

                            }
                        );

                    }
                );

            await setDoc(
                doc(
                    db,
                    'users',
                    currentUser.uid
                ),
                {
                    profileImage: url
                },
                {
                    merge: true
                }
            );

            await updateProfile(
                auth.currentUser,
                {
                    photoURL: url
                }
            );

            setUserProfile(p => ({
                ...p,
                profileImage: url
            }));

            toast.success(
                'Profile picture updated!'
            );

        } catch {

            toast.error(
                'Upload failed'
            );

        } finally {

            setUploadingAvatar(false);

        }

    };

    return (

        <div className="space-y-6 max-w-5xl mx-auto">

            {/* PROFILE CARD */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: -20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl"
            >

                {/* BANNER */}
                <div className="h-36 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-400 relative">

                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }}
                    />

                </div>

                <div className="px-8 pb-8">

                    {/* AVATAR */}
                    <div className="flex items-end justify-between -mt-16 mb-6">

                        <div className="relative">

                            <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">

                                {userProfile?.profileImage ? (

                                    <img
                                        src={userProfile.profileImage}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <span className="text-white font-black text-4xl">
                                        {initials}
                                    </span>

                                )}

                            </div>

                            <button
                                onClick={() =>
                                    fileRef.current?.click()
                                }
                                disabled={uploadingAvatar}
                                className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition"
                            >

                                <FiCamera className="w-4 h-4" />

                            </button>

                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />

                        </div>

                        {/* EDIT BUTTON */}
                        <div className="flex gap-3">

                            {editing ? (

                                <>
                                    <button
                                        onClick={() =>
                                            setEditing(false)
                                        }
                                        className="px-5 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>

                                    <motion.button
                                        onClick={handleSave}
                                        disabled={saving}
                                        whileHover={{
                                            scale: 1.05
                                        }}
                                        whileTap={{
                                            scale: 0.95
                                        }}
                                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg"
                                    >

                                        <FiSave />

                                        {saving
                                            ? 'Saving...'
                                            : 'Save'}

                                    </motion.button>
                                </>

                            ) : (

                                <motion.button
                                    onClick={() =>
                                        setEditing(true)
                                    }
                                    whileHover={{
                                        scale: 1.05
                                    }}
                                    whileTap={{
                                        scale: 0.95
                                    }}
                                    className="flex items-center gap-2 px-5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold"
                                >

                                    <FiEdit2 />

                                    Edit Profile

                                </motion.button>

                            )}

                        </div>

                    </div>

                    {/* INFO */}
                    {editing ? (

                        <div className="space-y-4 max-w-md">

                            <input
                                placeholder="Full Name"
                                value={form.name}
                                onChange={e =>
                                    setForm(p => ({
                                        ...p,
                                        name: e.target.value
                                    }))
                                }
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
                            />

                            <input
                                placeholder="Phone"
                                value={form.phone}
                                onChange={e =>
                                    setForm(p => ({
                                        ...p,
                                        phone: e.target.value
                                    }))
                                }
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
                            />

                            <select
                                value={form.department}
                                onChange={e =>
                                    setForm(p => ({
                                        ...p,
                                        department: e.target.value
                                    }))
                                }
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
                            >
                                {departments.map(d => (
                                    <option key={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={form.year}
                                onChange={e =>
                                    setForm(p => ({
                                        ...p,
                                        year: e.target.value
                                    }))
                                }
                                className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
                            >
                                {years.map(y => (
                                    <option key={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>

                        </div>

                    ) : (

                        <>

                            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                {displayName}
                            </h2>

                            <p className="text-blue-600 dark:text-blue-400 text-lg font-semibold capitalize mt-1">
                                {userProfile?.role || 'student'} • {userProfile?.department || 'NECN'} — {userProfile?.year || 'Student'}
                            </p>

                            {/* ADMIN BADGE */}
                            {isAdmin && (

                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">

                                    <FiShield className="text-red-500" />

                                    <span className="text-sm font-bold text-red-500 uppercase tracking-wider">
                                        Administrator Access
                                    </span>

                                </div>

                            )}

                            {/* STATS */}
                            <div className="grid sm:grid-cols-2 gap-4 mt-6">

                                {[
                                    {
                                        icon: FiMail,
                                        label: 'Email',
                                        val: currentUser?.email
                                    },
                                    {
                                        icon: FiPhone,
                                        label: 'Phone',
                                        val: userProfile?.phone || 'Not set'
                                    },
                                    {
                                        icon: FiHash,
                                        label: 'College ID',
                                        val: userProfile?.collegeId || 'Not set'
                                    },
                                    {
                                        icon: FiBook,
                                        label: 'Notes Uploaded',
                                        val: `${myNotes.length} notes`
                                    }
                                ].map(({ icon: Icon, label, val }) => (

                                    <div
                                        key={label}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800"
                                    >

                                        <Icon className="w-5 h-5 text-blue-500" />

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                {label}
                                            </p>

                                            <p className="text-sm font-bold">
                                                {val}
                                            </p>
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </>

                    )}

                </div>

            </motion.div>

            {/* MY NOTES */}
            {myNotes.length > 0 && (

                <div>

                    <h2 className="text-lg font-black mb-4 flex items-center gap-2">

                        <FiBook className="text-blue-500" />

                        My Uploaded Notes

                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

                        {myNotes.map(n => (

                            <NoteCard
                                key={n.id}
                                note={n}
                            />

                        ))}

                    </div>

                </div>

            )}

        </div>

    );

};

export default Profile;