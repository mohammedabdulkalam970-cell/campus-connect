import { createContext, useContext, useEffect, useState } from "react";

import { auth, db } from "../firebase";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const querySnapshot = await getDocs(
            collection(db, "admins")
          );

          const adminEmails = querySnapshot.docs.map(
            (doc) => doc.data().email
          );

          if (adminEmails.includes(user.email)) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};