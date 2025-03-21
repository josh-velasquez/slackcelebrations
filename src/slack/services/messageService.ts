import SlackBolt from "@slack/bolt";
import { EventType, Recurrence } from "../types/eventsUtil";

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
      } catch (error) {
        console.error(`Failed to schedule message for ${eventDate.toISOString()}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in scheduleRecurringMessages:", error);
    throw error;
  }
} 

export async function deleteRecurringScheduledMessages(date: string, userId: string, slackApp: SlackBolt.App, recurrence: Recurrence) {
  try {
    const [month, day] = date.split("-").map(Number);
    const today = new Date();
    const startYear = today.getFullYear();
    const maxFutureDate = new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 days from today
    let eventsToDelete = [];

    let startDate = new Date(startYear, month - 1, day, 10); // Set the first event to delete
    if (startDate < today) {
      startDate.setFullYear(startYear + 1);
    }

    while (startDate <= maxFutureDate) {
      eventsToDelete.push(new Date(startDate));

      if (recurrence === "monthly") {
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

    console.log("Deleting recurring messages:", {
      dates: eventsToDelete.map(d => d.toISOString()),
      recurrence,
      channel: process.env.SLACK_CHANNEL_ID
    });

    for (const eventDate of eventsToDelete) {
      const formattedDate = `${(eventDate.getMonth() + 1).toString().padStart(2, "0")}-${eventDate.getDate().toString().padStart(2, "0")}`;
      try {
        await deleteScheduledMessages(formattedDate, userId, slackApp);
        console.log(`Deleted message scheduled for ${eventDate.toISOString()}:`);
      } catch (error) {
        console.error(`Failed to delete scheduled message for ${eventDate.toISOString()}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in deleteRecurringScheduledMessages:", error);
    throw error;
  }
}

// THIS WILL DELETE ALL SCHEDULED MESSAGES
export async function deleteAllScheduledMessages(slackApp: SlackBolt.App){
  const result = await slackApp.client.chat.scheduledMessages.list({
    token: process.env.SLACK_BOT_TOKEN
  });
  
  console.log("Scheduled messages:", result);

  if(!result.scheduled_messages || result.scheduled_messages.length === 0){
    console.log("No scheduled messages found.");
    return
  }

  for (const msg of result.scheduled_messages) {
    if (!msg.channel_id || !msg.id) {
      console.warn(`Skipping message due to missing channel_id or id:`, msg);
      continue;
    }
    try {
      await slackApp.client.chat.deleteScheduledMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: msg.channel_id,
        scheduled_message_id: msg.id,
      });

      console.log(`Deleted scheduled message with ID: ${msg.id}`);
    } catch (error) {
      console.error(`Failed to delete message ${msg.id}:`, error);
    }
  }
}

export async function deleteScheduledMessages(date: string, userId: string, slackApp: SlackBolt.App) {
  try {
    const [month, day] = date.split("-").map(Number);
    const today = new Date();
    const startYear = today.getFullYear();
    const targetDate = new Date(startYear, month - 1, day, 10,); // 10 AM on the given days

    const latest = (targetDate.getTime() / 1000) + 3000
    const oldest = (targetDate.getTime() / 1000) - 3000

    // List all scheduled messages
    const result = await slackApp.client.chat.scheduledMessages.list({
      token: process.env.SLACK_BOT_TOKEN,
      latest: latest.toString(),
      oldest: oldest.toString()
    });

    console.log("Scheduled messages:", result);

    if (!result.scheduled_messages || result.scheduled_messages.length === 0) {
      console.log("No scheduled messages found.");
      return;
    }

    let messagesToDelete = result.scheduled_messages.filter((msg) => 
      msg.text?.includes(`<@${userId}>`)
    );

    if (messagesToDelete.length === 0) {
      console.log("No matching scheduled messages found.");
      return;
    }

    console.log(`Found ${messagesToDelete.length} messages to delete.`);

    // Delete each scheduled message
    for (const msg of messagesToDelete) {
      if (!msg.channel_id || !msg.id) {
        console.warn(`Skipping message due to missing channel_id or id:`, msg);
        continue;
      }
      try {
        await slackApp.client.chat.deleteScheduledMessage({
          token: process.env.SLACK_BOT_TOKEN,
          channel: msg.channel_id,
          scheduled_message_id: msg.id,
        });

        console.log(`Deleted scheduled message with ID: ${msg.id}`);
      } catch (error) {
        console.error(`Failed to delete message ${msg.id}:`, error);
      }
    }


  } catch (error) {
    console.error("Error in deleteScheduledMessages:", error);
    throw error;
  }
}