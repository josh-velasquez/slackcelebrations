import SlackBolt from "@slack/bolt";

export const setupSlackApp = () => {
  const { App } = SlackBolt;

  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN || "",
    signingSecret: process.env.SLACK_SIGNING_SECRET || "",
    socketMode: true,
    appToken: process.env.APP_TOKEN || "",
  });

  slackApp.command("/birthday", async ({ command, ack}) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})/);
      if (!match) {
        console.error("Invalid format. Expected: /birthday @user MM-DD");
        return;
      }
      const userId = match[1];
      const date = match[2];
      const message = `🎉🎂 *Happy Birthday <@${userId}>!* 🎂🎉\n🎈Wishing you a fantastic day! 🎁`

      await scheduleMessage(date, message)
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });

  slackApp.command("/work-anniversary", async ({ command, ack}) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{4}-\d{2}-\d{2})/);
      if (!match) {
        console.error("Invalid format. Expected: /work-anniversary @user YYYY-MM-DD");
        return;
      }
      const userId = match[1];
      const date = match[2];
      const MMDD = date.split("-").slice(1).join("-");
      const year = date.split("-")[0];
      const currentYear = new Date().getFullYear();
      const years = currentYear - parseInt(year);
      const message = `🎉🎈 *Happy Work Anniversary <@${userId}>!* 🎈🎉\n🎉 Congratulations on ${years} years with us! 🎁`

      await scheduleMessage(MMDD, message)
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });

  slackApp.command("/custom-celebration", async ({ command, ack}) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})\s+(\w+)\s+(.+)/);
      if (!match) {
        console.error("Invalid format. Expected: /custom-celebration @user MM-DD recurrence description");
        return;
      }
      
      const userId = match[1];
      const date = match[2];
      const recurrence = match[3].toLowerCase(); // e.g., "yearly", "monthly"
      const description = match[4];
      const message = `🎉 *${description} for <@${userId}>!* 🎉\nLet's celebrate this special day! 🎁`;

      await scheduleRecurringMessages(date, message, recurrence);
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
  
  slackApp.command("/help", async ({ command, ack}) => {
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

  async function scheduleRecurringMessages(date: string, message: string, recurrence: string) {
    const [month, day] = date.split("-").map(Number);
    const today = new Date();
    const startYear = today.getFullYear();
    const maxFutureDays = 120; // Slack limit, we can only schedule messages up to 120 days in the future
    let eventsToSchedule = [];
  
    let startDate = new Date(startYear, month - 1, day, 10); // Set the first event
    if (startDate < today) {
      startDate.setFullYear(startYear + 1);
    }
  
    while (eventsToSchedule.length < 10) { // Schedule multiple occurrences in chunks of 120 days
      if (recurrence === "yearly") {
        eventsToSchedule.push(new Date(startDate));
        startDate.setFullYear(startDate.getFullYear() + 1);
      } else if (recurrence === "monthly") {
        eventsToSchedule.push(new Date(startDate));
        startDate.setMonth(startDate.getMonth() + 1);
      } else if (recurrence === "weekly") {
        for (let i = 0; i < Math.floor(maxFutureDays / 7); i++) {
          eventsToSchedule.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 7);
        }
      } else if (recurrence === "daily") {
        for (let i = 0; i < maxFutureDays; i++) {
          eventsToSchedule.push(new Date(startDate));
          startDate.setDate(startDate.getDate() + 1);
        }
      } else {
        console.error("Invalid recurrence type:", recurrence);
        return;
      }
    }
  
    for (const eventDate of eventsToSchedule) {
      if (eventDate < today) continue;
      const time = Math.floor(eventDate.getTime() / 1000);
      await slackApp.client.chat.scheduleMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: process.env.SLACK_CHANNEL_ID || "",
        post_at: time,
        text: message,
      });
    }
  
    console.log("Scheduled events:", eventsToSchedule);
  }
  

  async function scheduleMessage (date: string, message: string) {
    const [month, day] = date.split("-");
    const today = new Date();
    const eventDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day), 10);
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    const time = eventDate.getTime();
    const job = await slackApp.client.chat.scheduleMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL_ID || "",
      post_at: time / 1000,
      text: message,
    });
    console.log("Scheduled message:", job);
  }

  return slackApp;
};