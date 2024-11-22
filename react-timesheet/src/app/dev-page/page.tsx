"use client";

import React, { useState, useEffect, useReducer } from "react";
import {
  saveTimesheet,
  deleteTimesheet,
  updateTimesheet,
  fetchTimesheets,
  TimesheetItem,
  timesheetReducer,
  TimesheetState,
  timesheetActions,
} from "@/services/timesheet";
import { Timestamp } from "firebase/firestore";
import { signInWithGoogle } from "@/services/auth";
import { useAuth } from "@/services/useAuth";

export default function DevPage() {
  const user = useAuth();
  const userId = user?.uid;
  const initialState: TimesheetState = { timesheets: [] };
  const [timesheets, setTimesheets] = useReducer(
    timesheetReducer,
    initialState
  );
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string>(""); // Selected timesheet
  const [newTimesheetTitle, setNewTimesheetTitle] = useState<string>("");

  // TimesheetItem inputse
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
          console.log(fetchedTimesheets);
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
        const id = await saveTimesheet(userId, newTimesheet);
        setTimesheets([...timesheets, { ...newTimesheet, id }]);
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
        await deleteTimesheet(userId, selectedTimesheetId);
        setTimesheets(timesheets.filter((ts) => ts.id !== selectedTimesheetId));
        setSelectedTimesheetId("");
      }
    } catch (err) {
      console.error("Error deleting timesheet:", err);
    }
  };

  // Add item to selected timesheet
  const handleAddItem = async () => {
    if (!selectedTimesheetId) return alert("Select a timesheet first!");
    const timesheet = timesheets.find((ts) => ts.id === selectedTimesheetId);
    if (!timesheet) return;

    const itemWithHours = {
      ...newItem,
      hoursWorked: calculateHoursWorked(newItem.in, newItem.out),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const updatedTimesheet = {
      ...timesheet,
      items: [...timesheet.items, itemWithHours],
      hoursWorked: timesheet.hoursWorked + itemWithHours.hoursWorked,
    };

    try {
      if (userId) {
        await updateTimesheet(userId, selectedTimesheetId, updatedTimesheet);
        setTimesheets((prevTimesheets) =>
          (prevTimesheets ?? []).map((ts) =>
            ts.id === selectedTimesheetId ? updatedTimesheet : ts
          )
        );
        setNewItem({ date: "", in: "", out: "", title: "", detail: "" });
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  // Calculate hours worked
  const calculateHoursWorked = (inTime: string, outTime: string) => {
    const inDate = new Date(`1970-01-01T${inTime}:00Z`);
    const outDate = new Date(`1970-01-01T${outTime}:00Z`);
    if (outDate < inDate) outDate.setDate(outDate.getDate() + 1);
    return (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60); // hours
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Error signing in with Google:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dev Page</h1>
      <button onClick={handleSignInWithGoogle}>Sign in with Google</button>
      {userId ? (
        <h3>you are signed in maybe</h3>
      ) : (
        <h3>you are not signed in maybe</h3>
      )}

      {/* Create Timesheet */}
      <div>
        <h2>Create Timesheet</h2>
        <input
          type="text"
          placeholder="Timesheet title"
          value={newTimesheetTitle}
          onChange={(e) => setNewTimesheetTitle(e.target.value)}
        />
        {/* <button onClick={handleCreateTimesheet}>Create</button> */}
      </div>

      {/* Select Timesheet */}
      <div>
        <h2>Manage Timesheet</h2>
        {/* <select
          value={selectedTimesheetId}
          onChange={(e) => setSelectedTimesheetId(e.target.value)}
        >
          <option value="">Select Timesheet</option>
          {timesheets.map((ts) => (
            <option key={ts.id} value={ts.id}>
              {ts.title}
            </option>
          ))}
        </select> */}
        {/* <button onClick={handleDeleteTimesheet}> */}
        {/* Delete Selected Timesheet
        </button> */}
      </div>

      {/* Add TimesheetItem */}
      {selectedTimesheetId && (
        <div>
          <h3>Add Timesheet Item</h3>
          <input
            type="text"
            placeholder="Date (YYYY-MM-DD)"
            value={newItem.date}
            onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Time In (HH:mm)"
            value={newItem.in}
            onChange={(e) => setNewItem({ ...newItem, in: e.target.value })}
          />
          <input
            type="text"
            placeholder="Time Out (HH:mm)"
            value={newItem.out}
            onChange={(e) => setNewItem({ ...newItem, out: e.target.value })}
          />
          <input
            type="text"
            placeholder="Title"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />
          <textarea
            placeholder="Detail"
            value={newItem.detail}
            onChange={(e) => setNewItem({ ...newItem, detail: e.target.value })}
          />
          {/* <button onClick={handleAddItem}>Add Item</button> */}
        </div>
      )}

      {/* Display Timesheet Items */}
      {selectedTimesheetId && (
        <div>
          <h3>Items in Selected Timesheet</h3>
          {/* <ul>
            {timesheets
              .find((ts) => ts.id === selectedTimesheetId)
              ?.items.map((item: TimesheetItem, idx: number) => {
                const hoursWorked = item.hoursWorked || 0;
                return (
                  <li key={idx}>
                    {item.title} ({item.date}): {hoursWorked.toFixed(2)} hours
                  </li>
                );
              })}
          </ul> */}
        </div>
      )}
    </div>
  );
}
