// Marty AI - Settings Manager

class SettingsManager {
  constructor() {
    this.settings = {
      general: {
        darkMode: false,
        notifications: true,
        language: 'cs',
        autoSync: true
      },
      api: {
        openAiApiKey: '',
        telegramBotToken: '',
        telegramChatId: ''
      },
      ical: {
        ceskomalinskaUrl: 'https://www.airbnb.com/calendar/ical/12345.ics?s=abcdef1234567890',
        podoliUrl: 'https://www.airbnb.com/calendar/ical/67890.ics?s=abcdef1234567890',
        marnaUrl: 'https://www.airbnb.com/calendar/ical/13579.ics?s=abcdef1234567890',
        syncInterval: 60 // minutes
      },
      data: {
        localStorageEnabled: true,
        syncOnStartup: true,
        backupFrequency: 'weekly'
      },
      ui: {
        calendarView: 'month',
        defaultTab: 'dashboard',
        showFloatingCalendar: true
      }
    };
    
    this.localStorageManager = null;
    this.settingsLoaded = false;
  }

  // Initialize the settings manager
  init(localStorageManager) {
    this.localStorageManager = localStorageManager;
    
    // Load settings from localStorage
    this.loadSettings();
    
    // Initialize UI elements
    this.initUI();
    
    console.log('Settings Manager initialized');
  }
  
  // Load settings from localStorage
  loadSettings() {
    if (!this.localStorageManager) return;
    
    const savedSettings = this.localStorageManager.getItem('settings');
    if (savedSettings) {
      // Merge saved settings with defaults
      this.settings = this.mergeObjects(this.settings, savedSettings);
      this.settingsLoaded = true;
      
      // Apply settings
      this.applySettings();
    }
  }
  
  // Save settings to localStorage
  saveSettings() {
    if (!this.localStorageManager) return;
    
    this.localStorageManager.setItem('settings', this.settings);
    
    // Apply settings
    this.applySettings();
  }
  
  // Apply current settings to the application
  applySettings() {
    // Apply dark mode
    if (this.settings.general.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Apply localStorage setting
    if (this.localStorageManager) {
      this.localStorageManager.setEnabled(this.settings.data.localStorageEnabled);
    }
    
    // Apply UI settings
    this.applyUISettings();
    
    // Dispatch settings changed event
    const event = new CustomEvent('settings-changed', { detail: this.settings });
    document.dispatchEvent(event);
  }
  
  // Apply UI-specific settings
  applyUISettings() {
    // Set default tab
    const defaultTab = this.settings.ui.defaultTab;
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-tab') === defaultTab) {
        link.classList.add('active');
      }
    });
    
    tabContents.forEach(tab => {
      tab.classList.remove('active');
      if (tab.id === `${defaultTab}-tab`) {
        tab.classList.add('active');
      }
    });
    
    // Show/hide floating calendar
    const floatingCalendar = document.getElementById('floating-calendar');
    if (floatingCalendar) {
      if (this.settings.ui.showFloatingCalendar) {
        floatingCalendar.classList.remove('hidden');
      } else {
        floatingCalendar.classList.add('hidden');
      }
    }
  }
  
  // Initialize UI elements
  initUI() {
    // Connect settings toggles and inputs
    this.connectGeneralSettings();
    this.connectApiSettings();
    this.connectIcalSettings();
    this.connectDataSettings();
    this.connectUISettings();
    
    // Update UI with current settings
    this.updateUI();
  }
  
  // Connect general settings UI elements
  connectGeneralSettings() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.checked = this.settings.general.darkMode;
      
      darkModeToggle.addEventListener('change', () => {
        this.settings.general.darkMode = darkModeToggle.checked;
        this.saveSettings();
        this.showNotification(
          darkModeToggle.checked ? 'Tmavý režim aktivován' : 'Světlý režim aktivován',
          'info'
        );
      });
    }
    
    // Notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
      notificationsToggle.checked = this.settings.general.notifications;
      
      notificationsToggle.addEventListener('change', () => {
        this.settings.general.notifications = notificationsToggle.checked;
        this.saveSettings();
        this.showNotification(
          notificationsToggle.checked ? 'Notifikace povoleny' : 'Notifikace zakázány',
          'info'
        );
      });
    }
  }
  
  // Connect API settings UI elements
  connectApiSettings() {
    // OpenAI API key
    const openAiKeyButton = document.querySelector('.settings-item:nth-child(1) button');
    if (openAiKeyButton) {
      openAiKeyButton.addEventListener('click', () => {
        const key = prompt('Zadejte OpenAI API klíč:', this.settings.api.openAiApiKey);
        if (key !== null) {
          this.settings.api.openAiApiKey = key;
          this.saveSettings();
          this.showNotification('OpenAI API klíč byl aktualizován', 'success');
        }
      });
    }
    
    // Telegram Bot Token
    const telegramTokenButton = document.querySelector('.settings-item:nth-child(2) button');
    if (telegramTokenButton) {
      telegramTokenButton.addEventListener('click', () => {
        const token = prompt('Zadejte Telegram Bot Token:', this.settings.api.telegramBotToken);
        if (token !== null) {
          this.settings.api.telegramBotToken = token;
          this.saveSettings();
          this.showNotification('Telegram Bot Token byl aktualizován', 'success');
          
          // Notify Telegram manager
          const event = new CustomEvent('telegram-token-changed', { detail: token });
          document.dispatchEvent(event);
        }
      });
    }
  }
  
  // Connect iCal settings UI elements
  connectIcalSettings() {
    // Českomalínská iCal URL
    const ceskomalinskaButton = document.querySelector('.settings-section:nth-child(3) .settings-item:nth-child(1) button');
    if (ceskomalinskaButton) {
      ceskomalinskaButton.addEventListener('click', () => {
        const url = prompt('Zadejte iCal URL pro Českomalínskou:', this.settings.ical.ceskomalinskaUrl);
        if (url !== null) {
          this.settings.ical.ceskomalinskaUrl = url;
          this.saveSettings();
          this.showNotification('iCal URL pro Českomalínskou byl aktualizován', 'success');
        }
      });
    }
    
    // Podolí iCal URL
    const podoliButton = document.querySelector('.settings-section:nth-child(3) .settings-item:nth-child(2) button');
    if (podoliButton) {
      podoliButton.addEventListener('click', () => {
        const url = prompt('Zadejte iCal URL pro Podolí:', this.settings.ical.podoliUrl);
        if (url !== null) {
          this.settings.ical.podoliUrl = url;
          this.saveSettings();
          this.showNotification('iCal URL pro Podolí byl aktualizován', 'success');
        }
      });
    }
    
    // Marna iCal URL
    const marnaButton = document.querySelector('.settings-section:nth-child(3) .settings-item:nth-child(3) button');
    if (marnaButton) {
      marnaButton.addEventListener('click', () => {
        const url = prompt('Zadejte iCal URL pro Marnu:', this.settings.ical.marnaUrl);
        if (url !== null) {
          this.settings.ical.marnaUrl = url;
          this.saveSettings();
          this.showNotification('iCal URL pro Marnu byl aktualizován', 'success');
        }
      });
    }
  }
  
  // Connect data settings UI elements
  connectDataSettings() {
    // localStorage toggle
    const localStorageToggle = document.getElementById('localstorage-toggle');
    if (localStorageToggle) {
      localStorageToggle.checked = this.settings.data.localStorageEnabled;
      
      localStorageToggle.addEventListener('change', () => {
        this.settings.data.localStorageEnabled = localStorageToggle.checked;
        this.saveSettings();
        this.showNotification(
          localStorageToggle.checked ? 'Ukládání do localStorage povoleno' : 'Ukládání do localStorage zakázáno',
          'info'
        );
      });
    }
    
    // Clear data button
    const clearDataButton = document.querySelector('.settings-item button.btn-danger');
    if (clearDataButton) {
      clearDataButton.addEventListener('click', () => {
        if (confirm('Opravdu chcete vymazat všechna lokálně uložená data? Tato akce je nevratná.')) {
          if (this.localStorageManager) {
            this.localStorageManager.clear();
            this.showNotification('Všechna lokální data byla vymazána', 'info');
          }
        }
      });
    }
    
    // Export data button
    const exportDataButton = document.querySelector('.settings-item:nth-child(3) button');
    if (exportDataButton) {
      exportDataButton.addEventListener('click', () => {
        if (this.localStorageManager) {
          const data = this.localStorageManager.exportData();
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
            
            this.showNotification('Data byla exportována', 'success');
          }
        }
      });
    }
  }
  
  // Connect UI settings elements
  connectUISettings() {
    // These would be implemented in a real app
    // For now, we'll just use the defaults
  }
  
  // Update UI with current settings
  updateUI() {
    // Update toggles
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.checked = this.settings.general.darkMode;
    }
    
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
      notificationsToggle.checked = this.settings.general.notifications;
    }
    
    const localStorageToggle = document.getElementById('localstorage-toggle');
    if (localStorageToggle) {
      localStorageToggle.checked = this.settings.data.localStorageEnabled;
    }
  }
  
  // Get a setting value
  getSetting(category, name) {
    if (this.settings[category] && this.settings[category][name] !== undefined) {
      return this.settings[category][name];
    }
    return null;
  }
  
  // Set a setting value
  setSetting(category, name, value) {
    if (this.settings[category]) {
      this.settings[category][name] = value;
      this.saveSettings();
      return true;
    }
    return false;
  }
  
  // Helper method to merge objects
  mergeObjects(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeObjects(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
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

// Create and export settings manager instance
const settingsManager = new SettingsManager();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for localStorage manager to be available
  const checkDependencies = () => {
    if (window.localStorageManager) {
      settingsManager.init(window.localStorageManager);
      
      // Make settings available globally
      window.settingsManager = settingsManager;
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  
  checkDependencies();
});
