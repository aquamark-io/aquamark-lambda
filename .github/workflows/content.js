document.addEventListener('DOMContentLoaded', () => {
  console.log("🔍 DOM Content Loaded - Aquamark Extension Active");

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        console.log("🔄 Mutation Detected - Attempting to Inject Icon");
        setTimeout(() => {
          injectIcon();
        }, 1000); // Wait 1 second to ensure DOM is ready
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function injectIcon() {
    const attachmentCards = document.querySelectorAll('.aV3 .aZo');

    console.log(`🔎 Found ${attachmentCards.length} Attachment Cards`);
    if (attachmentCards.length === 0) {
      console.warn("⚠️ No attachment cards found. Selector might be incorrect.");
    }

    attachmentCards.forEach((card) => {
      if (!card.parentElement.querySelector('.aquamark-icon-button')) {
        console.log("✅ Icon is being injected");

        const iconButton = document.createElement('img');
        iconButton.src = chrome.runtime.getURL('icon16.jpg');
        iconButton.classList.add('aquamark-icon-button');
        iconButton.style.cssText = `
          width: 20px;
          height: 20px;
          margin-left: 5px;
          cursor: pointer;
        `;

        iconButton.addEventListener('click', async () => {
          console.log("🖱️ Aquamark Icon Clicked!");
          const downloadLink = card.querySelector('[data-tooltip="Download"]').href;
          await chrome.runtime.sendMessage({ action: 'watermarkPDF', url: downloadLink });
        });

        card.appendChild(iconButton);
      }
    });
  }
});
