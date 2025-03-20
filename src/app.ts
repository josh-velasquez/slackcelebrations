import pkg from '@slack/bolt';
const { App } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const APP_TOKEN = process.env.APP_TOKEN;

if (!SLACK_BOT_TOKEN || !SLACK_SIGNING_SECRET) {
  throw new Error("Missing Slack bot token or signing secret in environment variables");
}

const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: APP_TOKEN, 
});

(async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Start your app
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();