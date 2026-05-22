import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiCamera, FiBook, FiCalendar, FiMail, FiPhone, FiHash } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { setDocument } from '../firebase/firestore';
import { uploadFile, getProfilePath } from '../firebase/storage';
import { updateUserProfile } from '../firebase/auth';
import useFirestore from '../hooks/useFirestore';
import NoteCard from '../components/NoteCard';
import toast from 'react-hot-toast';

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MBA', 'MCA'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Profile = () => {
    const { currentUser, userProfile, setUserProfile } = useAuth();
    const { docs: myNotes } = useFirestore('notes', [{ field: 'uploadedBy', operator: '==', value: currentUser?.uid }]);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [form, setForm] = useState({ name: userProfile?.name || '', phone: userProfile?.phone || '', department: userProfile?.department || '', year: userProfile?.year || '' });
    const fileRef = useRef();

    const displayName = userProfile?.name || currentUser?.displayName || 'Student';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleSave = async () => {
        if (!form.name) return toast.error('Name is required');
        setSaving(true);
        try {
            await setDocument('users', currentUser.uid, form);
            await updateUserProfile(form.name, userProfile?.profileImage || '');
            setUserProfile(p => ({ ...p, ...form }));
            setEditing(false);
            toast.success('Profile updated!');
        } catch { toast.error('Failed to save changes'); }
        finally { setSaving(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const path = getProfilePath(currentUser.uid, file.name);
            const url = await uploadFile(file, path, () => { });
            await setDocument('users', currentUser.uid, { profileImage: url });
            await updateUserProfile(displayName, url);
            setUserProfile(p => ({ ...p, profileImage: url }));
            toast.success('Profile picture updated!');
        } catch { toast.error('Upload failed'); }
        finally { setUploadingAvatar(false); }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                {/* Banner */}
                <div className="h-28 gradient-brand relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="flex items-end justify-between -mt-14 mb-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden gradient-brand flex items-center justify-center">
                                {userProfile?.profileImage ? (
                                    <img src={userProfile.profileImage} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-black text-3xl">{initials}</span>
                                )}
                            </div>
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1 -right-1 w-7 h-7 gradient-brand text-white rounded-lg flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                            >
                                <FiCamera className="w-3 h-3" />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Cancel</button>
                                    <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-4 py-2 gradient-brand text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-60">
                                        <FiSave className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button onClick={() => setEditing(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <FiEdit2 className="w-3.5 h-3.5" /> Edit Profile
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    {editing ? (
                        <div className="space-y-3 max-w-sm">
                            <input placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                            <input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm" />
                            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                {departments.map(d => <option key={d}>{d}</option>)}
                            </select>
                            <select value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-sm">
                                {years.map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{displayName}</h2>
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{userProfile?.department} — {userProfile?.year}</p>
                            <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                {[
                                    { icon: FiMail, label: 'Email', val: currentUser?.email },
                                    { icon: FiPhone, label: 'Phone', val: userProfile?.phone || 'Not set' },
                                    { icon: FiHash, label: 'College ID', val: userProfile?.collegeId || 'Not set' },
                                    { icon: FiBook, label: 'Notes Uploaded', val: `${myNotes.length} notes` },
                                ].map(({ icon: Icon, label, val }) => (
                                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* My uploaded notes */}
            {myNotes.length > 0 && (
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <FiBook className="w-4 h-4 text-blue-500" /> My Uploaded Notes
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myNotes.map(n => <NoteCard key={n.id} note={n} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
