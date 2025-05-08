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

        // Fetch logo URL from Supabase storage
        const logo_url = `https://dvzmnikrvkvgragzhrof.supabase.co/storage/v1/object/public/logos/${normalizedEmail}/logo-1746620828730.png`;

        // Fetch usage data from Supabase
        const { data, error } = await supabase
            .from('usage')
            .select('page_credits, pages_used, plan_name')
            .eq('user_email', normalizedEmail)
            .single();

        if (error || !data) {
            console.error('Data retrieval failed:', error);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found or data retrieval failed.' })
            };
        }

        // Return the user data with the logo URL
        return {
            statusCode: 200,
            body: JSON.stringify({
                logo_url: logo_url,
                page_credits: data.page_credits,
                pages_used: data.pages_used,
                plan_name: data.plan_name
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
