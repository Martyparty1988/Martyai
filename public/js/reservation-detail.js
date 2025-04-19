// Marty Task Commander - Reservation Detail Modal Component

class ReservationDetailModal {
  constructor() {
    this.modalId = 'reservation-detail-modal';
    this.createModal();
    this.initEventListeners();
    
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
  
  // Create modal element
  createModal() {
    // Check if modal already exists
    if (document.getElementById(this.modalId)) {
      return;
    }
    
    // Create modal element
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div id="reservation-detail-content"></div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
  }
  
  // Initialize event listeners
  initEventListeners() {
    // Close modal when clicking on close button or outside the modal
    document.addEventListener('click', (event) => {
      const modal = document.getElementById(this.modalId);
      
      if (!modal) return;
      
      if (event.target.classList.contains('close-modal') || 
          event.target.classList.contains('close-modal-btn') ||
          event.target === modal) {
        this.hideModal();
      }
    });
    
    // Create task button click
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('create-task-btn') || 
          event.target.closest('.create-task-btn')) {
        const reservationId = event.target.closest('.reservation-details')?.dataset.id;
        
        if (reservationId) {
          this.createTaskFromReservation(reservationId);
          this.hideModal();
        }
      }
    });
  }
  
  // Show modal with reservation details
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
      const detailContent = document.getElementById('reservation-detail-content');
      detailContent.innerHTML = `
        <div class="reservation-details" data-id="${reservation.id}">
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
      
      // Show modal
      const modal = document.getElementById(this.modalId);
      modal.classList.add('active');
    } catch (error) {
      console.error('Error showing reservation details:', error);
    }
  }
  
  // Hide modal
  hideModal() {
    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }
  
  // Create task from reservation
  async createTaskFromReservation(reservationId) {
    try {
      // Get reservation from database
      const reservations = await db.getReservations();
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (!reservation) {
        console.error('Reservation not found:', reservationId);
        return;
      }
      
      // Create check-in task
      const checkInDate = new Date(reservation.startDate).toISOString().split('T')[0];
      const checkInTask = {
        id: 'task_checkin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: `Příprava pro příjezd: ${reservation.guest}`,
        villa: reservation.villa,
        date: checkInDate,
        priority: 'high',
        description: `Příprava vily pro příjezd hosta: ${reservation.guest}`,
        subtasks: [
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Kontrola čistoty',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Příprava ručníků',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Kontrola vybavení',
            completed: false
          }
        ],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create check-out task
      // In iCal, the end date is exclusive, so the actual check-out is the day before
      const checkOutDate = new Date(reservation.endDate);
      checkOutDate.setDate(checkOutDate.getDate() - 1);
      const formattedCheckOutDate = checkOutDate.toISOString().split('T')[0];
      
      const checkOutTask = {
        id: 'task_checkout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: `Úklid po odjezdu: ${reservation.guest}`,
        villa: reservation.villa,
        date: formattedCheckOutDate,
        priority: 'high',
        description: `Úklid vily po odjezdu hosta: ${reservation.guest}`,
        subtasks: [
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Výměna ložního prádla',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Výměna ručníků',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Úklid koupelny',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Úklid kuchyně',
            completed: false
          },
          {
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: 'Vysávání a vytírání',
            completed: false
          }
        ],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save tasks to database
      await db.addTask(checkInTask);
      await db.addTask(checkOutTask);
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Úkoly byly vytvořeny z rezervace';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
      
      // Refresh tasks display if on the same date
      if (taskManager.currentDate.toISOString().split('T')[0] === checkInDate ||
          taskManager.currentDate.toISOString().split('T')[0] === formattedCheckOutDate) {
        taskManager.displayTasks();
      }
    } catch (error) {
      console.error('Error creating tasks from reservation:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při vytváření úkolů z rezervace';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
}

// Create and export reservation detail modal instance
const reservationDetailModal = new ReservationDetailModal();

// Add event listeners for reservation interactions
document.addEventListener('DOMContentLoaded', () => {
  // Add click event listener to reservation cards and events
  document.addEventListener('click', (event) => {
    const reservationElement = event.target.closest('.reservation-card, .timeline-event, .week-event, .day-event');
    
    if (reservationElement) {
      const reservationId = reservationElement.dataset.id;
      if (reservationId) {
        reservationDetailModal.showReservationDetails(reservationId);
      }
    }
  });
});
