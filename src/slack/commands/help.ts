import SlackBolt from "@slack/bolt";

export const setupHelpCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/help", async ({ command, ack }) => {
    const helpMessage = `👋 *Hello <@${command.user_id}>! Here's what I can do:*\n
    🎂 *\`/birthday [@user] [MM-DD]\`*  
    → Registers a user's birthday. I'll send a celebration message every year on that date! 🎉  

    🎊 *\`/work-anniversary [@user] [YYYY-MM-DD]\`*  
    → Records a work anniversary date. I'll send a message every year on that day to celebrate their milestone! 🎈  

    🎁 *\`/custom-celebration [@user] [MM-DD] [recurrence] [description] \`*  
    → Create a custom recurring celebration for a user!  
    *Example:* \`/custom-celebration @john 09-15 yearly Hot Dog Day\` will remind everyone every year on Sept 15! 🌭  

    🆘 *\`/help\`*  
    → Shows this list of commands so you never forget what I can do! 🤖  

    \n
    *Additional Notes:*
    - For the \`[@user]\` parameter, you can mention them directly
       → Example: \`/birthday @UserJohn 10-10\`
    - For the \`[recurrence]\` parameter, you can use the following keywords: \`yearly, monthly, weekly, daily, once\`
    - For the \`[description]\` parameter, you can write a custom message to be displayed in the reminder\n

    Let me know if you need anything else! 🚀`;

    try {
      await ack(helpMessage);
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
}; 