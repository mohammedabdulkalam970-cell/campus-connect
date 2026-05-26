import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff
} from 'react-icons/fi';

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from 'firebase/auth';

import { auth, db } from '../firebase';

import {
    doc,
    setDoc
} from 'firebase/firestore';

import toast from 'react-hot-toast';

const Register = () => {

    const navigate = useNavigate();

    const [showPw, setShowPw] = useState(false);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleRegister = async (e) => {

        e.preventDefault();

        if (
            !form.name ||
            !form.email ||
            !form.password
        ) {

            return toast.error(
                'Please fill all required fields'
            );

        }

        // TEMPORARY REMOVE NECN CHECK FOR TESTING
        /*
        if (
            !form.email.endsWith('@necn.ac.in')
        ) {

            return toast.error(
                'Only NECN emails allowed'
            );

        }
        */

        if (form.password.length < 6) {

            return toast.error(
                'Password must be at least 6 characters'
            );

        }

        setLoading(true);

        try {

            console.log("CREATING USER...");

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    form.email,
                    form.password
                );

            console.log("USER CREATED");

            // SEND EMAIL VERIFICATION
            console.log("SENDING EMAIL...");

            await sendEmailVerification(
                userCredential.user
            );

            console.log("EMAIL SENT SUCCESS");

            // SAVE USER TO FIRESTORE
            await setDoc(
                doc(
                    db,
                    'users',
                    userCredential.user.uid
                ),
                {
                    name: form.name,
                    email: form.email,
                    role: 'student',
                    createdAt: new Date()
                }
            );

            // AUTO LOGOUT
            await signOut(auth);

            toast.success(
                'Verification email sent 📧'
            );

            navigate('/login');

        } catch (error) {

            console.log(error);

            toast.error(
                error.message
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-800 to-cyan-500 flex items-center justify-center p-4">

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20"
            >

                <div className="text-center mb-8">

                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">

                        <span className="text-blue-700 font-black text-3xl">
                            CC
                        </span>

                    </div>

                    <h1 className="text-4xl font-black text-white">
                        Join Campus Connect
                    </h1>

                    <p className="text-blue-100 mt-2">
                        Create your NECN student account
                    </p>

                </div>

                <form
                    onSubmit={handleRegister}
                    className="space-y-5"
                >

                    <div className="relative">

                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    name: e.target.value
                                })
                            }
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none"
                        />

                    </div>

                    <div className="relative">

                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value
                                })
                            }
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none"
                        />

                    </div>

                    <div className="relative">

                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />

                        <input
                            type={showPw ? 'text' : 'password'}
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value
                                })
                            }
                            className="w-full pl-12 pr-14 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPw(!showPw)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                        >

                            {showPw
                                ? <FiEyeOff />
                                : <FiEye />
                            }

                        </button>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition-all"
                    >

                        {loading
                            ? 'Creating Account...'
                            : 'Create Account →'
                        }

                    </button>

                </form>

                <p className="text-center text-white/70 mt-6">

                    Already a member?{' '}

                    <Link
                        to="/login"
                        className="font-bold text-white"
                    >
                        Sign In
                    </Link>

                </p>

            </motion.div>

        </div>

    );

};

export default Register;