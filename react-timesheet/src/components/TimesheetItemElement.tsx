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
    return items.map((item, index) => {
      return (
        <li key={index} className="flex flex-col justify-center items-center mb-3">
          <div className="flex justify-center items-center">
            <h4 className="text-xl">{item.title}</h4>
            <span>{item.detail}</span>
          </div>
          <div>
            <span>{item.in.toDate().toISOString()}</span>
            <span>{/* item.out.toDate().toString() */}</span>
          </div>
        </li>
      );
    });
  }
};

export default TimesheetItemElement;
