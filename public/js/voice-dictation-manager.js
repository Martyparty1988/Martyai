// Marty AI - Voice Dictation with OpenAI Integration

class VoiceDictationManager {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.transcript = '';
    this.openAiManager = null;
    this.localStorageManager = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Initialize the voice dictation manager
  init(openAiManager, localStorageManager) {
    this.openAiManager = openAiManager;
    this.localStorageManager = localStorageManager;
    
    if (this.isSupported) {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'cs-CZ'; // Czech language
      
      // Set up event handlers
      this.recognition.onstart = this.handleStart.bind(this);
      this.recognition.onresult = this.handleResult.bind(this);
      this.recognition.onerror = this.handleError.bind(this);
      this.recognition.onend = this.handleEnd.bind(this);
      
      console.log('Voice Dictation Manager initialized with speech recognition');
    } else {
      console.warn('Speech recognition is not supported in this browser');
    }
    
    // Initialize UI elements
    this.initUI();
  }
  
  // Initialize UI elements
  initUI() {
    // Get UI elements
    const voiceBtn = document.getElementById('voice-btn');
    const voicePopup = document.getElementById('voice-popup');
    const voicePopupClose = document.getElementById('voice-popup-close');
    const voiceTranscript = document.getElementById('voice-transcript');
    const voiceCancel = document.getElementById('voice-cancel');
    const voiceSave = document.getElementById('voice-save');
    
    if (!this.isSupported) {
      // Disable voice button if not supported
      if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Hlasové diktování není v tomto prohlížeči podporováno';
        voiceBtn.classList.add('disabled');
      }
      return;
    }
    
    // Add event listeners
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (this.isRecording) {
          this.stopRecording();
        } else {
          this.startRecording();
          if (voicePopup) voicePopup.classList.add('show');
        }
      });
    }
    
    if (voicePopupClose) {
      voicePopupClose.addEventListener('click', () => {
        this.stopRecording();
        if (voicePopup) voicePopup.classList.remove('show');
      });
    }
    
    if (voiceCancel) {
      voiceCancel.addEventListener('click', () => {
        this.stopRecording();
        this.transcript = '';
        if (voiceTranscript) voiceTranscript.textContent = 'Klikněte na mikrofon a začněte mluvit...';
        if (voicePopup) voicePopup.classList.remove('show');
      });
    }
    
    if (voiceSave) {
      voiceSave.addEventListener('click', () => {
        this.processTranscriptWithOpenAI();
        this.stopRecording();
        if (voicePopup) voicePopup.classList.remove('show');
      });
    }
  }
  
  // Start recording
  startRecording() {
    if (!this.isSupported || this.isRecording) return;
    
    try {
      this.recognition.start();
      this.isRecording = true;
      
      // Update UI
      const voiceBtn = document.getElementById('voice-btn');
      const voiceTranscript = document.getElementById('voice-transcript');
      
      if (voiceBtn) voiceBtn.classList.add('recording');
      if (voiceTranscript) voiceTranscript.textContent = 'Poslouchám...';
      
      this.showNotification('Hlasové diktování zahájeno', 'info');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      this.showNotification('Chyba při zahájení hlasového diktování', 'error');
    }
  }
  
  // Stop recording
  stopRecording() {
    if (!this.isSupported || !this.isRecording) return;
    
    try {
      this.recognition.stop();
      this.isRecording = false;
      
      // Update UI
      const voiceBtn = document.getElementById('voice-btn');
      if (voiceBtn) voiceBtn.classList.remove('recording');
      
      this.showNotification('Hlasové diktování ukončeno', 'info');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
  
  // Handle start event
  handleStart() {
    console.log('Speech recognition started');
    this.isRecording = true;
  }
  
  // Handle result event
  handleResult(event) {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update transcript
    if (finalTranscript) {
      this.transcript += finalTranscript + ' ';
    }
    
    // Update UI
    const voiceTranscript = document.getElementById('voice-transcript');
    if (voiceTranscript) {
      voiceTranscript.textContent = this.transcript + interimTranscript;
    }
  }
  
  // Handle error event
  handleError(event) {
    console.error('Speech recognition error:', event.error);
    
    let errorMessage = 'Chyba při hlasovém diktování';
    
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'Nebyla detekována žádná řeč';
        break;
      case 'audio-capture':
        errorMessage = 'Nelze zachytit zvuk, zkontrolujte mikrofon';
        break;
      case 'not-allowed':
        errorMessage = 'Přístup k mikrofonu byl zamítnut';
        break;
      case 'network':
        errorMessage = 'Síťová chyba při hlasovém diktování';
        break;
      case 'aborted':
        errorMessage = 'Hlasové diktování bylo přerušeno';
        break;
    }
    
    this.showNotification(errorMessage, 'error');
    this.stopRecording();
  }
  
  // Handle end event
  handleEnd() {
    console.log('Speech recognition ended');
    this.isRecording = false;
    
    // Update UI
    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn) voiceBtn.classList.remove('recording');
  }
  
  // Process transcript with OpenAI
  async processTranscriptWithOpenAI() {
    if (!this.transcript.trim()) {
      this.showNotification('Žádný text k zpracování', 'error');
      return;
    }
    
    if (!this.openAiManager) {
      console.error('OpenAI Manager is not initialized');
      this.showNotification('OpenAI Manager není inicializován', 'error');
      return;
    }
    
    try {
      this.showNotification('Zpracovávám text pomocí OpenAI...', 'info');
      
      // Process transcript with OpenAI
      const result = await this.openAiManager.processVoiceCommand(this.transcript);
      
      // Create task or note based on result
      if (result.type === 'task') {
        this.createTask(result);
      } else if (result.type === 'note') {
        this.createNote(result);
      } else {
        this.showNotification(result.message || 'Text byl zpracován', 'success');
      }
      
      // Clear transcript
      this.transcript = '';
    } catch (error) {
      console.error('Error processing transcript with OpenAI:', error);
      this.showNotification('Chyba při zpracování textu pomocí OpenAI', 'error');
    }
  }
  
  // Create a task from OpenAI result
  createTask(result) {
    // In a real app, this would create a task in the task manager
    console.log('Creating task:', result);
    
    // For demo purposes, just show a notification
    this.showNotification(`Úkol vytvořen: ${result.title}`, 'success');
    
    // Dispatch custom event for task creation
    const event = new CustomEvent('voice-task-created', { detail: result });
    document.dispatchEvent(event);
  }
  
  // Create a note from OpenAI result
  createNote(result) {
    // In a real app, this would create a note
    console.log('Creating note:', result);
    
    // For demo purposes, just show a notification
    this.showNotification(`Poznámka vytvořena: ${result.title}`, 'success');
    
    // Dispatch custom event for note creation
    const event = new CustomEvent('voice-note-created', { detail: result });
    document.dispatchEvent(event);
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

// Create and export voice dictation manager instance
const voiceDictationManager = new VoiceDictationManager();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for OpenAI manager and localStorage manager to be available
  const checkDependencies = () => {
    if (window.openAiManager && window.localStorageManager) {
      voiceDictationManager.init(window.openAiManager, window.localStorageManager);
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  
  checkDependencies();
});
