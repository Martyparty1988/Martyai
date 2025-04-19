// Marty Task Commander - Test Suite

// This script tests all major functionality of the application
// Run this script to verify that all components work correctly

// Test configuration
const TEST_CONFIG = {
  runAll: true,
  tests: {
    database: true,
    ical: true,
    reservations: true,
    tasks: true,
    telegram: true,
    ai: true,
    offline: true
  },
  logResults: true
};

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

// Main test function
async function runTests() {
  console.log('Starting Marty Task Commander test suite...');
  
  // Start time
  const startTime = Date.now();
  
  try {
    // Database tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.database) {
      await runDatabaseTests();
    }
    
    // iCal tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.ical) {
      await runICalTests();
    }
    
    // Reservation tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.reservations) {
      await runReservationTests();
    }
    
    // Task tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.tasks) {
      await runTaskTests();
    }
    
    // Telegram tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.telegram) {
      await runTelegramTests();
    }
    
    // AI tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.ai) {
      await runAITests();
    }
    
    // Offline tests
    if (TEST_CONFIG.runAll || TEST_CONFIG.tests.offline) {
      await runOfflineTests();
    }
    
    // End time
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Log summary
    console.log('\n==== Test Summary ====');
    console.log(`Total tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Skipped: ${testResults.skipped}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);
    
    // Save results to file
    if (TEST_CONFIG.logResults) {
      saveTestResults(duration);
    }
    
    return testResults;
  } catch (error) {
    console.error('Error running tests:', error);
    return null;
  }
}

// Database tests
async function runDatabaseTests() {
  console.log('\n==== Database Tests ====');
  
  // Test IndexedDB initialization
  await test('IndexedDB initialization', async () => {
    const dbInstance = await db.init();
    return !!dbInstance;
  });
  
  // Test data storage and retrieval
  await test('Data storage and retrieval', async () => {
    const testData = {
      id: 'test_' + Date.now(),
      name: 'Test Item',
      value: Math.random()
    };
    
    // Store test data
    await db.addItem('test', testData);
    
    // Retrieve test data
    const retrievedData = await db.getItem('test', testData.id);
    
    // Verify data
    return retrievedData && 
           retrievedData.id === testData.id && 
           retrievedData.name === testData.name &&
           retrievedData.value === testData.value;
  });
  
  // Test data update
  await test('Data update', async () => {
    const testData = {
      id: 'test_update_' + Date.now(),
      name: 'Test Update Item',
      value: Math.random()
    };
    
    // Store test data
    await db.addItem('test', testData);
    
    // Update test data
    testData.name = 'Updated Test Item';
    await db.updateItem('test', testData);
    
    // Retrieve updated data
    const retrievedData = await db.getItem('test', testData.id);
    
    // Verify data
    return retrievedData && 
           retrievedData.id === testData.id && 
           retrievedData.name === 'Updated Test Item';
  });
  
  // Test data deletion
  await test('Data deletion', async () => {
    const testData = {
      id: 'test_delete_' + Date.now(),
      name: 'Test Delete Item',
      value: Math.random()
    };
    
    // Store test data
    await db.addItem('test', testData);
    
    // Delete test data
    await db.deleteItem('test', testData.id);
    
    // Try to retrieve deleted data
    const retrievedData = await db.getItem('test', testData.id);
    
    // Verify data is deleted
    return !retrievedData;
  });
}

// iCal tests
async function runICalTests() {
  console.log('\n==== iCal Tests ====');
  
  // Test iCal URL validation
  await test('iCal URL validation', () => {
    const validUrl = 'https://www.airbnb.com/calendar/ical/12345.ics?s=abcdef1234567890';
    const invalidUrl = 'not-a-url';
    
    return icalManager.isValidUrl(validUrl) && !icalManager.isValidUrl(invalidUrl);
  });
  
  // Test iCal parsing
  await test('iCal parsing', async () => {
    // Sample iCal data
    const sampleIcal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:20250501T150000Z
DTEND:20250503T110000Z
DTSTAMP:20250401T080000Z
UID:12345@airbnb.com
SUMMARY:Reservation - John Doe
DESCRIPTION:Reservation for John Doe
END:VEVENT
END:VCALENDAR`;
    
    const events = await icalManager.parseIcalData(sampleIcal);
    
    return events && 
           events.length === 1 && 
           events[0].summary === 'Reservation - John Doe';
  });
  
  // Test reservation extraction
  await test('Reservation extraction', async () => {
    // Sample iCal data
    const sampleIcal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART:20250501T150000Z
DTEND:20250503T110000Z
DTSTAMP:20250401T080000Z
UID:12345@airbnb.com
SUMMARY:Reservation - John Doe
DESCRIPTION:Reservation for John Doe
END:VEVENT
END:VCALENDAR`;
    
    const events = await icalManager.parseIcalData(sampleIcal);
    const reservations = icalManager.extractReservations(events, 'ceskomalinska');
    
    return reservations && 
           reservations.length === 1 && 
           reservations[0].guest === 'John Doe' &&
           reservations[0].villa === 'ceskomalinska';
  });
}

// Reservation tests
async function runReservationTests() {
  console.log('\n==== Reservation Tests ====');
  
  // Test reservation creation
  await test('Reservation creation', async () => {
    const testReservation = {
      id: 'res_test_' + Date.now(),
      guest: 'Test Guest',
      villa: 'ceskomalinska',
      startDate: '2025-05-01',
      endDate: '2025-05-03',
      guestCount: 2,
      source: 'Airbnb',
      createdAt: new Date().toISOString()
    };
    
    // Add reservation
    await db.addReservation(testReservation);
    
    // Get reservation
    const retrievedReservation = await db.getReservation(testReservation.id);
    
    // Verify reservation
    return retrievedReservation && 
           retrievedReservation.id === testReservation.id && 
           retrievedReservation.guest === testReservation.guest &&
           retrievedReservation.villa === testReservation.villa;
  });
  
  // Test reservation update
  await test('Reservation update', async () => {
    const testReservation = {
      id: 'res_update_test_' + Date.now(),
      guest: 'Update Test Guest',
      villa: 'podoli',
      startDate: '2025-06-01',
      endDate: '2025-06-03',
      guestCount: 3,
      source: 'Airbnb',
      createdAt: new Date().toISOString()
    };
    
    // Add reservation
    await db.addReservation(testReservation);
    
    // Update reservation
    testReservation.guestCount = 4;
    await db.updateReservation(testReservation);
    
    // Get updated reservation
    const retrievedReservation = await db.getReservation(testReservation.id);
    
    // Verify reservation
    return retrievedReservation && 
           retrievedReservation.id === testReservation.id && 
           retrievedReservation.guestCount === 4;
  });
  
  // Test reservation deletion
  await test('Reservation deletion', async () => {
    const testReservation = {
      id: 'res_delete_test_' + Date.now(),
      guest: 'Delete Test Guest',
      villa: 'marna',
      startDate: '2025-07-01',
      endDate: '2025-07-03',
      guestCount: 2,
      source: 'Airbnb',
      createdAt: new Date().toISOString()
    };
    
    // Add reservation
    await db.addReservation(testReservation);
    
    // Delete reservation
    await db.deleteReservation(testReservation.id);
    
    // Try to get deleted reservation
    const retrievedReservation = await db.getReservation(testReservation.id);
    
    // Verify reservation is deleted
    return !retrievedReservation;
  });
  
  // Test reservation filtering
  await test('Reservation filtering', async () => {
    // Create test reservations
    const testReservations = [
      {
        id: 'res_filter_1_' + Date.now(),
        guest: 'Filter Test Guest 1',
        villa: 'ceskomalinska',
        startDate: '2025-08-01',
        endDate: '2025-08-03',
        guestCount: 2,
        source: 'Airbnb',
        createdAt: new Date().toISOString()
      },
      {
        id: 'res_filter_2_' + Date.now(),
        guest: 'Filter Test Guest 2',
        villa: 'podoli',
        startDate: '2025-08-05',
        endDate: '2025-08-07',
        guestCount: 3,
        source: 'Airbnb',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Add reservations
    await Promise.all(testReservations.map(res => db.addReservation(res)));
    
    // Get all reservations
    const allReservations = await db.getReservations();
    
    // Filter reservations by villa
    const ceskomalinskaReservations = allReservations.filter(res => res.villa === 'ceskomalinska');
    const podoliReservations = allReservations.filter(res => res.villa === 'podoli');
    
    // Verify filtering
    return ceskomalinskaReservations.length > 0 && podoliReservations.length > 0;
  });
}

// Task tests
async function runTaskTests() {
  console.log('\n==== Task Tests ====');
  
  // Test task creation
  await test('Task creation', async () => {
    const testTask = {
      id: 'task_test_' + Date.now(),
      title: 'Test Task',
      villa: 'ceskomalinska',
      date: '2025-05-01',
      priority: 'medium',
      description: 'This is a test task',
      subtasks: [
        {
          id: 'subtask_1_' + Date.now(),
          text: 'Subtask 1',
          completed: false
        },
        {
          id: 'subtask_2_' + Date.now(),
          text: 'Subtask 2',
          completed: false
        }
      ],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add task
    await db.addTask(testTask);
    
    // Get task
    const retrievedTask = await db.getTask(testTask.id);
    
    // Verify task
    return retrievedTask && 
           retrievedTask.id === testTask.id && 
           retrievedTask.title === testTask.title &&
           retrievedTask.subtasks.length === 2;
  });
  
  // Test task update
  await test('Task update', async () => {
    const testTask = {
      id: 'task_update_test_' + Date.now(),
      title: 'Update Test Task',
      villa: 'podoli',
      date: '2025-06-01',
      priority: 'high',
      description: 'This is an update test task',
      subtasks: [
        {
          id: 'subtask_update_1_' + Date.now(),
          text: 'Update Subtask 1',
          completed: false
        }
      ],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add task
    await db.addTask(testTask);
    
    // Update task
    testTask.title = 'Updated Task';
    testTask.subtasks[0].completed = true;
    await db.updateTask(testTask);
    
    // Get updated task
    const retrievedTask = await db.getTask(testTask.id);
    
    // Verify task
    return retrievedTask && 
           retrievedTask.id === testTask.id && 
           retrievedTask.title === 'Updated Task' &&
           retrievedTask.subtasks[0].completed === true;
  });
  
  // Test task deletion
  await test('Task deletion', async () => {
    const testTask = {
      id: 'task_delete_test_' + Date.now(),
      title: 'Delete Test Task',
      villa: 'marna',
      date: '2025-07-01',
      priority: 'low',
      description: 'This is a delete test task',
      subtasks: [],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add task
    await db.addTask(testTask);
    
    // Delete task
    await db.deleteTask(testTask.id);
    
    // Try to get deleted task
    const retrievedTask = await db.getTask(testTask.id);
    
    // Verify task is deleted
    return !retrievedTask;
  });
  
  // Test task filtering
  await test('Task filtering', async () => {
    // Create test tasks
    const testTasks = [
      {
        id: 'task_filter_1_' + Date.now(),
        title: 'Filter Test Task 1',
        villa: 'ceskomalinska',
        date: '2025-08-01',
        priority: 'medium',
        description: 'This is a filter test task 1',
        subtasks: [],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task_filter_2_' + Date.now(),
        title: 'Filter Test Task 2',
        villa: 'podoli',
        date: '2025-08-01',
        priority: 'high',
        description: 'This is a filter test task 2',
        subtasks: [],
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Add tasks
    await Promise.all(testTasks.map(task => db.addTask(task)));
    
    // Get all tasks
    const allTasks = await db.getTasks();
    
    // Filter tasks by villa and completion status
    const ceskomalinskaActiveTasks = allTasks.filter(task => 
      task.villa === 'ceskomalinska' && !task.completed);
    const completedTasks = allTasks.filter(task => task.completed);
    
    // Verify filtering
    return ceskomalinskaActiveTasks.length > 0 && completedTasks.length > 0;
  });
  
  // Test task creation from reservation
  await test('Task creation from reservation', async () => {
    // Create test reservation
    const testReservation = {
      id: 'res_task_test_' + Date.now(),
      guest: 'Task Test Guest',
      villa: 'marna',
      startDate: '2025-09-01',
      endDate: '2025-09-03',
      guestCount: 2,
      source: 'Airbnb',
      createdAt: new Date().toISOString()
    };
    
    // Add reservation
    await db.addReservation(testReservation);
    
    // Create tasks from reservation
    const tasks = await taskManager.createTasksFromReservations();
    
    // Get tasks for this reservation
    const reservationTasks = await db.getTasks();
    const matchingTasks = reservationTasks.filter(task => 
      task.villa === testReservation.villa && 
      (task.date === testReservation.startDate || 
       task.date === new Date(new Date(testReservation.endDate).setDate(new Date(testReservation.endDate).getDate() - 1)).toISOString().split('T')[0]));
    
    // Verify tasks were created
    return matchingTasks.length > 0;
  });
}

// Telegram tests
async function runTelegramTests() {
  console.log('\n==== Telegram Tests ====');
  
  // Test Telegram message parsing
  await test('Telegram message parsing', () => {
    const testMessages = [
      {
        text: '/ukol Českomalínská Vyměnit ručníky',
        expected: {
          command: 'ukol',
          villa: 'ceskomalinska',
          content: 'Vyměnit ručníky'
        }
      },
      {
        text: '/hotovo 123456',
        expected: {
          command: 'hotovo',
          taskId: '123456'
        }
      },
      {
        text: '/vila podoli',
        expected: {
          command: 'vila',
          villa: 'podoli'
        }
      }
    ];
    
    // Test each message
    return testMessages.every(msg => {
      const parsed = telegramBot.parseMessage(msg.text);
      
      if (!parsed) return false;
      
      return Object.keys(msg.expected).every(key => 
        parsed[key] === msg.expected[key]);
    });
  });
  
  // Test Telegram command handling
  await test('Telegram command handling', () => {
    // Mock Telegram bot
    const mockBot = {
      commands: {},
      onText: function(regex, callback) {
        const command = regex.toString().match(/\/(\w+)/)[1];
        this.commands[command] = callback;
      },
      sendMessage: function(chatId, text) {
        return Promise.resolve({ message_id: 123 });
      }
    };
    
    // Register commands
    telegramBot.registerCommands(mockBot);
    
    // Verify commands were registered
    return mockBot.commands.ukol && 
           mockBot.commands.hotovo && 
           mockBot.commands.vila;
  });
  
  // Test Telegram message to task conversion
  await test('Telegram message to task conversion', async () => {
    const message = {
      chat: { id: 12345 },
      from: { id: 67890, first_name: 'Test', last_name: 'User' },
      text: 'Rozbité okno v Marně',
      date: Math.floor(Date.now() / 1000)
    };
    
    // Convert message to task
    const task = await telegramBot.createTaskFromMessage(message);
    
    // Verify task
    return task && 
           task.title.includes('Rozbité okno') && 
           task.villa === 'marna';
  });
}

// AI tests
async function runAITests() {
  console.log('\n==== AI Tests ====');
  
  // Test AI message interpretation
  await test('AI message interpretation', async () => {
    const testMessages = [
      'Vyměnit ručníky v Českomalínské',
      'Neteče voda v Podolí',
      'Rozbité okno v Marně'
    ];
    
    // Test each message
    const results = await Promise.all(testMessages.map(msg => 
      aiManager.interpretMessage(msg)));
    
    // Verify results
    return results.every(result => 
      result && 
      result.type === 'task' && 
      result.title && 
      result.villa);
  });
  
  // Test AI subtask generation
  await test('AI subtask generation', async () => {
    const testTasks = [
      { title: 'Úklid koupelny', villa: 'ceskomalinska' },
      { title: 'Oprava rozbitého okna', villa: 'podoli' },
      { title: 'Výměna ručníků', villa: 'marna' }
    ];
    
    // Test each task
    const results = await Promise.all(testTasks.map(task => 
      aiManager.generateSubtasks(task.title, task.villa)));
    
    // Verify results
    return results.every(result => 
      Array.isArray(result) && 
      result.length > 0);
  });
  
  // Test AI response generation
  await test('AI response generation', async () => {
    const testQuestions = [
      'Kdy má být hotový úklid?',
      'Jak často se mění ručníky?'
    ];
    
    // Test each question
    const results = await Promise.all(testQuestions.map(question => 
      aiManager.generateResponse(question)));
    
    // Verify results
    return results.every(result => 
      typeof result === 'string' && 
      result.length > 0);
  });
}

// Offline tests
async function runOfflineTests() {
  console.log('\n==== Offline Tests ====');
  
  // Test offline detection
  await test('Offline detection', () => {
    // Mock navigator.onLine
    const originalOnLine = navigator.onLine;
    navigator.onLine = false;
    
    // Check if offline manager detects offline status
    const isOffline = !offlineManager.isOnline;
    
    // Restore navigator.onLine
    navigator.onLine = originalOnLine;
    
    return isOffline;
  });
  
  // Test pending operations
  await test('Pending operations', () => {
    // Add pending operation
    const operationCount = offlineManager.addPendingOperation('add-task', {
      id: 'offline_task_' + Date.now(),
      title: 'Offline Task',
      villa: 'ceskomalinska'
    });
    
    return operationCount > 0;
  });
  
  // Test service worker registration
  await test('Service worker registration', async () => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    } catch (error) {
      console.error('Error checking service worker registration:', error);
      return false;
    }
  });
}

// Test helper function
async function test(name, testFn) {
  try {
    console.log(`Running test: ${name}`);
    testResults.total++;
    
    const result = await testFn();
    
    if (result) {
      console.log(`✅ PASS: ${name}`);
      testResults.passed++;
      testResults.results.push({
        name,
        result: 'pass'
      });
    } else {
      console.log(`❌ FAIL: ${name}`);
      testResults.failed++;
      testResults.results.push({
        name,
        result: 'fail'
      });
    }
    
    return result;
  } catch (error) {
    console.error(`❌ ERROR: ${name}`, error);
    testResults.failed++;
    testResults.results.push({
      name,
      result: 'error',
      error: error.message
    });
    return false;
  }
}

// Save test results to file
function saveTestResults(duration) {
  const results = {
    timestamp: new Date().toISOString(),
    duration: duration,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      skipped: testResults.skipped
    },
    tests: testResults.results
  };
  
  // Create results string
  const resultsStr = JSON.stringify(results, null, 2);
  
  // Log results
  console.log('\nTest results saved.');
  
  // In a browser environment, we would save to IndexedDB or localStorage
  // For this test script, we'll just log the results
  return resultsStr;
}

// Run tests when script is loaded
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('load', () => {
    // Only run tests if explicitly requested
    if (window.location.search.includes('runTests=true')) {
      runTests();
    }
  });
} else {
  // Node.js environment
  runTests();
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = {
    runTests,
    testResults
  };
}
