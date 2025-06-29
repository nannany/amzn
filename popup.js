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

function showStatus(message, type = 'info') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const formatBtn = document.getElementById('formatBtn');
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;
    
    if (!url.includes('amazon')) {
      formatBtn.disabled = true;
      showStatus('Amazonページでのみ使用可能です', 'error');
      return;
    }
    
    formatBtn.addEventListener('click', async function() {
      try {
        formatBtn.disabled = true;
        showStatus('処理中...', 'info');
        
        const formattedUrl = formatAmazonUrl(url);
        
        await navigator.clipboard.writeText(formattedUrl);
        
        showStatus('URLをクリップボードにコピーしました!', 'success');
        
        setTimeout(() => {
          window.close();
        }, 1500);
        
      } catch (error) {
        console.error('Error:', error);
        showStatus('コピーに失敗しました', 'error');
      } finally {
        formatBtn.disabled = false;
      }
    });
  });
});