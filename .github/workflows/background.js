// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'watermarkPDF') {
    console.log(`Received request to watermark: ${request.filename}`);

    // Get the Chrome user's email
    chrome.identity.getProfileUserInfo((userInfo) => {
      if (userInfo.email) {
        console.log("User Email: ", userInfo.email);

        // Send to Lambda
        fetch('https://jl47smynwk.execute-api.us-east-2.amazonaws.com/default/AquamarkHandler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userInfo.email,
            pdfData: request.data,
            filename: request.filename
          })
        })
          .then(response => response.json())
          .then(data => {
            console.log("Lambda Response:", data);
            alert(`Watermarking Complete for ${request.filename}`);
          })
          .catch(error => {
            console.error("Error calling Lambda:", error);
          });
      } else {
        console.error("Failed to fetch user email.");
      }
    });
  }
});
