import SlackBolt from "@slack/bolt";

export const setupSubscribeCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/subscribe", async ({ command, ack }) => {
    try {
      console.log("Command received: ", command.channel_id);
      await ack({
        response_type: "ephemeral",
        text: "🚧 This feature is under construction. Please check back later! 🚧",
      });
    } catch (error) {
      console.error("Error handling message event:", error);
      await ack({
        response_type: "ephemeral",
        text: "❌ An error occurred while processing your request. Please try again later.",
      });
    }
  });

  slackApp.command("/unsubscribe", async ({ command, ack }) => {
    try {
      await ack({
        response_type: "ephemeral",
        text: "🚧 This feature is under construction. Please check back later! 🚧",
      });
    } catch (error) {
      console.error("Error handling message event:", error);
      await ack({
        response_type: "ephemeral",
        text: "❌ An error occurred while processing your request. Please try again later.",
      });
    }
  });
};
