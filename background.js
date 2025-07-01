chrome.action.onClicked.addListener(async (tab) => {
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

chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('Original text:', text);
  const formattedUrl = formatAmazonUrl(text);
  console.log('Formatted URL:', formattedUrl);
  // clipboardにコピーする
  navigator.clipboard.writeText(formattedUrl).then(() => {
      console.log('URL copied to clipboard:', formattedUrl);
  }).catch(err => {
      console.error('Failed to copy URL:', err);
  });
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