// Marty AI - Floating Calendar

class FloatingCalendarManager {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.events = []; // Will store reservation events
    this.localStorageManager = null;
    this.settingsManager = null;
    this.isCollapsed = false;
    this.isVisible = true;
  }

  // Initialize the floating calendar manager
  init(localStorageManager, settingsManager) {
    this.localStorageManager = localStorageManager;
    this.settingsManager = settingsManager;
    
    // Load settings
    if (this.settingsManager) {
      this.isVisible = this.settingsManager.getSetting('ui', 'showFloatingCalendar') !== false;
    }
    
    // Load events from localStorage
    this.loadEvents();
    
    // Initialize UI elements
    this.initUI();
    
    // Render calendar
    this.renderCalendar();
    
    console.log('Floating Calendar Manager initialized');
  }
  
  // Load events from localStorage
  loadEvents() {
    if (this.localStorageManager) {
      const reservations = this.localStorageManager.getReservations() || [];
      
      // Convert reservations to calendar events
      this.events = reservations.map(reservation => {
        return {
          id: reservation.id,
          title: reservation.guestName,
          start: new Date(reservation.checkIn),
          end: new Date(reservation.checkOut),
          villa: reservation.villa,
          type: 'reservation'
        };
      });
    }
  }
  
  // Initialize UI elements
  initUI() {
    // Get UI elements
    const floatingCalendar = document.getElementById('floating-calendar');
    const calendarHeader = document.getElementById('calendar-header');
    const calendarToggle = document.getElementById('calendar-toggle');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (!floatingCalendar) return;
    
    // Set initial visibility
    if (!this.isVisible) {
      floatingCalendar.classList.add('hidden');
    }
    
    // Add event listeners
    if (calendarHeader) {
      calendarHeader.addEventListener('click', () => {
        this.toggleCollapse();
      });
    }
    
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the header click
        this.prevMonth();
      });
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the header click
        this.nextMonth();
      });
    }
    
    // Make calendar draggable
    this.makeCalendarDraggable(floatingCalendar, calendarHeader);
    
    // Listen for settings changes
    document.addEventListener('settings-changed', (event) => {
      if (event.detail && event.detail.ui) {
        const showCalendar = event.detail.ui.showFloatingCalendar !== false;
        this.setVisibility(showCalendar);
      }
    });
    
    // Listen for reservation changes
    document.addEventListener('reservations-updated', () => {
      this.loadEvents();
      this.renderCalendar();
    });
  }
  
  // Make the calendar draggable
  makeCalendarDraggable(element, handle) {
    if (!element || !handle) return;
    
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }
    
    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  
  // Toggle calendar collapse state
  toggleCollapse() {
    const floatingCalendar = document.getElementById('floating-calendar');
    const calendarToggle = document.getElementById('calendar-toggle');
    
    if (!floatingCalendar || !calendarToggle) return;
    
    this.isCollapsed = !this.isCollapsed;
    
    if (this.isCollapsed) {
      floatingCalendar.classList.add('collapsed');
      calendarToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
      floatingCalendar.classList.remove('collapsed');
      calendarToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
  }
  
  // Set calendar visibility
  setVisibility(visible) {
    const floatingCalendar = document.getElementById('floating-calendar');
    if (!floatingCalendar) return;
    
    this.isVisible = visible;
    
    if (visible) {
      floatingCalendar.classList.remove('hidden');
    } else {
      floatingCalendar.classList.add('hidden');
    }
    
    // Save setting
    if (this.settingsManager) {
      this.settingsManager.setSetting('ui', 'showFloatingCalendar', visible);
    }
  }
  
  // Go to previous month
  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }
  
  // Go to next month
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }
  
  // Render the calendar
  renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarMonth = document.getElementById('calendar-month');
    
    if (!calendarGrid || !calendarMonth) return;
    
    // Clear previous content
    calendarGrid.innerHTML = '';
    
    // Set month title
    const monthNames = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    calendarMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    
    // Create day name headers
    const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
    dayNames.forEach(day => {
      const dayNameElement = document.createElement('div');
      dayNameElement.className = 'calendar-day-name';
      dayNameElement.textContent = day;
      calendarGrid.appendChild(dayNameElement);
    });
    
    // Get first day of month
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    // Get last day of month
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add days from previous month
    const prevMonthLastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, day);
      this.createDayElement(calendarGrid, day, date, true);
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
      this.createDayElement(calendarGrid, day, date, false);
    }
    
    // Add days from next month
    const totalCells = 42; // 6 rows of 7 days
    const daysFromCurrentMonth = lastDay.getDate();
    const daysFromPrevMonth = firstDayOfWeek;
    const daysFromNextMonth = totalCells - daysFromCurrentMonth - daysFromPrevMonth;
    
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, day);
      this.createDayElement(calendarGrid, day, date, true);
    }
  }
  
  // Create a day element
  createDayElement(container, day, date, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    // Add classes for styling
    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    }
    
    // Check if day is today
    const today = new Date();
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      dayElement.classList.add('today');
    }
    
    // Check if day is selected
    if (date.getDate() === this.selectedDate.getDate() && 
        date.getMonth() === this.selectedDate.getMonth() && 
        date.getFullYear() === this.selectedDate.getFullYear()) {
      dayElement.classList.add('selected');
    }
    
    // Check if day has events
    const hasEvents = this.hasEventsOnDate(date);
    if (hasEvents) {
      dayElement.classList.add('has-events');
      
      // Add villa-specific class for styling
      const villaClass = this.getVillaClassForDate(date);
      if (villaClass) {
        dayElement.classList.add(villaClass);
      }
    }
    
    // Add click event
    dayElement.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the header click
      this.selectDate(date);
    });
    
    container.appendChild(dayElement);
  }
  
  // Check if date has events
  hasEventsOnDate(date) {
    return this.events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return date >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) && 
             date <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
    });
  }
  
  // Get villa class for date (for color coding)
  getVillaClassForDate(date) {
    // Find events for this date
    const eventsOnDate = this.events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return date >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) && 
             date <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
    });
    
    // Return class based on villa
    if (eventsOnDate.length > 0) {
      const villa = eventsOnDate[0].villa.toLowerCase();
      
      if (villa.includes('ceskomalinska')) {
        return 'villa-ceskomalinska';
      } else if (villa.includes('podoli')) {
        return 'villa-podoli';
      } else if (villa.includes('marna')) {
        return 'villa-marna';
      }
    }
    
    return '';
  }
  
  // Select a date
  selectDate(date) {
    this.selectedDate = date;
    
    // Dispatch date selected event
    const event = new CustomEvent('calendar-date-selected', { 
      detail: { 
        date: this.selectedDate,
        events: this.getEventsForDate(this.selectedDate)
      } 
    });
    document.dispatchEvent(event);
    
    // Re-render calendar to update selected date
    this.renderCalendar();
  }
  
  // Get events for a specific date
  getEventsForDate(date) {
    return this.events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      return date >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) && 
             date <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
    });
  }
  
  // Add an event to the calendar
  addEvent(event) {
    this.events.push(event);
    this.renderCalendar();
  }
  
  // Remove an event from the calendar
  removeEvent(eventId) {
    this.events = this.events.filter(event => event.id !== eventId);
    this.renderCalendar();
  }
  
  // Update an event in the calendar
  updateEvent(updatedEvent) {
    const index = this.events.findIndex(event => event.id === updatedEvent.id);
    if (index !== -1) {
      this.events[index] = updatedEvent;
      this.renderCalendar();
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

// Create and export floating calendar manager instance
const floatingCalendarManager = new FloatingCalendarManager();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for dependencies to be available
  const checkDependencies = () => {
    if (window.localStorageManager && window.settingsManager) {
      floatingCalendarManager.init(window.localStorageManager, window.settingsManager);
      
      // Make calendar available globally
      window.floatingCalendarManager = floatingCalendarManager;
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  
  checkDependencies();
});
