// TODO: Replaced direct ICS fetch with server API '/api/ical/sync'
// Marty Task Commander - iCal Parser Module

class ICalParser {
  constructor() {
    this.villas = {
      ceskomalinska: {
        name: 'Českomalínská',
        url: 'https://www.airbnb.cz/calendar/ical/660104733582708563.ics?s=690e5705d584bdea19c3be8e2144e4fb',
        color: '#ffb6c1' // Pastel pink
      },
      podoli: {
        name: 'Podolí',
        url: 'https://www.airbnb.cz/calendar/ical/36773922.ics?s=3530bcd2c1602623eff2c2876a9ec341',
        color: '#afeeee' // Pastel turquoise
      },
      marna: {
        name: 'Marna',
        url: 'https://www.airbnb.cz/calendar/ical/1013828545896648855.ics?s=79f0dd2f2e7ee95659dd831d4213475e',
        color: '#98fb98' // Pastel green
      }
    };
  }

  // Fetch iCal data from URL
  async fetchICalData(url) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'Content-Type': 'text/calendar',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      return data;
    } catch (error) {
      console.error('Error fetching iCal data:', error);
      throw error;
    }
  }

  // Parse iCal data into reservation objects
  parseICalData(data, villa) {
    // Basic iCal parsing
    const events = [];
    const lines = data.split('\n');
    
    let currentEvent = null;
    let inEvent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Start of an event
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {
          villa: villa,
          id: 'reservation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
        inEvent = true;
        continue;
      }
      
      // End of an event
      if (line === 'END:VEVENT') {
        if (currentEvent && currentEvent.startDate && currentEvent.endDate) {
          events.push(currentEvent);
        }
        inEvent = false;
        continue;
      }
      
      // Skip if not in an event
      if (!inEvent) continue;
      
      // Parse event properties
      if (line.startsWith('DTSTART')) {
        const dateValue = this.extractDateValue(line);
        if (dateValue) {
          currentEvent.startDate = dateValue;
        }
      } else if (line.startsWith('DTEND')) {
        const dateValue = this.extractDateValue(line);
        if (dateValue) {
          currentEvent.endDate = dateValue;
        }
      } else if (line.startsWith('SUMMARY')) {
        const summary = line.substring(line.indexOf(':') + 1);
        currentEvent.summary = summary;
        
        // Try to extract guest name from summary
        const guestMatch = summary.match(/Reservation for (.+)/i);
        if (guestMatch && guestMatch[1]) {
          currentEvent.guest = guestMatch[1];
        } else {
          currentEvent.guest = 'Guest';
        }
      } else if (line.startsWith('DESCRIPTION')) {
        let description = line.substring(line.indexOf(':') + 1);
        
        // Handle multi-line descriptions
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith(' ')) {
          description += lines[j].trim();
          j++;
        }
        
        currentEvent.description = description;
        
        // Try to extract additional information from description
        const guestsMatch = description.match(/Number of guests: (\d+)/i);
        if (guestsMatch && guestsMatch[1]) {
          currentEvent.guestCount = parseInt(guestsMatch[1], 10);
        }
      } else if (line.startsWith('UID')) {
        const uid = line.substring(line.indexOf(':') + 1);
        currentEvent.uid = uid;
      }
    }
    
    return events;
  }
  
  // Extract date value from iCal date line
  extractDateValue(line) {
    const dateStr = line.split(':')[1];
    if (!dateStr) return null;
    
    // Handle different date formats
    let date;
    if (dateStr.includes('T')) {
      // Format: YYYYMMDDTHHMMSSZ
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const hour = dateStr.substring(9, 11);
      const minute = dateStr.substring(11, 13);
      
      date = new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-based
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10)
      ));
    } else {
      // Format: YYYYMMDD
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      
      date = new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-based
        parseInt(day, 10)
      ));
    }
    
    return date.toISOString();
  }
  
  // Fetch and parse all villas' iCal data
  async fetchAllVillasData() {
    const allReservations = [];
    
    for (const [villaKey, villaData] of Object.entries(this.villas)) {
      try {
        console.log(`Fetching iCal data for ${villaData.name}...`);
        const icalData = await this.fetchICalData(villaData.url);
        const reservations = this.parseICalData(icalData, villaKey);
        
        // Add villa-specific information
        reservations.forEach(reservation => {
          reservation.villaName = villaData.name;
          reservation.villaColor = villaData.color;
        });
        
        allReservations.push(...reservations);
        console.log(`Fetched ${reservations.length} reservations for ${villaData.name}`);
      } catch (error) {
        console.error(`Error fetching data for ${villaData.name}:`, error);
      }
    }
    
    return allReservations;
  }
  
  // Save reservations to database
  async saveReservationsToDb(reservations) {
    for (const reservation of reservations) {
      try {
        await db.addReservation(reservation);
      } catch (error) {
        console.error('Error saving reservation to database:', error);
      }
    }
    
    console.log(`Saved ${reservations.length} reservations to database`);
  }
  
  // Main function to sync reservations
  async syncReservations() {
    try {
      // Show sync notification
      const syncNotification = document.getElementById('sync-notification');
      if (syncNotification) {
        syncNotification.textContent = 'Synchronizace rezervací...';
        syncNotification.classList.remove('hidden');
      }
      
      // Fetch and parse all villas' data
      const reservations = await this.fetchAllVillasData();
      
      // Save to database
      await this.saveReservationsToDb(reservations);
      
      // Hide sync notification
      if (syncNotification) {
        syncNotification.classList.add('hidden');
      }
      
      return reservations;
    } catch (error) {
      console.error('Error syncing reservations:', error);
      
      // Hide sync notification
      const syncNotification = document.getElementById('sync-notification');
      if (syncNotification) {
        syncNotification.classList.add('hidden');
      }
      
      throw error;
    }
  }
}

// Create and export iCal parser instance
const icalParser = new ICalParser();
