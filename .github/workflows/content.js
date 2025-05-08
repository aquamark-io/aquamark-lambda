// content.js

// Wait for Gmail to load
const observeGmail = () => {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Find all attachment containers
        const attachmentCards = document.querySelectorAll('div.aQH span.aZo');

        attachmentCards.forEach((card) => {
          const filename = card.textContent;

          // Check if it's a PDF
          if (filename.endsWith('.pdf') && !card.parentNode.querySelector('.watermark-btn')) {
            // Create button if not already added
            const button = document.createElement('button');
            button.innerText = 'Watermark with Aquamark';
            button.classList.add('watermark-btn');
            button.style.cssText = "margin-left: 5px; background-color: #1a73e8; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;";

            // Attach click event
            button.onclick = async () => {
              try {
                const pdfBase64 = await getAttachmentBase64(card);
                chrome.runtime.sendMessage({
                  action: 'watermarkPDF',
                  filename: filename,
                  data: pdfBase64
                });
              } catch (error) {
                console.error("Failed to fetch PDF:", error);
              }
            };

            card.parentNode.appendChild(button);
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
};

// Base64 Fetch Logic
const getAttachmentBase64 = (card) => {
  return new Promise((resolve, reject) => {
    const attachmentUrl = card.closest('a').href;

    fetch(attachmentUrl, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('gmailAuthToken')
      }
    })
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
    .catch(reject);
  });
};

// Start observing
observeGmail();
