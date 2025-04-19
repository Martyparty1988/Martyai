// Marty AI - LocalStorage Data Persistence Module

class LocalStorageManager {
  constructor() {
    this.enabled = true;
    this.prefix = 'marty_ai_';
    this.init();
  }
  
  // Initialize the local storage manager
  init() {
    // Check if localStorage is available
    this.available = this.isLocalStorageAvailable();
    
    // Load settings from localStorage
    this.loadSettings();
    
    console.log('LocalStorage Manager initialized. Available:', this.available, 'Enabled:', this.enabled);
  }
  
  // Check if localStorage is available
  isLocalStorageAvailable() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('LocalStorage is not available:', e);
      return false;
    }
  }
  
  // Load settings from localStorage
  loadSettings() {
    if (!this.available) return;
    
    const settingsStr = localStorage.getItem(this.prefix + 'settings');
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        this.enabled = settings.localStorageEnabled !== false; // Default to true if not set
      } catch (e) {
        console.error('Error parsing settings from localStorage:', e);
      }
    }
  }
  
  // Save settings to localStorage
  saveSettings(settings) {
    if (!this.available) return false;
    
    try {
      const settingsStr = JSON.stringify(settings);
      localStorage.setItem(this.prefix + 'settings', settingsStr);
      this.enabled = settings.localStorageEnabled !== false;
      return true;
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
      return false;
    }
  }
  
  // Enable or disable localStorage
  setEnabled(enabled) {
    this.enabled = enabled;
    
    // Update settings
    const settings = this.getItem('settings') || {};
    settings.localStorageEnabled = enabled;
    this.saveSettings(settings);
    
    return this.enabled;
  }
  
  // Get item from localStorage
  getItem(key) {
    if (!this.available || !this.enabled) return null;
    
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error(`Error getting item '${key}' from localStorage:`, e);
      return null;
    }
  }
  
  // Set item in localStorage
  setItem(key, value) {
    if (!this.available || !this.enabled) return false;
    
    try {
      const valueStr = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, valueStr);
      return true;
    } catch (e) {
      console.error(`Error setting item '${key}' in localStorage:`, e);
      return false;
    }
  }
  
  // Remove item from localStorage
  removeItem(key) {
    if (!this.available || !this.enabled) return false;
    
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (e) {
      console.error(`Error removing item '${key}' from localStorage:`, e);
      return false;
    }
  }
  
  // Clear all items with our prefix from localStorage
  clear() {
    if (!this.available) return false;
    
    try {
      // Only remove items with our prefix
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove the keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
  
  // Get all keys with our prefix
  getKeys() {
    if (!this.available || !this.enabled) return [];
    
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (e) {
      console.error('Error getting keys from localStorage:', e);
      return [];
    }
  }
  
  // Get localStorage usage statistics
  getUsageStats() {
    if (!this.available) return { used: 0, total: 0, percentage: 0 };
    
    try {
      let totalSize = 0;
      let ourSize = 0;
      
      // Calculate total size
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
        totalSize += size;
        
        if (key.startsWith(this.prefix)) {
          ourSize += size;
        }
      }
      
      // Estimate total available space (5MB is common limit)
      const totalAvailable = 5 * 1024 * 1024;
      const percentageUsed = (totalSize / totalAvailable) * 100;
      
      return {
        used: totalSize,
        ourUsed: ourSize,
        total: totalAvailable,
        percentage: percentageUsed,
        ourPercentage: (ourSize / totalAvailable) * 100
      };
    } catch (e) {
      console.error('Error calculating localStorage usage:', e);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
  
  // Export all data to JSON
  exportData() {
    if (!this.available || !this.enabled) return null;
    
    try {
      const data = {};
      const keys = this.getKeys();
      
      keys.forEach(key => {
        data[key] = this.getItem(key);
      });
      
      return data;
    } catch (e) {
      console.error('Error exporting data from localStorage:', e);
      return null;
    }
  }
  
  // Import data from JSON
  importData(data) {
    if (!this.available || !this.enabled || !data) return false;
    
    try {
      // Clear existing data first
      this.clear();
      
      // Import new data
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key]);
      });
      
      return true;
    } catch (e) {
      console.error('Error importing data to localStorage:', e);
      return false;
    }
  }
  
  // Save reservations to localStorage
  saveReservations(reservations) {
    return this.setItem('reservations', reservations);
  }
  
  // Get reservations from localStorage
  getReservations() {
    return this.getItem('reservations') || [];
  }
  
  // Save tasks to localStorage
  saveTasks(tasks) {
    return this.setItem('tasks', tasks);
  }
  
  // Get tasks from localStorage
  getTasks() {
    return this.getItem('tasks') || [];
  }
  
  // Save notes to localStorage
  saveNotes(notes) {
    return this.setItem('notes', notes);
  }
  
  // Get notes from localStorage
  getNotes() {
    return this.getItem('notes') || [];
  }
  
  // Save Telegram messages to localStorage
  saveTelegramMessages(messages) {
    return this.setItem('telegram_messages', messages);
  }
  
  // Get Telegram messages from localStorage
  getTelegramMessages() {
    return this.getItem('telegram_messages') || [];
  }
  
  // Save user preferences to localStorage
  saveUserPreferences(preferences) {
    return this.setItem('user_preferences', preferences);
  }
  
  // Get user preferences from localStorage
  getUserPreferences() {
    return this.getItem('user_preferences') || {};
  }
  
  // Save API keys to localStorage (encrypted in a real app)
  saveApiKeys(apiKeys) {
    // In a real app, these would be encrypted before storage
    return this.setItem('api_keys', apiKeys);
  }
  
  // Get API keys from localStorage
  getApiKeys() {
    // In a real app, these would be decrypted after retrieval
    return this.getItem('api_keys') || {};
  }
}

// Create and export localStorage manager instance
const localStorageManager = new LocalStorageManager();

// Initialize event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Connect localStorage toggle in settings
  const localStorageToggle = document.getElementById('localstorage-toggle');
  if (localStorageToggle) {
    // Set initial state
    localStorageToggle.checked = localStorageManager.enabled;
    
    // Add change event listener
    localStorageToggle.addEventListener('change', function() {
      localStorageManager.setEnabled(this.checked);
      
      // Show notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.textContent = this.checked 
          ? 'Ukládání do localStorage povoleno' 
          : 'Ukládání do localStorage zakázáno';
        notification.className = 'notification info';
        notification.classList.remove('hidden');
        
        setTimeout(() => {
          notification.classList.add('hidden');
        }, 3000);
      }
    });
  }
  
  // Connect clear data button
  const clearDataBtn = document.querySelector('.settings-item button.btn-danger');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', function() {
      if (confirm('Opravdu chcete vymazat všechna lokálně uložená data? Tato akce je nevratná.')) {
        localStorageManager.clear();
        
        // Show notification
        const notification = document.getElementById('notification');
        if (notification) {
          notification.textContent = 'Všechna lokální data byla vymazána';
          notification.className = 'notification info';
          notification.classList.remove('hidden');
          
          setTimeout(() => {
            notification.classList.add('hidden');
          }, 3000);
        }
      }
    });
  }
  
  // Connect export data button
  const exportDataBtn = document.querySelector('.settings-item button.btn-outline');
  if (exportDataBtn) {
    exportDataBtn.addEventListener('click', function() {
      const data = localStorageManager.exportData();
      if (data) {
        // Create a download link
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marty_ai_data_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show notification
        const notification = document.getElementById('notification');
        if (notification) {
          notification.textContent = 'Data byla exportována';
          notification.className = 'notification info';
          notification.classList.remove('hidden');
          
          setTimeout(() => {
            notification.classList.add('hidden');
          }, 3000);
        }
      }
    });
  }
});
