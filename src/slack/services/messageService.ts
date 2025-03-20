import SlackBolt from "@slack/bolt";

export async function scheduleMessage(date: string, message: string, slackApp: SlackBolt.App) {
  try {
    const [month, day] = date.split("-");
    const today = new Date();
    const eventDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day), 10);
    if (eventDate < today) {
      eventDate.setFullYear(today.getFullYear() + 1);
    }
    const time = eventDate.getTime();
    
    console.log("Attempting to schedule message:", {
      date: eventDate.toISOString(),
      time: time / 1000,
      channel: process.env.SLACK_CHANNEL_ID
    });

    const result = await slackApp.client.chat.scheduleMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL_ID || "",
      post_at: time / 1000,
      text: message,
    });

    console.log("Message scheduled successfully:", result);
    return result;
  } catch (error) {
    console.error("Error in scheduleMessage:", error);
    throw error;
  }
}

export async function scheduleRecurringMessages(
  date: string,
  message: string,
  recurrence: string,
  slackApp: SlackBolt.App
) {
  try {
    const [month, day] = date.split("-").map(Number);
    const today = new Date();
    const startYear = today.getFullYear();
    const maxFutureDate = new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 days from today
    let eventsToSchedule = [];

    let startDate = new Date(startYear, month - 1, day, 10); // Set the first event
    if (startDate < today) {
      startDate.setFullYear(startYear + 1);
    }

    while (startDate <= maxFutureDate) {
      eventsToSchedule.push(new Date(startDate));

      if (recurrence === "yearly") {
        startDate.setFullYear(startDate.getFullYear() + 1);
      } else if (recurrence === "monthly") {
        startDate.setMonth(startDate.getMonth() + 1);
      } else if (recurrence === "weekly") {
        startDate.setDate(startDate.getDate() + 7);
      } else if (recurrence === "daily") {
        startDate.setDate(startDate.getDate() + 1);
      } else if (recurrence === "once") {
        break;
      }else {
        console.error("Invalid recurrence type:", recurrence);
        return;
      }
    }

    console.log("Scheduling recurring messages:", {
      dates: eventsToSchedule.map(d => d.toISOString()),
      recurrence,
      channel: process.env.SLACK_CHANNEL_ID
    });

    for (const eventDate of eventsToSchedule) {
      const time = Math.floor(eventDate.getTime() / 1000);
      try {
        const result = await slackApp.client.chat.scheduleMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: process.env.SLACK_CHANNEL_ID || "",
          post_at: time,
          text: message,
        });
        console.log(`Message scheduled for ${eventDate.toISOString()}:`, result);
      } catch (error) {
        console.error(`Failed to schedule message for ${eventDate.toISOString()}:`, error);
        throw error;
      }
    }

    return eventsToSchedule;
  } catch (error) {
    console.error("Error in scheduleRecurringMessages:", error);
    throw error;
  }
} 