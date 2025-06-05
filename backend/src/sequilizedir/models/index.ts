import { Sequelize } from "sequelize-typescript";
import { DATABASE_URL } from "@/config";
import User from "./user.model";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  timezone: "+00:00", // UTC timezone
  dialectOptions: {
    timezone: "+00:00",
  },
  pool: {
    max: 20, // Increased max connections
    min: 5, // Maintain minimum idle connections
    idle: 10000, // Release idle connections after 10 seconds
    acquire: 60000, // Allow up to 60 seconds for acquiring a connection
  },
  retry: {
    max: 5,
    match: [/ETIMEDOUT/, /ECONNREFUSED/],
  },
  // logging: NODE_ENV !== "production" && logger.info.bind(null, "\n%s"),
});

sequelize.addModels([User]);

const db = {
  sequelize,
  User,
};

export { db, sequelize };
