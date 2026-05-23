import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiHash, FiEye, FiEyeOff } from 'react-icons/fi';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'MBA', 'MCA'];
const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Field = ({ icon: Icon, name, type = 'text', placeholder, value, onChange, showPw, onTogglePw }) => (
    <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
        <input
            type={name === 'password' || name === 'confirm' ? (showPw ? 'text' : 'password') : type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(name, e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
        />
        {(name === 'password' || name === 'confirm') && (
            <button type="button" onClick={onTogglePw} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
        )}
    </div>
);

const Register = () => {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '',
        collegeId: '', department: '', year: '', phone: '',
    });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const validate = () => {
        if (!form.name || !form.email || !form.password || !form.collegeId || !form.department || !form.year)
            return 'Please fill all required fields';
        if (form.password.length < 6) return 'Password must be at least 6 characters';
        if (form.password !== form.confirm) return 'Passwords do not match';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email';
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) return toast.error(err);

        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
            await updateProfile(user, { displayName: form.name });
            await setDoc(doc(db, 'users', user.uid), {
                name: form.name,
                email: form.email,
                collegeId: form.collegeId,
                department: form.department,
                year: form.year,
                phone: form.phone,
                profileImage: '',
                role: 'student',
                uid: user.uid,
            });
            toast.success('Account created! Welcome 🎉');
            navigate('/dashboard');
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'An account already exists with this email.',
                'auth/invalid-email': 'Invalid email address',
                'auth/weak-password': 'Password is too weak',
            };
            toast.error(messages[err.code] || err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen gradient-brand flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-lg relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                        <span className="text-blue-700 font-black text-xl">CC</span>
                    </div>
                    <h1 className="text-2xl font-black text-white">Join Campus Connect</h1>
                    <p className="text-blue-200 text-sm">Create your NECN student account</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card backdrop-blur-2xl p-7"
                >
                    <form onSubmit={handleRegister} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Field icon={FiUser} name="name" placeholder="Full Name *" value={form.name} onChange={set} />
                            </div>
                            <div className="col-span-2">
                                <Field icon={FiMail} name="email" type="email" placeholder="College Email *" value={form.email} onChange={set} />
                            </div>
                            <Field icon={FiHash} name="collegeId" placeholder="College ID *" value={form.collegeId} onChange={set} />
                            <Field icon={FiPhone} name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={set} />
                        </div>

                        {/* Department */}
                        <select
                            value={form.department}
                            onChange={e => set('department', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                        >
                            <option value="" className="text-slate-900 bg-white">Select Department *</option>
                            {departments.map(d => <option key={d} value={d} className="text-slate-900 bg-white">{d}</option>)}
                        </select>

                        {/* Year */}
                        <select
                            value={form.year}
                            onChange={e => set('year', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                        >
                            <option value="" className="text-slate-900 bg-white">Select Year *</option>
                            {years.map(y => <option key={y} value={y} className="text-slate-900 bg-white">{y}</option>)}
                        </select>

                        <Field icon={FiLock} name="password" placeholder="Password (min 6 chars) *" value={form.password} onChange={set} showPw={showPw} onTogglePw={() => setShowPw(p => !p)} />
                        <Field icon={FiLock} name="confirm" placeholder="Confirm Password *" value={form.confirm} onChange={set} showPw={showPw} onTogglePw={() => setShowPw(p => !p)} />

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg disabled:opacity-60 mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account →'}
                        </motion.button>
                    </form>

                    <p className="text-center text-white/50 text-sm mt-5">
                        Already a member?{' '}
                        <Link to="/login" className="text-blue-200 hover:text-white font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
