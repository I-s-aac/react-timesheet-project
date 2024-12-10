import React, { useEffect } from "react";
import { deleteTimesheetItem, TimesheetItem } from "@/services/timesheet";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import { useUserContext } from "@/contexts/UserContext";
import { useUndoContext } from "@/contexts/UndoContext";

type TimesheetItemElementProps = {
  timesheetId: string;
};
// work in progress, modify later
const TimesheetItemElement: React.FC<TimesheetItemElementProps> = ({
  timesheetId,
}) => {
  const { userId } = useUserContext();
  const { timesheets, setTimesheets } = useTimesheetContext();
  const { addToUndoStack } = useUndoContext();

  const timesheet = timesheets.find((ts) => ts.id === timesheetId);

  if (timesheet && timesheetId) {
    /* planned functionality 
      edit mode to allow editing title, detail, in, and out, use regex to validate
      delete button, with undo popup
    */

    const handleDeleteTimesheetItem = async (item: TimesheetItem) => {
      if (item) {
        await deleteTimesheetItem(
          userId,
          timesheetId,
          item,
          setTimesheets,
          addToUndoStack
        );
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
                handleDeleteTimesheetItem(item);
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
