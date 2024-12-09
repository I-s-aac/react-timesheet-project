import React from "react";
import { deleteTimesheet, Timesheet } from "@/services/timesheet";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";

type TimesheetElementProps = {
  timesheet?: Timesheet;
  timesheetId?: string;
  showDetailButton?: boolean;
};

const TimesheetElement: React.FC<TimesheetElementProps> = ({
  timesheet,
  timesheetId,
  showDetailButton = true,
}) => {
  const { userId } = useUserContext();
  const { timesheets, setTimesheets } = useTimesheetContext();

  if (timesheetId) {
    timesheet = timesheets.find((ts) => ts.id === timesheetId);
  }
  if (timesheet) {
    /* planned functionality
    allow editing title, validate with regex
    make draggable
    delete button, with confirmation window
    */
    // Delete selected timesheet
    const handleDeleteTimesheet = async (timesheetId: string) => {
      try {
        if (userId) {
          // Call the function to delete the timesheet from the database
          await deleteTimesheet(setTimesheets, userId, timesheetId);
        }
      } catch (err) {
        console.error("Error deleting timesheet:", err);
      }
    };
    return (
      <li className="flex flex-col justify-center items-center">
        <div className="flex justify-center items-center">
          {/* title and hours */}
          <h1 className="text-2xl">{timesheet.title}</h1>
          <div>Hours: {timesheet.hoursWorked}</div>
          {showDetailButton && (
            <Link
              href={`timesheets-list/timesheet-content-list/${timesheet.id}`}
            >
              show details
            </Link>
          )}
          <button
            onClick={() => {
              handleDeleteTimesheet(timesheet.id);
            }}
          >
            Delete
          </button>
        </div>
        <div>entries: {timesheet.items.length}</div>
        <div>Updated: {timesheet.updatedAt.toDate().toLocaleString()}</div>
        <div>Created: {timesheet.createdAt.toDate().toLocaleString()}</div>
      </li>
    );
  }
};

export default TimesheetElement;
