"use client";
// src/pages/AuthPage.tsx
import React, { useState } from "react";
import {
  signInWithGoogle,
  signInWithEmailPassword,
  registerWithEmailPassword,
  logout,
} from "@/services/auth";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignInWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Signed in with Google:", user);
    } catch (error) {
      setError("Error signing in with Google");
    }
  };

  const handleSignInWithEmail = async () => {
    try {
      const user = await signInWithEmailPassword(email, password);
      console.log("Signed in with email:", user);
    } catch (error) {
      setError("Error signing in with email");
    }
  };

  const handleRegisterWithEmail = async () => {
    try {
      const user = await registerWithEmailPassword(email, password);
      console.log("Registered with email:", user);
    } catch (error) {
      setError("Error registering with email");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("User signed out");
    } catch (error) {
      setError("Error signing out");
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      {error && <p>{error}</p>}
      <div>
        <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
      </div>
      <div>
        <h3>Email/Password Authentication</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={handleSignInWithEmail}>Sign In</button>
        <button onClick={handleRegisterWithEmail}>Register</button>
      </div>
      <div>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
};

export default AuthPage;
