import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: "AIzaSyCUkXoEhuxGFvjrjtyLWBbfIEEryu7aDPU",
authDomain: "campus-connect-5eaa2.firebaseapp.com",
projectId: "campus-connect-5eaa2",
storageBucket: "campus-connect-5eaa2.firebasestorage.app",
messagingSenderId: "807632386204",
appId: "1:807632386204:web:d4dd5b43a8dbe75f731559"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
