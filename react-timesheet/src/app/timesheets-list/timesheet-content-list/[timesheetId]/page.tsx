"use client";

import TimesheetElement from "@/components/TimesheetElement";
import TimesheetItemElement from "@/components/TimesheetItemElement";
import { useUserContext } from "@/contexts/UserContext";
import { saveTimesheetItem } from "@/services/timesheet";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  /* planned functionality/stuff
    clock in/clock out:
        automatically update the last item in the list, or add one if the last one is already full (has a valid time for in and out)
    items are listed in a column of rectangles or something
    the timesheet at the top is displayed the same way, but bigger or something
  */
  const { timesheetId } = useParams();
  const { userId } = useUserContext();
  const [title, setTitle] = useState<string>("Edit");
  const [detail, setDetail] = useState<string>("Edit");

  // create a timesheet item
  const handleCreateTimesheetItem = async () => {
    const newItem = {
      in: Timestamp.now(),
      out: Timestamp.now(),
      detail: title,
      title: detail,
    };
    if (timesheetId) {
      try {
        await saveTimesheetItem(userId, timesheetId.toString(), newItem);
      } catch (err) {
        console.error("Error creating timesheet:", err);
      }
    }
  };

  const clockIn = () => {};

  const clockOut = () => {};

  return (
    <>
      <div className="flex flex-col">
        <Link href="../">go back</Link>
        <div>
          <button
            onClick={() => {
              handleCreateTimesheetItem();
            }}
          >
            Add new entry
          </button>
          <button
            onClick={() => {
              clockIn();
            }}
          >
            Clock in
          </button>
          <button
            onClick={() => {
              clockOut();
            }}
          >
            Clock out
          </button>
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
