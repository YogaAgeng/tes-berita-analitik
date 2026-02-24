import app from "./app.js";
import { testConnection } from "./lib/db.js";

const PORT = process.env.PORT || 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 20, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await testConnection();
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`Database not ready (attempt ${attempt}/${retries}), retrying...`);
      await wait(delayMs);
    }
  }
};

const start = async () => {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
