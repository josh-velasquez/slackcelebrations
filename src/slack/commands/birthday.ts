import SlackBolt from "@slack/bolt";
import { scheduleMessage } from "../services/messageService";
import { databaseService } from "../services/databaseService";
import { Event } from "../types/event";

export const setupBirthdayCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/birthday", async ({ command, ack }) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})/);
      if (!match) {
        console.error("Invalid format. Expected: /birthday @user MM-DD");
        return;
      }
      const userId = match[1];
      const date = match[2];
      const message = `🎉🎂 *Happy Birthday <@${userId}>!* 🎂🎉\n🎈Wishing you a fantastic day! 🎁`;

      // Create event in database
      const event: Event = {
        user_id: userId,
        event_type: 'birthday',
        recurrence: 'yearly',
        event_date: `${new Date().getFullYear()}-${date}`,
      };

      await databaseService.createEvent(event);
      await scheduleMessage(date, message, slackApp);
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
}; 