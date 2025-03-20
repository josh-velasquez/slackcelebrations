import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://ucfvuzencmglqrlmhtin.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "public-anon-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
