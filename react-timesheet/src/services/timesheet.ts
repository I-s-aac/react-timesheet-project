import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

export type Timesheet = {
  id?: string;
  title: string;
  detail?: string;
  hoursWorked: number; // Automatically calculated from items
  items: TimesheetItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type TimesheetItem = {
  id?: string;
  date: string; // Format: "YYYY-MM-DD"
  in: string; // Format: "HH:mm"
  out: string; // Format: "HH:mm"
  detail?: string;
  title: string;
  hoursWorked?: number; // Optional; calculated if not provided
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export const timesheetActions = {
  SET_TIMESHEETS: "SET_TIMESHEETS",
  ADD_TIMESHEET: "ADD_TIMESHEET",
  UPDATE_TIMESHEET: "UPDATE_TIMESHEET",
  DELETE_TIMESHEET: "DELETE_TIMESHEET",
};

export type TimesheetState = { timesheets: Timesheet[] };

type Action =
  | { type: string; payload: Timesheet[] }
  | { type: string; payload: Timesheet }
  | { type: string; payload: Timesheet }
  | { type: string; payload: Timesheet };

export const timesheetReducer = (state: TimesheetState, action: Action) => {
  switch (action.type) {
    case timesheetActions.SET_TIMESHEETS: {
      const payload = action.payload as Timesheet[];
      return { ...state, timesheets: payload };
    }
    case timesheetActions.ADD_TIMESHEET: {
      const payload = action.payload as Timesheet;
      return { ...state, timesheets: [...state.timesheets, payload] };
    }
    case timesheetActions.UPDATE_TIMESHEET: {
      const payload = action.payload as Timesheet;
      return {
        ...state,
        timesheets: state.timesheets.map((ts: Timesheet) => {
          const updatedTimesheets = ts.id === payload.id ? payload : ts;
          return updatedTimesheets;
        }),
      };
    }
    case timesheetActions.DELETE_TIMESHEET: {
      const payload = action.payload as Timesheet;
      return {
        ...state,
        timesheets: state.timesheets.filter((ts) => ts.id !== payload.id),
      };
    }
    default: {
      throw new Error(`Unknown action type: ${action.type}`);
    }
  }
};

const calculateHoursWorked = (inTime: string, outTime: string): number => {
  const inDate = new Date(`1970-01-01T${inTime}:00Z`);
  const outDate = new Date(`1970-01-01T${outTime}:00Z`);
  if (outDate < inDate) outDate.setDate(outDate.getDate() + 1);
  return (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60);
};

const calculateTotalHours = (items: TimesheetItem[]): number =>
  items.reduce((total, item) => total + (item.hoursWorked || 0), 0);

const mapFirestoreDataToTimesheet = (doc: any): Timesheet => ({
  id: doc.id,
  title: doc.title ?? "",
  detail: doc.detail ?? "",
  hoursWorked: doc.hoursWorked ?? 0,
  items: doc.items.map(mapFirestoreDataToTimesheetItem) ?? [],
  createdAt: doc.createdAt ? doc.createdAt.toDate() : new Date(),
  updatedAt: doc.updatedAt ? doc.updatedAt.toDate() : new Date(),
});

const mapFirestoreDataToTimesheetItem = (doc: any): TimesheetItem => ({
  id: doc.id,
  date: doc.date ?? "",
  in: doc.in ?? "",
  out: doc.out ?? "",
  detail: doc.detail ?? "",
  title: doc.title ?? "",
  hoursWorked: doc.hoursWorked ?? 0,
  createdAt: doc.createdAt ? doc.createdAt.toDate() : new Date(),
  updatedAt: doc.updatedAt ? doc.updatedAt.toDate() : new Date(),
});

const getUserTimesheetsCollection = (userId: string) =>
  collection(db, "users", userId, "timesheets");

export const fetchTimesheets = async (userId: string) => {
  try {
    const timesheetsCollection = getUserTimesheetsCollection(userId);
    const snapshot = await getDocs(timesheetsCollection);
    const timesheets = snapshot.docs.map((doc) =>
      mapFirestoreDataToTimesheet(doc.data())
    );
    console.log(timesheets);
    return timesheets;
  } catch (error) {
    console.error("Error fetching timesheets:", error);
  }
};

export const saveTimesheet = async (
  dispatch: any,
  userId: string,
  data: Timesheet
) => {
  try {
    const timesheetsCollection = getUserTimesheetsCollection(userId);
    const timesheetData = {
      ...data,
      hoursWorked: calculateTotalHours(data.items),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(timesheetsCollection, timesheetData);
    const newTimesheet = { ...timesheetData, id: docRef.id };
    dispatch({ type: timesheetActions.ADD_TIMESHEET, payload: newTimesheet });
  } catch (error) {
    console.error("Error saving timesheet:", error);
  }
};

export const updateTimesheet = async (
  dispatch: any,
  userId: string,
  id: string,
  data: Partial<Timesheet>
) => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", id);
    const updatedData = {
      ...data,
      hoursWorked: calculateTotalHours(data.items || []),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    await updateDoc(timesheetDoc, updatedData);
    dispatch({
      type: timesheetActions.UPDATE_TIMESHEET,
      payload: { id, ...data },
    });
  } catch (error) {
    console.error("Error updating timesheet:", error);
  }
};

export const deleteTimesheet = async (
  dispatch: any,
  userId: string,
  id: string
) => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", id);
    await deleteDoc(timesheetDoc);
    dispatch({ type: timesheetActions.DELETE_TIMESHEET, payload: id });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
  }
};
