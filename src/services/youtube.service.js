import fs from "fs";
import { google } from "googleapis";
import { getAuthClient } from "../config/google.js";

export async function uploadShort({
  videoPath,
  title,
  description,
  tags,
  thumbnailPath,
}) {
  const auth = await getAuthClient();
  const youtube = google.youtube({ version: "v3", auth });

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

  if (thumbnailPath && fs.existsSync(thumbnailPath)) {
    await youtube.thumbnails.set({
      videoId,
      media: {
        body: fs.createReadStream(thumbnailPath),
      },
    });
  }

  console.log("✅ Uploaded video ID:", videoId);
}
