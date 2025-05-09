const clientId = "291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com";
const redirectUri = chrome.identity.getRedirectURL("oauth2");

const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=openid email profile`;

chrome.identity.launchWebAuthFlow(
  {
    url: authUrl,
    interactive: true,
  },
  (redirectUrl) => {
    if (chrome.runtime.lastError) {
      console.error(`❌ Authentication Error: ${chrome.runtime.lastError.message}`);
      alert("Authentication failed.");
    } else {
      console.log("✅ Authentication Success: ", redirectUrl);

      // Extract the token from the redirectUrl
      const params = new URLSearchParams(redirectUrl.split('#')[1]);
      const accessToken = params.get('access_token');

      if (accessToken) {
        console.log("🔑 Access Token: ", accessToken);
        
        // Save it in chrome storage
        chrome.storage.local.set({ accessToken }, () => {
          console.log("🔒 Access Token stored in Chrome Storage.");
        });

        // Optional: Fetch User Info
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(response => response.json())
        .then(data => {
          console.log("👤 User Info: ", data);
        })
        .catch(error => console.error("❌ Error Fetching User Info: ", error));
      }
    }
  }
);
