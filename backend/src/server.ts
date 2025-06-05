import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { PORT } from "@config";
import router from "./routes";
import { sequelize } from "./sequilizedir/models";

const app: Express = express();
const port = PORT ?? 3000;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
app.use("/", router);
const connectWithRetry = async () => {
  try {
    await sequelize.authenticate();
    console.log("info", "Connection has been established successfully.");
  } catch (error) {
    console.log("error", "Unable to connect to the database:", error);
    setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
  }
};

connectWithRetry();

server.listen(port, () => {
  console.log("=================================");
  console.log("======= ENV:", port, "========");
  console.log("=================================");
});
