// Marty Task Commander - Task Management System

class TaskManager {
  constructor() {
    this.currentDate = new Date();
    this.tasks = [];
    this.filteredVillas = ['ceskomalinska', 'podoli', 'marna']; // Default: show all villas
    this.filterStatus = 'all'; // all, pending, completed
    
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
  
  // Initialize task manager
  async init() {
    try {
      // Load tasks from database
      await this.loadTasks();
      
      // Set up UI elements
      this.setupUI();
      
      // Add event listeners
      this.addEventListeners();
      
      // Display tasks for current date
      this.displayTasks();
      
      return true;
    } catch (error) {
      console.error('Error initializing task manager:', error);
      return false;
    }
  }
  
  // Load tasks from database
  async loadTasks() {
    try {
      this.tasks = await db.getTasks();
      console.log(`Loaded ${this.tasks.length} tasks from database`);
      return this.tasks;
    } catch (error) {
      console.error('Error loading tasks from database:', error);
      this.tasks = [];
      return [];
    }
  }
  
  // Set up UI elements
  setupUI() {
    // Create task list container if it doesn't exist
    const taskListContainer = document.getElementById('task-list');
    if (!taskListContainer) {
      console.error('Task list container not found');
      return;
    }
    
    // Clear task list container
    taskListContainer.innerHTML = '';
    
    // Add date navigation
    const dateNav = document.createElement('div');
    dateNav.className = 'date-nav';
    dateNav.innerHTML = `
      <button id="prev-date-btn" class="nav-btn">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div id="current-date" class="current-date">
        ${this.formatDate(this.currentDate)}
      </div>
      <button id="next-date-btn" class="nav-btn">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
    taskListContainer.appendChild(dateNav);
    
    // Add filter controls
    const filterControls = document.createElement('div');
    filterControls.className = 'filter-controls';
    filterControls.innerHTML = `
      <div class="villa-filters">
        <label>
          <input type="checkbox" class="villa-filter" data-villa="ceskomalinska" checked>
          <span class="villa-color" style="background-color: ${this.villas.ceskomalinska.color}"></span>
          ${this.villas.ceskomalinska.name}
        </label>
        <label>
          <input type="checkbox" class="villa-filter" data-villa="podoli" checked>
          <span class="villa-color" style="background-color: ${this.villas.podoli.color}"></span>
          ${this.villas.podoli.name}
        </label>
        <label>
          <input type="checkbox" class="villa-filter" data-villa="marna" checked>
          <span class="villa-color" style="background-color: ${this.villas.marna.color}"></span>
          ${this.villas.marna.name}
        </label>
      </div>
      <div class="status-filters">
        <label>
          <input type="radio" name="status-filter" value="all" checked>
          Všechny
        </label>
        <label>
          <input type="radio" name="status-filter" value="pending">
          Nedokončené
        </label>
        <label>
          <input type="radio" name="status-filter" value="completed">
          Dokončené
        </label>
      </div>
    `;
    taskListContainer.appendChild(filterControls);
    
    // Add task list
    const taskList = document.createElement('div');
    taskList.id = 'tasks';
    taskList.className = 'tasks';
    taskListContainer.appendChild(taskList);
    
    // Add new task button
    const newTaskBtn = document.createElement('button');
    newTaskBtn.id = 'new-task-btn';
    newTaskBtn.className = 'primary-btn new-task-btn';
    newTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Nový úkol';
    taskListContainer.appendChild(newTaskBtn);
  }
  
  // Add event listeners
  addEventListeners() {
    // Date navigation
    const prevDateBtn = document.getElementById('prev-date-btn');
    const nextDateBtn = document.getElementById('next-date-btn');
    
    if (prevDateBtn) {
      prevDateBtn.addEventListener('click', () => {
        this.changeDate(-1);
      });
    }
    
    if (nextDateBtn) {
      nextDateBtn.addEventListener('click', () => {
        this.changeDate(1);
      });
    }
    
    // Villa filters
    const villaFilters = document.querySelectorAll('.villa-filter');
    villaFilters.forEach(filter => {
      filter.addEventListener('change', () => {
        this.updateVillaFilters();
      });
    });
    
    // Status filters
    const statusFilters = document.querySelectorAll('input[name="status-filter"]');
    statusFilters.forEach(filter => {
      filter.addEventListener('change', (event) => {
        this.filterStatus = event.target.value;
        this.displayTasks();
      });
    });
    
    // New task button
    const newTaskBtn = document.getElementById('new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        this.showNewTaskModal();
      });
    }
    
    // Task completion
    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('task-checkbox')) {
        const taskId = event.target.closest('.task-item').dataset.id;
        this.toggleTaskCompletion(taskId, event.target.checked);
      }
    });
    
    // Subtask completion
    document.addEventListener('change', (event) => {
      if (event.target.classList.contains('subtask-checkbox')) {
        const taskId = event.target.closest('.task-item').dataset.id;
        const subtaskId = event.target.closest('.subtask-item').dataset.id;
        this.toggleSubtaskCompletion(taskId, subtaskId, event.target.checked);
      }
    });
    
    // Task details
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('task-title') || 
          event.target.closest('.task-title')) {
        const taskItem = event.target.closest('.task-item');
        if (taskItem) {
          this.toggleTaskDetails(taskItem);
        }
      }
    });
    
    // Delete task
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-task-btn') || 
          event.target.closest('.delete-task-btn')) {
        const taskId = event.target.closest('.task-item').dataset.id;
        this.confirmDeleteTask(taskId);
      }
    });
    
    // Edit task
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('edit-task-btn') || 
          event.target.closest('.edit-task-btn')) {
        const taskId = event.target.closest('.task-item').dataset.id;
        this.showEditTaskModal(taskId);
      }
    });
  }
  
  // Change current date
  changeDate(days) {
    const newDate = new Date(this.currentDate);
    newDate.setDate(newDate.getDate() + days);
    this.currentDate = newDate;
    
    // Update current date display
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
      currentDateElement.textContent = this.formatDate(this.currentDate);
    }
    
    // Display tasks for new date
    this.displayTasks();
  }
  
  // Update villa filters
  updateVillaFilters() {
    const villaFilters = document.querySelectorAll('.villa-filter');
    this.filteredVillas = [];
    
    villaFilters.forEach(filter => {
      if (filter.checked) {
        this.filteredVillas.push(filter.dataset.villa);
      }
    });
    
    this.displayTasks();
  }
  
  // Display tasks for current date
  async displayTasks() {
    try {
      // Get tasks container
      const tasksContainer = document.getElementById('tasks');
      if (!tasksContainer) {
        console.error('Tasks container not found');
        return;
      }
      
      // Clear tasks container
      tasksContainer.innerHTML = '';
      
      // Format current date for comparison
      const currentDateStr = this.formatDateISO(this.currentDate);
      
      // Filter tasks for current date and selected villas
      const filteredTasks = this.tasks.filter(task => {
        // Filter by date
        if (task.date !== currentDateStr) {
          return false;
        }
        
        // Filter by villa
        if (!this.filteredVillas.includes(task.villa)) {
          return false;
        }
        
        // Filter by status
        if (this.filterStatus === 'pending' && task.completed) {
          return false;
        }
        if (this.filterStatus === 'completed' && !task.completed) {
          return false;
        }
        
        return true;
      });
      
      // Sort tasks by priority and completion status
      filteredTasks.sort((a, b) => {
        // Completed tasks at the bottom
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      // Display tasks
      if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '<div class="no-tasks">Žádné úkoly pro tento den</div>';
        return;
      }
      
      filteredTasks.forEach(task => {
        const taskElement = this.createTaskElement(task);
        tasksContainer.appendChild(taskElement);
      });
    } catch (error) {
      console.error('Error displaying tasks:', error);
    }
  }
  
  // Create task element
  createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
    taskElement.dataset.id = task.id;
    
    // Task header
    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';
    
    // Task checkbox
    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';
    taskCheckbox.className = 'task-checkbox';
    taskCheckbox.checked = task.completed;
    taskHeader.appendChild(taskCheckbox);
    
    // Task title
    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    taskTitle.innerHTML = `
      <span class="villa-indicator" style="background-color: ${this.villas[task.villa].color}"></span>
      <span class="title-text">${task.title}</span>
      <span class="task-expand"><i class="fas fa-chevron-down"></i></span>
    `;
    taskHeader.appendChild(taskTitle);
    
    taskElement.appendChild(taskHeader);
    
    // Task details (initially hidden)
    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';
    
    // Task description
    if (task.description) {
      const taskDescription = document.createElement('div');
      taskDescription.className = 'task-description';
      taskDescription.textContent = task.description;
      taskDetails.appendChild(taskDescription);
    }
    
    // Task subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      const subtasksList = document.createElement('ul');
      subtasksList.className = 'subtasks-list';
      
      task.subtasks.forEach(subtask => {
        const subtaskItem = document.createElement('li');
        subtaskItem.className = `subtask-item ${subtask.completed ? 'completed' : ''}`;
        subtaskItem.dataset.id = subtask.id;
        
        const subtaskCheckbox = document.createElement('input');
        subtaskCheckbox.type = 'checkbox';
        subtaskCheckbox.className = 'subtask-checkbox';
        subtaskCheckbox.checked = subtask.completed;
        subtaskItem.appendChild(subtaskCheckbox);
        
        const subtaskText = document.createElement('span');
        subtaskText.className = 'subtask-text';
        subtaskText.textContent = subtask.text;
        subtaskItem.appendChild(subtaskText);
        
        subtasksList.appendChild(subtaskItem);
      });
      
      taskDetails.appendChild(subtasksList);
    }
    
    // Task actions
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'secondary-btn edit-task-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i> Upravit';
    taskActions.appendChild(editButton);
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'danger-btn delete-task-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Smazat';
    taskActions.appendChild(deleteButton);
    
    taskDetails.appendChild(taskActions);
    
    taskElement.appendChild(taskDetails);
    
    return taskElement;
  }
  
  // Toggle task details visibility
  toggleTaskDetails(taskItem) {
    taskItem.classList.toggle('expanded');
    
    // Update expand icon
    const expandIcon = taskItem.querySelector('.task-expand i');
    if (expandIcon) {
      expandIcon.classList.toggle('fa-chevron-down');
      expandIcon.classList.toggle('fa-chevron-up');
    }
  }
  
  // Toggle task completion
  async toggleTaskCompletion(taskId, completed) {
    try {
      // Find task
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Update task
      task.completed = completed;
      task.updatedAt = new Date().toISOString();
      
      // Update all subtasks to match task completion
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          subtask.completed = completed;
        });
      }
      
      // Update task in database
      await db.updateTask(task);
      
      // Update UI
      const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
      if (taskItem) {
        taskItem.classList.toggle('completed', completed);
        
        // Update subtask checkboxes
        const subtaskCheckboxes = taskItem.querySelectorAll('.subtask-checkbox');
        subtaskCheckboxes.forEach(checkbox => {
          checkbox.checked = completed;
        });
        
        // Update subtask items
        const subtaskItems = taskItem.querySelectorAll('.subtask-item');
        subtaskItems.forEach(item => {
          item.classList.toggle('completed', completed);
        });
      }
      
      // Show notification
      this.showNotification(`Úkol ${completed ? 'dokončen' : 'označen jako nedokončený'}`);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  }
  
  // Toggle subtask completion
  async toggleSubtaskCompletion(taskId, subtaskId, completed) {
    try {
      // Find task
      const task = this.tasks.find(t => t.id === taskId);
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
      
      // Update subtask
      subtask.completed = completed;
      task.updatedAt = new Date().toISOString();
      
      // Check if all subtasks are completed
      const allSubtasksCompleted = task.subtasks.every(s => s.completed);
      
      // Update task completion if all subtasks are completed
      if (allSubtasksCompleted !== task.completed) {
        task.completed = allSubtasksCompleted;
        
        // Update task checkbox in UI
        const taskCheckbox = document.querySelector(`.task-item[data-id="${taskId}"] .task-checkbox`);
        if (taskCheckbox) {
          taskCheckbox.checked = allSubtasksCompleted;
        }
        
        // Update task item class
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
          taskItem.classList.toggle('completed', allSubtasksCompleted);
        }
      }
      
      // Update task in database
      await db.updateTask(task);
      
      // Update UI
      const subtaskItem = document.querySelector(`.subtask-item[data-id="${subtaskId}"]`);
      if (subtaskItem) {
        subtaskItem.classList.toggle('completed', completed);
      }
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
    }
  }
  
  // Show new task modal
  showNewTaskModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'new-task-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Nový úkol</h2>
        <form id="new-task-form">
          <div class="form-group">
            <label for="task-title">Název úkolu</label>
            <input type="text" id="task-title" required>
          </div>
          <div class="form-group">
            <label for="task-villa">Vila</label>
            <select id="task-villa" required>
              <option value="ceskomalinska">${this.villas.ceskomalinska.name}</option>
              <option value="podoli">${this.villas.podoli.name}</option>
              <option value="marna">${this.villas.marna.name}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="task-date">Datum</label>
            <input type="date" id="task-date" value="${this.formatDateISO(this.currentDate)}" required>
          </div>
          <div class="form-group">
            <label for="task-priority">Priorita</label>
            <select id="task-priority" required>
              <option value="high">Vysoká</option>
              <option value="medium" selected>Střední</option>
              <option value="low">Nízká</option>
            </select>
          </div>
          <div class="form-group">
            <label for="task-description">Popis</label>
            <textarea id="task-description"></textarea>
          </div>
          <div class="form-group">
            <label for="task-subtasks">Podúkoly (jeden na řádek)</label>
            <textarea id="task-subtasks"></textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="primary-btn">Vytvořit úkol</button>
            <button type="button" class="secondary-btn cancel-btn">Zrušit</button>
          </div>
        </form>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#new-task-form');
    
    // Close modal on close button click
    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    // Close modal on cancel button click
    cancelBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    // Close modal on click outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        this.closeModal(modal);
      }
    });
    
    // Handle form submission
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      // Get form values
      const title = document.getElementById('task-title').value;
      const villa = document.getElementById('task-villa').value;
      const date = document.getElementById('task-date').value;
      const priority = document.getElementById('task-priority').value;
      const description = document.getElementById('task-description').value;
      const subtasksText = document.getElementById('task-subtasks').value;
      
      // Create subtasks array
      const subtasks = subtasksText
        .split('\n')
        .filter(text => text.trim() !== '')
        .map(text => ({
          id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          completed: false
        }));
      
      // Create task object
      const task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
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
      
      // Add task to database
      await this.addTask(task);
      
      // Close modal
      this.closeModal(modal);
    });
    
    // Focus on title input
    setTimeout(() => {
      document.getElementById('task-title').focus();
    }, 100);
  }
  
  // Show edit task modal
  async showEditTaskModal(taskId) {
    try {
      // Find task
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('Task not found:', taskId);
        return;
      }
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'edit-task-modal';
      
      // Create modal content
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h2>Upravit úkol</h2>
          <form id="edit-task-form">
            <div class="form-group">
              <label for="edit-task-title">Název úkolu</label>
              <input type="text" id="edit-task-title" value="${task.title}" required>
            </div>
            <div class="form-group">
              <label for="edit-task-villa">Vila</label>
              <select id="edit-task-villa" required>
                <option value="ceskomalinska" ${task.villa === 'ceskomalinska' ? 'selected' : ''}>${this.villas.ceskomalinska.name}</option>
                <option value="podoli" ${task.villa === 'podoli' ? 'selected' : ''}>${this.villas.podoli.name}</option>
                <option value="marna" ${task.villa === 'marna' ? 'selected' : ''}>${this.villas.marna.name}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-task-date">Datum</label>
              <input type="date" id="edit-task-date" value="${task.date}" required>
            </div>
            <div class="form-group">
              <label for="edit-task-priority">Priorita</label>
              <select id="edit-task-priority" required>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Vysoká</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Střední</option>
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Nízká</option>
              </select>
            </div>
            <div class="form-group">
              <label for="edit-task-description">Popis</label>
              <textarea id="edit-task-description">${task.description || ''}</textarea>
            </div>
            <div class="form-group">
              <label for="edit-task-subtasks">Podúkoly (jeden na řádek)</label>
              <textarea id="edit-task-subtasks">${task.subtasks.map(s => s.text).join('\n')}</textarea>
            </div>
            <div class="form-group">
              <button type="submit" class="primary-btn">Uložit změny</button>
              <button type="button" class="secondary-btn cancel-btn">Zrušit</button>
            </div>
          </form>
        </div>
      `;
      
      // Add modal to document
      document.body.appendChild(modal);
      
      // Show modal
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
      
      // Add event listeners
      const closeBtn = modal.querySelector('.close-modal');
      const cancelBtn = modal.querySelector('.cancel-btn');
      const form = modal.querySelector('#edit-task-form');
      
      // Close modal on close button click
      closeBtn.addEventListener('click', () => {
        this.closeModal(modal);
      });
      
      // Close modal on cancel button click
      cancelBtn.addEventListener('click', () => {
        this.closeModal(modal);
      });
      
      // Close modal on click outside
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.closeModal(modal);
        }
      });
      
      // Handle form submission
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form values
        const title = document.getElementById('edit-task-title').value;
        const villa = document.getElementById('edit-task-villa').value;
        const date = document.getElementById('edit-task-date').value;
        const priority = document.getElementById('edit-task-priority').value;
        const description = document.getElementById('edit-task-description').value;
        const subtasksText = document.getElementById('edit-task-subtasks').value;
        
        // Create subtasks array
        const subtasks = subtasksText
          .split('\n')
          .filter(text => text.trim() !== '')
          .map((text, index) => {
            // Try to reuse existing subtask IDs
            const existingSubtask = task.subtasks[index];
            return {
              id: existingSubtask ? existingSubtask.id : 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
              text: text.trim(),
              completed: existingSubtask ? existingSubtask.completed : false
            };
          });
        
        // Update task object
        const updatedTask = {
          ...task,
          title,
          villa,
          date,
          priority,
          description,
          subtasks,
          updatedAt: new Date().toISOString()
        };
        
        // Update task in database
        await this.updateTask(updatedTask);
        
        // Close modal
        this.closeModal(modal);
      });
      
      // Focus on title input
      setTimeout(() => {
        document.getElementById('edit-task-title').focus();
      }, 100);
    } catch (error) {
      console.error('Error showing edit task modal:', error);
    }
  }
  
  // Confirm delete task
  confirmDeleteTask(taskId) {
    // Find task
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'confirm-delete-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Smazat úkol</h2>
        <p>Opravdu chcete smazat úkol "${task.title}"?</p>
        <div class="modal-actions">
          <button class="danger-btn confirm-delete-btn">Smazat</button>
          <button class="secondary-btn cancel-btn">Zrušit</button>
        </div>
      </div>
    `;
    
    // Add modal to document
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-delete-btn');
    
    // Close modal on close button click
    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    // Close modal on cancel button click
    cancelBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    // Close modal on click outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        this.closeModal(modal);
      }
    });
    
    // Handle confirm button click
    confirmBtn.addEventListener('click', async () => {
      await this.deleteTask(taskId);
      this.closeModal(modal);
    });
  }
  
  // Close modal
  closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  // Add task
  async addTask(task) {
    try {
      // Add task to database
      await db.addTask(task);
      
      // Add task to local array
      this.tasks.push(task);
      
      // Display tasks
      this.displayTasks();
      
      // Show notification
      this.showNotification('Úkol vytvořen');
      
      return task;
    } catch (error) {
      console.error('Error adding task:', error);
      this.showNotification('Chyba při vytváření úkolu', 'error');
      return null;
    }
  }
  
  // Update task
  async updateTask(updatedTask) {
    try {
      // Update task in database
      await db.updateTask(updatedTask);
      
      // Update task in local array
      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
      
      // Display tasks
      this.displayTasks();
      
      // Show notification
      this.showNotification('Úkol aktualizován');
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      this.showNotification('Chyba při aktualizaci úkolu', 'error');
      return null;
    }
  }
  
  // Delete task
  async deleteTask(taskId) {
    try {
      // Delete task from database
      await db.deleteTask(taskId);
      
      // Delete task from local array
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      
      // Display tasks
      this.displayTasks();
      
      // Show notification
      this.showNotification('Úkol smazán');
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showNotification('Chyba při mazání úkolu', 'error');
      return false;
    }
  }
  
  // Create tasks from reservations
  async createTasksFromReservations() {
    try {
      // Get all reservations
      const reservations = await db.getReservations();
      
      // Get all existing tasks
      const existingTasks = await db.getTasks();
      
      // Track created tasks
      const createdTasks = [];
      
      // Process each reservation
      for (const reservation of reservations) {
        // Create check-in task
        const checkInDate = new Date(reservation.startDate).toISOString().split('T')[0];
        
        // Check if check-in task already exists
        const existingCheckInTask = existingTasks.find(t => 
          t.date === checkInDate && 
          t.villa === reservation.villa && 
          t.title.includes('Příprava pro příjezd')
        );
        
        if (!existingCheckInTask) {
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
          
          // Add task to database
          await db.addTask(checkInTask);
          
          // Add task to local array
          this.tasks.push(checkInTask);
          
          // Add to created tasks
          createdTasks.push(checkInTask);
        }
        
        // Create check-out task
        // In iCal, the end date is exclusive, so the actual check-out is the day before
        const checkOutDate = new Date(reservation.endDate);
        checkOutDate.setDate(checkOutDate.getDate() - 1);
        const formattedCheckOutDate = checkOutDate.toISOString().split('T')[0];
        
        // Check if check-out task already exists
        const existingCheckOutTask = existingTasks.find(t => 
          t.date === formattedCheckOutDate && 
          t.villa === reservation.villa && 
          t.title.includes('Úklid po odjezdu')
        );
        
        if (!existingCheckOutTask) {
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
          
          // Add task to database
          await db.addTask(checkOutTask);
          
          // Add task to local array
          this.tasks.push(checkOutTask);
          
          // Add to created tasks
          createdTasks.push(checkOutTask);
        }
      }
      
      // Display tasks if current date matches any created task
      if (createdTasks.some(t => t.date === this.formatDateISO(this.currentDate))) {
        this.displayTasks();
      }
      
      // Show notification
      if (createdTasks.length > 0) {
        this.showNotification(`Vytvořeno ${createdTasks.length} úkolů z rezervací`);
      } else {
        this.showNotification('Žádné nové úkoly k vytvoření');
      }
      
      return createdTasks;
    } catch (error) {
      console.error('Error creating tasks from reservations:', error);
      this.showNotification('Chyba při vytváření úkolů z rezervací', 'error');
      return [];
    }
  }
  
  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.getElementById('sync-notification');
    if (notification) {
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
  
  // Format date for display
  formatDate(date) {
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  // Format date as ISO string (YYYY-MM-DD)
  formatDateISO(date) {
    return date.toISOString().split('T')[0];
  }
}

// Create and export task manager instance
const taskManager = new TaskManager();

// Initialize task manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  taskManager.init();
});
