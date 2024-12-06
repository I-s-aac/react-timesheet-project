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
    /* planned functionality 
      edit mode to allow editing title, detail, in, and out, use regex to validate
      delete button, with confirmation window
    */
    const items = timesheet.items;
    return items.map((item, index) => {
      return (
        <li
          key={index}
          className="flex flex-col justify-center items-center mb-3"
        >
          <div className="flex justify-center items-center">
            <h4 className="text-xl">{item.title}</h4>
            <span>{item.detail}</span>
          </div>
          <div className="flex flex-col">
            <span>In: {item.in.toDate().toISOString()}</span>
            <span>
              Out:{" "}
              {item.out.seconds !== item.in.seconds ? (
                item.out.toDate().toISOString()
              ) : (
                <span>Edit</span>
              )}
            </span>
          </div>
        </li>
      );
    });
  }
};

export default TimesheetItemElement;
