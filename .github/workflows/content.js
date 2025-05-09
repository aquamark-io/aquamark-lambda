// Function to add Aquamark icon to Gmail attachment cards
function addAquamarkButtonToAttachments() {
  console.log("🔄 Running Attachment Button Injection");

  // Target the download buttons on attachment cards
  const downloadButtons = document.querySelectorAll('[data-tooltip="Download"]');
  console.log(`🔎 Found ${downloadButtons.length} Download Buttons`);

  // Loop through each download button
  downloadButtons.forEach((button) => {
    // Prevent duplicates
    if (button.parentNode.querySelector('.aquamark-button')) {
      console.log("⚠️ Button already exists, skipping...");
      return;
    }

    console.log("✅ Inserting Aquamark button");

    // Create new button element
    const aquamarkButton = document.createElement('img');
    aquamarkButton.className = 'aquamark-button';
    aquamarkButton.setAttribute('role', 'button');
    aquamarkButton.setAttribute('data-tooltip', 'Watermark with Aquamark');
    aquamarkButton.src = chrome.runtime.getURL('icon16.jpg');

    // Style the button to match Gmail's styling
    aquamarkButton.style.cursor = 'pointer';
    aquamarkButton.style.marginLeft = '6px';
    aquamarkButton.style.width = '20px';
    aquamarkButton.style.height = '20px';

    // Add click event
    aquamarkButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering parent elements
      const downloadLink = button.getAttribute('href');
      if (downloadLink) {
        console.log("🖱️ Aquamark Icon Clicked! Sending to background script...");
        chrome.runtime.sendMessage({ action: 'watermarkPDF', url: downloadLink });
      } else {
        console.error("❌ Download link not found.");
      }
    });

    // Insert the button next to the download button
    button.parentNode.insertBefore(aquamarkButton, button.nextSibling);
  });
}

// Run initially and also use a MutationObserver to handle dynamically loaded content
function initializeAquamarkButtonAdder() {
  // Run once on load
  addAquamarkButtonToAttachments();

  // Set up MutationObserver to detect when new attachments are added
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        addAquamarkButtonToAttachments();
      }
    }
  });

  // Start observing the document body for DOM changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}

// Initialize when the page is fully loaded
if (document.readyState === 'complete') {
  initializeAquamarkButtonAdder();
} else {
  window.addEventListener('load', initializeAquamarkButtonAdder);
}
