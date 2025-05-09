// Popup JavaScript - Aquamark Watermark All PDFs
document.getElementById('watermark-button').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Scanning for PDFs...';

    // 👉 Force authentication to get email
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
            console.error("❌ Authentication failed:", chrome.runtime.lastError);
            alert("Authentication failed. Please log in to your Google account.");
            document.getElementById('status').innerText = 'Login required.';
            return;
        }

        console.log("✅ Auth Token received:", token);

        // 👉 Fetch user info from Google API
        fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
            .then(response => response.json())
            .then(data => {
                if (data.email) {
                    console.log("✅ User email detected:", data.email);

                    // Check if it is already stored to avoid duplicate storage
                    chrome.storage.local.get(['user_email'], (result) => {
                        if (result.user_email !== data.email) {
                            chrome.storage.local.set({ 'user_email': data.email }, () => {
                                console.log("✅ User email saved to storage.");
                            });
                        }
                    });
                } else {
                    console.error("❌ Could not retrieve user email.");
                    alert("Could not retrieve your email address. Please log in.");
                    document.getElementById('status').innerText = 'Login required.';
                }
            }).catch(error => {
                console.error("❌ Error fetching user info:", error);
                alert("Failed to fetch user info. Please try again.");
            });
    });

    // Execute script to find all PDFs in the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: findAndWatermarkPDFs
    }, (result) => {
        if (chrome.runtime.lastError) {
            console.error("❌ Error executing script:", chrome.runtime.lastError.message);
            document.getElementById('status').innerText = 'An error occurred.';
            return;
        }

        if (!result || !result[0] || !result[0].result) {
            console.error("❌ No result returned from content script.");
            document.getElementById('status').innerText = 'No PDFs found or error occurred.';
            return;
        }

        if (result[0].result.length > 0) {
            document.getElementById('status').innerText = 'Watermarking complete! Check your downloads.';
        } else {
            document.getElementById('status').innerText = 'No PDFs found.';
        }
    });
});
