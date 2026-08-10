import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_URL and SUPABASE_KEY are not set in production");
  }
  console.warn("⚠ Supabase credentials are not set. Storage operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const BUCKET_NAME = process.env.SUPABASE_BUCKET || "properties";
