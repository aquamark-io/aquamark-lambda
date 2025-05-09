document.getElementById('watermark-button').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Scanning for PDFs...';

    // 🔄 OAuth URL for Google Sign-In
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=291434381676-3ek42et2uh46ooubnfjgeh7spdkh1pkt.apps.googleusercontent.com&response_type=token&redirect_uri=chrome-extension://<YOUR_EXTENSION_ID>/popup.html&scope=openid%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile`;

    // 🔄 Open the sign-in window
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
            } else {
                console.error("❌ Token not found in URL.");
            }
        }
    });
});
