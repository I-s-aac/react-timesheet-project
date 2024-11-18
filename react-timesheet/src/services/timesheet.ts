import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc, // Import getDoc for fetching a single document
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
    const { id, ...itemData } = data; // Exclude ID if it exists
    const timesheetCollection = getUserTimesheetCollection(userId);
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
