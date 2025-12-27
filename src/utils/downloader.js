import fs from "fs";
import fetch from "node-fetch";
import path from "path";

/**
 * Converts Google Drive "view" links to direct download links
 */
function normalizeDriveUrl(url) {
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new Error("Invalid Google Drive link format");
    }
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;

  }
  return url;
}

export async function downloadFile(originalUrl, ext) {
  const url = normalizeDriveUrl(originalUrl);

  const filePath = path.join(
    "/tmp",
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  );

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.statusText}`);
  }

  const fileStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  return filePath;
}
