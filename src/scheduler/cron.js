import cron from "node-cron";
import { exec } from "child_process";

console.log("⏰ YouTube automation scheduler started");

// Runs every day at 10:00 AM
cron.schedule("0 10 * * *", () => {
  console.log("🚀 Running daily upload job");
  exec("node src/index.js", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Job error:", err.message);
      return;
    }
    console.log(stdout);
    if (stderr) console.error(stderr);
  });
});
