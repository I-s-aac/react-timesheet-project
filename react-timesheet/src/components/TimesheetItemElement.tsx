import React from "react";
import { Timesheet } from "@/services/timesheet";
import { useTimesheetContext } from "@/contexts/TimesheetContext";

type TimesheetItemElementProps = {
  timesheet?: Timesheet;
  timesheetId?: string;
};
// work in progress, modify later
const TimesheetItemElement: React.FC<TimesheetItemElementProps> = ({
  timesheet,
  timesheetId,
}) => {
  const { timesheets } = useTimesheetContext();
  if (timesheetId) {
    timesheet = timesheets.find((ts) => ts.id === timesheetId);
  }
  if (timesheet) {
    const items = timesheet.items;
    console.log(items);
    return (
      <li className="flex flex-col justify-center items-center">
        work in progress
      </li>
    );
  }
};

export default TimesheetItemElement;
