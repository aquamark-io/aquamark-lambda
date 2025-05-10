const { createClient } = require('@supabase/supabase-js');

// Pulling environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
    const path = event.rawPath;

    try {
        const body = JSON.parse(event.body);
        const user_email = body.user_email.toLowerCase();

        // Route Handler
        if (path === "/getUserData") {
            const { data, error } = await supabase
                .from('usage')
                .select('logo_url, pages_remaining, pages_used, plan_name')
                .eq('user_email', user_email)
                .single();

            if (error || !data) {
                return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    logo_url: `https://dvzmnikrvkvgragzhrof.supabase.co/storage/v1/object/public/logos/${user_email}/${data.logo_url}`,
                    pages_remaining: data.pages_remaining,
                    pages_used: data.pages_used,
                    plan_name: data.plan_name
                })
            };
        }

        if (path === "/updateUsage") {
            const { pages_used } = body;

            const { data, error } = await supabase
                .from('usage')
                .update({ pages_remaining: pages_used })
                .eq('user_email', user_email);

            if (error) {
                return { statusCode: 500, body: JSON.stringify({ error: "Update failed" }) };
            }

            return { statusCode: 200, body: JSON.stringify({ message: "Usage updated" }) };
        }

        return { statusCode: 404, body: "Route not found" };

    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};
