import { App } from "@slack/bolt";

export const startSlackApp = async (slackApp: App) => {
  const port = process.env.SLACK_PORT || 4344;
  await slackApp.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
};