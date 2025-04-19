// Marty AI - Main Application Script

// Global variables to store manager instances
let localStorageManager;
let settingsManager;
let openAiManager;
let telegramBotManager;
let voiceDictationManager;
let floatingCalendarManager;

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Marty AI application...');
  
  // Initialize managers in the correct order
  initializeManagers();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load initial data
  loadInitialData();
});

// Initialize all managers in the correct dependency order
function initializeManagers() {
  // First, initialize localStorage manager (no dependencies)
  if (window.localStorageManager) {
    localStorageManager = window.localStorageManager;
    console.log('LocalStorage Manager initialized');
  } else {
    console.error('LocalStorage Manager not found');
  }
  
  // Next, initialize settings manager (depends on localStorage)
  if (window.settingsManager && localStorageManager) {
    settingsManager = window.settingsManager;
    console.log('Settings Manager initialized');
  } else {
    console.error('Settings Manager not found or dependencies not met');
  }
  
  // Initialize OpenAI manager (depends on localStorage and settings)
  if (window.openAiManager && localStorageManager && settingsManager) {
    openAiManager = window.openAiManager;
    console.log('OpenAI Manager initialized');
  } else {
    console.error('OpenAI Manager not found or dependencies not met');
  }
  
  // Initialize Telegram bot manager (depends on OpenAI, localStorage, and settings)
  if (window.telegramBotManager && openAiManager && localStorageManager && settingsManager) {
    telegramBotManager = window.telegramBotManager;
    console.log('Telegram Bot Manager initialized');
  } else {
    console.error('Telegram Bot Manager not found or dependencies not met');
  }
  
  // Initialize voice dictation manager (depends on OpenAI, localStorage, and settings)
  if (window.voiceDictationManager && openAiManager && localStorageManager && settingsManager) {
    voiceDictationManager = window.voiceDictationManager;
    console.log('Voice Dictation Manager initialized');
  } else {
    console.error('Voice Dictation Manager not found or dependencies not met');
  }
  
  // Initialize floating calendar manager (depends on localStorage and settings)
  if (window.floatingCalendarManager && localStorageManager && settingsManager) {
    floatingCalendarManager = window.floatingCalendarManager;
    console.log('Floating Calendar Manager initialized');
  } else {
    console.error('Floating Calendar Manager not found or dependencies not met');
  }
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  // Tab navigation
  const navLinks = document.querySelectorAll('.nav-link');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links and tabs
      navLinks.forEach(l => l.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked link and corresponding tab
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
      
      // Save as default tab in settings
      if (settingsManager) {
        settingsManager.setSetting('ui', 'defaultTab', this.getAttribute('data-tab'));
      }
    });
  });
  
  // Add task button
  const addTaskBtn = document.getElementById('add-task-btn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
      createNewTask();
    });
  }
  
  // Listen for online/offline events
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
  
  // Check initial online status
  if (navigator.onLine) {
    handleOnlineStatus();
  } else {
    handleOfflineStatus();
  }
  
  // Listen for custom events
  document.addEventListener('voice-task-created', handleVoiceTaskCreated);
  document.addEventListener('voice-note-created', handleVoiceNoteCreated);
  document.addEventListener('calendar-date-selected', handleCalendarDateSelected);
  document.addEventListener('settings-changed', handleSettingsChanged);
  document.addEventListener('telegram-token-changed', handleTelegramTokenChanged);
}

// Load initial data for the application
function loadInitialData() {
  // Load reservations
  loadReservations();
  
  // Load tasks
  loadTasks();
  
  // Load notes
  loadNotes();
  
  // Apply settings
  if (settingsManager) {
    settingsManager.applySettings();
  }
  
  // Show welcome notification
  showNotification('Vítejte v aplikaci Marty AI', 'info');
}

// Handle online status change
function handleOnlineStatus() {
  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.classList.remove('visible');
  }
  
  // Sync data if needed
  syncData();
}

// Handle offline status change
function handleOfflineStatus() {
  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.classList.add('visible');
  }
}

// Sync data with server
function syncData() {
  const syncIndicator = document.getElementById('sync-indicator');
  if (syncIndicator) {
    syncIndicator.classList.add('visible');
  }
  
  // Simulate sync delay
  setTimeout(() => {
    if (syncIndicator) {
      syncIndicator.classList.remove('visible');
    }
    
    showNotification('Data byla úspěšně synchronizována', 'success');
  }, 2000);
}

// Load reservations from localStorage
function loadReservations() {
  if (!localStorageManager) return;
  
  const reservations = localStorageManager.getReservations() || [];
  
  // Update UI with reservations
  updateReservationsUI(reservations);
}

// Update reservations UI
function updateReservationsUI(reservations) {
  // Update today's reservations on dashboard
  const todayReservationsContainer = document.getElementById('today-reservations');
  if (todayReservationsContainer) {
    // For demo purposes, we'll keep the existing content
    // In a real app, this would be populated with actual reservation data
  }
  
  // Update reservations calendar
  const reservationsCalendar = document.getElementById('reservations-calendar');
  if (reservationsCalendar) {
    // For demo purposes, we'll just show a message
    reservationsCalendar.innerHTML = `
      <div class="calendar-message">
        <p>Načteno ${reservations.length} rezervací.</p>
        <p>Kalendář rezervací bude implementován v další verzi.</p>
      </div>
    `;
  }
  
  // Notify calendar of reservation changes
  document.dispatchEvent(new CustomEvent('reservations-updated'));
}

// Load tasks from localStorage
function loadTasks() {
  if (!localStorageManager) return;
  
  const tasks = localStorageManager.getTasks() || [];
  
  // Update UI with tasks
  updateTasksUI(tasks);
}

// Update tasks UI
function updateTasksUI(tasks) {
  // Update pending tasks on dashboard
  const pendingTasksContainer = document.getElementById('pending-tasks');
  if (pendingTasksContainer) {
    // For demo purposes, we'll keep the existing content
    // In a real app, this would be populated with actual task data
  }
  
  // Update tasks list
  const tasksList = document.getElementById('tasks-list');
  if (tasksList) {
    // For demo purposes, we'll just show a message
    tasksList.innerHTML = `
      <div class="tasks-message">
        <p>Načteno ${tasks.length} úkolů.</p>
        <p>Seznam úkolů bude implementován v další verzi.</p>
      </div>
    `;
  }
}

// Load notes from localStorage
function loadNotes() {
  if (!localStorageManager) return;
  
  const notes = localStorageManager.getNotes() || [];
  
  // Update UI with notes
  updateNotesUI(notes);
}

// Update notes UI
function updateNotesUI(notes) {
  // For demo purposes, we'll keep the existing content
  // In a real app, this would be populated with actual note data
}

// Create a new task
function createNewTask() {
  // For demo purposes, just show a notification
  showNotification('Funkce přidání úkolu bude implementována v další verzi', 'info');
}

// Handle voice task created event
function handleVoiceTaskCreated(event) {
  const taskData = event.detail;
  
  // For demo purposes, just show a notification
  showNotification(`Úkol vytvořen: ${taskData.title}`, 'success');
  
  // In a real app, this would create a task and update the UI
}

// Handle voice note created event
function handleVoiceNoteCreated(event) {
  const noteData = event.detail;
  
  // For demo purposes, just show a notification
  showNotification(`Poznámka vytvořena: ${noteData.title}`, 'success');
  
  // In a real app, this would create a note and update the UI
}

// Handle calendar date selected event
function handleCalendarDateSelected(event) {
  const selectedDate = event.detail.date;
  const events = event.detail.events;
  
  // For demo purposes, just show a notification
  const formattedDate = selectedDate.toLocaleDateString('cs-CZ');
  showNotification(`Vybráno datum: ${formattedDate} (${events.length} událostí)`, 'info');
  
  // In a real app, this would update the UI to show events for the selected date
}

// Handle settings changed event
function handleSettingsChanged(event) {
  // For demo purposes, just show a notification
  showNotification('Nastavení byla aktualizována', 'info');
  
  // In a real app, this would apply the new settings to the UI
}

// Handle Telegram token changed event
function handleTelegramTokenChanged(event) {
  const token = event.detail;
  
  // For demo purposes, just show a notification
  showNotification('Telegram Bot Token byl aktualizován', 'success');
  
  // In a real app, this would reconnect the Telegram bot with the new token
}

// Show notification
function showNotification(message, type = 'info') {
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
