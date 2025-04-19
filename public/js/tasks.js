// Marty Task Commander - Task Management Module

class TaskManager {
  constructor() {
    this.currentDate = new Date();
    this.filteredVillas = ['ceskomalinska', 'podoli', 'marna']; // Default: show all villas
    this.filteredStatus = 'all'; // all, pending, completed
    this.filteredPriority = 'all'; // all, high, medium, low
    
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
    // Add task button
    document.getElementById('add-task-btn').addEventListener('click', () => this.openTaskModal());
    
    // Task filter controls
    document.getElementById('task-filter-status').addEventListener('change', (e) => {
      this.filteredStatus = e.target.value;
      this.displayTasks();
    });
    
    document.getElementById('task-filter-priority').addEventListener('change', (e) => {
      this.filteredPriority = e.target.value;
      this.displayTasks();
    });
    
    // Villa filters (reuse from reservations)
    const villaCheckboxes = document.querySelectorAll('.villa-checkbox');
    villaCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateVillaFilters());
    });
    
    // Task form
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });
    
    // Add subtask button
    document.getElementById('add-subtask-btn').addEventListener('click', () => this.addSubtaskField());
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.closeTaskModal());
    });
    
    // Date navigation (reuse from reservations)
    document.getElementById('prev-date-btn').addEventListener('click', () => this.navigateDate('prev'));
    document.getElementById('next-date-btn').addEventListener('click', () => this.navigateDate('next'));
  }
  
  // Navigate date (prev, next)
  navigateDate(direction) {
    const currentDate = this.currentDate;
    
    // Navigate by day
    if (direction === 'prev') {
      this.currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
    } else {
      this.currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    // Update current date display
    this.updateDateDisplay();
    
    // Refresh display
    this.displayTasks();
  }
  
  // Update date display
  updateDateDisplay() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = this.currentDate.toLocaleDateString('cs-CZ', options);
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
    this.displayTasks();
  }
  
  // Open task modal
  openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const subtasksContainer = document.getElementById('subtasks-container');
    
    // Clear form
    form.reset();
    subtasksContainer.innerHTML = '';
    
    // Set default date to current date
    document.getElementById('task-date').valueAsDate = this.currentDate;
    
    // If editing existing task
    if (taskId) {
      this.loadTaskForEditing(taskId);
    } else {
      // Add one empty subtask field for new tasks
      this.addSubtaskField();
    }
    
    // Show modal
    modal.classList.add('active');
  }
  
  // Close task modal
  closeTaskModal() {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('active');
  }
  
  // Add subtask field
  addSubtaskField(value = '') {
    const subtasksContainer = document.getElementById('subtasks-container');
    const subtaskId = Date.now(); // Unique ID for the subtask field
    
    const subtaskGroup = document.createElement('div');
    subtaskGroup.className = 'subtask-input-group';
    subtaskGroup.innerHTML = `
      <input type="text" name="subtask_${subtaskId}" value="${value}" placeholder="Podúkol">
      <button type="button" class="remove-subtask-btn" data-id="${subtaskId}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add event listener to remove button
    subtaskGroup.querySelector('.remove-subtask-btn').addEventListener('click', (e) => {
      e.target.closest('.subtask-input-group').remove();
    });
    
    subtasksContainer.appendChild(subtaskGroup);
  }
  
  // Load task for editing
  async loadTaskForEditing(taskId) {
    try {
      // Get task from database
      const tasks = await db.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Fill form with task data
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-villa').value = task.villa;
      document.getElementById('task-date').value = task.date;
      document.getElementById('task-priority').value = task.priority;
      document.getElementById('task-description').value = task.description || '';
      
      // Add subtask fields
      const subtasksContainer = document.getElementById('subtasks-container');
      subtasksContainer.innerHTML = '';
      
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          this.addSubtaskField(subtask.text);
        });
      } else {
        // Add one empty subtask field
        this.addSubtaskField();
      }
      
      // Store task ID for updating
      document.getElementById('task-form').dataset.taskId = taskId;
    } catch (error) {
      console.error('Error loading task for editing:', error);
    }
  }
  
  // Save task
  async saveTask() {
    try {
      const form = document.getElementById('task-form');
      const taskId = form.dataset.taskId;
      
      // Get form data
      const title = document.getElementById('task-title').value;
      const villa = document.getElementById('task-villa').value;
      const date = document.getElementById('task-date').value;
      const priority = document.getElementById('task-priority').value;
      const description = document.getElementById('task-description').value;
      
      // Get subtasks
      const subtaskInputs = form.querySelectorAll('[name^="subtask_"]');
      const subtasks = [];
      
      subtaskInputs.forEach(input => {
        if (input.value.trim()) {
          subtasks.push({
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: input.value.trim(),
            completed: false
          });
        }
      });
      
      // Create task object
      const task = {
        title,
        villa,
        date,
        priority,
        description,
        subtasks,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If editing existing task
      if (taskId) {
        task.id = taskId;
        await db.updateTask(task);
      } else {
        // Generate ID for new task
        task.id = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        await db.addTask(task);
      }
      
      // Close modal
      this.closeTaskModal();
      
      // Refresh display
      this.displayTasks();
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = taskId ? 'Úkol byl aktualizován' : 'Nový úkol byl vytvořen';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    } catch (error) {
      console.error('Error saving task:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při ukládání úkolu';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Toggle task completion
  async toggleTaskCompletion(taskId) {
    try {
      // Get task from database
      const tasks = await db.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Toggle completion status
      task.completed = !task.completed;
      task.updatedAt = new Date().toISOString();
      
      // Update task in database
      await db.updateTask(task);
      
      // Refresh display
      this.displayTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  }
  
  // Toggle subtask completion
  async toggleSubtaskCompletion(taskId, subtaskId) {
    try {
      // Get task from database
      const tasks = await db.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Find subtask
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      
      if (!subtask) {
        console.error('Subtask not found:', subtaskId);
        return;
      }
      
      // Toggle completion status
      subtask.completed = !subtask.completed;
      task.updatedAt = new Date().toISOString();
      
      // Check if all subtasks are completed
      const allSubtasksCompleted = task.subtasks.every(s => s.completed);
      
      // Update task completion status if all subtasks are completed
      if (allSubtasksCompleted && !task.completed) {
        task.completed = true;
      } else if (!allSubtasksCompleted && task.completed) {
        task.completed = false;
      }
      
      // Update task in database
      await db.updateTask(task);
      
      // Refresh display
      this.displayTasks();
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  }
  
  // Delete task
  async deleteTask(taskId) {
    try {
      // Confirm deletion
      if (!confirm('Opravdu chcete smazat tento úkol?')) {
        return;
      }
      
      // Delete task from database
      await db.deleteTask(taskId);
      
      // Refresh display
      this.displayTasks();
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Úkol byl smazán';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při mazání úkolu';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Get tasks for current view
  async getTasksForCurrentView() {
    try {
      // Format current date to YYYY-MM-DD
      const formattedDate = this.currentDate.toISOString().split('T')[0];
      
      // Get tasks for current date
      const tasks = await db.getTasksByDate(formattedDate);
      
      // Apply filters
      return tasks.filter(task => {
        // Filter by villa
        if (!this.filteredVillas.includes(task.villa)) {
          return false;
        }
        
        // Filter by status
        if (this.filteredStatus === 'pending' && task.completed) {
          return false;
        }
        
        if (this.filteredStatus === 'completed' && !task.completed) {
          return false;
        }
        
        // Filter by priority
        if (this.filteredPriority !== 'all' && task.priority !== this.filteredPriority) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error getting tasks for current view:', error);
      return [];
    }
  }
  
  // Display tasks
  async displayTasks() {
    try {
      // Update date display
      this.updateDateDisplay();
      
      // Get tasks for current view
      const tasks = await this.getTasksForCurrentView();
      
      // Get content container
      const contentElement = document.getElementById('tasks-content');
      
      // Clear content
      contentElement.innerHTML = '';
      
      // Display tasks
      if (tasks.length === 0) {
        contentElement.innerHTML = '<div class="no-tasks">Žádné úkoly pro tento den</div>';
        return;
      }
      
      // Sort tasks by priority (high > medium > low) and then by completion status
      tasks.sort((a, b) => {
        // First sort by completion status
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      // Create task cards
      tasks.forEach(task => {
        const card = this.createTaskCard(task);
        contentElement.appendChild(card);
      });
    } catch (error) {
      console.error('Error displaying tasks:', error);
      
      // Show error message
      const contentElement = document.getElementById('tasks-content');
      contentElement.innerHTML = '<div class="error-message">Chyba při načítání úkolů</div>';
    }
  }
  
  // Create task card
  createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.priority}`;
    card.dataset.id = task.id;
    
    if (task.completed) {
      card.classList.add('completed');
    }
    
    // Format date
    const taskDate = new Date(task.date);
    const formattedDate = taskDate.toLocaleDateString('cs-CZ');
    
    // Create card content
    card.innerHTML = `
      <div class="task-header">
        <div class="task-title">
          <span class="task-villa-indicator ${task.villa}"></span>
          ${task.completed ? '<i class="fas fa-check-circle"></i> ' : ''}
          ${task.title}
        </div>
        <div class="task-actions">
          <button class="edit-task-btn" title="Upravit úkol">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-task-btn" title="Smazat úkol">
            <i class="fas fa-trash"></i>
          </button>
          <button class="toggle-task-btn" title="${task.completed ? 'Označit jako nedokončený' : 'Označit jako dokončený'}">
            <i class="fas ${task.completed ? 'fa-times-circle' : 'fa-check-circle'}"></i>
          </button>
        </div>
      </div>
      <div class="task-date">
        <i class="fas fa-calendar-alt"></i> ${formattedDate}
        <span class="task-villa">${this.villas[task.villa].name}</span>
      </div>
      ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      ${task.subtasks && task.subtasks.length > 0 ? `
        <div class="subtasks">
          ${task.subtasks.map(subtask => `
            <div class="subtask-item ${subtask.completed ? 'completed' : ''}" data-id="${subtask.id}">
              <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
              <span>${subtask.text}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
    
    // Add event listeners
    // Edit task
    card.querySelector('.edit-task-btn').addEventListener('click', () => {
      this.openTaskModal(task.id);
    });
    
    // Delete task
    card.querySelector('.delete-task-btn').addEventListener('click', () => {
      this.deleteTask(task.id);
    });
    
    // Toggle task completion
    card.querySelector('.toggle-task-btn').addEventListener('click', () => {
      this.toggleTaskCompletion(task.id);
    });
    
    // Toggle subtask completion
    const subtaskCheckboxes = card.querySelectorAll('.subtask-checkbox');
    subtaskCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const subtaskId = checkbox.closest('.subtask-item').dataset.id;
        this.toggleSubtaskCompletion(task.id, subtaskId);
      });
    });
    
    return card;
  }
  
  // Create tasks from reservations
  async createTasksFromReservations() {
    try {
      // Get all reservations
      const reservations = await db.getReservations();
      
      // Get all existing tasks
      const existingTasks = await db.getTasks();
      
      // Create cleaning tasks for check-out dates
      for (const reservation of reservations) {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Check-in date task (prepare for arrival)
        const checkInDate = startDate.toISOString().split('T')[0];
        
        // Check if task already exists for this date and villa
        const existingCheckInTask = existingTasks.find(task => 
          task.date === checkInDate && 
          task.villa === reservation.villa &&
          task.title.includes('Příprava')
        );
        
        if (!existingCheckInTask) {
          // Create check-in task
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
          
          await db.addTask(checkInTask);
        }
        
        // Check-out date task (cleaning after departure)
        // In iCal, the end date is exclusive, so the actual check-out is the day before
        const checkOutDate = new Date(endDate);
        checkOutDate.setDate(checkOutDate.getDate() - 1);
        const formattedCheckOutDate = checkOutDate.toISOString().split('T')[0];
        
        // Check if task already exists for this date and villa
        const existingCheckOutTask = existingTasks.find(task => 
          task.date === formattedCheckOutDate && 
          task.villa === reservation.villa &&
          task.title.includes('Úklid')
        );
        
        if (!existingCheckOutTask) {
          // Create check-out task
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
          
          await db.addTask(checkOutTask);
        }
      }
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Úkoly byly vytvořeny z rezervací';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
      
      // Refresh display
      this.displayTasks();
    } catch (error) {
      console.error('Error creating tasks from reservations:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při vytváření úkolů z rezervací';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Export tasks to CSV
  async exportTasksToCSV() {
    try {
      // Get all tasks
      const tasks = await db.getTasks();
      
      if (tasks.length === 0) {
        alert('Žádné úkoly k exportu');
        return;
      }
      
      // Create CSV header
      let csv = 'ID,Název,Vila,Datum,Priorita,Popis,Podúkoly,Dokončeno,Vytvořeno,Aktualizováno\n';
      
      // Add tasks to CSV
      tasks.forEach(task => {
        const subtasks = task.subtasks.map(s => `${s.text}${s.completed ? ' (✓)' : ''}`).join('; ');
        
        csv += `"${task.id}","${task.title}","${this.villas[task.villa].name}","${task.date}","${task.priority}","${task.description.replace(/"/g, '""')}","${subtasks}","${task.completed ? 'Ano' : 'Ne'}","${new Date(task.createdAt).toLocaleString('cs-CZ')}","${new Date(task.updatedAt).toLocaleString('cs-CZ')}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `marty-tasks-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Úkoly byly exportovány do CSV';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    } catch (error) {
      console.error('Error exporting tasks to CSV:', error);
      
      // Show error notification
      const notification = document.getElementById('sync-notification');
      notification.textContent = 'Chyba při exportu úkolů';
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Initialize task manager
  async init() {
    // Update date display
    this.updateDateDisplay();
    
    // Display tasks
    await this.displayTasks();
    
    // Create tasks from reservations if no tasks exist
    const tasks = await db.getTasks();
    if (tasks.length === 0) {
      // Wait for reservations to be loaded first
      setTimeout(() => {
        this.createTasksFromReservations();
      }, 2000);
    }
  }
}

// Create and export task manager instance
const taskManager = new TaskManager();
