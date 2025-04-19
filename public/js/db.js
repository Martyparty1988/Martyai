// Marty Task Commander - Database Module

// IndexedDB setup
class Database {
  constructor() {
    this.dbName = 'martyTaskCommanderDB';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    
    // Initialize the database
    this.init();
  }
  
  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      // Handle database upgrade (first time or version change)
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('reservations')) {
          const reservationsStore = db.createObjectStore('reservations', { keyPath: 'id' });
          reservationsStore.createIndex('villa', 'villa', { unique: false });
          reservationsStore.createIndex('startDate', 'startDate', { unique: false });
          reservationsStore.createIndex('endDate', 'endDate', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
          tasksStore.createIndex('villa', 'villa', { unique: false });
          tasksStore.createIndex('date', 'date', { unique: false });
          tasksStore.createIndex('priority', 'priority', { unique: false });
          tasksStore.createIndex('completed', 'completed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        
        console.log('Database setup complete');
      };
      
      // Handle success
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };
      
      // Handle errors
      request.onerror = (event) => {
        console.error('Database initialization error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  
  // Handle online/offline status changes
  handleConnectionChange(isOnline) {
    this.isOnline = isOnline;
    
    // Show notification to user
    const offlineNotification = document.getElementById('offline-notification');
    if (offlineNotification) {
      if (!isOnline) {
        offlineNotification.classList.remove('hidden');
        setTimeout(() => {
          offlineNotification.classList.add('hidden');
        }, 3000);
      } else {
        offlineNotification.classList.add('hidden');
        this.syncData();
      }
    }
    
    // Trigger sync when back online
    if (isOnline && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-tasks');
        registration.sync.register('sync-reservations');
      });
    }
  }
  
  // Add a reservation to the database
  async addReservation(reservation) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reservations'], 'readwrite');
      const store = transaction.objectStore('reservations');
      const request = store.put(reservation);
      
      request.onsuccess = () => {
        this.addToSyncQueue({
          type: 'reservation',
          action: 'add',
          data: reservation
        });
        resolve(reservation);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get all reservations
  async getReservations() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reservations'], 'readonly');
      const store = transaction.objectStore('reservations');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get reservations by villa
  async getReservationsByVilla(villa) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['reservations'], 'readonly');
      const store = transaction.objectStore('reservations');
      const index = store.index('villa');
      const request = index.getAll(villa);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get reservations by date range
  async getReservationsByDateRange(startDate, endDate) {
    if (!this.db) await this.init();
    
    // Get all reservations and filter by date range
    const reservations = await this.getReservations();
    
    return reservations.filter(reservation => {
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      // Check if reservation overlaps with the date range
      return (
        (reservationStart >= rangeStart && reservationStart <= rangeEnd) ||
        (reservationEnd >= rangeStart && reservationEnd <= rangeEnd) ||
        (reservationStart <= rangeStart && reservationEnd >= rangeEnd)
      );
    });
  }
  
  // Add a task to the database
  async addTask(task) {
    if (!this.db) await this.init();
    
    // Generate ID if not provided
    if (!task.id) {
      task.id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(task);
      
      request.onsuccess = () => {
        this.addToSyncQueue({
          type: 'task',
          action: 'add',
          data: task
        });
        resolve(task);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Update a task
  async updateTask(task) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(task);
      
      request.onsuccess = () => {
        this.addToSyncQueue({
          type: 'task',
          action: 'update',
          data: task
        });
        resolve(task);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Delete a task
  async deleteTask(taskId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.delete(taskId);
      
      request.onsuccess = () => {
        this.addToSyncQueue({
          type: 'task',
          action: 'delete',
          data: { id: taskId }
        });
        resolve(taskId);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get all tasks
  async getTasks() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get tasks by villa
  async getTasksByVilla(villa) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('villa');
      const request = index.getAll(villa);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Get tasks by date
  async getTasksByDate(date) {
    if (!this.db) await this.init();
    
    // Format date to YYYY-MM-DD for consistent comparison
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('date');
      const request = index.getAll(formattedDate);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Add item to sync queue for background sync
  async addToSyncQueue(item) {
    if (!this.db) await this.init();
    
    // Only add to sync queue if offline
    if (!this.isOnline) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        const request = store.add({
          ...item,
          timestamp: Date.now()
        });
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }
    
    // If online, try to sync immediately
    if (this.isOnline) {
      // In a real implementation, this would call the server API
      console.log('Syncing data immediately:', item);
    }
  }
  
  // Process sync queue (called when back online)
  async syncData() {
    if (!this.db) await this.init();
    
    // Only process if online
    if (!this.isOnline) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = async () => {
        const items = request.result;
        
        if (items.length === 0) {
          resolve();
          return;
        }
        
        // Show sync notification
        const syncNotification = document.getElementById('sync-notification');
        if (syncNotification) {
          syncNotification.classList.remove('hidden');
        }
        
        // Process each item in the queue
        for (const item of items) {
          try {
            // In a real implementation, this would call the server API
            console.log('Syncing item:', item);
            
            // Remove from queue after successful sync
            await this.removeFromSyncQueue(item.id);
          } catch (error) {
            console.error('Error syncing item:', error);
          }
        }
        
        // Hide sync notification
        if (syncNotification) {
          syncNotification.classList.add('hidden');
        }
        
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Remove item from sync queue
  async removeFromSyncQueue(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  
  // Clear all data (for testing/reset)
  async clearAllData() {
    if (!this.db) await this.init();
    
    const storeNames = ['reservations', 'tasks', 'syncQueue'];
    
    for (const storeName of storeNames) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    }
    
    console.log('All data cleared');
  }
}

// Create and export database instance
const db = new Database();
