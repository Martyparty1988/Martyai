// Marty AI - Test Suite

class TestSuite {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    this.currentTest = null;
  }

  // Add a test to the suite
  addTest(name, category, testFn) {
    this.tests.push({
      name,
      category,
      testFn,
      status: 'pending', // pending, running, passed, failed, skipped
      error: null
    });
  }

  // Run all tests
  async runAllTests() {
    this.resetResults();
    this.updateUI('start');
    
    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      this.currentTest = test;
      test.status = 'running';
      this.updateUI('test-start', test);
      
      try {
        await test.testFn();
        test.status = 'passed';
        this.results.passed++;
      } catch (error) {
        test.status = 'failed';
        test.error = error;
        this.results.failed++;
        console.error(`Test failed: ${test.name}`, error);
      }
      
      this.updateUI('test-end', test);
    }
    
    this.results.total = this.tests.length;
    this.currentTest = null;
    this.updateUI('end');
    
    return this.results;
  }

  // Run tests by category
  async runTestsByCategory(category) {
    this.resetResults();
    this.updateUI('start');
    
    const testsInCategory = this.tests.filter(test => test.category === category);
    
    for (let i = 0; i < this.tests.length; i++) {
      const test = this.tests[i];
      
      if (test.category === category) {
        this.currentTest = test;
        test.status = 'running';
        this.updateUI('test-start', test);
        
        try {
          await test.testFn();
          test.status = 'passed';
          this.results.passed++;
        } catch (error) {
          test.status = 'failed';
          test.error = error;
          this.results.failed++;
          console.error(`Test failed: ${test.name}`, error);
        }
        
        this.updateUI('test-end', test);
      } else {
        test.status = 'skipped';
        this.results.skipped++;
      }
    }
    
    this.results.total = this.tests.length;
    this.currentTest = null;
    this.updateUI('end');
    
    return this.results;
  }

  // Reset test results
  resetResults() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    
    this.tests.forEach(test => {
      test.status = 'pending';
      test.error = null;
    });
  }

  // Update the UI with test progress
  updateUI(event, test = null) {
    // Get UI elements
    const testResults = document.getElementById('test-results');
    const testProgress = document.getElementById('test-progress');
    const testLog = document.getElementById('test-log');
    
    if (!testResults || !testProgress || !testLog) return;
    
    switch (event) {
      case 'start':
        // Clear previous results
        testLog.innerHTML = '';
        testProgress.innerHTML = 'Spouštím testy...';
        testResults.innerHTML = '';
        break;
        
      case 'test-start':
        // Add test to log
        const testStartItem = document.createElement('div');
        testStartItem.className = 'test-log-item running';
        testStartItem.innerHTML = `
          <span class="test-status">⏳</span>
          <span class="test-name">${test.name}</span>
          <span class="test-category">${test.category}</span>
        `;
        testStartItem.id = `test-${this.tests.indexOf(test)}`;
        testLog.appendChild(testStartItem);
        
        // Update progress
        const runningCount = this.tests.filter(t => t.status === 'running').length;
        const pendingCount = this.tests.filter(t => t.status === 'pending').length;
        testProgress.innerHTML = `Spouštím test ${this.results.passed + this.results.failed + runningCount} z ${this.tests.length - this.results.skipped}...`;
        break;
        
      case 'test-end':
        // Update test in log
        const testItem = document.getElementById(`test-${this.tests.indexOf(test)}`);
        if (testItem) {
          testItem.className = `test-log-item ${test.status}`;
          
          let statusIcon = '⏳';
          if (test.status === 'passed') statusIcon = '✅';
          if (test.status === 'failed') statusIcon = '❌';
          if (test.status === 'skipped') statusIcon = '⏭️';
          
          testItem.querySelector('.test-status').textContent = statusIcon;
          
          if (test.status === 'failed' && test.error) {
            const errorDetails = document.createElement('div');
            errorDetails.className = 'test-error';
            errorDetails.textContent = test.error.message || 'Unknown error';
            testItem.appendChild(errorDetails);
          }
        }
        
        // Update progress
        const progress = ((this.results.passed + this.results.failed) / (this.tests.length - this.results.skipped)) * 100;
        testProgress.innerHTML = `Dokončeno ${this.results.passed + this.results.failed} z ${this.tests.length - this.results.skipped} testů (${Math.round(progress)}%)`;
        break;
        
      case 'end':
        // Show final results
        testResults.innerHTML = `
          <div class="test-summary">
            <div class="test-summary-item total">Celkem: ${this.results.total}</div>
            <div class="test-summary-item passed">Úspěšné: ${this.results.passed}</div>
            <div class="test-summary-item failed">Neúspěšné: ${this.results.failed}</div>
            <div class="test-summary-item skipped">Přeskočené: ${this.results.skipped}</div>
          </div>
        `;
        
        testProgress.innerHTML = this.results.failed > 0 
          ? `Testování dokončeno s chybami. ${this.results.passed} z ${this.tests.length - this.results.skipped} testů úspěšných.`
          : `Testování úspěšně dokončeno. Všech ${this.results.passed} testů prošlo.`;
        break;
    }
  }
}

// Create test suite instance
const testSuite = new TestSuite();

// Define tests
function defineTests() {
  // LocalStorage Tests
  testSuite.addTest('LocalStorage dostupnost', 'localStorage', async function() {
    assert(window.localStorageManager, 'LocalStorage Manager není dostupný');
    assert(window.localStorageManager.available, 'LocalStorage není dostupný v prohlížeči');
  });
  
  testSuite.addTest('LocalStorage ukládání a načítání', 'localStorage', async function() {
    const testKey = 'test_key';
    const testValue = { test: 'value', number: 123 };
    
    const saveResult = window.localStorageManager.setItem(testKey, testValue);
    assert(saveResult, 'Nepodařilo se uložit data do localStorage');
    
    const loadedValue = window.localStorageManager.getItem(testKey);
    assert(loadedValue, 'Nepodařilo se načíst data z localStorage');
    assert(loadedValue.test === testValue.test, 'Načtená data neodpovídají uloženým datům');
    assert(loadedValue.number === testValue.number, 'Načtená data neodpovídají uloženým datům');
    
    const removeResult = window.localStorageManager.removeItem(testKey);
    assert(removeResult, 'Nepodařilo se odstranit data z localStorage');
    
    const removedValue = window.localStorageManager.getItem(testKey);
    assert(removedValue === null, 'Data nebyla správně odstraněna z localStorage');
  });
  
  // Settings Tests
  testSuite.addTest('Nastavení dostupnost', 'settings', async function() {
    assert(window.settingsManager, 'Settings Manager není dostupný');
  });
  
  testSuite.addTest('Nastavení ukládání a načítání', 'settings', async function() {
    const testCategory = 'general';
    const testName = 'testSetting';
    const testValue = true;
    
    const setResult = window.settingsManager.setSetting(testCategory, testName, testValue);
    assert(setResult, 'Nepodařilo se uložit nastavení');
    
    const loadedValue = window.settingsManager.getSetting(testCategory, testName);
    assert(loadedValue === testValue, 'Načtené nastavení neodpovídá uloženému');
    
    // Reset to default
    window.settingsManager.setSetting(testCategory, testName, false);
  });
  
  // OpenAI Tests
  testSuite.addTest('OpenAI dostupnost', 'openai', async function() {
    assert(window.openAiManager, 'OpenAI Manager není dostupný');
  });
  
  // Telegram Bot Tests
  testSuite.addTest('Telegram Bot dostupnost', 'telegram', async function() {
    assert(window.telegramBotManager, 'Telegram Bot Manager není dostupný');
  });
  
  // Voice Dictation Tests
  testSuite.addTest('Hlasové diktování dostupnost', 'voice', async function() {
    assert(window.voiceDictationManager, 'Voice Dictation Manager není dostupný');
  });
  
  testSuite.addTest('Hlasové diktování podpora prohlížeče', 'voice', async function() {
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    assert(isSupported === window.voiceDictationManager.isSupported, 'Detekce podpory hlasového diktování není správná');
  });
  
  // Floating Calendar Tests
  testSuite.addTest('Plovoucí kalendář dostupnost', 'calendar', async function() {
    assert(window.floatingCalendarManager, 'Floating Calendar Manager není dostupný');
  });
  
  testSuite.addTest('Plovoucí kalendář vykreslení', 'calendar', async function() {
    const calendarGrid = document.getElementById('calendar-grid');
    assert(calendarGrid, 'Element kalendáře není dostupný');
    assert(calendarGrid.children.length > 0, 'Kalendář není vykreslen');
  });
  
  // UI Tests
  testSuite.addTest('UI navigace', 'ui', async function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    assert(navLinks.length > 0, 'Navigační odkazy nejsou dostupné');
    assert(tabContents.length > 0, 'Záložky obsahu nejsou dostupné');
    
    // Test clicking each nav link
    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const tabId = link.getAttribute('data-tab') + '-tab';
      const tab = document.getElementById(tabId);
      
      assert(tab, `Záložka ${tabId} nebyla nalezena`);
      
      // Click the link
      link.click();
      
      // Check if the tab is active
      assert(link.classList.contains('active'), `Odkaz ${link.getAttribute('data-tab')} není aktivní po kliknutí`);
      assert(tab.classList.contains('active'), `Záložka ${tabId} není aktivní po kliknutí na odkaz`);
    }
  });
  
  testSuite.addTest('UI notifikace', 'ui', async function() {
    const notification = document.getElementById('notification');
    assert(notification, 'Element notifikace není dostupný');
    
    // Test showing notification
    showNotification('Test notification', 'info');
    
    // Check if notification is visible
    assert(!notification.classList.contains('hidden'), 'Notifikace není viditelná po zobrazení');
    
    // Wait for notification to hide
    await new Promise(resolve => setTimeout(resolve, 3100));
    
    // Check if notification is hidden
    assert(notification.classList.contains('hidden'), 'Notifikace není skrytá po časovém limitu');
  });
  
  // Integration Tests
  testSuite.addTest('Integrace manažerů', 'integration', async function() {
    // Check if all managers are initialized and connected
    assert(window.localStorageManager, 'LocalStorage Manager není inicializován');
    assert(window.settingsManager, 'Settings Manager není inicializován');
    assert(window.openAiManager, 'OpenAI Manager není inicializován');
    assert(window.telegramBotManager, 'Telegram Bot Manager není inicializován');
    assert(window.voiceDictationManager, 'Voice Dictation Manager není inicializován');
    assert(window.floatingCalendarManager, 'Floating Calendar Manager není inicializován');
  });
}

// Helper function for assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
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

// Initialize tests when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Define all tests
  defineTests();
  
  // Set up UI
  setupTestUI();
});

// Set up test UI
function setupTestUI() {
  const runAllButton = document.getElementById('run-all-tests');
  const categoryButtons = document.querySelectorAll('.test-category-button');
  
  if (runAllButton) {
    runAllButton.addEventListener('click', async function() {
      await testSuite.runAllTests();
    });
  }
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const category = this.getAttribute('data-category');
      await testSuite.runTestsByCategory(category);
    });
  });
}
