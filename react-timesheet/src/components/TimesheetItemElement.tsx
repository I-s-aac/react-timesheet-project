import React from "react";
import { Timesheet } from "@/services/timesheet";

type TimesheetItemElementProps = {
  timesheet: Timesheet;
};
// work in progress, modify later
const TimesheetItemElement: React.FC<TimesheetItemElementProps> = ({
  timesheet,
}) => {
  return (
    <li className="flex flex-col justify-center items-center">
      <div className="flex justify-center items-center">
        {/* title and hours */}
        <h1 className="text-2xl">{timesheet.title}</h1>
        <div>Hours: {timesheet.hoursWorked}</div>
      </div>
      <div>entries: {timesheet.items.length}</div>
      <div>Updated: {timesheet.updatedAt.toDate().toLocaleString()}</div>
      <div>Created: {timesheet.createdAt.toDate().toLocaleString()}</div>
    </li>
  );
};

export default TimesheetItemElement;
