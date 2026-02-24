const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Service-role client — bypasses RLS for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
