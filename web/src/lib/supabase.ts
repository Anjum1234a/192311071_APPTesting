import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvdqjdjaplfngpihvmvk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2ZHFqZGphcGxmbmdwaWh2bXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg1OTYsImV4cCI6MjA5NzAwNDU5Nn0.nCJw4FKpJv4D7CHhdGibWnnWyKryKA6HwMl6US1r8hc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
