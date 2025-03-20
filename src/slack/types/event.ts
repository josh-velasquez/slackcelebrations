export type EventType = 'birthday' | 'work-anniversary' | 'custom-celebration';
export type Recurrence = 'none' | 'yearly' | 'monthly' | 'weekly' | 'daily';

export interface Event {
  user_id: string;
  event_type: EventType;
  recurrence: Recurrence;
  event_date: string;
  description?: string;
} 