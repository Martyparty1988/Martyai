// Marty Task Commander - Main Application Module

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Marty Task Commander initializing...');
  
  try {
    // Initialize UI first
    uiManager.init();
    console.log('UI initialized');
    
    // Initialize database
    await db.init();
    console.log('Database initialized');
    
    // Initialize reservation manager
    await reservationManager.init();
    console.log('Reservation manager initialized');
    
    // Initialize task manager
    await taskManager.init();
    console.log('Task manager initialized');
    
    // Test AI connection
    const aiConnected = await aiManager.testConnection();
    console.log('AI connection test:', aiConnected ? 'successful' : 'failed');
    
    // Initialize Telegram bot in background
    setTimeout(async () => {
      try {
        await telegramBotManager.init();
        console.log('Telegram bot initialized');
      } catch (error) {
        console.error('Error initializing Telegram bot:', error);
      }
    }, 2000);
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    // Set up sync button functionality
    document.getElementById('sync-btn').addEventListener('click', async () => {
      try {
        // Show sync notification
        const syncNotification = document.getElementById('sync-notification');
        syncNotification.textContent = 'Synchronizace dat...';
        syncNotification.classList.remove('hidden');
        
        // Sync reservations
        await icalParser.syncReservations();
        
        // Create tasks from reservations
        await taskManager.createTasksFromReservations();
        
        // Hide sync notification
        syncNotification.classList.add('hidden');
        
        // Show success notification
        uiManager.showNotification('Synchronizace dokončena');
      } catch (error) {
        console.error('Error during sync:', error);
        uiManager.showNotification('Chyba při synchronizaci');
      }
    });
    
    // Application is ready
    console.log('Marty Task Commander initialized successfully');
    uiManager.showNotification('Aplikace je připravena', 2000);
    
  } catch (error) {
    console.error('Error initializing application:', error);
    
    // Show error notification
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <h2>Chyba při inicializaci aplikace</h2>
      <p>${error.message}</p>
      <button id="retry-btn">Zkusit znovu</button>
    `;
    
    document.body.appendChild(errorMessage);
    
    // Add retry button functionality
    document.getElementById('retry-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }
});

// Handle beforeunload event to warn about unsaved changes
window.addEventListener('beforeunload', (event) => {
  // Check if there are any unsaved changes
  // This is a placeholder for actual implementation
  const hasUnsavedChanges = false;
  
  if (hasUnsavedChanges) {
    // Standard way of showing a confirmation dialog before leaving the page
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
});

// Handle app installation event
window.addEventListener('appinstalled', (event) => {
  console.log('Marty Task Commander was installed');
  uiManager.showNotification('Aplikace byla nainstalována');
});

// Expose app version
window.appVersion = '1.0.0';
console.log(`Marty Task Commander v${window.appVersion}`);
