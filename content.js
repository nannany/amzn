function showNotification() {
  if (window.amazonUrlFormatterNotification) {
    document.body.removeChild(window.amazonUrlFormatterNotification);
  }
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
  `;
  notification.textContent = 'URLをシンプルにできます';
  
  document.body.appendChild(notification);
  window.amazonUrlFormatterNotification = notification;
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
      window.amazonUrlFormatterNotification = null;
    }
  }, 2000);
}

if (window.location.hostname.includes('amazon')) {
  showNotification();
}