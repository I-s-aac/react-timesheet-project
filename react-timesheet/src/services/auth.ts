// src/services/auth.ts
import { auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("User signed in:", user);
    return user; // Return user details (name, email, etc.)
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// Monitor authentication state
export const monitorAuthState = (callback: (user: any) => void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log("Authenticated user:", user);
      callback(user);
    } else {
      // User is signed out
      console.log("User signed out");
      callback(null);
    }
  });
};
