// // src/services/drive.ts
// import { google } from "googleapis";

// export const uploadToDrive = async (authToken: string, file: Blob) => {
//   const drive = google.drive({ version: "v3", auth: authToken });
//   const fileMetadata = { name: "timesheet.json" };
//   const media = { mimeType: "application/json", body: file };

//   try {
//     const response = await drive.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: "id",
//     });
//     return response.data.id; // Return the ID of the uploaded file
//   } catch (error) {
//     console.error("Error uploading to Google Drive:", error);
//     throw error;
//   }
// };
