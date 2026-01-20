import { createServer } from "http";
import app from "./app.js";
import { config } from "./api/config/config.js";

const server = createServer(app);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
