import SlackBolt from "@slack/bolt";
import { scheduleRecurringMessages } from "../services/messageService";
import { databaseService } from "../services/databaseService";
import { Event, Recurrence } from "../types/event";

export const setupCustomCelebrationCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/custom-celebration", async ({ command, ack }) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})\s+(\w+)\s+(.+)/);
      if (!match) {
        console.error("Invalid format. Expected: /custom-celebration @user MM-DD recurrence description");
        return;
      }
      
      const userId = match[1];
      const date = match[2];
      const recurrence = match[3].toLowerCase() as Recurrence
      const description = match[4];
      const message = `🎉 *${description} for <@${userId}>!* 🎉\nLet's celebrate this special day! 🎁`;

      // Create event in database
      const event: Event = {
        user_id: userId,
        event_type: 'custom-celebration',
        recurrence,
        event_date: `${new Date().getFullYear()}-${date}`,
        description,
      };

      await databaseService.createEvent(event);
      await scheduleRecurringMessages(date, message, recurrence, slackApp);
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
}; 