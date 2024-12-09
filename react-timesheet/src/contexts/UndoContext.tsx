"use client";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";

// Create context
const UndoContext = createContext<any>(undefined);

// Provider component
interface UndoProviderProps {
  children: ReactNode;
}

export const undoTypes = {
  CREATE: "CREATE",
  DELETE: "DELETE",
  UPDATE: "UPDATE",
} as const;

type UndoStackItem = {
  type: string;
  value: any;
  location: string;
  undo: Function;
};

export const UndoProvider = ({ children }: UndoProviderProps) => {
  const undoStackLength = 10; // no more than x items kept at once
  const [undoStack, setUndoStack] = useState<any[]>([]);

  const undoChange = (data: UndoStackItem) => {
    switch (data.type) {
      case undoTypes.CREATE: {
      }
      case undoTypes.DELETE: {
      }
      case undoTypes.UPDATE: {
      }
      default: {
        throw new Error(`Unknown data type: ${data.type}`);
      }
    }
    // remove the data from the undoStack here probably
  };

  const addToUndoStack = (type: string, value: any, location: string) => {
    const data = {
      type: type,
      value: value,
      location: location,
      undo: function () {
        undoChange(this);
      },
    };

    const newValue = [data, ...undoStack].slice(0, undoStackLength);
    setUndoStack(newValue);
  };

  return (
    <UndoContext.Provider value={{ undoStack, addToUndoStack }}>
      {children}
    </UndoContext.Provider>
  );
};

// Custom hook for consuming the context
export const useUndoContext = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error("useUndoContext must be used within a UndoProvider");
  }
  return context;
};
