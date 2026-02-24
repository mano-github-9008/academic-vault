require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing connection to "videos" table...');
    try {
        const { data, error } = await supabase.from('videos').select('*');
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Found', data.length, 'videos');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Catch Error:', err);
    }
}

test();
