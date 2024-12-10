"use client";
import { saveTimesheet, deleteTimesheet } from "@/services/timesheet";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import TimesheetElement from "@/components/TimesheetElement";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import { useUserContext } from "@/contexts/UserContext";
import { useUndoContext } from "@/contexts/UndoContext";

export default function Page() {
  /* planned functionality/stuff
    drag and drop to re-order timesheets
    timesheets are listed in a column of rectangles or something
  */
  const { userId } = useUserContext();
  const { timesheets, setTimesheets } = useTimesheetContext();

  const [newTimesheetTitle, setNewTimesheetTitle] = useState<string>("");

  const { undoStack } = useUndoContext();
  // Save new timesheet
  const handleCreateTimesheet = async () => {
    if (!newTimesheetTitle.trim()) return alert("Enter a timesheet title!");
    const newTimesheet = {
      id: "",
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

  return (
    <div>
      <div>
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
