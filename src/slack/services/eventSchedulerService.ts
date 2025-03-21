import SlackBolt from "@slack/bolt";
import { databaseService } from "./databaseService";
import { scheduleMessage, scheduleRecurringMessages } from "./messageService";
import { getBirthdayMessage } from "../commands/birthday";
import { getWorkAnniversaryMessage } from "../commands/workAnniversary";
import { getCustomCelebrationMessage } from "../commands/customCelebration";


// 120 days from today
const MAX_DATE_THRESHOLD = 120 * 24 * 60 * 60 * 1000;

export const eventSchedulerService = {
  async scheduleUpcomingEvents(slackApp: SlackBolt.App) {
    try {
      const events = await databaseService.getAllEvents();
      console.log(`Found ${events.length} events to schedule`);

      const today = new Date();
      const maxFutureDate = new Date(today.getTime() + MAX_DATE_THRESHOLD); 

      for (const event of events) {
        try {
          const eventDate = new Date(event.event_date);
          
          // Skip if event date is in the past
          if (eventDate < today) {
            // For yearly events, adjust to next year
            if (event.recurrence === 'yearly') {
              eventDate.setFullYear(today.getFullYear() + 1);
            } else {
              continue;
            }
          }

          // Skip if event date is beyond our 120-day window
          if (eventDate > maxFutureDate) {
            continue;
          }

          // Create message based on event type
          let message = '';
          switch (event.event_type) {
            case 'birthday':
              message = getBirthdayMessage(event.user_id);
              break;
            case 'work-anniversary':
              const years = today.getFullYear() - new Date(event.event_date).getFullYear();
              message = getWorkAnniversaryMessage(event.user_id, years);
              break;
            case 'custom':
              message = getCustomCelebrationMessage(event.user_id, event.description || "Celebration");
              break;
          }

          // Format date for scheduling (MM-DD)
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const formattedDate = `${month}-${day}`;

          // Schedule the message
          if (event.recurrence === 'once') {
            await scheduleMessage(formattedDate, message, slackApp);
          } else {
            // For recurring events, we only need to schedule future occurrences
            // The initial date is already handled by the event creation
            await scheduleRecurringMessages(formattedDate, message, event.recurrence, slackApp);
          }

          console.log(`Scheduled ${event.event_type} for user ${event.user_id} on ${formattedDate}`);
        } catch (error) {
          console.error(`Failed to schedule event for user ${event.user_id}:`, error);
        }
      }

      console.log('Finished scheduling upcoming events');
    } catch (error) {
      console.error('Error in scheduleUpcomingEvents:', error);
      throw error;
    }
  }
}; 