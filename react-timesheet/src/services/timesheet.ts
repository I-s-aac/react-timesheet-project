import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";

export type Timesheet = {
  id: string;
  title: string;
  hoursWorked: number;
  items: TimesheetItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  detail?: string;
};

export type TimesheetItem = {
  id: string;
  in: Timestamp;
  out: Timestamp;
  title: string;
  detail?: string;
  hoursWorked?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export const timesheetActions = {
  SET_TIMESHEETS: "SET_TIMESHEETS",
  ADD_TIMESHEET: "ADD_TIMESHEET",
  UPDATE_TIMESHEET: "UPDATE_TIMESHEET",
  DELETE_TIMESHEET: "DELETE_TIMESHEET",
  ADD_TIMESHEET_ITEM: "ADD_TIMESHEET_ITEM",
  UPDATE_TIMESHEET_ITEM: "UPDATE_TIMESHEET_ITEM",
  DELETE_TIMESHEET_ITEM: "DELETE_TIMESHEET_ITEM",
} as const;

export type Action =
  | { type: string; payload: Timesheet[] }
  | { type: string; payload: Timesheet }
  | { type: string; payload: string }
  | {
      type: string;
      payload: {
        timesheetId: string;
        newItem: TimesheetItem;
      };
    }
  | {
      type: string;
      payload: {
        timesheetId: string;
        itemId: string;
      };
    };

export const timesheetReducer = (state: Timesheet[], action: Action) => {
  switch (action.type) {
    case timesheetActions.SET_TIMESHEETS: {
      return action.payload;
    }
    case timesheetActions.ADD_TIMESHEET: {
      return [...state, action.payload];
    }
    case timesheetActions.UPDATE_TIMESHEET: {
      const timesheet = action.payload as Timesheet;
      return state.map((ts) => (ts.id === timesheet.id ? action.payload : ts));
    }
    case timesheetActions.DELETE_TIMESHEET: {
      const timesheetId = action.payload;
      return state.filter((ts) => ts.id !== timesheetId);
    }
    case timesheetActions.ADD_TIMESHEET_ITEM: {
      const { timesheetId, newItem } = action.payload as {
        timesheetId: string;
        newItem: TimesheetItem;
      };

      return state.map((ts) => {
        if (ts.id === timesheetId) {
          return {
            ...ts,
            items: [...ts.items, newItem],
            updatedAt: Timestamp.fromDate(new Date()),
          };
        }
        return ts;
      });
    }
    case timesheetActions.DELETE_TIMESHEET_ITEM: {
      const { timesheetId, itemId } = action.payload as {
        timesheetId: string;
        itemId: string;
      };
      return state.map((ts) => {
        if (ts.id === timesheetId) {
          return {
            ...ts,
            items: ts.items.filter((item) => {
              return item.id !== itemId;
            }),
          };
        }
        return ts;
      });
    }
    case timesheetActions.UPDATE_TIMESHEET_ITEM: {
      const { timesheetId, newItem } = action.payload as {
        timesheetId: string;
        newItem: TimesheetItem;
      };
      return state.map((ts) => {
        if (ts.id === timesheetId) {
          return {
            ...ts,
            items: ts.items.map((item) => {
              if (item.id === newItem.id) {
                return newItem;
              }
              return item;
            }),
          };
        }
        return ts;
      });
    }
    default: {
      throw new Error(`Unknown action type: ${action.type}`);
    }
  }
};

export const calculateHoursWorked = (
  inTime: Timestamp,
  outTime: Timestamp
): number => {
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
    const docRef = await doc(timesheetsCollection);

    const { items, ...timesheetData } = {
      ...data,
      id: docRef.id,
      hoursWorked: calculateTotalHours(data.items),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    await setDoc(docRef, timesheetData);

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
  addToUndoStack: any,
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
  item: TimesheetItem,
  dispatch: any
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
    const docRef = await doc(itemsCollection);
    const itemData = {
      ...item,
      id: docRef.id,
      hoursWorked: calculateHoursWorked(item.in, item.out),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    await setDoc(docRef, itemData);
    dispatch({
      type: timesheetActions.ADD_TIMESHEET_ITEM,
      payload: { timesheetId: timesheetId, item: itemData },
    });
    console.log("Timesheet item added with ID:", docRef.id);
  } catch (error) {
    console.error("Error saving timesheet item:", error);
    throw error;
  }
};

export const updateTimesheetItem = async (
  userId: string,
  timesheetId: string,
  itemId: string,
  updatedItem: Partial<TimesheetItem>
) => {
  try {
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
  userId: string,
  timesheetId: string,
  itemId: string,
  dispatch: any
) => {
  try {
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
    dispatch({
      type: timesheetActions.DELETE_TIMESHEET_ITEM,
      payload: { timesheetId, itemId },
    });
    console.log("Timesheet item deleted with ID:", itemId);
  } catch (error) {
    console.error("Error deleting timesheet item:", error);
    throw error;
  }
};
