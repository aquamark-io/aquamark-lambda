document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Content Loaded - Aquamark Extension Active");

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        console.log("🔄 Mutation Detected - Attempting to Inject Icon");
        setTimeout(() => {
          injectIcon();
        }, 1000); // Wait for DOM to stabilize
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function injectIcon() {
    // This is our new confirmed selector
    const attachmentCards = document.querySelectorAll('div[data-tooltip*="Download"]');

    console.log(`🔎 Found ${attachmentCards.length} Attachment Cards`);
    if (attachmentCards.length === 0) {
      console.warn("⚠️ No attachment cards found. Selector might be incorrect.");
    }

    attachmentCards.forEach((card) => {
      if (!card.parentElement.querySelector('.aquamark-icon-button')) {
        console.log("✅ Icon is being injected");

        // Create the Aquamark button
        const iconButton = document.createElement('img');
        iconButton.src = chrome.runtime.getURL('icon16.jpg');
        iconButton.classList.add('aquamark-icon-button');
        iconButton.style.cssText = `
          width: 20px;
          height: 20px;
          margin-left: 8px;
          cursor: pointer;
        `;

        iconButton.addEventListener('click', async () => {
          console.log("🖱️ Aquamark Icon Clicked!");
          const downloadLink = card.getAttribute('href');
          if (downloadLink) {
            console.log("🔗 Download link found, sending to background.js");
            await chrome.runtime.sendMessage({ action: 'watermarkPDF', url: downloadLink });
          } else {
            console.error("❌ Download link not found.");
          }
        });

        // Attach it right next to the Download button
        card.parentElement.appendChild(iconButton);
      }
    });
  }
});
