// Marty AI - Telegram Bot with OpenAI Integration

class TelegramBotManager {
  constructor() {
    this.apiUrl = 'https://api.telegram.org/bot';
    this.botToken = ''; // Will be loaded from settings
    this.chatId = ''; // Will be loaded from settings
    this.messages = [];
    this.openAiManager = null;
    this.localStorageManager = null;
    this.isConnected = false;
    this.lastUpdateId = 0;
    this.pollingInterval = null;
    this.pollingDelay = 5000; // 5 seconds
  }

  // Initialize the Telegram bot manager
  init(openAiManager, localStorageManager) {
    this.openAiManager = openAiManager;
    this.localStorageManager = localStorageManager;
    
    // Load settings
    this.loadSettings();
    
    // Load messages from localStorage
    this.loadMessages();
    
    console.log('Telegram Bot Manager initialized');
    
    // Start polling if token is available
    if (this.botToken) {
      this.connect();
    }
    
    // Initialize UI elements
    this.initUI();
  }
  
  // Load settings from localStorage
  loadSettings() {
    if (this.localStorageManager) {
      const apiKeys = this.localStorageManager.getApiKeys() || {};
      this.botToken = apiKeys.telegramBotToken || '';
      this.chatId = apiKeys.telegramChatId || '';
    }
  }
  
  // Save settings to localStorage
  saveSettings() {
    if (this.localStorageManager) {
      const apiKeys = this.localStorageManager.getApiKeys() || {};
      apiKeys.telegramBotToken = this.botToken;
      apiKeys.telegramChatId = this.chatId;
      this.localStorageManager.saveApiKeys(apiKeys);
    }
  }
  
  // Load messages from localStorage
  loadMessages() {
    if (this.localStorageManager) {
      this.messages = this.localStorageManager.getTelegramMessages() || [];
    }
  }
  
  // Save messages to localStorage
  saveMessages() {
    if (this.localStorageManager) {
      this.localStorageManager.saveTelegramMessages(this.messages);
    }
  }
  
  // Connect to Telegram API and start polling for updates
  connect() {
    if (!this.botToken) {
      console.error('Telegram Bot Token is not set');
      this.showNotification('Telegram Bot Token není nastaven', 'error');
      return false;
    }
    
    // Test connection
    this.getMe()
      .then(response => {
        if (response && response.ok) {
          this.isConnected = true;
          this.showNotification(`Připojeno k Telegram botu: ${response.result.first_name}`, 'success');
          
          // Start polling for updates
          this.startPolling();
          
          // Update UI
          this.updateConnectionStatus();
          
          return true;
        } else {
          throw new Error('Failed to connect to Telegram Bot API');
        }
      })
      .catch(error => {
        console.error('Error connecting to Telegram Bot API:', error);
        this.isConnected = false;
        this.showNotification('Chyba připojení k Telegram Bot API', 'error');
        
        // Update UI
        this.updateConnectionStatus();
        
        return false;
      });
  }
  
  // Disconnect from Telegram API and stop polling
  disconnect() {
    this.isConnected = false;
    this.stopPolling();
    this.updateConnectionStatus();
    this.showNotification('Odpojeno od Telegram bota', 'info');
  }
  
  // Start polling for updates
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    // Get updates immediately
    this.getUpdates();
    
    // Then start polling
    this.pollingInterval = setInterval(() => {
      this.getUpdates();
    }, this.pollingDelay);
  }
  
  // Stop polling for updates
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  // Get bot information
  async getMe() {
    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/getMe`);
      return await response.json();
    } catch (error) {
      console.error('Error in getMe:', error);
      return null;
    }
  }
  
  // Get updates from Telegram
  async getUpdates() {
    if (!this.isConnected || !this.botToken) return;
    
    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`);
      const data = await response.json();
      
      if (data.ok && data.result.length > 0) {
        // Process updates
        data.result.forEach(update => {
          this.processUpdate(update);
          this.lastUpdateId = update.update_id;
        });
      }
    } catch (error) {
      console.error('Error getting updates:', error);
    }
  }
  
  // Process an update from Telegram
  processUpdate(update) {
    if (update.message) {
      const message = update.message;
      
      // Only process messages from allowed chat IDs if set
      if (this.chatId && message.chat.id.toString() !== this.chatId) {
        console.log(`Ignoring message from unauthorized chat: ${message.chat.id}`);
        return;
      }
      
      // Create message object
      const messageObj = {
        id: message.message_id,
        chatId: message.chat.id,
        from: {
          id: message.from.id,
          firstName: message.from.first_name,
          lastName: message.from.last_name,
          username: message.from.username
        },
        text: message.text,
        date: new Date(message.date * 1000),
        isFromBot: false
      };
      
      // Add message to list
      this.addMessage(messageObj);
      
      // Process message with OpenAI and respond
      this.processMessageWithOpenAI(messageObj);
    }
  }
  
  // Process message with OpenAI and respond
  async processMessageWithOpenAI(message) {
    if (!this.openAiManager) {
      console.error('OpenAI Manager is not initialized');
      return;
    }
    
    try {
      // Show typing indicator
      this.sendChatAction(message.chatId, 'typing');
      
      // Process message with OpenAI
      const response = await this.openAiManager.processMessage(message.text);
      
      // Send response back to Telegram
      this.sendMessage(message.chatId, response);
      
      // Add bot response to messages
      const responseObj = {
        id: Date.now(),
        chatId: message.chatId,
        from: {
          id: 'bot',
          firstName: 'Marty',
          lastName: 'AI',
          username: 'MartyAIBot'
        },
        text: response,
        date: new Date(),
        isFromBot: true
      };
      
      this.addMessage(responseObj);
    } catch (error) {
      console.error('Error processing message with OpenAI:', error);
      
      // Send error message
      this.sendMessage(message.chatId, 'Omlouvám se, ale došlo k chybě při zpracování vaší zprávy. Zkuste to prosím znovu později.');
    }
  }
  
  // Send a message to Telegram
  async sendMessage(chatId, text) {
    if (!this.isConnected || !this.botToken) return;
    
    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }
  
  // Send chat action to Telegram (typing, etc.)
  async sendChatAction(chatId, action) {
    if (!this.isConnected || !this.botToken) return;
    
    try {
      const response = await fetch(`${this.apiUrl}${this.botToken}/sendChatAction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          action: action
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error sending chat action:', error);
      return null;
    }
  }
  
  // Add a message to the list and update UI
  addMessage(message) {
    this.messages.push(message);
    
    // Limit messages to last 100
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
    
    // Save messages to localStorage
    this.saveMessages();
    
    // Update UI
    this.updateMessagesUI();
  }
  
  // Initialize UI elements
  initUI() {
    // Connect send button
    const sendButton = document.querySelector('.telegram-input button');
    const inputField = document.querySelector('.telegram-input input');
    
    if (sendButton && inputField) {
      sendButton.addEventListener('click', () => {
        const text = inputField.value.trim();
        if (text) {
          this.sendMessageFromUI(text);
          inputField.value = '';
        }
      });
      
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const text = inputField.value.trim();
          if (text) {
            this.sendMessageFromUI(text);
            inputField.value = '';
          }
        }
      });
    }
    
    // Connect settings buttons
    const tokenEditButton = document.querySelector('.settings-item:nth-child(2) button');
    if (tokenEditButton) {
      tokenEditButton.addEventListener('click', () => {
        const token = prompt('Zadejte Telegram Bot Token:', this.botToken);
        if (token !== null) {
          this.botToken = token;
          this.saveSettings();
          
          // Reconnect if token changed
          if (this.isConnected) {
            this.disconnect();
          }
          
          if (token) {
            this.connect();
          }
        }
      });
    }
    
    // Update UI with current data
    this.updateMessagesUI();
    this.updateConnectionStatus();
  }
  
  // Send a message from the UI
  sendMessageFromUI(text) {
    if (!this.isConnected) {
      this.showNotification('Nejste připojeni k Telegram botu', 'error');
      return;
    }
    
    if (!this.chatId) {
      this.showNotification('Není nastaven chat ID', 'error');
      return;
    }
    
    // Create message object for UI
    const messageObj = {
      id: Date.now(),
      chatId: this.chatId,
      from: {
        id: 'user',
        firstName: 'Admin',
        lastName: '',
        username: 'admin'
      },
      text: text,
      date: new Date(),
      isFromBot: false
    };
    
    // Add message to list
    this.addMessage(messageObj);
    
    // Send message to Telegram
    this.sendMessage(this.chatId, text);
  }
  
  // Update messages UI
  updateMessagesUI() {
    const messagesContainer = document.querySelector('.telegram-messages');
    const telegramChatContainer = document.getElementById('telegram-chat');
    
    if (messagesContainer) {
      // Update dashboard tile
      messagesContainer.innerHTML = '';
      
      // Show last 2 messages
      const lastMessages = this.messages.slice(-2);
      
      lastMessages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'telegram-message';
        
        messageElement.innerHTML = `
          <div class="telegram-message-avatar">
            <i class="fas ${message.isFromBot ? 'fa-robot' : 'fa-user'}"></i>
          </div>
          <div class="telegram-message-content">
            <div class="telegram-message-name">${message.isFromBot ? 'MartyBot' : message.from.firstName + ' ' + (message.from.lastName || '')}</div>
            <div class="telegram-message-text">${message.text}</div>
            <div class="telegram-message-time">${this.formatDate(message.date)}</div>
          </div>
        `;
        
        messagesContainer.appendChild(messageElement);
      });
    }
    
    if (telegramChatContainer) {
      // Update full chat page
      telegramChatContainer.innerHTML = '';
      
      // Show all messages
      this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = 'telegram-message';
        
        messageElement.innerHTML = `
          <div class="telegram-message-avatar">
            <i class="fas ${message.isFromBot ? 'fa-robot' : 'fa-user'}"></i>
          </div>
          <div class="telegram-message-content">
            <div class="telegram-message-name">${message.isFromBot ? 'MartyBot' : message.from.firstName + ' ' + (message.from.lastName || '')}</div>
            <div class="telegram-message-text">${message.text}</div>
            <div class="telegram-message-time">${this.formatDate(message.date)}</div>
          </div>
        `;
        
        telegramChatContainer.appendChild(messageElement);
      });
      
      // Scroll to bottom
      telegramChatContainer.scrollTop = telegramChatContainer.scrollHeight;
    }
  }
  
  // Update connection status in UI
  updateConnectionStatus() {
    const statusElements = document.querySelectorAll('.telegram-connection-status');
    
    statusElements.forEach(element => {
      element.className = `telegram-connection-status ${this.isConnected ? 'connected' : 'disconnected'}`;
      element.innerHTML = this.isConnected ? 'Připojeno' : 'Odpojeno';
    });
  }
  
  // Format date for display
  formatDate(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date >= today;
    const isYesterday = date >= yesterday && date < today;
    
    if (isToday) {
      return `Dnes, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (isYesterday) {
      return `Včera, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }
  
  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.classList.remove('hidden');
      
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
}

// Create and export Telegram bot manager instance
const telegramBotManager = new TelegramBotManager();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for OpenAI manager and localStorage manager to be available
  const checkDependencies = () => {
    if (window.openAiManager && window.localStorageManager) {
      telegramBotManager.init(window.openAiManager, window.localStorageManager);
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  
  checkDependencies();
});
