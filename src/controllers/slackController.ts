import SlackBolt from "@slack/bolt";

export const setupSlackApp = () => {
  const { App } = SlackBolt;

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN || "",
    signingSecret: process.env.SLACK_SIGNING_SECRET || "",
    socketMode: true,
    appToken: process.env.APP_TOKEN || "",
  });

  slackApp.command("/birthday", async ({ command, ack, say }) => {
    // the command argument contains the text that the user entered after the command 
    // e.g /birthday @Josh 10-10 will give command.text = <@U07RL8L14R2|josh.velasquez> 10-10, the left number is the user id
    try {
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
  slackApp.command("/work-anniversary", async ({ command, ack, say }) => {
    try {
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
  slackApp.command("/custom-celebration", async ({ command, ack, say }) => {
    try {
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
  slackApp.command("/help", async ({ command, ack, say }) => {
    const helpMessage = `👋 *Hello <@${command.user_id}>! Here's what I can do:*\n
    🎂 *\`/birthday [@user] [MM-DD]\`*  
    → Registers a user's birthday. I'll send a celebration message every year on that date! 🎉  

    🎊 *\`/work-anniversary [@user] [YYYY-MM-DD]\`*  
    → Records a work anniversary date. I’ll send a message every year on that day to celebrate their milestone! 🎈  

    🎁 *\`/custom-celebration [@user] [MM-DD] [recurrence] [description] \`*  
    → Create a custom recurring celebration for a user!  
    *Example:* \`/custom-celebration @john 09-15 yearly Hot Dog Day\` will remind everyone every year on Sept 15! 🌭  

    🆘 *\`/help\`*  
    → Shows this list of commands so you never forget what I can do! 🤖  

    \n
    *Additional Notes:*
    - For the \`[@user]\` parameter, you can mention them directly
       → Example: \`/birthday @UserJohn 10-10\`
    - For the \`[recurrence]\` parameter, you can use the following keywords: \`yearly, monthly, weekly, daily\`
    - For the \`[description]\` parameter, you can write a custom message to be displayed in the reminder\n

    Let me know if you need anything else! 🚀`;
    try {
      await ack(helpMessage);
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });

  return slackApp;
};