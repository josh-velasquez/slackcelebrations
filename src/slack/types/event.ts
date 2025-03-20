export type EventType = 'birthday' | 'work-anniversary' | 'custom';
export type Recurrence = 'once' | 'yearly' | 'monthly' | 'weekly' | 'daily';

export interface Event {
  user_id: string;
  event_type: EventType;
  recurrence: Recurrence;
  event_date: string;
  description?: string;
} 