const clientId = "291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com";
const redirectUri = "https://oauth2.googleapis.com/token";

const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=openid%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile`;

chrome.identity.launchWebAuthFlow({
    url: url,
    interactive: true,
}, (redirectUrl) => {
    if (chrome.runtime.lastError) {
        console.error("❌ Authentication Error: ", chrome.runtime.lastError.message);
        alert("Authentication failed. Please log in to your Google account.");
        document.getElementById('status').innerText = 'Login required.';
        return;
    }

    console.log("🔄 Redirect URL: ", redirectUrl);

    // ✅ Token Handler
    if (redirectUrl) {
        const hash = new URL(redirectUrl).hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
            console.log(`✅ Access Token: ${token}`);

            // Now you can store it or use it to get user info
            chrome.storage.local.set({ google_token: token }, () => {
                console.log("🔒 Token stored locally.");
                document.getElementById('status').innerText = 'Authenticated. Scanning for PDFs...';
            });

            // 🚀 Optional: Fetch User Info
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("👤 User Info: ", data);
            })
            .catch(error => console.error("❌ Error Fetching User Info: ", error));
        } else {
            console.error("❌ Token not found in URL.");
        }
    }
});
