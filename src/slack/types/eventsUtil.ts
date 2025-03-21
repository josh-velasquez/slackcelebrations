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

export type ScheduledMessage = {
  id?: string;
  channel_id: string;
  post_at: number;
  date_created: number;
  text: string;
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

export const groupEventsByType = (messages: ScheduledMessage[]): Record<EventType, Event[]> => {
  return messages.reduce((acc, message) => {
    const today = new Date()
    const dateObj = new Date(message.post_at * 1000);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${month}-${day}-${today.getFullYear()}`;

    const userMatch = message.text.match(/<@([A-Z0-9]+)>/);
    const userId = userMatch ? userMatch[1] : '';

    // Ensure each event type is initialized in acc before pushing
    if (!acc.birthday) acc.birthday = [];
    if (!acc['work-anniversary']) acc['work-anniversary'] = [];
    if (!acc.custom) acc.custom = [];

    console.log('message', message);

    let eventType: EventType;
    if (message.text.includes('birthday')) {
      eventType = 'birthday';
    } else if (message.text.includes('Work Anniversary')) {
      eventType = 'work-anniversary';
    } else {
      eventType = 'custom';
    }

    const event: Event = {
      user_id: userId,
      event_type: eventType,
      recurrence: 'yearly',
      event_date: formattedDate,
    };

    console.log('event', event);
    acc[eventType].push(event);

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