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

    if (event.httpMethod === "POST") {
      console.log("📝 Handling POST Request");

      // Parse the body
      const body = JSON.parse(event.body);
      const { user_email, pages_to_add } = body;

      if (!user_email || !pages_to_add) {
        console.error("❌ Missing required parameters");
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "user_email and pages_to_add are required" })
        };
      }

      console.log("🔍 User Email Detected: ", user_email);

      // Update user data in Supabase
      console.log(`🔄 Updating pages_used for user: ${user_email}`);
      const { data, error } = await supabase
        .from('usage')
        .update({ pages_used: supabase.raw('pages_used + ?', [pages_to_add]) })
        .eq('user_email', user_email)
        .select();

      if (error) {
        console.error("❌ Supabase Update Error: ", error.message);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Database update failed" })
        };
      }

      console.log("✅ Pages updated successfully: ", JSON.stringify(data));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Pages updated successfully", data })
      };

    } else if (event.httpMethod === "GET") {
      console.log("📝 Handling GET Request");

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
        .select('plan_name, pages_used, page_credits')
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
    }

    // If neither GET nor POST
    console.error("❌ Method not allowed");
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };

  } catch (err) {
    console.error("🔥 Unexpected Error: ", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
