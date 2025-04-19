// Marty Task Commander - OpenAI Integration Module

class AIManager {
  constructor() {
    this.apiKey = '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';
    this.isConnected = false;
    this.model = 'gpt-3.5-turbo';
    
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
  
  // Initialize AI manager
  async init() {
    try {
      // Test connection to OpenAI
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        console.log('OpenAI connection successful');
        this.isConnected = true;
      } else {
        console.error('OpenAI connection failed');
        this.isConnected = false;
      }
      
      return this.isConnected;
    } catch (error) {
      console.error('Error initializing AI manager:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  // Test connection to OpenAI
  async testConnection() {
    try {
      // Make a simple API call to test connection
      const response = await this.callOpenAI([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ], 0.7, 50);
      
      return !!response;
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      return false;
    }
  }
  
  // Call OpenAI API
  async callOpenAI(messages, temperature = 0.7, maxTokens = 500) {
    try {
      // In a real implementation, this would make an API call to OpenAI
      // For this implementation, we'll use a proxy endpoint or simulate responses
      
      // Prepare request data
      const requestData = {
        model: this.model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens
      };
      
      // Make API call
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData)
      });
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Return response content
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // For demonstration purposes, return simulated responses
      return this.simulateResponse(messages);
    }
  }
  
  // Simulate OpenAI response for demonstration
  simulateResponse(messages) {
    // Get the last user message
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Check if this is a message interpretation request
    if (messages[0]?.content?.includes('vacation rental management system')) {
      return this.simulateMessageInterpretation(userMessage);
    }
    
    // Check if this is a subtask generation request
    if (messages[0]?.content?.includes('generate appropriate subtasks')) {
      return this.simulateSubtaskGeneration(userMessage);
    }
    
    // Default response
    return 'I am an AI assistant for Marty Task Commander. How can I help you?';
  }
  
  // Simulate message interpretation
  simulateMessageInterpretation(message) {
    // Check for common patterns in messages
    
    // Check for villa mentions
    let villa = null;
    if (message.toLowerCase().includes('českomalínská') || message.toLowerCase().includes('ceskomalinska')) {
      villa = 'ceskomalinska';
    } else if (message.toLowerCase().includes('podolí') || message.toLowerCase().includes('podoli')) {
      villa = 'podoli';
    } else if (message.toLowerCase().includes('marna') || message.toLowerCase().includes('marně')) {
      villa = 'marna';
    }
    
    // Check if it's a question
    if (message.includes('?')) {
      return JSON.stringify({
        type: 'question',
        response: 'Omlouvám se, ale nemám dostatek informací k odpovědi na vaši otázku. Prosím, kontaktujte správce systému.'
      });
    }
    
    // Check for common task patterns
    const cleaningPattern = /(úklid|vyčistit|uklidit|vyměnit|opravit|zkontrolovat)/i;
    if (cleaningPattern.test(message)) {
      // It's likely a task
      return JSON.stringify({
        type: 'task',
        villa: villa || 'ceskomalinska', // Default to Ceskomalinska if not specified
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        priority: message.toLowerCase().includes('urgentní') ? 'high' : 'medium',
        subtasks: [
          'Zkontrolovat stav',
          'Zajistit potřebné materiály',
          'Provést úkol',
          'Ověřit dokončení'
        ]
      });
    }
    
    // Default to unknown
    return JSON.stringify({
      type: 'unknown'
    });
  }
  
  // Simulate subtask generation
  simulateSubtaskGeneration(taskTitle) {
    // Common subtasks based on task type
    if (taskTitle.toLowerCase().includes('úklid')) {
      return JSON.stringify([
        'Vysát podlahy',
        'Vytřít podlahy',
        'Utřít prach',
        'Vyčistit koupelnu',
        'Vyčistit kuchyň'
      ]);
    }
    
    if (taskTitle.toLowerCase().includes('ručník')) {
      return JSON.stringify([
        'Zkontrolovat stav ručníků',
        'Připravit nové ručníky',
        'Vyměnit ručníky v koupelně',
        'Odnést použité ručníky do prádelny'
      ]);
    }
    
    if (taskTitle.toLowerCase().includes('okno')) {
      return JSON.stringify([
        'Zkontrolovat rozsah poškození',
        'Zajistit náhradní sklo',
        'Odstranit rozbité sklo',
        'Instalovat nové sklo',
        'Uklidit okolí okna'
      ]);
    }
    
    // Default subtasks
    return JSON.stringify([
      'Zkontrolovat situaci',
      'Připravit potřebné materiály',
      'Provést úkol',
      'Ověřit dokončení úkolu'
    ]);
  }
  
  // Interpret message using OpenAI
  async interpretMessage(message) {
    try {
      const systemPrompt = `
        You are an AI assistant for a vacation rental management system called Marty Task Commander.
        Your job is to interpret messages from cleaning staff and create appropriate tasks.
        
        Available villas:
        - Českomalínská (ceskomalinska)
        - Podolí (podoli)
        - Marna (marna)
        
        Task priorities:
        - high: Urgent tasks that need immediate attention
        - medium: Regular tasks that should be done soon
        - low: Tasks that can wait
        
        Based on the message, determine:
        1. Is this a task, a question, or something else?
        2. If it's a task, which villa does it apply to?
        3. What is the task title?
        4. What is the priority?
        5. What subtasks should be created?
        
        Respond in JSON format:
        {
          "type": "task" or "question" or "unknown",
          "villa": "ceskomalinska" or "podoli" or "marna" (if applicable),
          "title": "Task title" (if applicable),
          "priority": "high" or "medium" or "low" (if applicable),
          "subtasks": ["Subtask 1", "Subtask 2", ...] (if applicable),
          "response": "Your response to a question" (if applicable)
        }
      `;
      
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]);
      
      try {
        return JSON.parse(response);
      } catch (error) {
        console.error('Error parsing AI response as JSON:', error);
        console.log('Raw response:', response);
        return null;
      }
    } catch (error) {
      console.error('Error interpreting message with OpenAI:', error);
      return null;
    }
  }
  
  // Generate subtasks for a task
  async generateSubtasks(taskTitle, villa) {
    try {
      const systemPrompt = `
        You are an AI assistant for a vacation rental management system.
        Your job is to generate appropriate subtasks for cleaning and maintenance tasks.
        
        The task is for villa: ${this.villas[villa]?.name || villa}
        
        Based on the task title, generate a list of 3-5 specific subtasks that would be needed to complete this task.
        Each subtask should be a specific, actionable item.
        
        Respond with an array of subtasks in JSON format.
      `;
      
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate subtasks for: "${taskTitle}"` }
      ]);
      
      try {
        const parsedResponse = JSON.parse(response);
        
        if (Array.isArray(parsedResponse)) {
          return parsedResponse;
        } else if (parsedResponse.subtasks && Array.isArray(parsedResponse.subtasks)) {
          return parsedResponse.subtasks;
        } else {
          console.error('Unexpected AI response format for subtasks:', parsedResponse);
          return [];
        }
      } catch (error) {
        console.error('Error parsing AI subtasks response as JSON:', error);
        console.log('Raw response:', response);
        
        // Fallback: try to extract subtasks from text response
        const lines = response.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
        if (lines.length > 0) {
          return lines.map(line => line.replace(/^[-\d.]+\s*/, '').trim());
        }
        
        return [];
      }
    } catch (error) {
      console.error('Error generating subtasks with OpenAI:', error);
      return [];
    }
  }
  
  // Generate a response to a question
  async generateResponse(question) {
    try {
      const systemPrompt = `
        You are an AI assistant for a vacation rental management system called Marty Task Commander.
        You help manage tasks for three vacation rental villas: Českomalínská, Podolí, and Marna.
        
        Provide helpful, concise responses to questions about the system or the villas.
        If you don't know the answer, politely say so.
        
        Keep responses under 100 words.
      `;
      
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error generating response with OpenAI:', error);
      return 'Omlouvám se, ale nemám dostatek informací k odpovědi na vaši otázku. Prosím, kontaktujte správce systému.';
    }
  }
  
  // Summarize reservation details
  async summarizeReservation(reservation) {
    try {
      const systemPrompt = `
        You are an AI assistant for a vacation rental management system.
        Your job is to summarize reservation details in a concise, informative way.
        
        Focus on the most important information:
        - Check-in and check-out dates
        - Number of guests
        - Special requests or notes
        - Any potential issues to be aware of
        
        Keep the summary under 100 words.
      `;
      
      const reservationDetails = `
        Villa: ${this.villas[reservation.villa]?.name || reservation.villa}
        Guest: ${reservation.guest}
        Check-in: ${new Date(reservation.startDate).toLocaleDateString('cs-CZ')}
        Check-out: ${new Date(reservation.endDate).toLocaleDateString('cs-CZ')}
        ${reservation.guestCount ? `Number of guests: ${reservation.guestCount}` : ''}
        ${reservation.description ? `Description: ${reservation.description}` : ''}
      `;
      
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Summarize this reservation: ${reservationDetails}` }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error summarizing reservation with OpenAI:', error);
      return null;
    }
  }
}

// Create and export AI manager instance
const aiManager = new AIManager();

// Initialize AI manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  aiManager.init();
});
