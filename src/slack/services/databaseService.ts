import dotenv from "dotenv";
import { Event } from "../types/event";
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

  async getEventsByUserId(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from("celebrations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching events:", error);
      throw error;
    }

    return data || [];
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
    eventType: string,
    date: string
  ): Promise<void> {
    const [day, month] = date.split("-").map(Number); 
    const { error } = await supabase
      .from("celebrations")
      .delete()
      .eq("user_id", userId)
      .eq("event_type", eventType)
      .eq("EXTRACT(DAY FROM date)", day)
      .eq("EXTRACT(MONTH FROM date)", month);

    if (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
