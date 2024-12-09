import React from "react";
import { deleteTimesheetItem } from "@/services/timesheet";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import { useUserContext } from "@/contexts/UserContext";

type TimesheetItemElementProps = {
  timesheetId: string;
};
// work in progress, modify later
const TimesheetItemElement: React.FC<TimesheetItemElementProps> = ({
  timesheetId,
}) => {
  const { userId } = useUserContext();
  const { timesheets, setTimesheets } = useTimesheetContext();

  const timesheet = timesheets.find((ts) => ts.id === timesheetId);

  if (timesheet && timesheetId) {
    /* planned functionality 
      edit mode to allow editing title, detail, in, and out, use regex to validate
      delete button, with undo popup
    */

    const handleDeleteTimesheetItem = async (itemId: string) => {
      if (itemId) {
        await deleteTimesheetItem(userId, timesheetId, itemId, setTimesheets);
      }
    };
    return timesheet.items.map((item, index) => {
      return (
        <li
          key={index}
          className="flex flex-col justify-center items-center mb-3"
        >
          <div className="flex justify-center items-center">
            <h4 className="text-xl">{item.title}</h4>
            <span>{item.detail}</span>
            <button
              onClick={() => {
                handleDeleteTimesheetItem(item.id);
              }}
            >
              Delete
            </button>
          </div>
          <div className="flex flex-col">
            <span>In: {item.in.toDate().toUTCString()}</span>
            <span>
              Out:{" "}
              {item.out.seconds !== item.in.seconds ? (
                item.out.toDate().toUTCString()
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
