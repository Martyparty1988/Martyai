// Marty Task Commander - Telegram Integration Module

class TelegramIntegration {
  constructor() {
    this.token = '7590306430:AAFjR5GNzdozq1HRGv_fw24mN_dRvb_NS_I';
    this.chatId = 6592431657;
    this.backendUrl = '/api/telegram'; // This would be replaced with actual backend URL in production
    this.isConnected = false;
    this.messages = [];
    this.lastMessageId = 0;
  }
  
  // Initialize Telegram integration
  async init() {
    try {
      // Check connection to backend
      await this.checkConnection();
      
      // Set up message polling
      this.startMessagePolling();
      
      // Set up UI elements
      this.setupUI();
      
      return true;
    } catch (error) {
      console.error('Error initializing Telegram integration:', error);
      return false;
    }
  }
  
  // Check connection to backend
  async checkConnection() {
    try {
      // In a real implementation, this would make an API call to the backend
      // For now, we'll simulate a successful connection
      this.isConnected = true;
      console.log('Telegram bot connected successfully');
      return true;
    } catch (error) {
      console.error('Error connecting to Telegram bot backend:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  // Start polling for new messages
  startMessagePolling() {
    // In a real implementation, this would poll the backend for new messages
    // For now, we'll simulate receiving messages periodically
    setInterval(() => {
      if (this.isConnected) {
        this.checkForNewMessages();
      }
    }, 5000);
  }
  
  // Check for new messages
  async checkForNewMessages() {
    try {
      // In a real implementation, this would make an API call to the backend
      // For now, we'll simulate receiving messages
      
      // Simulate receiving a new message occasionally
      if (Math.random() < 0.1) {
        const newMessage = this.generateRandomMessage();
        this.handleNewMessage(newMessage);
      }
    } catch (error) {
      console.error('Error checking for new Telegram messages:', error);
    }
  }
  
  // Generate a random message for simulation
  generateRandomMessage() {
    const messageTypes = [
      { type: 'command', text: '/ukol podoli Vyměnit ručníky' },
      { type: 'command', text: '/vila ceskomalinska' },
      { type: 'command', text: '/hotovo Úklid koupelny' },
      { type: 'text', text: 'V Marně chybí toaletní papír' },
      { type: 'text', text: 'Českomalínská - rozbité okno v ložnici' },
      { type: 'text', text: 'Kdy má být hotový úklid v Podolí?' }
    ];
    
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    return {
      id: this.lastMessageId++,
      type: randomType.type,
      text: randomType.text,
      from: {
        id: 123456789,
        first_name: 'Uklízečka',
        last_name: 'Testovací'
      },
      date: new Date().toISOString()
    };
  }
  
  // Handle new message
  async handleNewMessage(message) {
    // Add message to list
    this.messages.push(message);
    
    // Update UI
    this.updateMessageList();
    
    // Process message
    if (message.type === 'command') {
      await this.handleCommand(message);
    } else {
      await this.handleTextMessage(message);
    }
  }
  
  // Handle command message
  async handleCommand(message) {
    try {
      // Parse command
      const commandParts = message.text.split(' ');
      const command = commandParts[0];
      
      // Handle different commands
      switch (command) {
        case '/ukol':
          await this.handleTaskCommand(message);
          break;
        case '/hotovo':
          await this.handleCompletedCommand(message);
          break;
        case '/vila':
          await this.handleVillaCommand(message);
          break;
        default:
          console.log('Unknown command:', command);
      }
    } catch (error) {
      console.error('Error handling Telegram command:', error);
    }
  }
  
  // Handle /ukol command
  async handleTaskCommand(message) {
    try {
      // Parse command: /ukol [villa] [task]
      const commandParts = message.text.split(' ');
      
      if (commandParts.length < 3) {
        await this.sendMessage('Použití: /ukol [vila] [úkol]\nPříklad: /ukol podoli Vyměnit ručníky');
        return;
      }
      
      const villaName = commandParts[1].toLowerCase();
      const taskText = commandParts.slice(2).join(' ');
      
      // Map villa name to villa key
      let villaKey = null;
      if (villaName.includes('cesko') || villaName.includes('česko') || villaName.includes('malin')) {
        villaKey = 'ceskomalinska';
      } else if (villaName.includes('podol')) {
        villaKey = 'podoli';
      } else if (villaName.includes('marn')) {
        villaKey = 'marna';
      }
      
      if (!villaKey) {
        await this.sendMessage('Neznámá vila. Použijte: ceskomalinska, podoli, nebo marna');
        return;
      }
      
      // Create task
      const task = {
        id: 'task_telegram_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: taskText,
        villa: villaKey,
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        description: `Úkol vytvořen přes Telegram od uživatele ${message.from.first_name} ${message.from.last_name || ''}`,
        subtasks: [],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Use AI to generate subtasks
      try {
        const aiSubtasks = await aiManager.generateSubtasks(taskText, villaKey);
        
        if (aiSubtasks && aiSubtasks.length > 0) {
          task.subtasks = aiSubtasks.map(text => ({
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: text,
            completed: false
          }));
        }
      } catch (error) {
        console.error('Error generating subtasks with AI:', error);
      }
      
      // Save task to database
      await db.addTask(task);
      
      // Send confirmation
      const villaNames = {
        ceskomalinska: 'Českomalínská',
        podoli: 'Podolí',
        marna: 'Marna'
      };
      
      await this.sendMessage(`✅ Úkol vytvořen pro vilu ${villaNames[villaKey]}:\n${taskText}`);
      
      // Refresh tasks display if on the same date
      if (taskManager.currentDate.toISOString().split('T')[0] === task.date) {
        taskManager.displayTasks();
      }
      
      // Show notification
      this.showNotification(`Nový úkol z Telegramu: ${taskText}`);
    } catch (error) {
      console.error('Error handling task command:', error);
      await this.sendMessage('❌ Chyba při vytváření úkolu. Zkuste to prosím znovu.');
    }
  }
  
  // Handle /hotovo command
  async handleCompletedCommand(message) {
    try {
      // Parse command: /hotovo [task_id or task_description]
      const commandParts = message.text.split(' ');
      
      if (commandParts.length < 2) {
        await this.sendMessage('Použití: /hotovo [ID úkolu nebo popis]');
        return;
      }
      
      const taskIdentifier = commandParts.slice(1).join(' ');
      
      // Get all tasks
      const tasks = await db.getTasks();
      
      // Find task by ID or description
      let task = tasks.find(t => t.id === taskIdentifier);
      
      // If not found by ID, try to find by title (partial match)
      if (!task) {
        task = tasks.find(t => 
          !t.completed && 
          t.title.toLowerCase().includes(taskIdentifier.toLowerCase())
        );
      }
      
      if (!task) {
        await this.sendMessage('❌ Úkol nebyl nalezen. Zkontrolujte ID nebo popis úkolu.');
        return;
      }
      
      // Mark task as completed
      task.completed = true;
      task.updatedAt = new Date().toISOString();
      
      // Mark all subtasks as completed
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(subtask => {
          subtask.completed = true;
        });
      }
      
      // Update task in database
      await db.updateTask(task);
      
      // Send confirmation
      const villaNames = {
        ceskomalinska: 'Českomalínská',
        podoli: 'Podolí',
        marna: 'Marna'
      };
      
      await this.sendMessage(`✅ Úkol označen jako dokončený:\n${task.title}\nVila: ${villaNames[task.villa]}`);
      
      // Refresh tasks display if on the same date
      if (taskManager.currentDate.toISOString().split('T')[0] === task.date) {
        taskManager.displayTasks();
      }
      
      // Show notification
      this.showNotification(`Úkol dokončen přes Telegram: ${task.title}`);
    } catch (error) {
      console.error('Error handling completed command:', error);
      await this.sendMessage('❌ Chyba při označování úkolu jako dokončeného. Zkuste to prosím znovu.');
    }
  }
  
  // Handle /vila command
  async handleVillaCommand(message) {
    try {
      // Parse command: /vila [villa_name]
      const commandParts = message.text.split(' ');
      
      if (commandParts.length < 2) {
        // List all villas and their tasks for today
        const today = new Date().toISOString().split('T')[0];
        const tasks = await db.getTasksByDate(today);
        
        const villaNames = {
          ceskomalinska: 'Českomalínská',
          podoli: 'Podolí',
          marna: 'Marna'
        };
        
        let response = '📋 Dnešní úkoly podle vil:\n\n';
        
        for (const [villaKey, villaName] of Object.entries(villaNames)) {
          const villaTasks = tasks.filter(t => t.villa === villaKey);
          
          response += `${villaName}:\n`;
          
          if (villaTasks.length === 0) {
            response += '- Žádné úkoly\n\n';
          } else {
            villaTasks.forEach(task => {
              response += `- ${task.completed ? '✅' : '⬜'} ${task.title}\n`;
            });
            response += '\n';
          }
        }
        
        await this.sendMessage(response);
        return;
      }
      
      const villaName = commandParts[1].toLowerCase();
      
      // Map villa name to villa key
      let villaKey = null;
      if (villaName.includes('cesko') || villaName.includes('česko') || villaName.includes('malin')) {
        villaKey = 'ceskomalinska';
      } else if (villaName.includes('podol')) {
        villaKey = 'podoli';
      } else if (villaName.includes('marn')) {
        villaKey = 'marna';
      }
      
      if (!villaKey) {
        await this.sendMessage('Neznámá vila. Použijte: ceskomalinska, podoli, nebo marna');
        return;
      }
      
      // Get tasks for this villa
      const tasks = await db.getTasksByVilla(villaKey);
      
      // Filter for today and upcoming tasks
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const villaNames = {
        ceskomalinska: 'Českomalínská',
        podoli: 'Podolí',
        marna: 'Marna'
      };
      
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toDateString() === today.toDateString();
      });
      
      const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate > today && !task.completed;
      });
      
      // Sort upcoming tasks by date
      upcomingTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Prepare response
      let response = `📋 Úkoly pro vilu ${villaNames[villaKey]}:\n\n`;
      
      // Today's tasks
      response += 'Dnešní úkoly:\n';
      if (todayTasks.length === 0) {
        response += '- Žádné úkoly\n\n';
      } else {
        todayTasks.forEach(task => {
          response += `- ${task.completed ? '✅' : '⬜'} ${task.title}\n`;
        });
        response += '\n';
      }
      
      // Upcoming tasks
      response += 'Nadcházející úkoly:\n';
      if (upcomingTasks.length === 0) {
        response += '- Žádné úkoly\n';
      } else {
        // Show only next 5 upcoming tasks
        const tasksToShow = upcomingTasks.slice(0, 5);
        tasksToShow.forEach(task => {
          const taskDate = new Date(task.date);
          const formattedDate = taskDate.toLocaleDateString('cs-CZ');
          response += `- ${formattedDate}: ${task.title}\n`;
        });
        
        if (upcomingTasks.length > 5) {
          response += `... a dalších ${upcomingTasks.length - 5} úkolů\n`;
        }
      }
      
      await this.sendMessage(response);
      
      // Show notification
      this.showNotification(`Zobrazeny úkoly pro vilu ${villaNames[villaKey]} přes Telegram`);
    } catch (error) {
      console.error('Error handling villa command:', error);
      await this.sendMessage('❌ Chyba při získávání informací o vile. Zkuste to prosím znovu.');
    }
  }
  
  // Handle text message
  async handleTextMessage(message) {
    try {
      // Use AI to interpret message
      const interpretation = await aiManager.interpretMessage(message.text);
      
      if (!interpretation) {
        await this.sendMessage('Zpráva přijata, ale nerozumím, co mám udělat. Použijte příkazy /ukol, /hotovo nebo /vila.');
        return;
      }
      
      // Check if AI identified a task
      if (interpretation.type === 'task') {
        // Create task
        const task = {
          id: 'task_ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          title: interpretation.title || message.text,
          villa: interpretation.villa || 'ceskomalinska', // Default to Ceskomalinska if not specified
          date: new Date().toISOString().split('T')[0],
          priority: interpretation.priority || 'medium',
          description: `Úkol vytvořen z Telegram zprávy od uživatele ${message.from.first_name} ${message.from.last_name || ''}:\n"${message.text}"`,
          subtasks: [],
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add subtasks if provided by AI
        if (interpretation.subtasks && interpretation.subtasks.length > 0) {
          task.subtasks = interpretation.subtasks.map(text => ({
            id: 'subtask_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: text,
            completed: false
          }));
        }
        
        // Save task to database
        await db.addTask(task);
        
        // Send confirmation
        const villaNames = {
          ceskomalinska: 'Českomalínská',
          podoli: 'Podolí',
          marna: 'Marna'
        };
        
        await this.sendMessage(`✅ Vytvořen úkol pro vilu ${villaNames[task.villa]}:\n${task.title}`);
        
        // Refresh tasks display if on the same date
        if (taskManager.currentDate.toISOString().split('T')[0] === task.date) {
          taskManager.displayTasks();
        }
        
        // Show notification
        this.showNotification(`Nový úkol z Telegramu (AI): ${task.title}`);
      } else if (interpretation.type === 'question') {
        // Handle question
        await this.sendMessage(interpretation.response || 'Omlouvám se, ale nemám odpověď na vaši otázku.');
        
        // Show notification
        this.showNotification(`Nová otázka z Telegramu: ${message.text}`);
      } else {
        // Unknown interpretation
        await this.sendMessage('Zpráva přijata, ale nerozumím, co mám udělat. Použijte příkazy /ukol, /hotovo nebo /vila.');
      }
    } catch (error) {
      console.error('Error handling text message:', error);
      await this.sendMessage('Zpráva přijata, ale došlo k chybě při zpracování.');
    }
  }
  
  // Send message to Telegram
  async sendMessage(text) {
    try {
      // In a real implementation, this would make an API call to the backend
      // For now, we'll simulate sending a message
      console.log('Sending Telegram message:', text);
      
      // Add message to list (for UI display)
      this.messages.push({
        id: this.lastMessageId++,
        type: 'outgoing',
        text: text,
        from: {
          id: 0,
          first_name: 'Marty',
          last_name: 'Bot'
        },
        date: new Date().toISOString()
      });
      
      // Update UI
      this.updateMessageList();
      
      return true;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }
  
  // Set up UI elements
  setupUI() {
    // Create Telegram tab in settings
    this.createTelegramTab();
    
    // Add event listeners
    this.addEventListeners();
  }
  
  // Create Telegram tab in settings
  createTelegramTab() {
    // This would normally create a tab in the settings modal
    // For now, we'll just log that it's been created
    console.log('Telegram tab created in settings');
  }
  
  // Add event listeners
  addEventListeners() {
    // This would normally add event listeners to UI elements
    // For now, we'll just log that they've been added
    console.log('Telegram event listeners added');
  }
  
  // Update message list in UI
  updateMessageList() {
    // This would normally update the message list in the UI
    // For now, we'll just log the latest message
    if (this.messages.length > 0) {
      const latestMessage = this.messages[this.messages.length - 1];
      console.log('Latest Telegram message:', latestMessage);
    }
  }
  
  // Show notification
  showNotification(message) {
    const notification = document.getElementById('sync-notification');
    if (notification) {
      notification.textContent = message;
      notification.classList.remove('hidden');
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }
  }
}

// Create and export Telegram integration instance
const telegramIntegration = new TelegramIntegration();

// Initialize Telegram integration when the page loads
document.addEventListener('DOMContentLoaded', () => {
  telegramIntegration.init();
});
