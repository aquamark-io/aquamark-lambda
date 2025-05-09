// ✅ Google Login Button Event Listener
document.getElementById("login-button").addEventListener("click", () => {
    console.log("🌐 Launching OAuth Flow...");

    // Initialize the URL properly
    const CLIENT_ID = '291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com';
    const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;
    const SCOPE = 'openid email profile';
    const RESPONSE_TYPE = 'token';

    // Build the OAuth URL
    const url = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;

    console.log("🔗 OAuth URL:", url);

    chrome.identity.launchWebAuthFlow({
        url: url,
        interactive: true,
    }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error("❌ Authentication Error: ", chrome.runtime.lastError.message);
            alert("Authentication failed. Please log in to your Google account.");
            document.getElementById("status").innerText = 'Login required.';
            return;
        }

        // ✅ Extract the token from the URL
        const params = new URLSearchParams(redirectUrl.split('#')[1]);
        const accessToken = params.get('access_token');

        if (accessToken) {
            console.log("✅ Access Token:", accessToken);
            document.getElementById("status").innerText = "Logged in!";
            localStorage.setItem('google_access_token', accessToken);

            // ✅ Get the user's email and display it
            fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log("✅ User Info:", data);
                document.getElementById("status").innerText = `Logged in as ${data.email}`;
            })
            .catch(error => console.error("❌ Error fetching user info:", error));
        }
    });
});
