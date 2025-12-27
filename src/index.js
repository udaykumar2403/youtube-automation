import dotenv from "dotenv";
dotenv.config();

import { readSheet, updateStatus } from "./services/sheets.service.js";
import { uploadShort } from "./services/youtube.service.js";

const DAILY_LIMIT = 1;

(async () => {
  const rows = await readSheet();

  // ✅ ONLY pick rows that are strictly pending
  const candidates = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row[5] === "pending")
    .slice(0, DAILY_LIMIT);

  if (candidates.length === 0) {
    console.log("✅ No pending videos to upload today");
    return;
  }

  for (const { row, index } of candidates) {
    const [videoUrl, title, description, tags, thumbnailUrl] = row;

    try {
      // 🔒 STEP 1: Lock the row BEFORE upload
      await updateStatus(index, "uploading");

      // 🚀 STEP 2: Upload the video
      await uploadShort({
        videoUrl,
        title,
        description,
        tags,
        thumbnailUrl,
      });

      // ✅ STEP 3: Upload SUCCESS → mark as uploaded
      await updateStatus(index, "uploaded");
      console.log(`✅ Uploaded & marked row ${index + 2} as uploaded`);

    } catch (err) {
      console.error("❌ Upload failed:", err.message);

      // ❌ Upload FAILED → mark as failed
      await updateStatus(index, "failed");
      console.log(`⚠️ Marked row ${index + 2} as failed`);
    }
  }
})();
