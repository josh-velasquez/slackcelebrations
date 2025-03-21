import SlackBolt from "@slack/bolt";
import { initializeCommands } from "./commands";
import { setupCronJobs } from "./services/cronService";

export const setupSlackApp = async () => {
  const { App } = SlackBolt;

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN || "",
    signingSecret: process.env.SLACK_SIGNING_SECRET || "",
    socketMode: true,
    appToken: process.env.APP_TOKEN || "",
  });

  initializeCommands(slackApp);
  await setupCronJobs(slackApp);
  return slackApp;
};

export const startSlackApp = async (slackApp: SlackBolt.App) => {
  const port = process.env.SLACK_PORT || 4344;
  await slackApp.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
}; 