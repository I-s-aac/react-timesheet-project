"use client";
import {
  saveTimesheet,
  saveTimesheetItem,
  fetchTimesheets,
  updateTimesheet,
  deleteTimesheet,
  timesheetReducer,
  Timesheet,
  Action,
  calculateHoursWorked,
  timesheetActions,
} from "@/services/timesheet";
import { useAuth } from "@/services/useAuth";
import { useReducer, useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";

export default function Page() {
  const user = useAuth();
  const userId = user?.uid;
  const initialState: Timesheet[] = [];
  const [timesheets, setTimesheets] = useReducer<
    (state: Timesheet[], action: Action) => Timesheet[]
  >(timesheetReducer, initialState);

  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string>(""); // Selected timesheet
  const [newTimesheetTitle, setNewTimesheetTitle] = useState<string>("");

  // TimesheetItem inputs
  const [newItem, setNewItem] = useState({
    date: "",
    in: "",
    out: "",
    title: "",
    detail: "",
  });

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

  // Save new timesheet
  const handleCreateTimesheet = async () => {
    if (!newTimesheetTitle.trim()) return alert("Enter a timesheet title!");
    const newTimesheet = {
      title: newTimesheetTitle,
      items: [],
      hoursWorked: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    try {
      if (userId) {
        await saveTimesheet(setTimesheets, userId, newTimesheet);
        setNewTimesheetTitle("");
      }
    } catch (err) {
      console.error("Error creating timesheet:", err);
    }
  };

  // Delete selected timesheet
  const handleDeleteTimesheet = async () => {
    if (!selectedTimesheetId) return alert("Select a timesheet to delete!");

    try {
      if (userId) {
        // Call the function to delete the timesheet from the database
        await deleteTimesheet(setTimesheets, userId, selectedTimesheetId);

        // Clear the selected timesheet from the state
        setSelectedTimesheetId("");
      }
    } catch (err) {
      console.error("Error deleting timesheet:", err);
    }
  };

  return (
    <>
      <div>
        {/* top bar for adding timesheets */}
        <h1>list of timesheets goes here</h1>
        <label>
          Timesheet Title:{" "}
          <input
            type="text"
            placeholder="Timesheet title"
            value={newTimesheetTitle}
            onChange={(e) => setNewTimesheetTitle(e.target.value)}
          />
        </label>
        <button
          className="border px-1 rounded-lg"
          onClick={() => handleCreateTimesheet()}
        >
          add timesheet
        </button>
      </div>
      <ul>
        {timesheets.map((t, idx) => {
          return (
            <li key={idx} className="flex justify-center items-center">
              <h1 className="text-2xl">{t.title}</h1>
              <div>hours worked: {t.hoursWorked}</div>
              <div>entries: {t.items.length}</div>
              <div>
                last updated at: {t.updatedAt.toDate().toLocaleString()}
              </div>
              <div>date created: {t.createdAt.toDate().toLocaleString()}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
