import { google } from "googleapis";
import { getAuthClient } from "../config/google.js";

const SHEET_NAME = "Sheet1";

export async function readSheet() {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:F`,
  });

  return res.data.values || [];
}

export async function updateStatus(rowIndex, status) {
  const auth = await getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const rowNumber = rowIndex + 2; // because header is row 1

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${SHEET_NAME}!F${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[status]],
    },
  });
}
