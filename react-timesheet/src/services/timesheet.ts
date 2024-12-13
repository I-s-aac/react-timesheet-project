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
  getDoc,
} from "firebase/firestore";
import { undoTypes } from "@/contexts/UndoContext";

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
};

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
  userId: string,
  timesheetId: string,
  dispatch: any,
  addToUndoStack: any
) => {
  try {
    const timesheetDoc = doc(db, "users", userId, "timesheets", timesheetId);
    const itemsSubcollection = getItemsSubcollection(userId, timesheetId);
    const itemsSnapshot = await getDocs(itemsSubcollection);

    // Capture the data to be deleted, for undo functionality
    const timesheetSnapshot = await getDoc(timesheetDoc);
    const timesheetData = timesheetSnapshot.exists()
      ? timesheetSnapshot.data()
      : null;
    const itemsData = itemsSnapshot.docs.map((doc) => doc.data());
    if (timesheetData) {
      const timesheetLocation = `users/${userId}/timesheets/${timesheetId}`;
      const itemsLocation = `${timesheetLocation}/items`;

      const data = [];
      const locations = [];
      const functions = [];

      // add TimesheetItems to be restored
      for (let i = 0; i < itemsData.length; i++) {
        const item = itemsData[i];
        const location = `${itemsLocation}/${itemsData[i].id}`;

        if (item?.id && item?.in && item?.out && item?.title) {
          const item2 = item as TimesheetItem; // fixes item being seen as DocumentData instead of TimesheetItem
          data.push(item);
          locations.push(location);
          functions.push(() => {
            restoreTimesheetItem(item2, location, dispatch);
          });
        }
      }

      if (timesheetData) {
        data.push(timesheetData);
        locations.push(timesheetLocation);
        functions.push(() =>
          restoreTimesheet(
            timesheetData,
            itemsData,
            timesheetLocation,
            dispatch
          )
        );
      }
      addToUndoStack(undoTypes.DELETE, data, locations, functions);
    }

    // delete the items subcollection before the timesheet doc
    for (const itemDoc of itemsSnapshot.docs) {
      await deleteDoc(doc(itemsSubcollection, itemDoc.id));
    }
    // delete the timesheet doc
    await deleteDoc(timesheetDoc);

    // update state
    dispatch({ type: timesheetActions.DELETE_TIMESHEET, payload: timesheetId });
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
      payload: { timesheetId: timesheetId, newItem: itemData },
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
  item: TimesheetItem,
  dispatch: any,
  addToUndoStack: any
) => {
  try {
    const location = `users/${userId}/timesheets/${timesheetId}/items/${item.id}`;

    const itemDoc = doc(db, location);
    const snapshot = await getDoc(itemDoc);

    const value = snapshot.data();

    addToUndoStack(
      undoTypes.DELETE,
      [item],
      [location],
      [() => restoreTimesheetItem(item, location, dispatch)]
    );

    await deleteDoc(itemDoc);

    dispatch({
      type: timesheetActions.DELETE_TIMESHEET_ITEM,
      payload: { timesheetId, itemId: item.id },
    });
    console.log("Timesheet item deleted: ", item);
  } catch (error) {
    console.error("Error deleting timesheet item:", error);
    throw error;
  }
};

const restoreTimesheet = (
  value: any,
  items: any,
  location: string,
  setTimesheets: Function
) => {
  // Extract the timesheet ID from the location
  const timesheetId = location.split("/").pop();
  value = { ...value, items: items };
  setTimesheets({
    type: timesheetActions.ADD_TIMESHEET,
    payload: { ...value, id: timesheetId },
  });
};

const restoreTimesheetItem = (
  value: TimesheetItem,
  location: string,
  setTimesheets: Function
) => {
  // Extract the timesheet ID from the location
  const segments = location.split("/");
  const timesheetId = segments[segments.length - 3];

  setTimesheets({
    type: timesheetActions.ADD_TIMESHEET_ITEM,
    payload: { timesheetId, newItem: value },
  });
};
