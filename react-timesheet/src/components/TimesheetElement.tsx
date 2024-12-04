import React from "react";
import { Timesheet } from "@/services/timesheet";
import Link from "next/link";

type TimesheetElementProps = {
  timesheet: Timesheet;
};

const TimesheetElement: React.FC<TimesheetElementProps> = ({ timesheet }) => {
  return (
    <li className="flex flex-col justify-center items-center">
      <div className="flex justify-center items-center">
        {/* title and hours */}
        <h1 className="text-2xl">{timesheet.title}</h1>
        <div>Hours: {timesheet.hoursWorked}</div>
        <Link href="timesheets-list/timesheet-content-list/testing">test</Link>
      </div>
      <div>entries: {timesheet.items.length}</div>
      <div>Updated: {timesheet.updatedAt.toDate().toLocaleString()}</div>
      <div>Created: {timesheet.createdAt.toDate().toLocaleString()}</div>
    </li>
  );
};

export default TimesheetElement;
