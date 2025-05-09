const CLIENT_ID = "291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com";
const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;

const url = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid%20email%20profile`;

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

    if (redirectUrl) {
        const params = new URLSearchParams(redirectUrl.split('#')[1]);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            console.log("✅ Access Token:", accessToken);
            document.getElementById('status').innerText = 'Authenticated.';
            chrome.storage.local.set({ 'google_access_token': accessToken });
        } else {
            alert("Failed to get access token.");
        }
    }
});
