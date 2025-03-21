import SlackBolt from "@slack/bolt";
import { deleteScheduledMessages, scheduleMessage } from "../services/messageService";
import { databaseService } from "../services/databaseService";
import { Event, EventType, Recurrence } from "../types/event";

export const setupDeleteCelebrationCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/delete-celebration", async ({ command, ack }) => {
    try {
      const match = command.text.match(/<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})\s+(\w+)(?:\s+(\w+))?/);
      if (!match) {
        console.error("Invalid format. Expected: /delete-celebration @user MM-DD event-type reccurence?");
        return;
      }
      const userId = match[1];
      const date = match[2];
      const eventType = match[3] as EventType;
      const recurrence = match[4] as Recurrence | undefined;

      await deleteScheduledMessages(date, userId, eventType, slackApp, recurrence);
      await ack("This event, and all future occurrences, have been deleted. 🎉");
    } catch (error) {
      console.error("Error handling message event:", error);
    }
  });
}; 