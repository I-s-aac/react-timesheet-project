"use client";

import React, { useState, useEffect } from "react";
import {
  saveTimesheet,
  deleteTimesheet,
  updateTimesheet,
} from "@/services/timesheet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import { useUser } from "@/contexts/UserContext"; // Import the custom hook to get userId
import { signInWithGoogle } from "@/services/auth";

export default function DevPage() {
  const { userId, setUserId } = useUser(); // Get the userId from the context
  const [timesheetId, setTimesheetId] = useState(""); // For updating/deleting specific timesheets
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [detail, setDetail] = useState(""); // Detail field
  const [timesheets, setTimesheets] = useState<any[]>([]); // Stores fetched timesheets from Firestore

  // Fetch the user's timesheets based on userId
  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        if (userId) {
          const timesheetCollection = collection(
            db,
            "users",
            userId,
            "timesheets"
          );
          const timesheetSnapshot = await getDocs(timesheetCollection);
          const timesheetsData = timesheetSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTimesheets(timesheetsData); // Update the state with the fetched timesheets
        }
      } catch (error) {
        console.error("Error fetching timesheets:", error);
      }
    };

    if (userId) {
      fetchTimesheets();
    }
  }, [userId]); // Re-fetch if userId changes

  // Function to save a new timesheet
  const handleSave = async () => {
    try {
      if (userId) {
        const newTimesheet = { title, date, in: timeIn, out: timeOut, detail };
        const id = await saveTimesheet(userId, newTimesheet);
        alert(`Timesheet saved with ID: ${id}`);
      }
    } catch (error) {
      console.error("Error saving timesheet:", error);
    }
  };

  // Function to update an existing timesheet
  const handleUpdate = async () => {
    try {
      if (userId) {
        const updatedData = { title, date, in: timeIn, out: timeOut, detail };
        await updateTimesheet(userId, timesheetId, updatedData);
        alert(`Timesheet ${timesheetId} updated successfully.`);
      }
    } catch (error) {
      console.error("Error updating timesheet:", error);
    }
  };

  // Function to delete a timesheet
  const handleDelete = async () => {
    try {
      if (userId) {
        await deleteTimesheet(userId, timesheetId);
        alert(`Timesheet ${timesheetId} deleted successfully.`);
      }
    } catch (error) {
      console.error("Error deleting timesheet:", error);
    }
  };
  // Handle Google sign-in
  const handleSignInWithGoogle = async () => {
    try {
      console.log("test test");
      await signInWithGoogle(setUserId); // Call the function and pass setUserId
      console.log("test");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      {/* Left Column: Input Fields and Buttons */}
      <div style={{ flex: 1, marginRight: "20px" }}>
        <h1>Dev Page</h1>
        <button onClick={() => handleSignInWithGoogle()}>Google sign in</button>
        {/* Inputs for timesheet data */}
        <div>
          <label>Timesheet ID (for update/delete):</label>
          <input
            type="text"
            value={timesheetId}
            onChange={(e) => setTimesheetId(e.target.value)}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Date (YYYY-MM-DD):</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Time In (HH:mm):</label>
          <input
            type="text"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Time Out (HH:mm):</label>
          <input
            type="text"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            style={{ marginLeft: "10px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Detail:</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{
              marginLeft: "10px",
              marginBottom: "10px",
              width: "100%",
              height: "80px",
            }}
          />
        </div>

        {/* Buttons for actions */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleSave} style={{ marginRight: "10px" }}>
            Save Timesheet
          </button>
          <button onClick={handleUpdate} style={{ marginRight: "10px" }}>
            Update Timesheet
          </button>
          <button onClick={handleDelete} style={{ marginRight: "10px" }}>
            Delete Timesheet
          </button>
        </div>
      </div>

      {/* Right Column: Firestore Data Display */}
      <div
        style={{
          flex: 1,
          borderLeft: "1px solid #ccc",
          paddingLeft: "20px",
          overflowY: "auto",
        }}
      >
        <h2>Fetched Data</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(timesheets, null, 2)}
        </pre>
      </div>
    </div>
  );
}
