"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Type for the user context
type UserContextType = {
  userId: string | null;
  setUserId: (userId: string | null) => void;
};

// Create a context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component to wrap around the app
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};