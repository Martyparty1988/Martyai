// Marty Task Commander - Reservations Module

class ReservationManager {
  constructor() {
    this.currentView = 'daily'; // daily, weekly, monthly
    this.currentDate = new Date();
    this.filteredVillas = ['ceskomalinska', 'podoli', 'marna']; // Default: show all villas
    
    // Villa data
    this.villas = {
      ceskomalinska: {
        name: 'Českomalínská',
        color: '#ffb6c1' // Pastel pink
      },
      podoli: {
        name: 'Podolí',
        color: '#afeeee' // Pastel turquoise
      },
      marna: {
        name: 'Marna',
        color: '#98fb98' // Pastel green
      }
    };
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  // Initialize event listeners
  initEventListeners() {
    // View buttons
    document.getElementById('daily-view-btn').addEventListener('click', () => this.changeView('daily'));
    document.getElementById('weekly-view-btn').addEventListener('click', () => this.changeView('weekly'));
    document.getElementById('monthly-view-btn').addEventListener('click', () => this.changeView('monthly'));
    
    // Date navigation
    document.getElementById('prev-date-btn').addEventListener('click', () => this.navigateDate('prev'));
    document.getElementById('next-date-btn').addEventListener('click', () => this.navigateDate('next'));
    
    // Villa filters
    const villaCheckboxes = document.querySelectorAll('.villa-checkbox');
    villaCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateVillaFilters());
    });
    
    // Sync button
    document.getElementById('sync-btn').addEventListener('click', () => this.syncReservations());
  }
  
  // Change view (daily, weekly, monthly)
  changeView(view) {
    this.currentView = view;
    
    // Update active button
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => button.classList.remove('active'));
    document.getElementById(`${view}-view-btn`).classList.add('active');
    
    // Refresh display
    this.displayReservations();
  }
  
  // Navigate date (prev, next)
  navigateDate(direction) {
    const currentDate = this.currentDate;
    
    if (this.currentView === 'daily') {
      // Navigate by day
      if (direction === 'prev') {
        this.currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
      } else {
        this.currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    } else if (this.currentView === 'weekly') {
      // Navigate by week
      if (direction === 'prev') {
        this.currentDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      } else {
        this.currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
      }
    } else if (this.currentView === 'monthly') {
      // Navigate by month
      if (direction === 'prev') {
        this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      } else {
        this.currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }
    }
    
    // Update current date display
    this.updateDateDisplay();
    
    // Refresh display
    this.displayReservations();
  }
  
  // Update date display
  updateDateDisplay() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    if (this.currentView === 'daily') {
      dateElement.textContent = this.currentDate.toLocaleDateString('cs-CZ', options);
    } else if (this.currentView === 'weekly') {
      // Get start and end of week
      const startOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1); // Monday
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      
      dateElement.textContent = `${startOfWeek.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (this.currentView === 'monthly') {
      dateElement.textContent = this.currentDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
    }
  }
  
  // Update villa filters
  updateVillaFilters() {
    const villaCheckboxes = document.querySelectorAll('.villa-checkbox');
    this.filteredVillas = [];
    
    villaCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        this.filteredVillas.push(checkbox.dataset.villa);
      }
    });
    
    // Refresh display
    this.displayReservations();
  }
  
  // Sync reservations from iCal
  async syncReservations() {
    try {
      // Show loading indicator
      document.querySelector('.loading-indicator').classList.remove('hidden');
      document.getElementById('reservations-content').classList.add('hidden');
      
      // Sync reservations using iCal parser
      await icalParser.syncReservations();
      
      // Refresh display
      this.displayReservations();
      
      // Show success notification
      const syncNotification = document.getElementById('sync-notification');
      syncNotification.textContent = 'Rezervace úspěšně synchronizovány';
      syncNotification.classList.remove('hidden');
      setTimeout(() => {
        syncNotification.classList.add('hidden');
      }, 3000);
    } catch (error) {
      console.error('Error syncing reservations:', error);
      
      // Show error notification
      const syncNotification = document.getElementById('sync-notification');
      syncNotification.textContent = 'Chyba při synchronizaci rezervací';
      syncNotification.classList.remove('hidden');
      setTimeout(() => {
        syncNotification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Get reservations for current view
  async getReservationsForCurrentView() {
    let startDate, endDate;
    
    if (this.currentView === 'daily') {
      // For daily view, get reservations for the current date
      startDate = new Date(this.currentDate);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(this.currentDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (this.currentView === 'weekly') {
      // For weekly view, get reservations for the current week
      startDate = new Date(this.currentDate);
      startDate.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1); // Monday
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday
      endDate.setHours(23, 59, 59, 999);
    } else if (this.currentView === 'monthly') {
      // For monthly view, get reservations for the current month
      startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
      endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    // Get reservations from database
    const reservations = await db.getReservationsByDateRange(startDate.toISOString(), endDate.toISOString());
    
    // Filter by selected villas
    return reservations.filter(reservation => this.filteredVillas.includes(reservation.villa));
  }
  
  // Display reservations
  async displayReservations() {
    try {
      // Show loading indicator
      document.querySelector('.loading-indicator').classList.remove('hidden');
      document.getElementById('reservations-content').classList.add('hidden');
      
      // Update date display
      this.updateDateDisplay();
      
      // Get reservations for current view
      const reservations = await this.getReservationsForCurrentView();
      
      // Get content container
      const contentElement = document.getElementById('reservations-content');
      
      // Clear content
      contentElement.innerHTML = '';
      
      // Display reservations based on current view
      if (this.currentView === 'daily') {
        this.displayDailyView(contentElement, reservations);
      } else if (this.currentView === 'weekly') {
        this.displayWeeklyView(contentElement, reservations);
      } else if (this.currentView === 'monthly') {
        this.displayMonthlyView(contentElement, reservations);
      }
      
      // Hide loading indicator and show content
      document.querySelector('.loading-indicator').classList.add('hidden');
      contentElement.classList.remove('hidden');
    } catch (error) {
      console.error('Error displaying reservations:', error);
      
      // Show error message
      const contentElement = document.getElementById('reservations-content');
      contentElement.innerHTML = '<div class="error-message">Chyba při načítání rezervací</div>';
      
      // Hide loading indicator and show content
      document.querySelector('.loading-indicator').classList.add('hidden');
      contentElement.classList.remove('hidden');
    }
  }
  
  // Display daily view
  displayDailyView(container, reservations) {
    if (reservations.length === 0) {
      container.innerHTML = '<div class="no-reservations">Žádné rezervace pro tento den</div>';
      return;
    }
    
    // Sort reservations by villa
    reservations.sort((a, b) => {
      if (a.villa < b.villa) return -1;
      if (a.villa > b.villa) return 1;
      return 0;
    });
    
    // Create reservation cards
    reservations.forEach(reservation => {
      const card = this.createReservationCard(reservation);
      container.appendChild(card);
    });
  }
  
  // Display weekly view
  displayWeeklyView(container, reservations) {
    // Create week grid
    const weekGrid = document.createElement('div');
    weekGrid.className = 'week-grid';
    
    // Get start of week (Monday)
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'week-header';
    
    // Add day headers
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayHeader = document.createElement('div');
      dayHeader.className = 'week-day-header';
      
      const dayName = day.toLocaleDateString('cs-CZ', { weekday: 'short' });
      const dayNumber = day.getDate();
      
      dayHeader.innerHTML = `<div>${dayName}</div><div>${dayNumber}</div>`;
      
      // Highlight today
      if (day.toDateString() === new Date().toDateString()) {
        dayHeader.classList.add('today');
      }
      
      headerRow.appendChild(dayHeader);
    }
    
    weekGrid.appendChild(headerRow);
    
    // Group reservations by villa
    const villaGroups = {};
    this.filteredVillas.forEach(villa => {
      villaGroups[villa] = [];
    });
    
    reservations.forEach(reservation => {
      if (this.filteredVillas.includes(reservation.villa)) {
        villaGroups[reservation.villa].push(reservation);
      }
    });
    
    // Create villa rows
    for (const [villa, villaReservations] of Object.entries(villaGroups)) {
      const villaRow = document.createElement('div');
      villaRow.className = 'week-villa-row';
      
      // Add villa header
      const villaHeader = document.createElement('div');
      villaHeader.className = 'week-villa-header';
      villaHeader.textContent = this.villas[villa].name;
      villaHeader.style.backgroundColor = this.villas[villa].color;
      
      villaRow.appendChild(villaHeader);
      
      // Add reservation cells
      const reservationRow = document.createElement('div');
      reservationRow.className = 'week-reservation-row';
      
      // Create day cells
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const dayCell = document.createElement('div');
        dayCell.className = 'week-day-cell';
        
        // Highlight today
        if (day.toDateString() === new Date().toDateString()) {
          dayCell.classList.add('today');
        }
        
        // Find reservations for this day and villa
        const dayReservations = villaReservations.filter(reservation => {
          const startDate = new Date(reservation.startDate);
          const endDate = new Date(reservation.endDate);
          
          // Check if day is within reservation period
          return day >= startDate && day < endDate;
        });
        
        // Add reservation info
        if (dayReservations.length > 0) {
          dayReservations.forEach(reservation => {
            const reservationInfo = document.createElement('div');
            reservationInfo.className = 'week-reservation-info';
            
            // Check if this is check-in or check-out day
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            
            if (day.toDateString() === startDate.toDateString()) {
              reservationInfo.classList.add('check-in');
              reservationInfo.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${reservation.guest}`;
            } else if (day.toDateString() === new Date(endDate.getTime() - 86400000).toDateString()) {
              // Check-out is on the day before endDate in iCal
              reservationInfo.classList.add('check-out');
              reservationInfo.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${reservation.guest}`;
            } else {
              reservationInfo.innerHTML = `<i class="fas fa-bed"></i> ${reservation.guest}`;
            }
            
            dayCell.appendChild(reservationInfo);
          });
        }
        
        reservationRow.appendChild(dayCell);
      }
      
      villaRow.appendChild(reservationRow);
      weekGrid.appendChild(villaRow);
    }
    
    container.appendChild(weekGrid);
  }
  
  // Display monthly view
  displayMonthlyView(container, reservations) {
    // Create calendar grid
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-header';
    
    // Add day headers
    const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header-cell';
      dayHeader.textContent = day;
      headerRow.appendChild(dayHeader);
    });
    
    calendarGrid.appendChild(headerRow);
    
    // Get first day of month
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    
    // Get last day of month
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Calculate total days to display (including days from previous and next months)
    const totalDays = 42; // 6 rows of 7 days
    
    // Create day cells
    for (let i = 0; i < totalDays; i++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      
      // Calculate date for this cell
      const cellDate = new Date(firstDay);
      cellDate.setDate(firstDay.getDate() - firstDayOfWeek + i);
      
      // Check if date is in current month
      if (cellDate.getMonth() !== this.currentDate.getMonth()) {
        dayCell.classList.add('other-month');
      }
      
      // Check if date is today
      if (cellDate.toDateString() === new Date().toDateString()) {
        dayCell.classList.add('today');
      }
      
      // Add day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = cellDate.getDate();
      dayCell.appendChild(dayNumber);
      
      // Add day content container
      const dayContent = document.createElement('div');
      dayContent.className = 'day-content';
      
      // Find reservations for this day
      const dayReservations = reservations.filter(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Check if day is within reservation period
        return cellDate >= startDate && cellDate < endDate;
      });
      
      // Add reservation events
      dayReservations.forEach(reservation => {
        const event = document.createElement('div');
        event.className = `day-event ${reservation.villa}`;
        
        // Check if this is check-in or check-out day
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        if (cellDate.toDateString() === startDate.toDateString()) {
          event.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${reservation.guest}`;
        } else if (cellDate.toDateString() === new Date(endDate.getTime() - 86400000).toDateString()) {
          // Check-out is on the day before endDate in iCal
          event.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${reservation.guest}`;
        } else {
          event.innerHTML = `<i class="fas fa-bed"></i> ${reservation.guest}`;
        }
        
        dayContent.appendChild(event);
      });
      
      dayCell.appendChild(dayContent);
      calendarGrid.appendChild(dayCell);
    }
    
    container.appendChild(calendarGrid);
  }
  
  // Create reservation card
  createReservationCard(reservation) {
    const card = document.createElement('div');
    card.className = `reservation-card ${reservation.villa}`;
    card.dataset.id = reservation.id;
    
    // Format dates
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    const formattedStartDate = startDate.toLocaleDateString('cs-CZ');
    const formattedEndDate = endDate.toLocaleDateString('cs-CZ');
    
    // Calculate number of nights
    const nights = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Create card content
    card.innerHTML = `
      <div class="reservation-header">
        <div class="reservation-villa">${this.villas[reservation.villa].name}</div>
        <div class="reservation-nights">${nights} ${nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</div>
      </div>
      <div class="reservation-dates">
        <div class="date-item">
          <i class="fas fa-sign-in-alt"></i>
          <span>${formattedStartDate}</span>
        </div>
        <div class="date-item">
          <i class="fas fa-sign-out-alt"></i>
          <span>${formattedEndDate}</span>
        </div>
      </div>
      <div class="reservation-guest">
        <i class="fas fa-user"></i> ${reservation.guest}
        ${reservation.guestCount ? `(${reservation.guestCount} ${reservation.guestCount === 1 ? 'osoba' : reservation.guestCount < 5 ? 'osoby' : 'osob'})` : ''}
      </div>
    `;
    
    return card;
  }
  
  // Initialize reservations display
  async init() {
    // Update date display
    this.updateDateDisplay();
    
    // Display reservations
    await this.displayReservations();
    
    // Sync reservations if database is empty
    const reservations = await db.getReservations();
    if (reservations.length === 0) {
      this.syncReservations();
    }
  }
}

// Create and export reservation manager instance
const reservationManager = new ReservationManager();
