const fetch = require('node-fetch');
const supabaseUrl = 'https://dvzmnikrvkvgragzhrof.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

exports.handler = async (event) => {
    console.log("🚀 Lambda invoked");
    console.log("🌐 Incoming Event: ", JSON.stringify(event));

    if (!event.queryStringParameters || !event.queryStringParameters.user_email) {
        console.error("❌ Missing user_email parameter.");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "user_email parameter is required" }),
        };
    }

    const userEmail = event.queryStringParameters.user_email;
    console.log("📩 User Email: ", userEmail);

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/usage?user_email=eq.${userEmail}`, {
            method: 'GET',
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error("❌ Supabase Fetch Error: ", response.statusText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: response.statusText }),
            };
        }

        const data = await response.json();
        console.log("✅ Data received: ", JSON.stringify(data));

        if (!data || data.length === 0) {
            console.warn("⚠️ No usage data found for email: ", userEmail);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "No usage data found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("💥 Handler Error: ", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};
