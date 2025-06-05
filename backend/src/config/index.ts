import { config } from "dotenv";
config({ path: `.env.${process.env.NODE_ENV || "development"}` });
export const { PORT, DATABASE_URL } = process.env;
