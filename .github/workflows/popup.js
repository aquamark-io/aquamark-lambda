document.getElementById('fetchData').addEventListener('click', () => {
    const userEmail = "1christinaduncan@gmail.com";

    chrome.runtime.sendMessage(
        {
            action: 'fetchUserData',
            userEmail: userEmail
        },
        (response) => {
            if (response && response.success) {
                document.getElementById('status').innerText = "✅ Data fetched successfully!";
            } else {
                document.getElementById('status').innerText = "❌ Failed to fetch data.";
            }
        }
    );
});
