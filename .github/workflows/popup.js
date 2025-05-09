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
    const pdfLinks = Array.from(document.querySelectorAll('a[href$=".pdf"]'));
    if (pdfLinks.length === 0) return false;

    pdfLinks.forEach(async (link) => {
        const fileUrl = link.href;
        console.log('Processing PDF:', fileUrl);
        await chrome.runtime.sendMessage({ action: 'watermarkPDF', url: fileUrl });
    });

    return true;
}
