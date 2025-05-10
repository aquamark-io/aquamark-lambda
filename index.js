const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

exports.handler = async (event) => {
    // 🔍 Log the raw path for debugging
    console.log("🌐 Full Path Detected:", event.rawPath);

    // 🔄 Strip `/production` from the path if it exists
    const path = event.rawPath.replace("/production", "");
    console.log("🛣️ Cleaned Path:", path);

    try {
        const body = JSON.parse(event.body);
        const user_email = body.user_email.toLowerCase();

        console.log("🚀 Querying for user:", user_email);

        if (path === "/fetchUserData") {
            // Step 1: Query usage table for the user
            const { data, error } = await supabase
                .from('usage')
                .select('pages_remaining, pages_used, plan_name')
                .eq('user_email', user_email);

            if (error) {
                console.error("❌ Supabase Query Error: ", error.message);
                return { statusCode: 500, body: JSON.stringify({ error: "Database query failed" }) };
            }

            if (data.length === 0) {
                console.log("🔎 No user found for:", user_email);
                return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };
            }

            // Step 2: Fetch the logo from Supabase Storage
            const { data: fileData, error: storageError } = await supabase
                .storage
                .from('logos')
                .list(user_email);

            if (storageError) {
                console.error("❌ Supabase Storage Error: ", storageError.message);
                return { statusCode: 500, body: JSON.stringify({ error: "Could not fetch logo from storage" }) };
            }

            if (fileData.length === 0) {
                console.log("⚠️ No logo found in storage for user:", user_email);
                return { statusCode: 404, body: JSON.stringify({ error: "Logo not found" }) };
            }

            // Since there's only one logo, we fetch the first one
            const logoFileName = fileData[0].name;
            const logo_url = `https://dvzmnikrvkvgragzhrof.supabase.co/storage/v1/object/public/logos/${user_email}/${logoFileName}`;

            console.log("✅ User data and logo URL retrieved successfully.");

            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    logo_url,
                    pages_remaining: data[0].pages_remaining,
                    pages_used: data[0].pages_used,
                    plan_name: data[0].plan_name
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
                console.error("❌ Update Error: ", error.message);
                return { statusCode: 500, body: JSON.stringify({ error: "Update failed" }) };
            }

            console.log("✅ Usage updated successfully.");
            return { statusCode: 200, body: JSON.stringify({ message: "Usage updated" }) };
        }

        console.log("🛑 Route not found:", path);
        return { statusCode: 404, body: JSON.stringify({ error: "Route not found" }) };

    } catch (err) {
        console.error("🔥 Handler Error: ", err.message);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    }
};
