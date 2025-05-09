document.getElementById('watermark-button').addEventListener('click', async () => {
  document.getElementById('status').innerText = 'Scanning for PDFs...';

  // Open Google OAuth Popup
  chrome.identity.launchWebAuthFlow(
    {
      url: `https://accounts.google.com/o/oauth2/auth?client_id=291434381676-3ek42et2uh46ooubnfjgeh7spdkh1pkt.apps.googleusercontent.com&response_type=token&redirect_uri=https://developers.google.com/oauthplayground&scope=openid%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile`,
      interactive: true,
    },
    async (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
        console.error("Authentication failed:", chrome.runtime.lastError);
        alert("Authentication failed. Please log in to your Google account.");
        document.getElementById('status').innerText = 'Login required.';
        return;
      }

      // Extract Access Token
      const params = new URLSearchParams(redirectUrl.split('#')[1]);
      const accessToken = params.get('access_token');

      console.log("✅ Access Token: ", accessToken);

      // Fetch User Info
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch user info");
        alert("Failed to fetch user info. Please try again.");
        return;
      }

      const userInfo = await response.json();
      console.log("✅ User Info:", userInfo);

      // Store in Chrome Storage
      chrome.storage.local.set({ user_email: userInfo.email }, () => {
        console.log("✅ User email stored:", userInfo.email);
      });

      // Update UI
      document.getElementById('status').innerText = `User: ${userInfo.email}`;
    }
  );
});
