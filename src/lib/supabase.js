import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vlzppuszflywqhuqgome.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsenBwdXN6Zmx5d3FodXFnb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NjEzNjYsImV4cCI6MjA4OTQzNzM2Nn0.yBmR-pgF5yDFkEwYIyx2N7xhdqS_oF7M7ZtpT99e9ns'
);