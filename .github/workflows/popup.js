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

    if (pdfSpans.length === 0) {
        console.error("❌ No PDFs found");
        return [];
    }

    // Extract the URLs and file names
    const pdfLinks = pdfSpans.map(span => {
        const downloadUrl = span.getAttribute('download_url');
        const parts = downloadUrl.split(':');
        const fileName = parts[1];
        const url = parts.slice(3).join(':');

        // Ensure the URL is formatted correctly
        const cleanUrl = url.startsWith('//') ? `https:${url}` : url;

        console.log("✅ Found PDF:", cleanUrl);
        return {
            fileName,
            url: cleanUrl
        };
    });

    // Watermark each PDF
    pdfLinks.forEach(async ({ fileName, url }) => {
        console.log(`📄 Processing PDF: ${fileName} at ${url}`);
        await chrome.runtime.sendMessage({ action: 'watermarkPDF', url });
    });

    return pdfLinks;
}
