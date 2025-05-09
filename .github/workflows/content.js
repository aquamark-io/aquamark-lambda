document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        injectIcon();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function injectIcon() {
    const attachmentCards = document.querySelectorAll('[data-tooltip="Download"]');

    attachmentCards.forEach((card) => {
      if (!card.parentElement.querySelector('.aquamark-icon-button')) {
        // Create the icon button
        const iconButton = document.createElement('img');
        iconButton.src = chrome.runtime.getURL('icon16.jpg');
        iconButton.classList.add('aquamark-icon-button');
        iconButton.style.cssText = `
          width: 20px;
          height: 20px;
          margin-left: 5px;
          cursor: pointer;
        `;

        // Event listener to start watermarking on click
        iconButton.addEventListener('click', async () => {
          const downloadLink = card.href;
          await chrome.runtime.sendMessage({ action: 'watermarkPDF', url: downloadLink });
        });

        // Inject the icon into the attachment card
        card.parentElement.appendChild(iconButton);
      }
    });
  }
});
