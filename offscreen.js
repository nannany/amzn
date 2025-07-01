chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'copy-to-clipboard') {
    console.log('Attempting to copy:', message.text);
    console.log('Navigator clipboard available:', !!navigator.clipboard);
    console.log('Document focused:', document.hasFocus());
    
    try {
      // フォーカスを取得してからコピーを試行
      window.focus();
      document.body.focus();
      
      await navigator.clipboard.writeText(message.text);
      console.log('URL copied to clipboard successfully:', message.text);
      
      // 成功をbackground scriptに通知
      chrome.runtime.sendMessage({
        type: 'copy-success',
        text: message.text
      });
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      // フォールバック: execCommandを試行
      try {
        const textArea = document.createElement('textarea');
        textArea.value = message.text;
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          console.log('URL copied using execCommand fallback:', message.text);
          chrome.runtime.sendMessage({
            type: 'copy-success',
            text: message.text
          });
        } else {
          throw new Error('execCommand copy failed');
        }
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        chrome.runtime.sendMessage({
          type: 'copy-error',
          error: error.message
        });
      }
    }
  }
});