// src/services/timesheet.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
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
  createdAt?: string; // Timestamp of creation
  updatedAt?: string; // Timestamp of last update
};

// Reference to the "timesheets" collection
const timesheetCollection = collection(db, "timesheets");

/**
 * Save a new timesheet item to Firestore
 * @param data - The timesheet item to save
 * @returns The ID of the created document
 */
export const saveTimesheet = async (data: TimesheetItem): Promise<string> => {
  try {
    const { id, ...itemData } = data; // Exclude ID if it exists
    const docRef = await addDoc(timesheetCollection, {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving timesheet:", error);
    throw error;
  }
};

/**
 * Fetch all timesheets from Firestore
 * @returns A list of timesheet items
 */
export const fetchTimesheets = async (): Promise<TimesheetItem[]> => {
  try {
    const snapshot = await getDocs(timesheetCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TimesheetItem[];
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    throw error;
  }
};

/**
 * Update an existing timesheet item in Firestore
 * @param id - The ID of the document to update
 * @param data - The updated timesheet data
 */
export const updateTimesheet = async (
  id: string,
  data: Partial<TimesheetItem>
) => {
  try {
    const timesheetDoc = doc(timesheetCollection, id);
    await updateDoc(timesheetDoc, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    console.log(`Timesheet ${id} updated successfully.`);
  } catch (error) {
    console.error(`Error updating timesheet ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a timesheet item from Firestore
 * @param id - The ID of the document to delete
 */
export const deleteTimesheet = async (id: string) => {
  try {
    const timesheetDoc = doc(timesheetCollection, id);
    await deleteDoc(timesheetDoc);
    console.log(`Timesheet ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting timesheet ${id}:`, error);
    throw error;
  }
};
