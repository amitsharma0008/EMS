import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rwkgmnhtgahfvzmevmgv.supabase.co";
const supabaseKey = "sb_publishable_ICAkWwZuscIEPUkX7bJg9w_zlpqhWbT";


export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

