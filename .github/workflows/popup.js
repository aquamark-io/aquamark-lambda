document.getElementById('fetch-email').addEventListener('click', async () => {
    chrome.identity.getProfileUserInfo((userInfo) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            document.getElementById('result').innerText = "Failed to fetch email.";
            return;
        }
        document.getElementById('result').innerText = userInfo.email ? 
            `Email: ${userInfo.email}` : 'No email found';
    });
});
