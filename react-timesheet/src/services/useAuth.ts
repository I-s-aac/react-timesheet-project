// src/services/useAuth.ts
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase"; // Assuming your firebase configuration is here

// Custom hook to track authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user object (or null if no user is signed in)
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return user;
};
