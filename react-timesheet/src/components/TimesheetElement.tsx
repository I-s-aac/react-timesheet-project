import React from "react";
import { Timesheet } from "@/services/timesheet";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import Link from "next/link";

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
  const { timesheets } = useTimesheetContext();
  if (timesheetId) {
    timesheet = timesheets.find((ts) => ts.id === timesheetId);
  }
  if (timesheet) {
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
        </div>
        <div>entries: {timesheet.items.length}</div>
        <div>Updated: {timesheet.updatedAt.toDate().toLocaleString()}</div>
        <div>Created: {timesheet.createdAt.toDate().toLocaleString()}</div>
      </li>
    );
  }
};

export default TimesheetElement;
