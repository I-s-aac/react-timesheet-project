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
  const { timesheetId } = useParams();
  const { userId } = useUserContext();
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");

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

  return (
    <>
      <div className="flex flex-col">
        <Link href="../">go back</Link>
        <div>
          <h1>Add new entry:</h1>
          <label>
            title
            <input
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </label>
          <label>
            detail
            <input
              onChange={(e) => {
                setDetail(e.target.value);
              }}
            />
          </label>
          <button
            onClick={() => {
              handleCreateTimesheetItem();
            }}
          >
            Add
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
