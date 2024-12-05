"use client";
import {
  saveTimesheet,
  saveTimesheetItem,
  fetchTimesheets,
  updateTimesheet,
  deleteTimesheet,
  calculateHoursWorked,
  timesheetActions,
} from "@/services/timesheet";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import TimesheetElement from "@/components/TimesheetElement";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import { useUserContext } from "@/contexts/UserContext";

export default function Page() {
  const { userId } = useUserContext();
  const { timesheets, setTimesheets } = useTimesheetContext();

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
    <div>
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
          return <TimesheetElement key={idx} timesheet={t} />;
        })}
      </ul>
    </div>
  );
}
