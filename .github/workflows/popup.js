// popup.js

const CLIENT_ID = "291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com";
const SCOPES = "openid email profile";

document.getElementById("google-login").addEventListener("click", () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=https://oauth2.chromiumapp.org&scope=${SCOPES}`;

    chrome.identity.launchWebAuthFlow(
        { url: authUrl, interactive: true },
        (redirectUrl) => {
            if (chrome.runtime.lastError || redirectUrl.includes("error")) {
                console.error("OAuth Error:", chrome.runtime.lastError);
                alert("Failed to authenticate.");
                return;
            }

            // Extract the access token from the redirect URL
            const token = new URLSearchParams(new URL(redirectUrl).hash.substring(1)).get("access_token");

            if (token) {
                // Store the token in local storage
                chrome.runtime.sendMessage({
                    action: 'storeToken',
                    token: token
                });

                // Fetch user info
                fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then(response => response.json())
                    .then(userInfo => {
                        console.log("User Info:", userInfo);
                        chrome.storage.local.set({ userEmail: userInfo.email }, () => {
                            console.log("User email stored successfully!");
                        });
                    })
                    .catch(error => console.error("Failed to fetch user info:", error));
            }
        }
    );
});
