// Background Script - Aquamark Watermark PDFs
const SUPABASE_URL = "https://dvzmnikrvkvgragzhrof.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2em1uaWtydmt2Z3JhZ3pocm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5Njg5NzUsImV4cCI6MjA1OTU0NDk3NX0.FaHsjIRNlgf6YWbe5foz0kJFtCO4FuVFo7KVcfhKPEk";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'watermarkPDF') {
        console.log("🌐 Fetching PDF from URL:", request.url);

        try {
            // Step 1: Check pages remaining from Supabase
            const userEmail = await getUserEmail();
            console.log(`📧 User email detected: ${userEmail}`);

            if (!userEmail) {
                console.error("❌ No user email found in storage.");
                alert("Could not detect your email address. Please log in again.");
                sendResponse({ success: false, message: "User email not found" });
                return;
            }

            const userData = await fetchPageCount(userEmail);

            if (!userData || !userData.pages_remaining) {
                console.error("❌ No record found or pages remaining is undefined.");
                alert("You have no remaining pages left. Please upgrade your plan.");
                sendResponse({ success: false, message: "No pages remaining" });
                return;
            }

            const pages_remaining = userData.pages_remaining;
            console.log(`📄 Pages remaining for ${userEmail}: ${pages_remaining}`);

            if (pages_remaining <= 0) {
                console.error("❌ You have no remaining pages left.");
                alert("You have no remaining pages left. Please upgrade your plan.");
                sendResponse({ success: false, message: "No pages remaining" });
                return;
            }

            // Step 2: Fetch the PDF file
            const response = await fetch(request.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });

            if (!response.ok) {
                console.error("❌ Failed to fetch PDF:", response.status);
                sendResponse({ success: false, message: "Failed to fetch PDF" });
                return;
            }

            const pdfBlob = await response.blob();
            console.log("✅ PDF fetched successfully");

            // Step 3: Apply the watermark (temporary passthrough, no real watermark yet)
            const watermarkedBlob = await applyWatermark(pdfBlob);

            // Step 4: Decrement page count and update Supabase
            await decrementPageCount(userEmail, pages_remaining);

            // Step 5: Trigger download of the watermarked PDF
            const url = URL.createObjectURL(watermarkedBlob);
            const filename = `watermarked-${Date.now()}.pdf`;

            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            });

            console.log("✅ Download triggered for:", filename);
            sendResponse({ success: true, message: "Watermark applied and file downloaded" });

        } catch (error) {
            console.error("❌ Error during PDF processing:", error);
            sendResponse({ success: false, message: "Error during PDF processing" });
        }
    }
    return true;
});

// Function to apply watermark - Temporary placeholder
async function applyWatermark(pdfBlob) {
    console.log("💧 Applying watermark...");
    return pdfBlob;
}

// Function to get user's email from storage
async function getUserEmail() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['user_email'], (result) => {
            resolve(result.user_email);
        });
    });
}

// Function to fetch page count from Supabase
async function fetchPageCount(email) {
    console.log(`🔍 Fetching page count for ${email} from Supabase...`);
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/usage?user_email=eq.${email.toLowerCase()}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });

        const data = await response.json();
        console.log("📄 Supabase Response:", data);

        if (data.length === 0) {
            console.error("❌ No record found for this user in Supabase.");
            return null;
        }

        return data[0];
    } catch (error) {
        console.error("❌ Error fetching page count from Supabase:", error);
        return null;
    }
}

// Function to decrement page count
async function decrementPageCount(email, currentCount) {
    console.log(`🔄 Decrementing page count for ${email}`);
    const newCount = currentCount - 1;

    await fetch(`${SUPABASE_URL}/rest/v1/usage?user_email=eq.${email.toLowerCase()}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            pages_remaining: newCount
        })
    });

    console.log(`✅ New page count for ${email}: ${newCount}`);
}
