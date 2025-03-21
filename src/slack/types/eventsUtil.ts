export type EventType = 'birthday' | 'work-anniversary' | 'custom';
export type Recurrence = 'once' | 'yearly' | 'monthly' | 'weekly' | 'daily';

export interface Event {
  user_id: string;
  event_type: EventType;
  recurrence: Recurrence;
  event_date: string;
  description?: string;
} 

export type Block = {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
};

export const EVENT_EMOJIS: Record<EventType, string> = {
  'birthday': '🎂',
  'work-anniversary': '🎉',
  'custom': '🎈'
};

export const EVENT_TITLES: Record<EventType, string> = {
  'birthday': 'Birthdays',
  'work-anniversary': 'Work Anniversaries',
  'custom': 'Custom Celebrations'
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const sortEventsByDate = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.event_date);
    const dateB = new Date(b.event_date);
    return dateA.getTime() - dateB.getTime();
  });
};

export const groupEventsByType = (events: Event[]): Record<EventType, Event[]> => {
  return events.reduce((acc, event) => {
    if (!acc[event.event_type]) {
      acc[event.event_type] = [];
    }
    acc[event.event_type].push(event);
    return acc;
  }, {} as Record<EventType, Event[]>);
};

export const createEventBlock = (event: Event): Block => {
  const date = formatDate(event.event_date);
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `• <@${event.user_id}>\n  _${date}_${event.description ? `\n  ${event.description}` : ''}`
    }
  };
};

export const createEventTypeHeader = (type: EventType, count: number): Block => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${EVENT_EMOJIS[type]} *${EVENT_TITLES[type]}* (${count})`
    }
  };
};