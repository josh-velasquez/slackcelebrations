
import { setupBirthdayCommand } from "./birthday";
import { setupCustomCelebrationCommand } from "./customCelebration";
import { setupDeleteCelebrationCommand } from "./deleteCelebration";
import { setupEventsCommand } from "./events";
import { setupHelpCommand } from "./help";
import { setupSubscribeCommand } from "./subscribe";
import { setupWorkAnniversaryCommand } from "./workAnniversary";
import { App as SlackBoltApp } from "@slack/bolt";

export const initializeCommands = (slackApp: SlackBoltApp) => {
  setupBirthdayCommand(slackApp);
  setupWorkAnniversaryCommand(slackApp);
  setupCustomCelebrationCommand(slackApp);
  setupHelpCommand(slackApp);
  setupDeleteCelebrationCommand(slackApp);
  setupEventsCommand(slackApp);
  setupSubscribeCommand(slackApp);
}; 