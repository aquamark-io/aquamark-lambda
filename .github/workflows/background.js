// background.js
chrome.storage.local.get(["outsetaUser"], (result) => {
    if (result.outsetaUser) {
        const email = result.outsetaUser.email;
        console.log("User Email:", email);
        
        fetch("https://your-lambda-url.amazonaws.com/default/AquamarkHandler", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                pdfData: "Base64EncodedPDFData"
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
        console.error("User not found in Chrome storage");
    }
});
