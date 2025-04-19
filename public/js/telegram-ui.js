// Marty Task Commander - Telegram Message UI Component

class TelegramMessageUI {
  constructor() {
    this.messagesContainer = null;
    this.messageForm = null;
    this.messageInput = null;
    this.createUI();
    this.addEventListeners();
  }
  
  // Create Telegram message UI
  createUI() {
    // Create messages tab in the UI
    const messagesTab = document.createElement('div');
    messagesTab.id = 'telegram-messages-tab';
    messagesTab.className = 'tab-content';
    messagesTab.style.display = 'none';
    
    messagesTab.innerHTML = `
      <div class="telegram-header">
        <h2><i class="fab fa-telegram"></i> Telegram zprávy</h2>
        <div class="telegram-status">
          <span id="telegram-status-indicator" class="status-indicator online"></span>
          <span id="telegram-status-text">Online</span>
        </div>
      </div>
      
      <div id="telegram-messages-container" class="telegram-messages-container">
        <!-- Messages will be added here -->
      </div>
      
      <form id="telegram-message-form" class="telegram-message-form">
        <input type="text" id="telegram-message-input" placeholder="Napište zprávu..." required>
        <button type="submit" class="primary-btn">
          <i class="fas fa-paper-plane"></i>
        </button>
      </form>
    `;
    
    // Add tab to the main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.appendChild(messagesTab);
    }
    
    // Add tab button to the navigation
    const navList = document.querySelector('.nav-list');
    if (navList) {
      const telegramTabButton = document.createElement('li');
      telegramTabButton.className = 'nav-item';
      telegramTabButton.innerHTML = `
        <a href="#" data-tab="telegram-messages-tab">
          <i class="fab fa-telegram"></i>
          <span>Telegram</span>
        </a>
      `;
      navList.appendChild(telegramTabButton);
    }
    
    // Store references to elements
    this.messagesContainer = document.getElementById('telegram-messages-container');
    this.messageForm = document.getElementById('telegram-message-form');
    this.messageInput = document.getElementById('telegram-message-input');
  }
  
  // Add event listeners
  addEventListeners() {
    // Handle message form submission
    if (this.messageForm) {
      this.messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const messageText = this.messageInput.value.trim();
        if (messageText) {
          this.sendMessage(messageText);
          this.messageInput.value = '';
        }
      });
    }
  }
  
  // Send message
  async sendMessage(text) {
    try {
      // Add message to UI
      this.addMessageToUI({
        id: Date.now(),
        type: 'outgoing',
        text: text,
        from: {
          id: 0,
          first_name: 'Marty',
          last_name: 'Bot'
        },
        date: new Date().toISOString()
      });
      
      // Send message via Telegram integration
      await telegramIntegration.sendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  
  // Add message to UI
  addMessageToUI(message) {
    if (!this.messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `telegram-message ${message.type === 'outgoing' ? 'outgoing' : 'incoming'}`;
    messageElement.dataset.id = message.id;
    
    const date = new Date(message.date);
    const formattedTime = date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${message.from.first_name} ${message.from.last_name || ''}</span>
        <span class="message-time">${formattedTime}</span>
      </div>
      <div class="message-content">${this.formatMessageText(message.text)}</div>
    `;
    
    this.messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  // Format message text (handle commands, links, etc.)
  formatMessageText(text) {
    // Handle commands
    if (text.startsWith('/')) {
      return `<span class="message-command">${text}</span>`;
    }
    
    // Handle links
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(linkRegex, '<a href="$1" target="_blank">$1</a>');
    
    return text;
  }
  
  // Update status indicator
  updateStatus(isConnected) {
    const statusIndicator = document.getElementById('telegram-status-indicator');
    const statusText = document.getElementById('telegram-status-text');
    
    if (statusIndicator && statusText) {
      if (isConnected) {
        statusIndicator.className = 'status-indicator online';
        statusText.textContent = 'Online';
      } else {
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Offline';
      }
    }
  }
  
  // Update messages list
  updateMessages(messages) {
    if (!this.messagesContainer) return;
    
    // Clear existing messages
    this.messagesContainer.innerHTML = '';
    
    // Add messages to UI
    messages.forEach(message => {
      this.addMessageToUI(message);
    });
  }
}

// Create and export Telegram message UI instance
const telegramMessageUI = new TelegramMessageUI();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Update UI when Telegram integration status changes
  if (telegramIntegration) {
    telegramMessageUI.updateStatus(telegramIntegration.isConnected);
    
    // Update messages when available
    if (telegramIntegration.messages && telegramIntegration.messages.length > 0) {
      telegramMessageUI.updateMessages(telegramIntegration.messages);
    }
  }
});
