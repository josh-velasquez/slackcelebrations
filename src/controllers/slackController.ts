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

  slackApp.command("/birthday", async ({ command, ack, say }) => {
    // the command argument contains the text that the user entered after the command 
    // e.g /birthday @Josh 10-10 will give command.text = <@U07RL8L14R2|josh.velasquez> 10-10, the left number is the user id
    try {
      await ack("Your event has been registered, we will announce it on the day!");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });

  return slackApp;
};