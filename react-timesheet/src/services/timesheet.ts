import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc, // Import getDoc for fetching a single document
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

// Define the TimesheetItem type
export type TimesheetItem = {
  id?: string; // Optional ID for Firestore document
  date: string; // Date string in "YYYY-MM-DD" format
  in: string; // Start time in "HH:mm" or ISO string
  out: string; // End time in "HH:mm" or ISO string
  detail?: string; // Optional detail or description
  title: string; // Brief title of the task
  hoursWorked?: number; // Optional calculated hours
  createdAt?: Timestamp; // Timestamp of creation
  updatedAt?: Timestamp; // Timestamp of last update
};

// Helper function to ensure safe mapping of Firestore data to TimesheetItem
const mapFirestoreDataToTimesheetItem = (doc: any): TimesheetItem => {
  return {
    id: doc.id,
    date: doc.date ?? "", // Fallback if date is undefined
    in: doc.in ?? "", // Fallback if in is undefined
    out: doc.out ?? "", // Fallback if out is undefined
    detail: doc.detail ?? "", // Optional field, fallback to empty string
    title: doc.title ?? "", // Ensure title is always set
    hoursWorked: doc.hoursWorked ?? 0, // Fallback for hoursWorked
    createdAt: doc.createdAt ? doc.createdAt.toDate() : new Date(), // Convert Timestamp to Date
    updatedAt: doc.updatedAt ? doc.updatedAt.toDate() : new Date(), // Convert Timestamp to Date
  };
};

const calculateHoursWorked = (inTime: string, outTime: string): number => {
  const inDate = new Date(`1970-01-01T${inTime}:00Z`);
  const outDate = new Date(`1970-01-01T${outTime}:00Z`);

  // Handle the case when outTime might be before inTime (e.g., overnight)
  if (outDate < inDate) {
    outDate.setDate(outDate.getDate() + 1); // Add 1 day if outTime is earlier than inTime
  }

  const diff = outDate.getTime() - inDate.getTime(); // Time difference in milliseconds
  return diff / 1000 / 60 / 60; // Convert to hours
};

const isValidTime = (time: string) => {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/; // Simple regex for "HH:mm" format
  return regex.test(time);
};

/**
 * Get a reference to the user's timesheet collection
 * @param userId - The user's unique ID
 * @returns Firestore collection reference
 */
const getUserTimesheetCollection = (userId: string) =>
  collection(db, "users", userId, "timesheets");

/**
 * Save a new timesheet item to Firestore
 * @param userId - The user's unique ID
 * @param data - The timesheet item to save
 * @returns The ID of the created document
 */
export const saveTimesheet = async (
  userId: string,
  data: TimesheetItem
): Promise<string> => {
  try {
    const { in: inTime, out: outTime, ...itemData } = data;

    if (!isValidTime(inTime) || !isValidTime(outTime)) {
      throw new Error("Invalid time format, use HH:mm.");
    }

    const hoursWorked = calculateHoursWorked(inTime, outTime);

    const timesheetCollection = getUserTimesheetCollection(userId);
    const docRef = await addDoc(timesheetCollection, {
      ...itemData,
      in: inTime,
      out: outTime,
      hoursWorked,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving timesheet:", error);
    throw error;
  }
};

/**
 * Fetch all timesheets for a specific user from Firestore
 * @param userId - The user's unique ID
 * @returns A list of timesheet items
 */
export const fetchTimesheets = async (
  userId: string
): Promise<TimesheetItem[]> => {
  try {
    const timesheetCollection = getUserTimesheetCollection(userId);
    const snapshot = await getDocs(timesheetCollection);
    return snapshot.docs.map((doc) =>
      mapFirestoreDataToTimesheetItem(doc.data())
    ) as TimesheetItem[];
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    throw error;
  }
};

/**
 * Fetch a single timesheet item by ID for a specific user
 * @param userId - The user's unique ID
 * @param timesheetId - The ID of the timesheet to fetch
 * @returns The timesheet item data
 */
export const fetchTimesheetById = async (
  userId: string,
  timesheetId: string
): Promise<TimesheetItem | null> => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", timesheetId);
    const docSnap = await getDoc(timesheetDoc);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TimesheetItem;
    } else {
      console.log("No such timesheet!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching timesheet by ID:", error);
    throw error;
  }
};

/**
 * Update an existing timesheet item for a specific user in Firestore
 * @param userId - The user's unique ID
 * @param id - The ID of the document to update
 * @param data - The updated timesheet data
 */
export const updateTimesheet = async (
  userId: string,
  id: string,
  data: Partial<TimesheetItem>
) => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", id); // Reference to the specific user's timesheet document

    // Validate time inputs if present
    if (data.in && !isValidTime(data.in)) {
      throw new Error("Invalid 'in' time format. Please use HH:mm.");
    }
    if (data.out && !isValidTime(data.out)) {
      throw new Error("Invalid 'out' time format. Please use HH:mm.");
    }

    // If 'in' and 'out' times are provided, recalculate hours worked
    if (data.in && data.out) {
      const hoursWorked = calculateHoursWorked(data.in, data.out);
      data.hoursWorked = hoursWorked;
    }

    // Update the document in Firestore
    await updateDoc(timesheetDoc, {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()), // Set the updated timestamp
    });

    console.log(`Timesheet ${id} updated successfully.`);
  } catch (error) {
    console.error(`Error updating timesheet ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a timesheet item for a specific user from Firestore
 * @param userId - The user's unique ID
 * @param id - The ID of the document to delete
 */
export const deleteTimesheet = async (userId: string, id: string) => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", id); // Reference to the specific user's timesheet document
    await deleteDoc(timesheetDoc);
    console.log(`Timesheet ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting timesheet ${id}:`, error);
    throw error;
  }
};
