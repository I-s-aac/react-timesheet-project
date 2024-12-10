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
import { useTimesheetContext } from "./TimesheetContext";
import { Timesheet, timesheetActions } from "@/services/timesheet";

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
  values: any[];
  locations: string[];
  cleanups?: Function[];
  undo: Function;
};

export const UndoProvider = ({ children }: UndoProviderProps) => {
  const undoStackLength = 10; // no more than x items kept at once
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const { timesheets } = useTimesheetContext();

  const undoChange = async (data: UndoStackItem) => {
    switch (data.type) {
      case undoTypes.CREATE: {
        // Implement undo for create
        break;
      }
      case undoTypes.DELETE: {
        if (data.values.length !== data.locations.length) {
          console.error(
            "Undo data mismatch: values and locations arrays must have the same length."
          );
          break;
        }

        try {
          for (let i = 0; i < data.values.length; i++) {
            const value = data.values[i];
            const location = data.locations[i];
            console.log(data.values, data.locations);
            if (location.split("/").length % 2 === 0) {
              // This is a document path
              const docRef = doc(db, location);
              await setDoc(docRef, value);
            } else {
              // This is a collection path; restore items
              const collectionRef = collection(db, location);
              console.log(value);
              for (const item of value) {
                const itemRef = doc(collectionRef); // Auto-generate item document ID
                await setDoc(itemRef, item);
              }
              console.log("b");
            }

            // If cleanup exists, call it
            if (data?.cleanups && data?.cleanups[i]) {
              await data.cleanups[i]();
            }
          }

          // Update the undo stack: remove the undone action
          setUndoStack((prevStack) =>
            prevStack.filter((item) => item !== data)
          );

          console.log("Undo successful: Data restored.");
        } catch (error) {
          console.error("Error undoing delete action:", error);
        }
        break;
      }

      case undoTypes.UPDATE: {
        // Implement undo for update
        break;
      }
      default: {
        throw new Error(`Unknown data type: ${data.type}`);
      }
    }

    // Remove the data from the undoStack after performing the undo action
    setUndoStack((prevStack) => prevStack.filter((item) => item !== data));
  };

  const addToUndoStack = (
    type: string,
    values: any[],
    locations: string[],
    cleanups: Function[]
  ) => {
    const data = {
      type: type,
      values: values,
      locations: locations,
      cleanups: cleanups,
      undo: function () {
        undoChange(this);
      },
    };

    const newValue = [data, ...undoStack].slice(0, undoStackLength);
    setUndoStack(newValue);
  };

  useEffect(() => {
    console.log("undoStack changed: ", undoStack);
  }, [undoStack]);
  useEffect(() => {
    console.log("timesheets changed: ", timesheets);
  }, [timesheets]);

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
