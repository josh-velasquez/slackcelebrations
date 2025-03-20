import SlackBolt from "@slack/bolt";

export const setupSlackApp = () => {
  const { App } = SlackBolt;

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN || "",
    signingSecret: process.env.SLACK_SIGNING_SECRET || "",
    socketMode: true,
    appToken: process.env.APP_TOKEN || "",
  });

  slackApp.message("hey", async ({ message, say }) => {
    try {
      await say("Yaaay! that command works!");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });

  return slackApp;
};