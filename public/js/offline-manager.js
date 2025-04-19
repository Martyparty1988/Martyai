// Marty Task Commander - Offline Support Module

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineMode = false;
    this.pendingOperations = [];
    this.syncInProgress = false;
    
    // Initialize offline manager
    this.init();
  }
  
  // Initialize offline manager
  init() {
    // Add event listeners for online/offline events
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOnlineStatus.bind(this));
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }
    
    // Check initial online status
    this.handleOnlineStatus();
    
    // Register for periodic sync if supported
    this.registerPeriodicSync();
    
    console.log('Offline manager initialized');
  }
  
  // Handle online/offline status changes
  handleOnlineStatus() {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;
    
    // Update UI based on online status
    this.updateOfflineUI();
    
    // If we're back online and were offline before, sync data
    if (this.isOnline && !wasOnline) {
      this.syncOfflineData();
      
      // Show notification
      this.showNotification('Připojení obnoveno', 'Synchronizuji data...');
    } else if (!this.isOnline && wasOnline) {
      // Show notification
      this.showNotification('Jste offline', 'Aplikace funguje v offline režimu. Některé funkce mohou být omezené.');
    }
  }
  
  // Update UI based on online status
  updateOfflineUI() {
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.style.display = this.isOnline ? 'none' : 'block';
    }
    
    // Update app header
    const appHeader = document.querySelector('header');
    if (appHeader) {
      if (this.isOnline) {
        appHeader.classList.remove('offline');
      } else {
        appHeader.classList.add('offline');
      }
    }
    
    // Disable certain features when offline
    const offlineDisabledElements = document.querySelectorAll('.offline-disabled');
    offlineDisabledElements.forEach(element => {
      element.disabled = !this.isOnline;
      if (this.isOnline) {
        element.classList.remove('disabled');
      } else {
        element.classList.add('disabled');
      }
    });
  }
  
  // Handle service worker messages
  handleServiceWorkerMessage(event) {
    const data = event.data;
    
    if (!data) return;
    
    // Handle different message types
    switch (data.type) {
      case 'reservations-updated':
        this.handleReservationsUpdated(data);
        break;
      case 'tasks-updated':
        this.handleTasksUpdated(data);
        break;
      case 'sync-complete':
        this.handleSyncComplete(data);
        break;
      case 'sync-error':
        this.handleSyncError(data);
        break;
    }
  }
  
  // Handle reservations updated message
  handleReservationsUpdated(data) {
    console.log(`Reservations updated: ${data.count} reservations`);
    
    // Refresh reservations in UI if needed
    if (typeof reservationManager !== 'undefined' && reservationManager.loadReservations) {
      reservationManager.loadReservations();
    }
    
    // Show notification
    this.showNotification('Rezervace aktualizovány', `Synchronizováno ${data.count} rezervací`);
  }
  
  // Handle tasks updated message
  handleTasksUpdated(data) {
    console.log(`Tasks updated: ${data.count} tasks`);
    
    // Refresh tasks in UI if needed
    if (typeof taskManager !== 'undefined' && taskManager.loadTasks) {
      taskManager.loadTasks();
    }
    
    // Show notification
    this.showNotification('Úkoly aktualizovány', `Synchronizováno ${data.count} úkolů`);
  }
  
  // Handle sync complete message
  handleSyncComplete(data) {
    console.log('Sync complete:', data);
    
    this.syncInProgress = false;
    
    // Show notification
    this.showNotification('Synchronizace dokončena', 'Všechna data byla úspěšně synchronizována');
  }
  
  // Handle sync error message
  handleSyncError(data) {
    console.error('Sync error:', data);
    
    this.syncInProgress = false;
    
    // Show notification
    this.showNotification('Chyba synchronizace', data.message || 'Nepodařilo se synchronizovat data', 'error');
  }
  
  // Sync offline data when back online
  syncOfflineData() {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    
    // Show sync indicator
    const syncIndicator = document.getElementById('sync-indicator');
    if (syncIndicator) {
      syncIndicator.style.display = 'block';
    }
    
    // Process pending operations
    this.processPendingOperations()
      .then(() => {
        // Trigger sync in service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            if ('sync' in registration) {
              registration.sync.register('sync-pending-requests');
            }
          });
        }
        
        // Hide sync indicator after a delay
        setTimeout(() => {
          if (syncIndicator) {
            syncIndicator.style.display = 'none';
          }
          this.syncInProgress = false;
        }, 2000);
      })
      .catch(error => {
        console.error('Error syncing offline data:', error);
        
        // Hide sync indicator
        if (syncIndicator) {
          syncIndicator.style.display = 'none';
        }
        
        this.syncInProgress = false;
        
        // Show notification
        this.showNotification('Chyba synchronizace', 'Nepodařilo se synchronizovat offline data', 'error');
      });
  }
  
  // Process pending operations
  async processPendingOperations() {
    if (this.pendingOperations.length === 0) {
      return Promise.resolve();
    }
    
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    
    // Process each operation
    const promises = operations.map(operation => {
      return this.processOperation(operation);
    });
    
    return Promise.all(promises);
  }
  
  // Process a single operation
  async processOperation(operation) {
    try {
      switch (operation.type) {
        case 'add-task':
          await db.addTask(operation.data);
          break;
        case 'update-task':
          await db.updateTask(operation.data);
          break;
        case 'delete-task':
          await db.deleteTask(operation.data);
          break;
        case 'add-reservation':
          await db.addReservation(operation.data);
          break;
        case 'update-reservation':
          await db.updateReservation(operation.data);
          break;
        case 'delete-reservation':
          await db.deleteReservation(operation.data);
          break;
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error processing operation:', error, operation);
      
      // Add back to pending operations if it failed
      this.pendingOperations.push(operation);
      
      return Promise.reject(error);
    }
  }
  
  // Add operation to pending operations
  addPendingOperation(type, data) {
    this.pendingOperations.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Save pending operations to localStorage
    this.savePendingOperations();
    
    return this.pendingOperations.length;
  }
  
  // Save pending operations to localStorage
  savePendingOperations() {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }
  
  // Load pending operations from localStorage
  loadPendingOperations() {
    try {
      const operations = localStorage.getItem('pendingOperations');
      if (operations) {
        this.pendingOperations = JSON.parse(operations);
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }
  
  // Register for periodic sync if supported
  registerPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(registration => {
        // Check if periodic sync is supported
        if ('periodicSync' in registration) {
          // Register for periodic sync
          registration.periodicSync.register('sync-reservations', {
            minInterval: 24 * 60 * 60 * 1000 // Once per day
          }).then(() => {
            console.log('Periodic sync registered for reservations');
          }).catch(error => {
            console.error('Error registering periodic sync for reservations:', error);
          });
          
          registration.periodicSync.register('sync-tasks', {
            minInterval: 60 * 60 * 1000 // Once per hour
          }).then(() => {
            console.log('Periodic sync registered for tasks');
          }).catch(error => {
            console.error('Error registering periodic sync for tasks:', error);
          });
        }
      });
    }
  }
  
  // Show notification
  showNotification(title, message, type = 'info') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    // Set notification content
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
  
  // Check if app is installed
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
  }
  
  // Show install prompt
  showInstallPrompt() {
    const installPrompt = document.getElementById('install-prompt');
    if (!installPrompt) return;
    
    // Check if app is already installed
    if (this.isAppInstalled()) {
      installPrompt.style.display = 'none';
      return;
    }
    
    // Show install prompt
    installPrompt.style.display = 'block';
    
    // Add event listener for install button
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.addEventListener('click', this.installApp.bind(this));
    }
    
    // Add event listener for close button
    const closeButton = document.getElementById('close-install-prompt');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        installPrompt.style.display = 'none';
        
        // Remember that user dismissed the prompt
        localStorage.setItem('installPromptDismissed', 'true');
      });
    }
  }
  
  // Install app
  installApp() {
    if (!window.deferredPrompt) {
      console.error('No deferred prompt available');
      return;
    }
    
    // Show the install prompt
    window.deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    window.deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        
        // Hide the install prompt
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
          installPrompt.style.display = 'none';
        }
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      window.deferredPrompt = null;
    });
  }
}

// Create and export offline manager instance
const offlineManager = new OfflineManager();

// Initialize offline manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load pending operations
  offlineManager.loadPendingOperations();
  
  // Check if we should show the install prompt
  if (!localStorage.getItem('installPromptDismissed')) {
    offlineManager.showInstallPrompt();
  }
});

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default prompt
  event.preventDefault();
  
  // Store the event for later use
  window.deferredPrompt = event;
  
  // Show the install prompt
  offlineManager.showInstallPrompt();
});
