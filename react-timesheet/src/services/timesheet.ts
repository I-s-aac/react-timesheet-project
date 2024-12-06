import { useUserContext } from "@/contexts/UserContext";
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
  hoursWorked: number;
  items: TimesheetItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type TimesheetItem = {
  id?: string;
  in: Timestamp;
  out: Timestamp;
  detail?: string;
  title: string;
  hoursWorked?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export const timesheetActions = {
  SET_TIMESHEETS: "SET_TIMESHEETS",
  ADD_TIMESHEET: "ADD_TIMESHEET",
  UPDATE_TIMESHEET: "UPDATE_TIMESHEET",
  DELETE_TIMESHEET: "DELETE_TIMESHEET",
};

export type Action =
  | { type: string; payload: Timesheet[] }
  | { type: string; payload: Timesheet }
  | { type: string; payload: string };

export const timesheetReducer = (state: Timesheet[], action: Action) => {
  switch (action.type) {
    case timesheetActions.SET_TIMESHEETS:
      return action.payload as Timesheet[];
    case timesheetActions.ADD_TIMESHEET:
      return [...state, action.payload as Timesheet];
    case timesheetActions.UPDATE_TIMESHEET:
      return state.map((ts) =>
        ts.id === (action.payload as Timesheet).id
          ? (action.payload as Timesheet)
          : ts
      );
    case timesheetActions.DELETE_TIMESHEET:
      return state.filter((ts) => ts.id !== (action.payload as string));
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const calculateHoursWorked = (
  inTime: Timestamp,
  outTime: Timestamp
): number => {
  console.log(inTime.toDate());
  const inDate = inTime.toDate();
  const outDate = outTime.toDate();
  if (outDate < inDate) outDate.setDate(outDate.getDate() + 1);
  return (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60);
};

export const calculateTotalHours = (items: TimesheetItem[]): number =>
  items.reduce((total, item) => total + (item.hoursWorked || 0), 0);

const getUserTimesheetsCollection = (userId: string) =>
  collection(db, "users", userId, "timesheets");

const getItemsSubcollection = (userId: string, timesheetId: string) =>
  collection(db, "users", userId, "timesheets", timesheetId, "items");

export const fetchTimesheets = async (userId: string) => {
  try {
    const timesheetsCollection = getUserTimesheetsCollection(userId);
    const snapshot = await getDocs(timesheetsCollection);
    const timesheets = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const itemsSnapshot = await getDocs(
          getItemsSubcollection(userId, doc.id)
        );
        const items = itemsSnapshot.docs.map((itemDoc) => ({
          id: itemDoc.id,
          ...itemDoc.data(),
        }));
        return {
          ...data,
          id: doc.id,
          items,
        } as Timesheet;
      })
    );
    return timesheets;
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return [];
  }
};

export const saveTimesheet = async (
  dispatch: any,
  userId: string,
  data: Timesheet
) => {
  try {
    const timesheetsCollection = getUserTimesheetsCollection(userId);
    const { items, ...timesheetData } = {
      ...data,
      hoursWorked: calculateTotalHours(data.items),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(timesheetsCollection, timesheetData);
    const itemsSubcollection = getItemsSubcollection(userId, docRef.id);
    for (const item of items) {
      await addDoc(itemsSubcollection, {
        ...item,
        hoursWorked:
          item.hoursWorked || calculateHoursWorked(item.in, item.out),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      });
    }
    const newTimesheet = { ...timesheetData, id: docRef.id, items };
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
    const { items, ...updatedData } = {
      ...data,
      hoursWorked: calculateTotalHours(data.items || []),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    await updateDoc(timesheetDoc, updatedData);
    if (items) {
      const itemsSubcollection = getItemsSubcollection(userId, id);
      for (const item of items) {
        if (item.id) {
          await updateDoc(doc(itemsSubcollection, item.id), item);
        } else {
          await addDoc(itemsSubcollection, {
            ...item,
            hoursWorked:
              item.hoursWorked || calculateHoursWorked(item.in, item.out),
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }
      }
    }
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
    const itemsSubcollection = getItemsSubcollection(userId, id);
    const itemsSnapshot = await getDocs(itemsSubcollection);
    for (const itemDoc of itemsSnapshot.docs) {
      await deleteDoc(doc(itemsSubcollection, itemDoc.id));
    }
    await deleteDoc(timesheetDoc);
    dispatch({ type: timesheetActions.DELETE_TIMESHEET, payload: id });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
  }
};

export const saveTimesheetItem = async (
  userId: string,
  timesheetId: string,
  item: TimesheetItem
) => {
  try {
    const itemsCollection = collection(
      db,
      "users",
      userId,
      "timesheets",
      timesheetId,
      "items"
    );
    const itemData = {
      ...item,
      hoursWorked: calculateHoursWorked(item.in, item.out),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    const docRef = await addDoc(itemsCollection, itemData);
    console.log("Timesheet item added with ID:", docRef.id);
    return { ...itemData, id: docRef.id };
  } catch (error) {
    console.error("Error saving timesheet item:", error);
    throw error;
  }
};

export const updateTimesheetItem = async (
  timesheetId: string,
  itemId: string,
  updatedItem: Partial<TimesheetItem>
) => {
  try {
    const { userId } = useUserContext();
    const itemDoc = doc(
      db,
      "users",
      userId,
      "timesheets",
      timesheetId,
      "items",
      itemId
    );
    const updatedData = {
      ...updatedItem,
      hoursWorked:
        updatedItem.in && updatedItem.out
          ? calculateHoursWorked(updatedItem.in, updatedItem.out)
          : undefined,
      updatedAt: Timestamp.fromDate(new Date()),
    };
    await updateDoc(itemDoc, updatedData);
    console.log("Timesheet item updated with ID:", itemId);
  } catch (error) {
    console.error("Error updating timesheet item:", error);
    throw error;
  }
};

export const deleteTimesheetItem = async (
  timesheetId: string,
  itemId: string
) => {
  try {
    const { userId } = useUserContext();
    const itemDoc = doc(
      db,
      "users",
      userId,
      "timesheets",
      timesheetId,
      "items",
      itemId
    );
    await deleteDoc(itemDoc);
    console.log("Timesheet item deleted with ID:", itemId);
  } catch (error) {
    console.error("Error deleting timesheet item:", error);
    throw error;
  }
};
