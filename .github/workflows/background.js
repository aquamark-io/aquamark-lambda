// background.js

chrome.action.onClicked.addListener((tab) => {
  // Get the user's email
  chrome.identity.getProfileUserInfo((userInfo) => {
    if (userInfo.email) {
      console.log("User Email: ", userInfo.email);

      // Send request to Lambda
      fetch('https://jl47smynwk.execute-api.us-east-2.amazonaws.com/default/AquamarkHandler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userInfo.email,
          pdfData: "Base64EncodedPDFData" // We will update this next
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Lambda Response:", data);
      })
      .catch(error => {
        console.error("Error calling Lambda:", error);
      });

    } else {
      console.error("Failed to fetch user email.");
    }
  });
});
