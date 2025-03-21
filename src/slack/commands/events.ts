import SlackBolt from "@slack/bolt";
import { databaseService } from "../services/databaseService";
import {
  Block,
  EventType,
  sortEventsByDate,
  groupEventsByType,
  createEventBlock,
  createEventTypeHeader,
} from "../types/eventsUtil";

export const setupEventsCommand = (slackApp: SlackBolt.App) => {
  slackApp.command("/upcoming-celebrations", async ({ ack }) => {
    try {
      const events = await databaseService.getAllEvents();

      if (events.length === 0) {
        await ack({
          response_type: "ephemeral",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📅 No Upcoming Celebrations",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "There are no celebrations scheduled at the moment.",
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Add a celebration using one of these commands:*\n• `/birthday` - Add a birthday\n• `/work-anniversary` - Add a work anniversary\n• `/custom-celebration` - Add a custom celebration",
              },
            },
          ],
        });
        return;
      }

      // Sort and group events
      const sortedEvents = sortEventsByDate(events);
      const groupedEvents = groupEventsByType(sortedEvents);

      const blocks: Block[] = [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📅 Upcoming Celebrations",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Showing ${events.length} upcoming celebration${
              events.length === 1 ? "" : "s"
            }`,
          },
        },
        {
          type: "divider",
        },
      ];

      // Add sections for each event type
      Object.entries(groupedEvents).forEach(([type, typeEvents]) => {
        // Add header for event type
        blocks.push(
          createEventTypeHeader(type as EventType, typeEvents.length)
        );

        // Add each event as a separate section
        typeEvents.forEach((event) => {
          blocks.push(createEventBlock(event));
        });

        blocks.push({
          type: "divider",
        });
      });

      await ack({ blocks });
    } catch (error) {
      console.error("Error handling message event:", error);
      await ack({
        response_type: "ephemeral",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "❌ Error",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "An error occurred while processing your request. Please try again later.",
            },
          },
        ],
      });
    }
  });
  slackApp.command("/delete-celebration", async ({ command, ack }) => {
    try {
      const match = command.text.match(
        /<@([A-Z0-9]+)\|[^>]+>\s+(\d{2}-\d{2})\s+([a-zA-Z-]+)(?:\s+(.+))?$/
      );
      if (!match) {
        await ack({
          response_type: "ephemeral",
          text: "❌ Invalid format. Expected: /delete-celebration @user MM-DD event-type",
        });
        return;
      }

      const userId = match[1];
      const date = match[2];
      const eventType = match[3] as EventType;

      const deleted = await databaseService.deleteEvent(
        userId,
        eventType,
        date
      );
      if (deleted) {
        await ack({
          response_type: "ephemeral",
          text: "✅ Celebration deleted successfully!",
        });
      } else {
        await ack({
          response_type: "ephemeral",
          text: "❌ No celebration found matching the specified criteria.",
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      await ack({
        response_type: "ephemeral",
        text: "❌ Error deleting event. Please try again later.",
      });
    }
  });
};
