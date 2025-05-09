// popup.js

document.getElementById('fetchData').addEventListener('click', () => {
  // Replace this with the actual email you want to test
  const userEmail = "1christinaduncan@gmail.com";

  chrome.runtime.sendMessage(
    {
      action: 'fetchUserData',
      userEmail: userEmail
    },
    (response) => {
      if (response.success) {
        document.getElementById('status').innerText = "✅ Data fetched successfully!";
      } else {
        document.getElementById('status').innerText = "❌ Failed to fetch data.";
      }
    }
  );
});
