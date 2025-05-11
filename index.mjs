import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Lambda Initialized");

export const handler = async (event) => {
  try {
    console.log("✅ Starting Lambda Execution");
    console.log("Event Received: ", JSON.stringify(event, null, 2));

    // Extract user email from query parameters
    const userEmail = event.queryStringParameters?.user_email;
    console.log("🔍 User Email Detected: ", userEmail);

    if (!userEmail) {
      console.error("❌ No user email provided");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No user email provided" })
      };
    }

    console.log("🌐 Connecting to Supabase...");
    console.log("📝 Environment Variables Loaded: ", supabaseUrl, supabaseKey);

    // Fetch user data from Supabase
    console.log(`🔎 Querying Supabase for user: ${userEmail}`);
    const { data, error } = await supabase
      .from('usage')
      .select('plan_name, pages_, page_credits')
      .eq('user_email', userEmail)
      .single();

    if (error) {
      console.error("❌ Supabase Query Error: ", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Database query failed" })
      };
    }

    if (!data) {
      console.warn("⚠️ No data found for the provided email");
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" })
      };
    }

    console.log("✅ Supabase Query Success: ", JSON.stringify(data));

    // Prepare the response object
    const responseBody = {
      plan_name: data.plan_name,
      pages_used: data.pages_used,
      page_credits: data.page_credits
    };

    console.log("✅ Response Body Prepared: ", JSON.stringify(responseBody));

    // Send back the successful response
    return {
      statusCode: 200,
      body: JSON.stringify(responseBody)
    };
  } catch (err) {
    console.error("🔥 Unexpected Error: ", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
