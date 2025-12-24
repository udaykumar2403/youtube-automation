import dotenv from "dotenv";
dotenv.config();

import { readSheet, updateStatus } from "./services/sheets.service.js";
import { uploadShort } from "./services/youtube.service.js";

const DAILY_LIMIT = 1; // 🔥 change later if needed

(async () => {
  const rows = await readSheet();

  // Pick rows eligible for upload
  const candidates = rows
    .map((row, index) => ({ row, index }))
    .filter(
      ({ row }) =>
        row[5] === "pending" || row[5] === "retry"
    )
    .slice(0, DAILY_LIMIT);

  if (candidates.length === 0) {
    console.log("✅ No videos to upload today");
    return;
  }

  for (const { row, index } of candidates) {
    const [
      videoPath,
      title,
      description,
      tags,
      thumbnailPath,
    ] = row;

    try {
      await uploadShort({
        videoPath,
        title,
        description,
        tags,
        thumbnailPath,
      });

      await updateStatus(index, "uploaded");
      console.log(`✅ Uploaded & marked row ${index + 2}`);
    } catch (err) {
      console.error("❌ Upload failed:", err.message);

      // First failure → retry
      const currentStatus = row[5];
      const newStatus =
        currentStatus === "pending" ? "retry" : "failed";

      await updateStatus(index, newStatus);
      console.log(`⚠️ Marked row ${index + 2} as ${newStatus}`);
    }
  }
})();
