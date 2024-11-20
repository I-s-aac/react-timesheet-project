import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  UserCredential,
  AuthError,
} from "firebase/auth";

// Set persistence to local (so the user stays signed in across sessions)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local.");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Register with Email/Password
export const registerWithEmailPassword = async (
  email: string,
  password: string
) => {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    const err = error as AuthError;
    console.error("Error registering user:", err.message);
    throw error;
  }
};

// Sign In with Email/Password
export const signInWithEmailPassword = async (
  email: string,
  password: string
) => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    const err = error as AuthError;
    console.error("Error signing in:", err.message);
    throw error;
  }
};

// Sign In with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("User signed in with Google:", result.user);
    return result.user;
  } catch (error) {
    const err = error as AuthError;
    console.error("Error signing in with Google:", err.message);
    throw error;
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    const err = error as AuthError;
    console.error("Error signing out:", err.message);
  }
};
