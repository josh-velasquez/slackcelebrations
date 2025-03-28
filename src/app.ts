import express from "express";
import { mainRouter } from "./routes/index.js";
import dotenv from "dotenv";
import { setupSlackApp, startSlackApp } from "./slack/app.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4343;

const main = async () => {
  const slackApp = await setupSlackApp();
  await startSlackApp(slackApp);
};

main().catch((error) => {
  console.error("Error starting the application:", error);
  process.exit(1);
});

app.use("/", mainRouter);

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});

export { app };