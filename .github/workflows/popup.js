// Popup JavaScript - Aquamark Watermark All PDFs
document.getElementById('watermark-button').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Scanning for PDFs...';

    // Store email in chrome storage before processing
    chrome.identity.getProfileUserInfo((userInfo) => {
        if (userInfo.email) {
            console.log("✅ User email detected:", userInfo.email);

            // Check if it is already stored to avoid duplicate storage
            chrome.storage.local.get(['user_email'], (result) => {
                if (result.user_email !== userInfo.email) {
                    chrome.storage.local.set({ 'user_email': userInfo.email }, () => {
                        console.log("✅ User email saved to storage.");
                    });
                }
            });
        } else {
            console.error("❌ Could not retrieve user email.");
            alert("Could not retrieve your email address. Please log in.");
            document.getElementById('status').innerText = 'Login required.';
            return;
        }
    });

    try {
        // Execute script to find all PDFs in the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: findAndWatermarkPDFs
        }, (result) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Error executing script:", chrome.runtime.lastError.message);
                document.getElementById('status').innerText = 'An error occurred.';
                return;
            }

            // ✅ Null Check to Prevent Crashes
            if (!result || !result[0] || !result[0].result) {
                console.error("❌ No result returned from content script.");
                document.getElementById('status').innerText = 'No PDFs found or error occurred.';
                return;
            }

            if (result[0].result.length > 0) {
                document.getElementById('status').innerText = 'Watermarking complete! Check your downloads.';
            } else {
                document.getElementById('status').innerText = 'No PDFs found.';
            }
        });
    } catch (error) {
        console.error('Error watermarking PDFs:', error);
        document.getElementById('status').innerText = 'An error occurred. See console for details.';
    }
});

// Function to find and watermark all PDFs
function findAndWatermarkPDFs() {
    console.log("🔍 Scanning Gmail for PDFs...");

    // Find all spans with download_url containing PDF links
    const pdfSpans = Array.from(document.querySelectorAll('span[download_url^="application/pdf"]'));

    if (pdf
