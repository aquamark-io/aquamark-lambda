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

        // 1. Fetch the list of objects in the user's folder
        const { data: logoList, error: listError } = await supabase
            .storage
            .from('logos')
            .list(normalizedEmail, { limit: 1 });

        if (listError || logoList.length === 0) {
            console.error('Logo fetch failed:', listError);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Logo not found in storage.' })
            };
        }

        // 2. Get the first logo file (there should only be one)
        const logo_filename = logoList[0].name;
        const logo_url = `https://dvzmnikrvkvgragzhrof.supabase.co/storage/v1/object/public/logos/${normalizedEmail}/${logo_filename}`;

        // 3. Fetch usage data from Supabase
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

        // 4. Return the user data with the logo URL
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
