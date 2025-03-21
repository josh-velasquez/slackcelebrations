import { Recurrence } from "./eventsUtil";

export function calculateNextDate(
  currentDate: Date,
  recurrence: Recurrence
): Date {
  const nextDate = new Date(currentDate);

  switch (recurrence) {
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "once":
      return currentDate; // No change needed
    default:
      throw new Error(`Invalid recurrence type: ${recurrence}`);
  }

  return nextDate;
}

export interface PostTime {
  hour: number;
  minute: number;
}

export function calculateStartDate(
  date: string,
  postTime: PostTime
): Date {
  const [month, day] = date.split("-").map(Number);
  const today = new Date();
  const startYear = today.getFullYear();

  const startDate = new Date(
    startYear,
    month - 1,
    day,
    postTime.hour,
    postTime.minute
  );

  // If the date is in the past, move it to next year
  if (startDate < today) {
    startDate.setFullYear(startYear + 1);
  }

  return startDate;
}
