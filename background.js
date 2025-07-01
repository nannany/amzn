chrome.action.onClicked.addListener(async (_tab) => {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    
    if (!tab.url.includes('amazon')) {
      return;
    }
    
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: formatAndCopyUrl
    });
  } catch (error) {
    console.error('Error executing script:', error);
  }
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  console.log('Original text:', text);
  const formattedUrl = formatAmazonUrl(text);
  console.log('Formatted URL:', formattedUrl);
  
  try {
    // 既存のoffscreen documentがあるかチェック
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL('offscreen.html')]
    });

    if (existingContexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Copy formatted URL to clipboard'
      });
    }
    
    chrome.runtime.sendMessage({
      type: 'copy-to-clipboard',
      text: formattedUrl
    });
    
  } catch (error) {
    console.error('Error copying to clipboard:', error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'close-offscreen') {
    chrome.offscreen.closeDocument();
  } else if (message.type === 'copy-success') {
    console.log('Copy successful:', message.text);
    // offscreen documentを閉じる
    setTimeout(() => {
      chrome.offscreen.closeDocument().catch(err => {
        console.log('Error closing offscreen document:', err);
      });
    }, 1000);
  } else if (message.type === 'copy-error') {
    console.error('Copy failed:', message.error);
  }
});

function formatAmazonUrl(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const dpIndex = pathParts.indexOf('dp');

  if (dpIndex !== -1 && dpIndex + 1 < pathParts.length) {
    const productId = pathParts[dpIndex + 1];
    return `${urlObj.origin}/dp/${productId}`;
  }

  return url;
}

function formatAndCopyUrl() {
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      return false;
    }
  }

  function showNotification(message, isSuccess = true) {
    if (window.amazonUrlFormatterNotification) {
      document.body.removeChild(window.amazonUrlFormatterNotification);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isSuccess ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    window.amazonUrlFormatterNotification = notification;
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
        window.amazonUrlFormatterNotification = null;
      }
    }, 3000);
  }

  const currentUrl = window.location.href;
  const formattedUrl = formatAmazonUrl(currentUrl);
  
  copyToClipboard(formattedUrl).then(success => {
    if (success) {
      showNotification('URLをクリップボードにコピーしました!');
    } else {
      showNotification('コピーに失敗しました', false);
    }
  });
}