import dotenv from "dotenv";
import { Event, EventType } from "../types/eventsUtil";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl =
  process.env.SUPABASE_URL || "https://ucfvuzencmglqrlmhtin.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export const databaseService = {
  async createEvent(event: Event): Promise<Event> {
    const { data, error } = await supabase
      .from("celebrations")
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw error;
    }

    return data;
  },

  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase.from("celebrations").select("*");

    if (error) {
      console.error("Error fetching all events:", error);
      throw error;
    }

    return data || [];
  },

  async deleteEvent(
    userId: string,
    eventType: EventType,
    date: string
  ): Promise<boolean> {
    const [month, day] = date.split("-").map(Number);
    const { data, error } = await supabase.rpc("delete_celebration", {
      p_user_id: userId,
      p_event_type: eventType,
      p_day: day,
      p_month: month,
    });

    if (error) {
      throw `failed to delete event: ${error}`;
    }

    return typeof data === 'number' && data > 0;
  },
};
