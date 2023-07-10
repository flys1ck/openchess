import { createClient } from "@supabase/supabase-js";
import { type Database } from "../database";

const supabaseUrl = import.meta.env.SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.SUPABASE_API_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export function useSupabase() {
  return supabase;
}
