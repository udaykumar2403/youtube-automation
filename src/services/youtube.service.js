import fs from "fs";
import { google } from "googleapis";
import { getAuthClient } from "../config/google.js";
import { downloadFile } from "../utils/downloader.js";

export async function uploadShort({
  videoUrl,
  title,
  description,
  tags,
  thumbnailUrl,
}) {
  const auth = await getAuthClient();
  const youtube = google.youtube({ version: "v3", auth });

  console.log("⬇️ Downloading video...");
  const videoPath = await downloadFile(videoUrl, "mp4");

  let thumbnailPath = null;
  if (thumbnailUrl) {
    console.log("⬇️ Downloading thumbnail...");
    thumbnailPath = await downloadFile(thumbnailUrl, "jpg");
  }

  console.log("🚀 Uploading:", title);

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description,
        tags: tags.split(",").map(t => t.trim()),
        categoryId: "22",
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;

  if (thumbnailPath) {
    await youtube.thumbnails.set({
      videoId,
      media: {
        body: fs.createReadStream(thumbnailPath),
      },
    });
    console.log("🖼️ Thumbnail uploaded");
  }

  // Cleanup
  fs.unlinkSync(videoPath);
  if (thumbnailPath) fs.unlinkSync(thumbnailPath);

  console.log("🧹 Temp files deleted");
  console.log("✅ Uploaded video ID:", videoId);
}
