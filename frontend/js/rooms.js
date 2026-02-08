// Rooms functionality - FIXED VERSION

let allRooms = [];

// Show Rooms/Schedule Page
async function showRooms() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="rooms-section">
      <h2>📅 Available Rooms</h2>
      
      <div class="filters">
        <div class="filter-group">
          <label>Room Type:</label>
          <select id="filter-type" onchange="filterRooms()">
            <option value="">All Types</option>
            <option value="normal">Normal</option>
            <option value="lab">Lab</option>
            <option value="lecture_hall">Lecture Hall</option>
            <option value="conference">Conference</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Search Room:</label>
          <input type="text" id="search-room" placeholder="Room number..." onkeyup="filterRooms()">
        </div>

        <button class="btn btn-primary" onclick="showBookingForm()">➕ New Booking</button>
      </div>

      <div id="rooms-list" class="rooms-grid">
        <p>Loading rooms...</p>
      </div>
    </div>
  `;

  await loadRooms();
}

// Load Rooms from API
async function loadRooms() {
  const roomsList = document.getElementById('rooms-list');
  
  try {
    allRooms = await API.rooms.getAll();
    
    if (allRooms.length === 0) {
      roomsList.innerHTML = `
        <div class="info-box">
          <p>⚠️ No rooms found in database!</p>
          <p>Run this command in MongoDB to add test rooms:</p>
          <code style="display: block; margin: 10px 0; padding: 10px; background: #000; color: #0f0;">
mongosh<br>
use uniroomdb<br>
db.rooms.insertMany([<br>
  { roomNumber: "101", capacity: 30, type: "normal", features: ["Projector"] },<br>
  { roomNumber: "102", capacity: 25, type: "lab", features: ["Computers"] }<br>
])
          </code>
        </div>
      `;
      return;
    }
    
    displayRooms(allRooms);
  } catch (error) {
    roomsList.innerHTML = `<p class="error">Error loading rooms: ${error.message}</p>`;
  }
}

// Display Rooms
function displayRooms(rooms) {
  const roomsList = document.getElementById('rooms-list');
  
  if (rooms.length === 0) {
    roomsList.innerHTML = '<p>No rooms match your filters.</p>';
    return;
  }

  const roomsHTML = rooms.map(room => `
    <div class="room-card">
      <h3>🏛️ Room ${room.roomNumber}</h3>
      <p><strong>Type:</strong> ${room.type}</p>
      <p><strong>Capacity:</strong> ${room.capacity} people</p>
      <p><strong>Features:</strong> ${room.features.join(', ') || 'None'}</p>
      <button class="btn btn-primary" onclick="quickBook('${room._id}', '${room.roomNumber}')">
        Book This Room
      </button>
    </div>
  `).join('');

  roomsList.innerHTML = roomsHTML;
}

// Filter Rooms
function filterRooms() {
  const typeFilter = document.getElementById('filter-type').value;
  const searchText = document.getElementById('search-room').value.toLowerCase();

  let filtered = allRooms;

  if (typeFilter) {
    filtered = filtered.filter(room => room.type === typeFilter);
  }

  if (searchText) {
    filtered = filtered.filter(room => 
      room.roomNumber.toLowerCase().includes(searchText)
    );
  }

  displayRooms(filtered);
}

// Quick Book - Pre-fill room
function quickBook(roomId, roomNumber) {
  showBookingForm(roomId, roomNumber);
}

// Show Booking Form - FIXED!
function showBookingForm(preselectedRoomId = null, preselectedRoomNumber = '') {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="booking-form-container">
      <h2>📝 Create New Booking</h2>
      
      <form id="booking-form" onsubmit="handleCreateBooking(event)">
        <div class="form-group">
          <label>Select Room:</label>
          <select id="booking-room-select" required>
            <option value="">-- Choose a room --</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date:</label>
            <input type="date" id="booking-date" required>
          </div>

          <div class="form-group">
            <label>Start Time:</label>
            <input type="time" id="booking-start" required value="09:00">
          </div>

          <div class="form-group">
            <label>End Time:</label>
            <input type="time" id="booking-end" required value="11:00">
          </div>
        </div>

        <div class="user-info-box">
          ℹ️ <strong>Remember:</strong> Students can book max 2 hours. Teachers can override student bookings.
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">Create Booking</button>
          <button type="button" class="btn btn-secondary" onclick="showRooms()">Cancel</button>
        </div>

        <div id="booking-error" class="error-message"></div>
        <div id="booking-success" class="success-message"></div>
      </form>
    </div>
  `;

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').value = today;

  // Load rooms into dropdown
  loadRoomsDropdown(preselectedRoomId);
}

// Load rooms into dropdown
async function loadRoomsDropdown(preselectedId = null) {
  const select = document.getElementById('booking-room-select');
  
  try {
    const rooms = await API.rooms.getAll();
    
    rooms.forEach(room => {
      const option = document.createElement('option');
      option.value = room._id;
      option.textContent = `Room ${room.roomNumber} (${room.type}, ${room.capacity} people)`;
      if (room._id === preselectedId) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  } catch (error) {
    select.innerHTML = '<option value="">Error loading rooms</option>';
  }
}

// Handle Create Booking - FIXED!
async function handleCreateBooking(event) {
  event.preventDefault();

  const roomId = document.getElementById('booking-room-select').value;
  const date = document.getElementById('booking-date').value;
  const startTime = document.getElementById('booking-start').value;
  const endTime = document.getElementById('booking-end').value;

  const errorDiv = document.getElementById('booking-error');
  const successDiv = document.getElementById('booking-success');

  // Clear previous messages
  errorDiv.textContent = '';
  successDiv.textContent = '';

  // Validate room selection
  if (!roomId) {
    errorDiv.textContent = 'Please select a room!';
    return;
  }

  // Combine date and time
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  // Validate times
  if (endDateTime <= startDateTime) {
    errorDiv.textContent = 'End time must be after start time!';
    return;
  }

  // Check 2-hour limit for students
  const user = getCurrentUser();
  if (user.role === 'student') {
    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    if (durationHours > 2) {
      errorDiv.textContent = '⚠️ Students can only book for 2 hours maximum!';
      return;
    }
  }

  try {
    await API.bookings.create(roomId, startDateTime.toISOString(), endDateTime.toISOString());
    
    successDiv.textContent = '✅ Booking created successfully!';
    
    // Redirect after 1.5 seconds
    setTimeout(() => {
      showMyBookings();
    }, 1500);
  } catch (error) {
    errorDiv.textContent = `❌ ${error.message}`;
  }
}