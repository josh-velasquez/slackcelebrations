import cron from 'node-cron';
import SlackBolt from "@slack/bolt";
import { eventSchedulerService } from "./eventSchedulerService";

// Run every 120 days at midnight
const cronSchedule = '0 0 1 */4 *';

export const setupCronJobs = (slackApp: SlackBolt.App) => {

  console.log('Setting up cron job with schedule:', cronSchedule);
  console.log('This will run on the 1st of every 4th month (approximately every 120 days)');
  
  cron.schedule(cronSchedule, async () => {
    console.log('Running scheduled event check...', new Date().toISOString());
    try {
      await eventSchedulerService.scheduleUpcomingEvents(slackApp);
      console.log('Successfully completed scheduled event check');
    } catch (error) {
      console.error('Failed to run scheduled event check:', error);
    }
  });

  // Also run immediately when the app starts
  console.log('Running initial event check...', new Date().toISOString());
  eventSchedulerService.scheduleUpcomingEvents(slackApp)
    .then(() => console.log('Successfully completed initial event check'))
    .catch(error => {
      console.error('Failed to run initial event check:', error);
    });
}; 