import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://hvdqjdjaplfngpihvmvk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZHFqZGphcGxmbmdwaWh2bXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg1OTYsImV4cCI6MjA5NzAwNDU5Nn0.nCJw4FKpJv4D7CHhdGibWnnWyKryKA6HwMl6US1r8hc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
