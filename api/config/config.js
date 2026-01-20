import { configDotenv } from "dotenv";

configDotenv();

export const config = {
  port: process.env.PORT,
};
