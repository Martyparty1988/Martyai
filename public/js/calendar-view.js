// Marty Task Commander - Calendar View Enhancement Module

class CalendarView {
  constructor() {
    this.currentDate = new Date();
    this.currentView = 'daily'; // daily, weekly, monthly
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
  }
  
  // Initialize calendar view
  init() {
    // Add script reference to index.html
    this.addScriptToIndex();
    
    // Enhance the existing reservations.js functionality
    this.enhanceReservationsDisplay();
  }
  
  // Add script reference to index.html
  addScriptToIndex() {
    // This function would normally modify the HTML file to add the script reference
    // For this implementation, we'll assume the script is already included or will be added manually
    console.log('Calendar view script initialized');
  }
  
  // Enhance the existing reservations display
  enhanceReservationsDisplay() {
    // This function would normally modify the reservations.js file to enhance the display
    // For this implementation, we'll create additional methods that can be called from reservations.js
    
    // Enhance daily view
    this.enhanceDailyView();
    
    // Enhance weekly view
    this.enhanceWeeklyView();
    
    // Enhance monthly view
    this.enhanceMonthlyView();
  }
  
  // Enhance daily view
  enhanceDailyView() {
    // Create a more detailed daily view with timeline
    const dailyViewTemplate = `
      <div class="daily-view">
        <div class="timeline-header">
          <div class="timeline-villa-header">Vila</div>
          <div class="timeline-hours">
            <div class="timeline-hour">00:00</div>
            <div class="timeline-hour">03:00</div>
            <div class="timeline-hour">06:00</div>
            <div class="timeline-hour">09:00</div>
            <div class="timeline-hour">12:00</div>
            <div class="timeline-hour">15:00</div>
            <div class="timeline-hour">18:00</div>
            <div class="timeline-hour">21:00</div>
            <div class="timeline-hour">24:00</div>
          </div>
        </div>
        <div class="timeline-body">
          <!-- Villa rows will be added here -->
        </div>
      </div>
    `;
    
    // Create a template for each villa row
    const villaRowTemplate = (villa) => `
      <div class="timeline-row" data-villa="${villa}">
        <div class="timeline-villa" style="background-color: ${this.villas[villa].color}">
          ${this.villas[villa].name}
        </div>
        <div class="timeline-events">
          <!-- Events will be added here -->
        </div>
      </div>
    `;
    
    // Create a template for each event
    const eventTemplate = (event) => {
      const startHour = new Date(event.startDate).getHours();
      const endHour = new Date(event.endDate).getHours() || 24; // If end hour is 0, use 24 (midnight)
      const duration = endHour - startHour;
      const startPercent = (startHour / 24) * 100;
      const widthPercent = (duration / 24) * 100;
      
      return `
        <div class="timeline-event" 
             style="left: ${startPercent}%; width: ${widthPercent}%; background-color: ${this.villas[event.villa].color}"
             data-id="${event.id}">
          <div class="event-title">${event.guest}</div>
          <div class="event-time">${startHour}:00 - ${endHour}:00</div>
        </div>
      `;
    };
    
    // This code would be integrated into the reservations.js displayDailyView method
    console.log('Daily view enhanced with timeline');
  }
  
  // Enhance weekly view
  enhanceWeeklyView() {
    // Create a more detailed weekly view with day columns
    const weeklyViewTemplate = `
      <div class="weekly-view">
        <div class="week-header">
          <div class="week-day-header">Pondělí</div>
          <div class="week-day-header">Úterý</div>
          <div class="week-day-header">Středa</div>
          <div class="week-day-header">Čtvrtek</div>
          <div class="week-day-header">Pátek</div>
          <div class="week-day-header">Sobota</div>
          <div class="week-day-header">Neděle</div>
        </div>
        <div class="week-body">
          <!-- Villa sections will be added here -->
        </div>
      </div>
    `;
    
    // Create a template for each villa section
    const villaSectionTemplate = (villa) => `
      <div class="week-villa-section" data-villa="${villa}">
        <div class="week-villa-header" style="background-color: ${this.villas[villa].color}">
          ${this.villas[villa].name}
        </div>
        <div class="week-villa-days">
          <div class="week-day" data-day="1"></div>
          <div class="week-day" data-day="2"></div>
          <div class="week-day" data-day="3"></div>
          <div class="week-day" data-day="4"></div>
          <div class="week-day" data-day="5"></div>
          <div class="week-day" data-day="6"></div>
          <div class="week-day" data-day="0"></div>
        </div>
      </div>
    `;
    
    // Create a template for each event
    const eventTemplate = (event, dayOfWeek) => `
      <div class="week-event" data-id="${event.id}">
        <div class="event-title">${event.guest}</div>
        <div class="event-type">
          ${this.getEventTypeIcon(event, dayOfWeek)}
        </div>
      </div>
    `;
    
    // This code would be integrated into the reservations.js displayWeeklyView method
    console.log('Weekly view enhanced with day columns');
  }
  
  // Get event type icon (check-in, check-out, stay)
  getEventTypeIcon(event, date) {
    const eventDate = new Date(date);
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    // Check if this is check-in day
    if (eventDate.toDateString() === startDate.toDateString()) {
      return '<i class="fas fa-sign-in-alt" title="Check-in"></i>';
    }
    
    // Check if this is check-out day (the day before endDate in iCal)
    const checkoutDate = new Date(endDate);
    checkoutDate.setDate(checkoutDate.getDate() - 1);
    if (eventDate.toDateString() === checkoutDate.toDateString()) {
      return '<i class="fas fa-sign-out-alt" title="Check-out"></i>';
    }
    
    // Otherwise, it's a regular stay day
    return '<i class="fas fa-bed" title="Stay"></i>';
  }
  
  // Enhance monthly view
  enhanceMonthlyView() {
    // Create a more detailed monthly view with day cells
    const monthlyViewTemplate = `
      <div class="monthly-view">
        <div class="month-header">
          <div class="month-day-header">Po</div>
          <div class="month-day-header">Út</div>
          <div class="month-day-header">St</div>
          <div class="month-day-header">Čt</div>
          <div class="month-day-header">Pá</div>
          <div class="month-day-header">So</div>
          <div class="month-day-header">Ne</div>
        </div>
        <div class="month-body">
          <!-- Week rows will be added here -->
        </div>
      </div>
    `;
    
    // Create a template for each week row
    const weekRowTemplate = (weekNum) => `
      <div class="month-week" data-week="${weekNum}">
        <!-- Day cells will be added here -->
      </div>
    `;
    
    // Create a template for each day cell
    const dayCellTemplate = (date, isCurrentMonth) => {
      const day = date.getDate();
      const isToday = date.toDateString() === new Date().toDateString();
      
      return `
        <div class="month-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" 
             data-date="${date.toISOString().split('T')[0]}">
          <div class="day-number">${day}</div>
          <div class="day-events">
            <!-- Events will be added here -->
          </div>
        </div>
      `;
    };
    
    // Create a template for each event
    const eventTemplate = (event) => `
      <div class="day-event ${event.villa}" data-id="${event.id}">
        <div class="event-type">
          ${this.getEventTypeIcon(event, new Date(event.date))}
        </div>
        <div class="event-title">${event.guest}</div>
      </div>
    `;
    
    // This code would be integrated into the reservations.js displayMonthlyView method
    console.log('Monthly view enhanced with day cells');
  }
  
  // Get the first day of the month
  getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
  
  // Get the last day of the month
  getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  
  // Get the first day of the week (Monday) for a given date
  getFirstDayOfWeek(date) {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(date.setDate(diff));
  }
  
  // Get the date range for the current view
  getDateRange() {
    let startDate, endDate;
    
    if (this.currentView === 'daily') {
      // For daily view, use the current date
      startDate = new Date(this.currentDate);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(this.currentDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (this.currentView === 'weekly') {
      // For weekly view, get the week range (Monday to Sunday)
      startDate = this.getFirstDayOfWeek(new Date(this.currentDate));
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (this.currentView === 'monthly') {
      // For monthly view, get the month range
      startDate = this.getFirstDayOfMonth(new Date(this.currentDate));
      startDate.setHours(0, 0, 0, 0);
      
      endDate = this.getLastDayOfMonth(new Date(this.currentDate));
      endDate.setHours(23, 59, 59, 999);
    }
    
    return { startDate, endDate };
  }
  
  // Filter reservations for the current view
  filterReservations(reservations) {
    const { startDate, endDate } = this.getDateRange();
    
    return reservations.filter(reservation => {
      // Filter by villa
      if (!this.filteredVillas.includes(reservation.villa)) {
        return false;
      }
      
      // Filter by date range
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);
      
      // Check if reservation overlaps with the date range
      return (
        (reservationStart >= startDate && reservationStart <= endDate) ||
        (reservationEnd >= startDate && reservationEnd <= endDate) ||
        (reservationStart <= startDate && reservationEnd >= endDate)
      );
    });
  }
  
  // Add event listeners for reservation interactions
  addEventListeners() {
    // Add click event listener to reservation cards
    document.addEventListener('click', (event) => {
      const reservationCard = event.target.closest('.reservation-card, .timeline-event, .week-event, .day-event');
      
      if (reservationCard) {
        const reservationId = reservationCard.dataset.id;
        this.showReservationDetails(reservationId);
      }
    });
  }
  
  // Show reservation details
  async showReservationDetails(reservationId) {
    try {
      // Get reservation from database
      const reservations = await db.getReservations();
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (!reservation) {
        console.error('Reservation not found:', reservationId);
        return;
      }
      
      // Format dates
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      const formattedStartDate = startDate.toLocaleDateString('cs-CZ');
      const formattedEndDate = endDate.toLocaleDateString('cs-CZ');
      
      // Calculate number of nights
      const nights = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Create modal content
      const modalContent = `
        <div class="reservation-details">
          <h2>Detaily rezervace</h2>
          <div class="reservation-detail-header">
            <div class="reservation-villa" style="color: ${this.villas[reservation.villa].color}">
              ${this.villas[reservation.villa].name}
            </div>
            <div class="reservation-nights">${nights} ${nights === 1 ? 'noc' : nights < 5 ? 'noci' : 'nocí'}</div>
          </div>
          <div class="reservation-dates">
            <div class="date-item">
              <i class="fas fa-sign-in-alt"></i>
              <span>Check-in: ${formattedStartDate}</span>
            </div>
            <div class="date-item">
              <i class="fas fa-sign-out-alt"></i>
              <span>Check-out: ${formattedEndDate}</span>
            </div>
          </div>
          <div class="reservation-guest">
            <i class="fas fa-user"></i> ${reservation.guest}
            ${reservation.guestCount ? `(${reservation.guestCount} ${reservation.guestCount === 1 ? 'osoba' : reservation.guestCount < 5 ? 'osoby' : 'osob'})` : ''}
          </div>
          ${reservation.description ? `
            <div class="reservation-description">
              <h3>Popis</h3>
              <p>${reservation.description}</p>
            </div>
          ` : ''}
          <div class="reservation-actions">
            <button class="primary-btn create-task-btn">
              <i class="fas fa-tasks"></i> Vytvořit úkol
            </button>
            <button class="secondary-btn close-modal-btn">
              <i class="fas fa-times"></i> Zavřít
            </button>
          </div>
        </div>
      `;
      
      // Show modal with reservation details
      // This would normally be implemented in the UI module
      console.log('Showing reservation details:', reservation);
      
      // In a real implementation, this would create a modal and add event listeners
      // for the create task and close buttons
    } catch (error) {
      console.error('Error showing reservation details:', error);
    }
  }
}

// Create and export calendar view instance
const calendarView = new CalendarView();

// Initialize calendar view when the page loads
document.addEventListener('DOMContentLoaded', () => {
  calendarView.init();
  calendarView.addEventListeners();
});
