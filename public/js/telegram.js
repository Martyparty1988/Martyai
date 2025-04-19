// Marty Task Commander - Telegram Bot Integration Module

class TelegramBotManager {
  constructor() {
    this.token = '7590306430:AAFjR5GNzdozq1HRGv_fw24mN_dRvb_NS_I';
    this.chatId = 6592431657;
    this.apiUrl = `https://api.telegram.org/bot${this.token}`;
    this.lastUpdateId = 0;
    this.isPolling = false;
    this.pollingInterval = null;
    this.messageHandlers = [];
    
    // Register message handlers
    this.registerMessageHandlers();
  }
  
  // Register message handlers
  registerMessageHandlers() {
    // Command handlers
    this.addMessageHandler(
      message => message.text && message.text.startsWith('/ukol'),
      this.handleTaskCommand.bind(this)
    );
    
    this.addMessageHandler(
      message => message.text && message.text.startsWith('/hotovo'),
      this.handleCompletedCommand.bind(this)
    );
    
    this.addMessageHandler(
      message => message.text && message.text.startsWith('/vila'),
      this.handleVillaCommand.bind(this)
    );
    
    // General message handler (for AI interpretation)
    this.addMessageHandler(
      message => message.text && !message.text.startsWith('/'),
      this.handleGeneralMessage.bind(this)
    );
  }
  
  // Add message handler
  addMessageHandler(condition, handler) {
    this.messageHandlers.push({ condition, handler });
  }
  
  // Start polling for updates
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(() => this.getUpdates(), 5000);
    console.log('Telegram bot polling started');
  }
  
  // Stop polling for updates
  stopPolling() {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    clearInterval(this.pollingInterval);
    console.log('Telegram bot polling stopped');
  }
  
  // Get updates from Telegram API
  async getUpdates() {
    try {
      const response = await fetch(`${this.apiUrl}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=30`);
      const data = await response.json();
      
      if (data.ok && data.result.length > 0) {
        // Process updates
        for (const update of data.result) {
          await this.processUpdate(update);
          this.lastUpdateId = update.update_id;
        }
      }
    } catch (error) {
      console.error('Error getting updates from Telegram:', error);
    }
  }
  
  // Process update
  async processUpdate(update) {
    // Check if update contains a message
    if (!update.message) return;
    
    const message = update.message;
    
    // Check if message is from the specified chat
    if (message.chat.id !== this.chatId) return;
    
    console.log('Received message:', message);
    
    // Process message with handlers
    for (const { condition, handler } of this.messageHandlers) {
      if (condition(message)) {
        await handler(message);
        break;
      }
    }
  }
  
  // Send message to Telegram
  async sendMessage(text) {
    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
      }
      
      return data.result;
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      throw error;
    }
  }
  
  // Handle /ukol command
  async handleTaskCommand(message) {
    try {
      // Parse command: /ukol [villa] [task]
      // Example: /ukol podoli Vyměnit ručníky
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
        
        let response = '📋 <b>Dnešní úkoly podle vil:</b>\n\n';
        
        for (const [villaKey, villaName] of Object.entries(villaNames)) {
          const villaTasks = tasks.filter(t => t.villa === villaKey);
          
          response += `<b>${villaName}:</b>\n`;
          
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
      let response = `📋 <b>Úkoly pro vilu ${villaNames[villaKey]}:</b>\n\n`;
      
      // Today's tasks
      response += '<b>Dnešní úkoly:</b>\n';
      if (todayTasks.length === 0) {
        response += '- Žádné úkoly\n\n';
      } else {
        todayTasks.forEach(task => {
          response += `- ${task.completed ? '✅' : '⬜'} ${task.title}\n`;
        });
        response += '\n';
      }
      
      // Upcoming tasks
      response += '<b>Nadcházející úkoly:</b>\n';
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
    } catch (error) {
      console.error('Error handling villa command:', error);
      await this.sendMessage('❌ Chyba při získávání informací o vile. Zkuste to prosím znovu.');
    }
  }
  
  // Handle general message (for AI interpretation)
  async handleGeneralMessage(message) {
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
      } else if (interpretation.type === 'question') {
        // Handle question
        await this.sendMessage(interpretation.response || 'Omlouvám se, ale nemám odpověď na vaši otázku.');
      } else {
        // Unknown interpretation
        await this.sendMessage('Zpráva přijata, ale nerozumím, co mám udělat. Použijte příkazy /ukol, /hotovo nebo /vila.');
      }
    } catch (error) {
      console.error('Error handling general message:', error);
      await this.sendMessage('Zpráva přijata, ale došlo k chybě při zpracování.');
    }
  }
  
  // Initialize Telegram bot
  async init() {
    try {
      // Send startup message
      await this.sendMessage('🤖 Marty Task Commander je online a připraven!');
      
      // Start polling for updates
      this.startPolling();
    } catch (error) {
      console.error('Error initializing Telegram bot:', error);
    }
  }
}

// Create and export Telegram bot manager instance
const telegramBotManager = new TelegramBotManager();
