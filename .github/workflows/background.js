// background.js

const SUPABASE_URL = 'https://dvzmnikrvkvgragzhrof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2em1uaWtydmt2Z3JhZ3pocm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njg5NzUsImV4cCI6MjA1OTU0NDk3NX0.FaHsjIRNlgf6YWbe5foz0kJFtCO4FuVFo7KVcfhKPEk';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  try {
    // Parse the event body
    const body = JSON.parse(event.body);
    const user_email = body.user_email;

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .eq('user_email', user_email);

    if (error) {
      console.error('Supabase Error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Supabase fetch failed', error: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data fetched successfully', data: data }),
    };
  } catch (err) {
    console.error('Handler Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
