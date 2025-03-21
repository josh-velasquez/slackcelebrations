import SlackBolt from "@slack/bolt";
import { EventType, Recurrence } from "../types/eventsUtil";
import { MAX_DATE_THRESHOLD } from "./eventSchedulerService";
import { giphyService } from "../../services/giphyService";
import {
  calculateNextDate,
  calculateStartDate,
  PostTime,
} from "../types/messageUtil";

// Default post time: 10:00 AM
export const DEFAULT_POST_AT_TIME: PostTime = {
  hour: 10,
  minute: 0,
};

interface MessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  image_url?: string;
  alt_text?: string;
}

async function createMessageBlocks(
  message: string,
  eventType: EventType
): Promise<MessageBlock[]> {
  const gifUrl = await giphyService.getCelebrationGif(eventType);
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: message,
      },
    },
    {
      type: "image",
      image_url: gifUrl,
      alt_text: "Celebration GIF",
    },
  ];
}

async function scheduleSlackMessage(
  slackApp: SlackBolt.App,
  message: string,
  postAt: number,
  blocks: MessageBlock[]
): Promise<any> {
  return slackApp.client.chat.scheduleMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL_ID || "",
    post_at: postAt,
    text: message,
    blocks,
  });
}

export async function scheduleMessage(
  date: string,
  message: string,
  slackApp: SlackBolt.App,
  eventType: EventType
) {
  try {
    const eventDate = calculateStartDate(date, DEFAULT_POST_AT_TIME);
    const maxDate = new Date(new Date().getTime() + MAX_DATE_THRESHOLD);

    if (eventDate > maxDate) {
      throw new Error("Event date is too far in the future");
    }

    const postAt = Math.floor(eventDate.getTime() / 1000);
    const blocks = await createMessageBlocks(message, eventType);

    console.log("Attempting to schedule message:", {
      date: eventDate.toISOString(),
      time: postAt,
      channel: process.env.SLACK_CHANNEL_ID,
    });

    const result = await scheduleSlackMessage(
      slackApp,
      message,
      postAt,
      blocks
    );
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
  recurrence: Recurrence,
  slackApp: SlackBolt.App,
  eventType: EventType
) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for proper date comparison

    const maxFutureDate = new Date(today.getTime() + MAX_DATE_THRESHOLD);
    const eventsToSchedule: Date[] = [];

    // Initialize start date
    let startDate = calculateStartDate(date, DEFAULT_POST_AT_TIME);

    // For recurring events, we want to include all future dates including today
    while (startDate <= maxFutureDate) {
      eventsToSchedule.push(new Date(startDate));
      const nextDate = calculateNextDate(startDate, recurrence);

      // Break if the next date is not moving forward
      if (nextDate <= startDate) {
        console.warn("Next date is not moving forward, breaking loop:", {
          currentDate: startDate.toISOString(),
          nextDate: nextDate.toISOString(),
        });
        break;
      }

      startDate = nextDate;
    }

    console.log("Scheduling recurring messages:", {
      today: today.toISOString(),
      initialDate: date,
      dates: eventsToSchedule.map((d) => d.toISOString()),
      recurrence,
      channel: process.env.SLACK_CHANNEL_ID,
    });

    // Schedule messages for all dates
    for (const eventDate of eventsToSchedule) {
      try {
        const time = Math.floor(eventDate.getTime() / 1000);
        console.log("Scheduling message for:", {
          date: eventDate.toISOString(),
          unixTime: time,
          message,
        });

        const blocks = await createMessageBlocks(message, eventType);
        const result = await scheduleSlackMessage(
          slackApp,
          message,
          time,
          blocks
        );
        console.log("Successfully scheduled message:", {
          date: eventDate.toISOString(),
          result,
        });
      } catch (error) {
        console.error(
          `Failed to schedule message for ${eventDate.toISOString()}:`,
          error
        );
        throw error;
      }
    }

    return eventsToSchedule;
  } catch (error) {
    console.error("Error in scheduleRecurringMessages:", error);
    throw error;
  }
}

export async function deleteRecurringScheduledMessages(
  date: string,
  userId: string,
  slackApp: SlackBolt.App,
  recurrence: Recurrence
) {
  try {
    const today = new Date();
    const maxFutureDate = new Date(today.getTime() + MAX_DATE_THRESHOLD);
    const eventsToDelete: Date[] = [];

    // Initialize start date
    let startDate = calculateStartDate(date, DEFAULT_POST_AT_TIME);

    // Skip initial date for recurring events
    if (recurrence !== "once") {
      startDate = calculateNextDate(startDate, recurrence);
    }

    // Generate all dates up to maxFutureDate
    while (startDate <= maxFutureDate) {
      eventsToDelete.push(new Date(startDate));
      startDate = calculateNextDate(startDate, recurrence);
    }

    console.log("Deleting recurring messages:", {
      dates: eventsToDelete.map((d) => d.toISOString()),
      recurrence,
      channel: process.env.SLACK_CHANNEL_ID,
    });

    for (const eventDate of eventsToDelete) {
      const formattedDate = `${(eventDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${eventDate.getDate().toString().padStart(2, "0")}`;
      try {
        await deleteScheduledMessages(formattedDate, userId, slackApp);
        console.log(
          `Deleted message scheduled for ${eventDate.toISOString()}:`
        );
      } catch (error) {
        console.error(
          `Failed to delete scheduled message for ${eventDate.toISOString()}:`,
          error
        );
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in deleteRecurringScheduledMessages:", error);
    throw error;
  }
}

// THIS WILL DELETE ALL SCHEDULED MESSAGES
export async function deleteAllScheduledMessages(slackApp: SlackBolt.App) {
  const result = await slackApp.client.chat.scheduledMessages.list({
    token: process.env.SLACK_BOT_TOKEN,
  });

  console.log("Scheduled messages:", result);

  if (!result.scheduled_messages || result.scheduled_messages.length === 0) {
    console.log("No scheduled messages found.");
    return;
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

export async function deleteScheduledMessages(
  date: string,
  userId: string,
  slackApp: SlackBolt.App
) {
  try {
    const targetDate = calculateStartDate(date, DEFAULT_POST_AT_TIME);
    const latest = targetDate.getTime() / 1000 + 3000;
    const oldest = targetDate.getTime() / 1000 - 3000;

    // List all scheduled messages
    const result = await slackApp.client.chat.scheduledMessages.list({
      token: process.env.SLACK_BOT_TOKEN,
      latest: latest.toString(),
      oldest: oldest.toString(),
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
