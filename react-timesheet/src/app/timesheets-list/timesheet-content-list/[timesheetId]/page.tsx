"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const { timesheetId } = useParams();

  console.log(timesheetId);

  return <div></div>;
}
