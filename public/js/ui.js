// Marty Task Commander - UI Module

class UIManager {
  constructor() {
    // UI state
    this.currentView = 'reservations'; // reservations or tasks
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  // Initialize event listeners
  initEventListeners() {
    // Navigation buttons
    document.getElementById('view-reservations').addEventListener('click', () => this.switchView('reservations'));
    document.getElementById('view-tasks').addEventListener('click', () => this.switchView('tasks'));
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', () => this.handleExport());
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }
  
  // Switch between reservations and tasks views
  switchView(view) {
    this.currentView = view;
    
    // Update active navigation button
    const reservationsBtn = document.getElementById('view-reservations');
    const tasksBtn = document.getElementById('view-tasks');
    
    if (view === 'reservations') {
      reservationsBtn.classList.add('active');
      tasksBtn.classList.remove('active');
    } else {
      reservationsBtn.classList.remove('active');
      tasksBtn.classList.add('active');
    }
    
    // Update visible container
    const reservationsContainer = document.getElementById('reservations-container');
    const tasksContainer = document.getElementById('tasks-container');
    
    if (view === 'reservations') {
      reservationsContainer.classList.add('active');
      tasksContainer.classList.remove('active');
    } else {
      reservationsContainer.classList.remove('active');
      tasksContainer.classList.add('active');
    }
  }
  
  // Handle export button click
  handleExport() {
    if (this.currentView === 'reservations') {
      this.exportReservations();
    } else {
      taskManager.exportTasksToCSV();
    }
  }
  
  // Export reservations to CSV
  async exportReservations() {
    try {
      // Get all reservations
      const reservations = await db.getReservations();
      
      if (reservations.length === 0) {
        alert('Žádné rezervace k exportu');
        return;
      }
      
      // Create CSV header
      let csv = 'ID,Vila,Host,Příjezd,Odjezd,Počet hostů,Popis\n';
      
      // Add reservations to CSV
      reservations.forEach(reservation => {
        const villaNames = {
          ceskomalinska: 'Českomalínská',
          podoli: 'Podolí',
          marna: 'Marna'
        };
        
        const startDate = new Date(reservation.startDate).toLocaleDateString('cs-CZ');
        const endDate = new Date(reservation.endDate).toLocaleDateString('cs-CZ');
        
        csv += `"${reservation.id}","${villaNames[reservation.villa]}","${reservation.guest}","${startDate}","${endDate}","${reservation.guestCount || ''}","${(reservation.description || '').replace(/"/g, '""')}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `marty-reservations-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Rezervace byly exportovány do CSV';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    } catch (error) {
      console.error('Error exporting reservations to CSV:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při exportu rezervací';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Open settings modal
  openSettings() {
    // In a future version, this could open a settings modal
    alert('Nastavení aplikace bude dostupné v příští verzi.');
  }
  
  // Update online status
  updateOnlineStatus(isOnline) {
    const offlineNotification = document.getElementById('offline-notification');
    
    if (!isOnline) {
      offlineNotification.classList.remove('hidden');
    } else {
      offlineNotification.classList.add('hidden');
      
      // Show sync notification
      const syncNotification = document.getElementById('sync-notification');
      syncNotification.textContent = 'Synchronizace dat...';
      syncNotification.classList.remove('hidden');
      
      // Attempt to sync data
      setTimeout(() => {
        syncNotification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Show notification
  showNotification(message, duration = 3000) {
    const notification = document.getElementById('sync-notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, duration);
  }
  
  // Initialize UI
  init() {
    // Check initial online status
    this.updateOnlineStatus(navigator.onLine);
    
    // Start with reservations view
    this.switchView('reservations');
  }
}

// Create and export UI manager instance
const uiManager = new UIManager();
