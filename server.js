import { createServer } from "http";
import app from "./app.js";
import { config } from "./api/config/config.js";
import { initDb } from "./api/database/usersTable.js";

const server = createServer(app);

const startServer = async () => {
  try {
    console.log("Database connecting....");

    // 1. Actually call the test function
    await initDb();
    console.log("✅ Database connected successfully!");

    // 2. Start the server ONLY if DB connects
    server.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // Kill the server if DB is dead
  }
};

// 3. Execute the function
startServer();  


