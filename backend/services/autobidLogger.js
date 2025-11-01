import fs from "fs";
import path from "path";

const logDir = process.cwd(); // project root
const logFile = path.join(logDir, "autobidlog.txt");


if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "=== AutoBid Log Started ===\n", "utf8");
}

export const autobidLogger = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    fs.appendFileSync(logFile, logEntry, "utf8");
  } catch (err) {
    console.error("Failed to write log:", err.message);
  }
};