// Popup JavaScript - Aquamark Watermark All PDFs
document.getElementById('watermark-button').addEventListener('click', async () => {
    document.getElementById('status').innerText = 'Scanning for PDFs...';

    try {
        // Execute script to find all PDFs in the current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: findAndWatermarkPDFs
        }, (result) => {
            if (result[0].result) {
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
    // Find all attachment cards in Gmail
    const attachmentCards = document.querySelectorAll('div[data-tooltip="Download"]');
    
    if (attachmentCards.length === 0) {
        console.log("❌ No attachments found");
        return false;
    }

    // Extract the URLs and watermark each one
    attachmentCards.forEach(async (card) => {
        const downloadLink = card.closest('a').href;
        if (downloadLink.includes('.pdf')) {
            console.log('✅ Processing PDF:', downloadLink);
            await chrome.runtime.sendMessage({ action: 'watermarkPDF', url: downloadLink });
        }
    });

    return true;
}
