import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

const credentials = JSON.parse(fs.readFileSync("credentials.json"));

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/youtube.upload"
];

const auth = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

export async function getAuthClient() {
  if (fs.existsSync("token.json")) {
    const token = JSON.parse(fs.readFileSync("token.json"));
    auth.setCredentials(token);
    return auth;
  }

  const authUrl = auth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🔑 AUTHORIZE THIS APP:\n");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("\nPaste the code from browser here: ", async (code) => {
      rl.close();

      const { tokens } = await auth.getToken(code);
      auth.setCredentials(tokens);

      fs.writeFileSync("token.json", JSON.stringify(tokens, null, 2));
      console.log("✅ token.json saved successfully");

      resolve(auth);
    });
  });
}
