import { auth } from './config';

// Helper to get users from local storage
const getUsers = () => JSON.parse(localStorage.getItem('local_auth_users') || '[]');
const saveUsers = (users) => localStorage.setItem('local_auth_users', JSON.stringify(users));

// Helper to manage current session
let authChangeCallbacks = [];
const notifyAuthChange = (user) => authChangeCallbacks.forEach(cb => cb(user));

const setCurrentUser = (user) => {
    if (user) {
        localStorage.setItem('local_auth_currentUser', JSON.stringify(user));
        auth.currentUser = user;
    } else {
        localStorage.removeItem('local_auth_currentUser');
        auth.currentUser = null;
    }
    notifyAuthChange(user);
};

// Initialize session on load
const storedUser = JSON.parse(localStorage.getItem('local_auth_currentUser') || 'null');
if (storedUser) auth.currentUser = storedUser;

// Register new user
export const signUp = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            if (users.find(u => u.email === email)) {
                return reject({ code: 'auth/email-already-in-use', message: 'Email already in use.' });
            }
            
            const newUser = {
                uid: 'local_uid_' + Date.now(),
                email,
                password, // In a real app never store plaintext passwords
                displayName: email.split('@')[0],
                photoURL: null
            };
            
            users.push(newUser);
            saveUsers(users);
            setCurrentUser(newUser);
            resolve({ user: newUser });
        }, 500);
    });
};

// Sign in existing user
export const signIn = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                return reject({ code: 'auth/user-not-found', message: 'No user found.' });
            }
            if (user.password !== password) {
                return reject({ code: 'auth/wrong-password', message: 'Incorrect password.' });
            }
            
            setCurrentUser(user);
            resolve({ user });
        }, 500);
    });
};

// Sign out
export const signOut = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            setCurrentUser(null);
            resolve();
        }, 300);
    });
};

// Send password reset email (mock)
export const resetPassword = async (email) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Mock reset password email sent to ${email}`);
            resolve();
        }, 500);
    });
};

// Update display name & photo
export const updateUserProfile = async (displayName, photoURL) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!auth.currentUser) return reject(new Error("No user signed in"));
            
            const users = getUsers();
            const index = users.findIndex(u => u.uid === auth.currentUser.uid);
            
            if (index !== -1) {
                users[index] = { ...users[index], displayName, photoURL };
                saveUsers(users);
                setCurrentUser(users[index]);
                resolve();
            } else {
                reject(new Error("User not found in DB"));
            }
        }, 300);
    });
};

// Subscribe to auth state
export const onAuthChange = (callback) => {
    authChangeCallbacks.push(callback);
    // Immediately call with current user
    callback(auth.currentUser);
    
    // Return unsubscribe function
    return () => {
        authChangeCallbacks = authChangeCallbacks.filter(cb => cb !== callback);
    };
};
