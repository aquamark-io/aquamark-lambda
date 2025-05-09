// background.js

const LAMBDA_URL = 'https://jl47smynwk.execute-api.us-east-2.amazonaws.com/default/fetchUserData';

async function fetchUserData(userEmail) {
    try {
        const response = await fetch(LAMBDA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_email: userEmail })
        });

        if (!response.ok) {
            console.error('Failed to fetch user data:', response.statusText);
            return null;
        }

        const data = await response.json();

        // Store in chrome storage for later use
        chrome.storage.local.set({
            logo_url: data.logo_url,
            page_credits: data.page_credits,
            pages_used: data.pages_used,
            plan_name: data.plan_name
        }, () => {
            console.log('User data successfully stored:', data);
        });

        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Listener for popup request
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchUserData') {
        fetchUserData(request.userEmail).then(data => {
            sendResponse({ success: !!data, data: data });
        });
        return true; // Required for async sendResponse
    }
});
