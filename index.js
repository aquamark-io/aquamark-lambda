// AWS Lambda Function for Aquamark Chrome Extension

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const RENDER_URL = process.env.RENDER_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
    const { user_email } = JSON.parse(event.body);

    try {
        // Normalize the email to lowercase to match Supabase records
        const normalizedEmail = user_email.toLowerCase();

        // Fetch logo URL and usage data from Supabase
        const { data, error } = await supabase
            .from('usage')
            .select('logo_url, page_credits, pages_used, encrypted')
            .eq('user_email', normalizedEmail)
            .single();

        if (error || !data) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found or data retrieval failed.' })
            };
        }

        // Check for encryption and set Render URL if needed
        let decryption_url = null;
        if (data.encrypted) {
            decryption_url = `${RENDER_URL}/decrypt?email=${normalizedEmail}`;
        }

        // Return the user data
        return {
            statusCode: 200,
            body: JSON.stringify({
                logo_url: data.logo_url,
                page_credits: data.page_credits,
                pages_used: data.pages_used,
                decryption_url: decryption_url
            })
        };

    } catch (err) {
        console.error('Error fetching data:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
