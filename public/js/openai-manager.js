// Marty AI - OpenAI Integration

class OpenAIManager {
  constructor() {
    this.apiKey = '';
    this.apiUrl = 'https://api.openai.com/v1';
    this.model = 'gpt-4';
    this.localStorageManager = null;
    this.settingsManager = null;
  }

  // Initialize the OpenAI manager
  init(localStorageManager, settingsManager) {
    this.localStorageManager = localStorageManager;
    this.settingsManager = settingsManager;
    
    // Load API key from settings
    this.loadApiKey();
    
    console.log('OpenAI Manager initialized');
  }
  
  // Load API key from settings
  loadApiKey() {
    if (this.settingsManager) {
      this.apiKey = this.settingsManager.getSetting('api', 'openAiApiKey') || '';
    } else if (this.localStorageManager) {
      const apiKeys = this.localStorageManager.getApiKeys() || {};
      this.apiKey = apiKeys.openAiApiKey || '';
    }
  }
  
  // Check if API key is set
  isApiKeySet() {
    return !!this.apiKey;
  }
  
  // Process a message with OpenAI
  async processMessage(message) {
    if (!this.isApiKeySet()) {
      console.error('OpenAI API key is not set');
      return 'Nemohu zpracovat zprávu, protože není nastaven OpenAI API klíč. Prosím, nastavte jej v sekci Nastavení.';
    }
    
    try {
      const response = await this.callOpenAI([
        { role: 'system', content: 'Jsi asistent Marty AI, který pomáhá s úkoly pro správu Airbnb nemovitostí. Odpovídej stručně a věcně v češtině.' },
        { role: 'user', content: message }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error processing message with OpenAI:', error);
      return 'Omlouvám se, ale došlo k chybě při zpracování vaší zprávy. Zkuste to prosím znovu později.';
    }
  }
  
  // Process a voice command with OpenAI
  async processVoiceCommand(transcript) {
    if (!this.isApiKeySet()) {
      console.error('OpenAI API key is not set');
      return {
        type: 'error',
        message: 'Nemohu zpracovat hlasový příkaz, protože není nastaven OpenAI API klíč. Prosím, nastavte jej v sekci Nastavení.'
      };
    }
    
    try {
      const systemPrompt = `
        Jsi asistent Marty AI, který pomáhá s úkoly pro správu Airbnb nemovitostí.
        Analyzuj následující hlasový příkaz a vrať strukturovanou odpověď.
        
        Pokud se jedná o úkol, vrať:
        {
          "type": "task",
          "title": "Název úkolu",
          "description": "Popis úkolu",
          "villa": "Název vily (Českomalínská, Podolí, nebo Marna)",
          "priority": "high/medium/low",
          "dueDate": "YYYY-MM-DD" (pokud je zmíněno datum)
        }
        
        Pokud se jedná o poznámku, vrať:
        {
          "type": "note",
          "title": "Název poznámky",
          "content": "Obsah poznámky",
          "villa": "Název vily (pokud je zmíněna)"
        }
        
        Pokud se jedná o dotaz nebo jiný typ zprávy, vrať:
        {
          "type": "message",
          "message": "Odpověď na dotaz"
        }
      `;
      
      const response = await this.callOpenAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ]);
      
      try {
        // Parse the response as JSON
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Error parsing OpenAI response as JSON:', parseError);
        // If parsing fails, return a generic response
        return {
          type: 'message',
          message: response
        };
      }
    } catch (error) {
      console.error('Error processing voice command with OpenAI:', error);
      return {
        type: 'error',
        message: 'Omlouvám se, ale došlo k chybě při zpracování vašeho hlasového příkazu. Zkuste to prosím znovu později.'
      };
    }
  }
  
  // Call OpenAI API
  async callOpenAI(messages) {
    if (!this.isApiKeySet()) {
      throw new Error('OpenAI API key is not set');
    }
    
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

// Create and export OpenAI manager instance
const openAiManager = new OpenAIManager();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for dependencies to be available
  const checkDependencies = () => {
    if (window.localStorageManager && window.settingsManager) {
      openAiManager.init(window.localStorageManager, window.settingsManager);
      
      // Make OpenAI manager available globally
      window.openAiManager = openAiManager;
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  
  checkDependencies();
});
