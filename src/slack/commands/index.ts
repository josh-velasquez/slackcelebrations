
import { setupBirthdayCommand } from "./birthday";
import { setupCustomCelebrationCommand } from "./customCelebration";
import { setupHelpCommand } from "./help";
import { setupWorkAnniversaryCommand } from "./workAnniversary";
import { App as SlackBoltApp } from "@slack/bolt";

export const initializeCommands = (slackApp: SlackBoltApp) => {
  setupBirthdayCommand(slackApp);
  setupWorkAnniversaryCommand(slackApp);
  setupCustomCelebrationCommand(slackApp);
  setupHelpCommand(slackApp);
}; 