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

function addFormatButton() {
  if (document.getElementById('amazon-url-format-btn')) {
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'amazon-url-format-btn';
  button.textContent = 'URLをコピー';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: #ff9900;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
  `;
  
  button.addEventListener('click', async () => {
    const currentUrl = window.location.href;
    const formattedUrl = formatAmazonUrl(currentUrl);
    
    const success = await copyToClipboard(formattedUrl);
    if (success) {
      showNotification('URLをクリップボードにコピーしました!');
    } else {
      showNotification('コピーに失敗しました', false);
    }
  });
  
  button.addEventListener('mouseenter', () => {
    button.style.background = '#e68900';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = '#ff9900';
  });
  
  document.body.appendChild(button);
}

if (window.location.hostname.includes('amazon')) {
  addFormatButton();
}