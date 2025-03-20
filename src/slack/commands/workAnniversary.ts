import SlackBolt from "@slack/bolt";
import { scheduleMessage } from "../services/messageService";
import { databaseService } from "../services/databaseService";
import { Event } from "../types/event";

export const setupWorkAnniversaryCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/work-anniversary", async ({ command, ack }) => {
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
      const message = `🎉🎈 *Happy Work Anniversary <@${userId}>!* 🎈🎉\n🎉 Congratulations on ${years} years with us! 🎁`;

      // Create event in database
      const event: Event = {
        user_id: userId,
        event_type: 'work-anniversary',
        recurrence: 'yearly',
        event_date: date,
      };

      await databaseService.createEvent(event);
      await scheduleMessage(MMDD, message, slackApp);
      await ack("Your event has been registered, we will announce it on the day! 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
}; 