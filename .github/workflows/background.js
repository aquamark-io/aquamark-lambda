// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "triggerWatermark") {
    // Fetch the email using Chrome Identity API
    chrome.identity.getProfileUserInfo((userInfo) => {
      if (userInfo.email) {
        console.log("User Email:", userInfo.email);

        // Send request to Lambda
        fetch('https://<YOUR_LAMBDA_URL>.amazonaws.com/default/AquamarkHandler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: userInfo.email,
            pdfData: "Base64EncodedPDFData" // Replace with real data in next step
          })
        })
        .then((response) => response.json())
        .then((data) => {
          console.log("Lambda Response:", data);
          if (data.success) {
            alert("Document successfully watermarked!");
            sendResponse({ success: true });
          } else {
            alert("Failed to watermark document.");
            sendResponse({ success: false });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while watermarking.");
          sendResponse({ success: false });
        });

      } else {
        console.error("Email not found. Are you signed into Chrome?");
        alert("You need to be signed into Chrome to use this extension.");
        sendResponse({ success: false });
      }
    });

    return true; // Keeps the message channel open for async
  }
});
