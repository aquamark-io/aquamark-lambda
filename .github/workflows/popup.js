// ✅ Google Login Button Event Listener
document.getElementById("login-button").addEventListener("click", () => {
    console.log("🌐 Launching OAuth Flow...");

    // Log the URL before launching the flow
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
                document.getElementById("status").innerText = `Logged in as ${data.email}`;
            })
            .catch(error => console.error("❌ Error fetching user info:", error));
        }
    });
});
