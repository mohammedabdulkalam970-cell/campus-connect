import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';

import {
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';

import { auth } from '../firebase';

import toast from 'react-hot-toast';

const Login = () => {

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [showPw, setShowPw] = useState(false);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!form.email || !form.password) {

            return toast.error(
                'Please fill all fields'
            );

        }

        // ONLY NECN EMAILS
        if (!form.email.endsWith("@necn.ac.in")) {

            return toast.error(
                "Only NECN college emails are allowed"
            );

        }

        setLoading(true);

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    form.email,
                    form.password
                );

            // EMAIL VERIFICATION CHECK
            if (!userCredential.user.emailVerified) {

                await signOut(auth);

                toast.error(
                    "Please verify your email first 📧"
                );

                return;
            }

            toast.success(
                'Welcome back! 👋'
            );

            navigate('/dashboard');

        } catch (err) {

            console.error(err);

            const messages = {

                'auth/user-not-found':
                    'No account found with this email',

                'auth/wrong-password':
                    'Incorrect password',

                'auth/invalid-credential':
                    'Invalid email or password',

                'auth/too-many-requests':
                    'Too many attempts. Try later.'

            };

            toast.error(
                messages[err.code] || 'Login failed'
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen gradient-brand flex items-center justify-center p-4 relative overflow-hidden">

            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md relative">

                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >

                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">

                        <span className="text-blue-700 font-black text-2xl">
                            CC
                        </span>

                    </div>

                    <h1 className="text-2xl font-black text-white">
                        Campus Connect
                    </h1>

                    <p className="text-blue-200 text-sm">
                        NECN — Narayana Engineering College
                    </p>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card backdrop-blur-2xl p-8"
                >

                    <h2 className="text-xl font-bold text-white mb-6">
                        Sign In
                    </h2>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-4"
                    >

                        <div className="relative">

                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />

                            <input
                                type="email"
                                placeholder="NECN College Email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        email: e.target.value
                                    }))
                                }
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-sm"
                            />

                        </div>

                        <div className="relative">

                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />

                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        password: e.target.value
                                    }))
                                }
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-sm"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPw((p) => !p)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                            >

                                {showPw
                                    ? <FiEyeOff className="w-4 h-4" />
                                    : <FiEye className="w-4 h-4" />
                                }

                            </button>

                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >

                            {loading
                                ? 'Signing in...'
                                : 'Sign In →'
                            }

                        </motion.button>

                    </form>

                    <p className="text-center text-white/50 text-sm mt-6">

                        New student?{' '}

                        <Link
                            to="/register"
                            className="text-blue-200 hover:text-white font-semibold transition-colors"
                        >
                            Create Account
                        </Link>

                    </p>

                </motion.div>

            </div>

        </div>

    );

};

export default Login;