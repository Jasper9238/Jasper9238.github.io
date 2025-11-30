const firebaseConfig = {
    apiKey: "AIzaSyDka4Fbx1d_dJ9HJ0wnYAW_vgi18Zpt_Qw",
    authDomain: "studyhubbackend.firebaseapp.com",
    projectId: "studyhubbackend",
    storageBucket: "studyhubbackend.firebasestorage.app",
    messagingSenderId: "723869038326",
    appId: "1:723869038326:web:ff5ea3ce8b4ab6d17bded7"
};

// --- Module Imports and Initialization ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged, // Crucial for tracking login state
    signOut 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// --- CORE EXPORTED FUNCTIONS ---

// 1. Sign Up
export function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// 2. Sign In
export function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// 3. Sign Out
export function userSignOut() {
    return signOut(auth);
}

// 4. Check Authentication State
export function subscribeToAuthChanges(callback) {
    // This allows any page to listen for login/logout events
    return onAuthStateChanged(auth, callback);
}

// 5. Get the user's ID Token (needed for Python API calls)
export function getCurrentUserToken(forceRefresh = false) {
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken(forceRefresh);
    }
    return Promise.resolve(null);
}

// Export the auth object just in case
export { auth };