"use client";

import TimesheetElement from "@/components/TimesheetElement";
import TimesheetItemElement from "@/components/TimesheetItemElement";
import { saveTimesheetItem } from "@/services/timesheet";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";

// type TimesheetItem = {
//   id?: string;
//   in: string;
//   out: string;
//   detail?: string;
//   title: string;
//   hoursWorked?: number;
//   createdAt?: Timestamp;
//   updatedAt?: Timestamp;
// };

export default function Page() {
  const { timesheetId } = useParams();

  // create a timesheet item
  const handleCreateTimesheetItem = async () => {
    const newItem = {
      in: Timestamp.fromDate(new Date()),
      out: undefined,
      detail: "",
    };
    if (timesheetId) {
      try {
        await saveTimesheetItem(timesheetId.toString(), newItem);
      } catch (err) {
        console.error("Error creating timesheet:", err);
      }
    }
  };

  return (
    <>
      <div className="flex">
        <Link href="../">go back</Link>
        <div>
          <h1>Add new entry:</h1>
          <label>
            title
            <input />
          </label>
          <label>
            detail
            <input />
          </label>
        </div>
      </div>
      <div>
        <TimesheetElement
          timesheetId={timesheetId?.toString()}
          showDetailButton={false}
        />
        <ul className="mt-3">
          <TimesheetItemElement timesheetId={timesheetId?.toString()} />
        </ul>
      </div>
    </>
  );
}
