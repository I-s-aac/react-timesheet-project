"use client";

import TimesheetElement from "@/components/TimesheetElement";
import TimesheetItemElement from "@/components/TimesheetItemElement";
import { useTimesheetContext } from "@/contexts/TimesheetContext";
import { useUserContext } from "@/contexts/UserContext";
import { saveTimesheetItem } from "@/services/timesheet";
import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  /* planned functionality/stuff
    clock in/clock out:
        automatically update the last item in the list, or add one if the last one is already full (has a valid time for in and out)
    items are listed in a column of rectangles or something
    the timesheet at the top is displayed the same way, but bigger or something
  */
  const { timesheetId } = useParams();
  const { userId } = useUserContext();
  const { setTimesheets } = useTimesheetContext();

  const [title, setTitle] = useState<string>("Edit");
  const [detail, setDetail] = useState<string>("Edit");

  if (timesheetId && typeof timesheetId === "string") {
    // create a timesheet item
    const handleCreateTimesheetItem = async () => {
      const newItem = {
        id: "",
        in: Timestamp.now(),
        out: Timestamp.now(),
        detail: title,
        title: detail,
      };
      if (timesheetId) {
        try {
          await saveTimesheetItem(userId, timesheetId, newItem, setTimesheets);
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
          <div className="flex flex-col">
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
            timesheetId={timesheetId}
            showDetailButton={false}
          />
          <ul className="mt-3">
            <TimesheetItemElement timesheetId={timesheetId} />
          </ul>
        </div>
      </>
    );
  }
}
