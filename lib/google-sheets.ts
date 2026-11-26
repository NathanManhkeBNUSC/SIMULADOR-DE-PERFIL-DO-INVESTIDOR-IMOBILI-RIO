import { google } from "googleapis";

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error("As credenciais do Google Sheets não foram configuradas.");
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function appendLeadRow(values: (string | number | boolean | Date)[]) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE || "Leads!A:N";

  if (!spreadsheetId) throw new Error("ID da planilha CRM não configurado.");

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values.map((value) => value instanceof Date ? value.toISOString() : value)] },
  });

  const updatedRange = response.data.updates?.updatedRange || "";
  const rowNumber = Number(updatedRange.match(/![A-Z]+(\d+)/)?.[1]);

  return { rowNumber: Number.isFinite(rowNumber) ? rowNumber : null };
}

export async function updateEmailStatus(rowNumber: number, status: string) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("ID da planilha CRM não configurado.");

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Leads!N${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}
