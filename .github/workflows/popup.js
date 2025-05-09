document.addEventListener('DOMContentLoaded', function () {
  const loginButton = document.getElementById("login-button");

  if (loginButton) {
    loginButton.addEventListener("click", () => {
      console.log("🌐 Launching OAuth Flow...");

      // --- Configuration ---
      const clientId = '291434381676-tvr93t3bir4pp1m7qaf9nv9to9m0g5l7.apps.googleusercontent.com';
  const redirectUri = 'https://cokdnchabjgblbnacklelpcedbmmdege.chromiumapp.org/';
      const scopes = [
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ].join(" ");

      // --- Build Auth URL ---
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}`;

      console.log("🔗 OAuth URL: ", authUrl);

      // --- Launch Web Auth Flow ---
      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("❌ Authentication Error: ", chrome.runtime.lastError.message);
          alert("Authentication failed. Please log in to your Google account.");
          document.getElementById('status').innerText = 'Login required.';
          return;
        }

        console.log("✅ Redirect URL: ", redirectUrl);

        // --- Extract the Access Token ---
        const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
        const accessToken = urlParams.get('access_token');

        if (accessToken) {
          console.log("✅ Access Token: ", accessToken);
          document.getElementById('status').innerText = 'Login successful!';
          
          // --- Fetch User Info ---
          fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          .then(response => response.json())
          .then(userInfo => {
            console.log("👤 User Info: ", userInfo);
            document.getElementById('status').innerText = `Logged in as ${userInfo.email}`;
          })
          .catch(error => {
            console.error("❌ Error fetching user info: ", error);
          });
        } else {
          console.error("❌ No access token found.");
          document.getElementById('status').innerText = 'Login failed.';
        }
      });
    });
  } else {
    console.error("❌ Login button not found in the DOM.");
  }
});
