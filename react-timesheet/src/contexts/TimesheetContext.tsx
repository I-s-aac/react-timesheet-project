"use client";
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { timesheetActions, fetchTimesheets } from "../services/timesheet";
import { timesheetReducer, Timesheet, Action } from "../services/timesheet"; // Import the reducer
import { useUserContext } from "./UserContext";

// Create context
const TimesheetContext = createContext<
  | {
      timesheets: Timesheet[];
      setTimesheets: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

// Provider component
interface TimesheetProviderProps {
  children: ReactNode;
}

export const TimesheetProvider = ({ children }: TimesheetProviderProps) => {
  const [timesheets, setTimesheets] = useReducer(timesheetReducer, []); // Initial state is an empty array
  const { userId } = useUserContext();

  // Fetch timesheets on userId change
  useEffect(() => {
    const fetchUserTimesheets = async () => {
      try {
        if (userId) {
          const fetchedTimesheets = await fetchTimesheets(userId);
          setTimesheets({
            type: timesheetActions.SET_TIMESHEETS,
            payload: fetchedTimesheets ?? [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch timesheets:", err);
      }
    };

    fetchUserTimesheets();
  }, [userId]);

  return (
    <TimesheetContext.Provider value={{ timesheets, setTimesheets }}>
      {children}
    </TimesheetContext.Provider>
  );
};

// Custom hook for consuming the context
export const useTimesheetContext = () => {
  const context = useContext(TimesheetContext);
  if (!context) {
    throw new Error(
      "useTimesheetContext must be used within a TimesheetProvider"
    );
  }
  return context;
};
