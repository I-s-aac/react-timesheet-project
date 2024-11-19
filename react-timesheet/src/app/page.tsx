// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to timesheets-list as the starting page
  redirect("/timesheets-list");
}
