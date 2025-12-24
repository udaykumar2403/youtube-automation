import fs from "fs";
import { google } from "googleapis";

// 1️⃣ Load credentials (Secrets first, file fallback)
const credentials = process.env.GOOGLE_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
  : JSON.parse(fs.readFileSync("credentials.json", "utf-8"));

// 2️⃣ Create OAuth client
const auth = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

// 3️⃣ Load token (Secrets first, file fallback)
export async function getAuthClient() {
  if (process.env.GOOGLE_TOKEN) {
    auth.setCredentials(JSON.parse(process.env.GOOGLE_TOKEN));
    return auth;
  }

  if (fs.existsSync("token.json")) {
    auth.setCredentials(
      JSON.parse(fs.readFileSync("token.json", "utf-8"))
    );
    return auth;
  }

  throw new Error(
    "❌ No OAuth token found. Add GOOGLE_TOKEN secret or token.json"
  );
}
