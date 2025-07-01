chrome.runtime.onMessage.addListener(async (message, _sender, _sendResponse) => {
  if (message.type === 'copy-to-clipboard') {
    console.log('Attempting to copy:', message.text);
    console.log('Navigator clipboard available:', !!navigator.clipboard);
    console.log('Document focused:', document.hasFocus());
    
    // execCommandを直接使用する方法を試す
    try {
      const textArea = document.createElement('textarea');
      textArea.value = message.text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        console.log('URL copied using execCommand:', message.text);
        chrome.runtime.sendMessage({
          type: 'copy-success',
          text: message.text
        });
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (execError) {
      console.error('execCommand failed:', execError);
      
      // 最後の手段: ユーザーアクションを模擬してnavigator.clipboardを試行
      try {
        // ボタンを作成してプログラマティックにクリック
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.style.position = 'fixed';
        button.style.left = '-999999px';
        document.body.appendChild(button);
        
        button.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(message.text);
            console.log('URL copied via simulated click:', message.text);
            chrome.runtime.sendMessage({
              type: 'copy-success',
              text: message.text
            });
          } catch (clipboardError) {
            console.error('Clipboard API failed even with simulated click:', clipboardError);
            chrome.runtime.sendMessage({
              type: 'copy-error',
              error: clipboardError.message
            });
          } finally {
            document.body.removeChild(button);
          }
        });
        
        button.click();
        
      } catch (error) {
        console.error('All copy methods failed:', error);
        chrome.runtime.sendMessage({
          type: 'copy-error',
          error: error.message
        });
      }
    }
  }
});