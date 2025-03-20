import express from "express";
import { mainRouter } from "./routes";
import dotenv from "dotenv";
import { setupSlackApp } from "./controllers/slackController";
import { startSlackApp } from "./services/slackService";

dotenv.config();

const app = express();
const port = process.env.PORT || 4343;

const slackApp = setupSlackApp();
startSlackApp(slackApp);

app.use("/", mainRouter);

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});

export { app };