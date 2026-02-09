function showAdminPanel() {
  const user = getCurrentUser();
  
  if (user.role !== 'admin') {
    alert('Access denied. Admin only.');
    return;
  }

  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="admin-panel">
      <h2>Admin Panel</h2>
      
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="showUsersManagement()">👥 Users</button>
        <button class="admin-tab" onclick="showRoomsManagement()">🏛️ Rooms</button>
        <button class="admin-tab" onclick="showScheduleManagement()">📅 Base Schedule</button>
      </div>

      <div id="admin-content">
        <!-- Content will be loaded here -->
      </div>
    </div>
  `;

  showUsersManagement();
}


function showUsersManagement() {
  updateAdminTabs(0);
  
  const adminContent = document.getElementById('admin-content');
  
  adminContent.innerHTML = `
    <div class="management-section">
      <h3>User Management</h3>
      <p class="info">User management API coming soon...</p>
      <p>Features:</p>
      <ul>
        <li>View all users</li>
        <li>Change user roles</li>
        <li>Delete users</li>
      </ul>
    </div>
  `;
}


function showRoomsManagement() {
  updateAdminTabs(1);
  
  const adminContent = document.getElementById('admin-content');
  
  adminContent.innerHTML = `
    <div class="management-section">
      <h3>Room Management</h3>
      
      <button class="btn btn-primary" onclick="showAddRoomForm()">➕ Add New Room</button>
      
      <div id="rooms-management-list">
        <p class="info">Rooms API needed - add rooms endpoint to backend first!</p>
      </div>
    </div>
  `;
}


function showAddRoomForm() {
  const list = document.getElementById('rooms-management-list');
  
  list.innerHTML = `
    <div class="form-container">
      <h4>Add New Room</h4>
      <form id="add-room-form" onsubmit="handleAddRoom(event)">
        <div class="form-group">
          <label>Room Number:</label>
          <input type="text" id="room-number" required placeholder="e.g., 101A">
        </div>

        <div class="form-group">
          <label>Capacity:</label>
          <input type="number" id="room-capacity" required min="1" placeholder="e.g., 30">
        </div>

        <div class="form-group">
          <label>Type:</label>
          <select id="room-type" required>
            <option value="normal">Normal</option>
            <option value="lab">Lab</option>
            <option value="lecture_hall">Lecture Hall</option>
            <option value="conference">Conference</option>
          </select>
        </div>

        <div class="form-group">
          <label>Features (comma-separated):</label>
          <input type="text" id="room-features" placeholder="e.g., Projector, Whiteboard">
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">Add Room</button>
          <button type="button" class="btn btn-secondary" onclick="showRoomsManagement()">Cancel</button>
        </div>

        <div id="room-error" class="error-message"></div>
        <div id="room-success" class="success-message"></div>
      </form>
    </div>
  `;
}


async function handleAddRoom(event) {
  event.preventDefault();
  
  const errorDiv = document.getElementById('room-error');
  const successDiv = document.getElementById('room-success');
  
  errorDiv.textContent = 'Rooms API endpoint needed in backend!';
  successDiv.textContent = '';
  
  // This will work once you add the rooms API endpoint
  // const roomNumber = document.getElementById('room-number').value;
  // const capacity = document.getElementById('room-capacity').value;
  // const type = document.getElementById('room-type').value;
  // const features = document.getElementById('room-features').value.split(',').map(f => f.trim());
  
  // await API.rooms.create(roomNumber, capacity, type, features);
}

// Schedule Management
function showScheduleManagement() {
  updateAdminTabs(2);
  
  const adminContent = document.getElementById('admin-content');
  
  adminContent.innerHTML = `
    <div class="management-section">
      <h3>Base Schedule Management</h3>
      
      <button class="btn btn-primary" onclick="showAddScheduleForm()">➕ Add Class Schedule</button>
      
      <div id="schedule-management-list">
        <p class="info">Base schedule management coming soon...</p>
        <p>Features:</p>
        <ul>
          <li>Add official class schedules</li>
          <li>Edit existing schedules</li>
          <li>Delete schedules</li>
        </ul>
      </div>
    </div>
  `;
}


function showAddScheduleForm() {
  const list = document.getElementById('schedule-management-list');
  
  list.innerHTML = `
    <div class="form-container">
      <h4>Add Class to Base Schedule</h4>
      <form id="add-schedule-form">
        <div class="form-group">
          <label>Room ID:</label>
          <input type="text" id="schedule-room-id" required>
        </div>

        <div class="form-group">
          <label>Subject:</label>
          <input type="text" id="schedule-subject" required placeholder="e.g., Mathematics 101">
        </div>

        <div class="form-group">
          <label>Day of Week:</label>
          <select id="schedule-day" required>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Start Time:</label>
            <input type="time" id="schedule-start" required>
          </div>

          <div class="form-group">
            <label>End Time:</label>
            <input type="time" id="schedule-end" required>
          </div>
        </div>

        <div class="form-group">
          <label>Semester:</label>
          <input type="text" id="schedule-semester" required placeholder="e.g., Fall 2025">
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary">Add to Schedule</button>
          <button type="button" class="btn btn-secondary" onclick="showScheduleManagement()">Cancel</button>
        </div>

        <div class="info-message">
           Schedule API endpoint needed in backend to save this!
        </div>
      </form>
    </div>
  `;
}


function updateAdminTabs(activeIndex) {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach((tab, index) => {
    if (index === activeIndex) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}