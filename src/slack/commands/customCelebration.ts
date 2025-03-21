import SlackBolt from "@slack/bolt";
import { scheduleRecurringMessages } from "../services/messageService";
import { databaseService } from "../services/databaseService";
import { Event, Recurrence } from "../types/eventsUtil";

export const getCustomCelebrationMessage = (
  userId: string,
  description: string
) =>
  `🎉 *${description} for <@${userId}>!* 🎉\nLet's celebrate this special day! 🎁`;

export const setupCustomCelebrationCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/custom-celebration", async ({ command, ack }) => {
    try {
      const match = command.text.match(
        /<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})\s+(\w+)\s+(.+)$/
      );
      if (!match) {
        await ack({
          response_type: "ephemeral",
          text: "❌ Invalid format. Expected: /custom-celebration @user MM-DD recurrence description",
        });
        return;
      }

      const userId = match[1];
      const date = match[2];
      const recurrence = match[3].toLowerCase() as Recurrence;
      const description = match[4].trim();

      if (
        !['yearly', 'monthly', 'weekly', 'daily', 'once'].includes(recurrence)
      ) {
        await ack({
          response_type: "ephemeral",
          text: "❌ Invalid recurrence. Must be one of: yearly, monthly, weekly, daily, once",
        });
        return;
      }

      // Create event in database
      const event: Event = {
        user_id: userId,
        event_type: 'custom',
        recurrence,
        event_date: `${new Date().getFullYear()}-${date}`,
        description,
      };

      await databaseService.createEvent(event);
      await scheduleRecurringMessages(
        date,
        getCustomCelebrationMessage(userId, description),
        recurrence,
        slackApp
      );
      await ack({
        response_type: "ephemeral",
        text: "✅ Your event has been registered, we will announce it on the day! 🎉"
      });
    } catch (error) {
      console.error("Error handling message event:", error);
      await ack({
        response_type: "ephemeral",
        text: "❌ An error occurred while processing your request. Please try again later."
      });
    }
  });
};
