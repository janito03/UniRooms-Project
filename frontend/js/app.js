document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  if (!isLoggedIn()) {
    
    renderLogin();
  } else {
    
    renderDashboard();
  }
}


function renderDashboard() {
  const user = getCurrentUser();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <h1>🎓 UniRoom Scheduler</h1>
        <div class="nav-right">
          <span class="user-info">👤 ${user.username} (${user.role})</span>
          <button onclick="logout()" class="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div class="sidebar">
        <button class="nav-btn" onclick="showDashboardHome()"> Home</button>
        <button class="nav-btn" onclick="showRooms()"> Rooms & Schedule</button>
        <button class="nav-btn" onclick="showMyBookings()"> My Bookings</button>
        ${user.role === 'admin' ? '<button class="nav-btn" onclick="showAdminPanel()"> Admin Panel</button>' : ''}
      </div>

      <div class="main-content">
        <div class="content-wrapper" id="content-area">
          <div class="welcome-box">
            <h2>Welcome, ${user.username}!</h2>
            <p>You are logged in as: <strong>${user.role}</strong></p>
            
            <div class="dashboard-stats">
              <div class="stat-card">
                <h3>Quick Actions</h3>
                <div class="quick-actions">
                  <button class="btn btn-primary" onclick="showRooms()">Browse Rooms</button>
                  <button class="btn btn-primary" onclick="showMyBookings()">My Bookings</button>
                  ${user.role === 'admin' ? '<button class="btn btn-primary" onclick="showAdminPanel()">Admin Panel</button>' : ''}
                </div>
              </div>

              <div class="stat-card">
                <h3>👤 Your Role</h3>
                <p class="role-description">
                  ${getRoleDescription(user.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


function showDashboardHome() {
  renderDashboard();
}


function getRoleDescription(role) {
  const descriptions = {
    student: 'You can browse rooms and create bookings up to 2 hours.',
    teacher: 'You can browse rooms, create bookings, and override student bookings.',
    admin: 'You have full access to manage users, rooms, and schedules.'
  };
  return descriptions[role] || '';
}


async function showMyBookings() {
  const contentArea = document.getElementById('content-area');
  
  contentArea.innerHTML = `
    <div class="bookings-section">
      <h2> My Bookings</h2>
      <button class="btn btn-primary" onclick="showRooms()" style="margin-bottom: 20px;">
        Create New Booking
      </button>
      <div id="bookings-list"></div>
    </div>
  `;
  
  const bookingsList = document.getElementById('bookings-list');
  
  try {
    const bookings = await API.bookings.getMyBookings();
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p class="info">You have no active bookings.</p>';
      return;
    }

    const bookingsHTML = bookings.map(booking => {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      
      return `
        <div class="booking-card">
          <h3> Room ${booking.room_id.roomNumber}</h3>
          <p><strong>Type:</strong> ${booking.room_id.type}</p>
          <p><strong> Date:</strong> ${startDate.toLocaleDateString()}</p>
          <p><strong> Time:</strong> ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <p><strong> Duration:</strong> ${Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10} hours</p>
          <button onclick="cancelBooking('${booking._id}')" class="btn btn-danger">Cancel Booking</button>
        </div>
      `;
    }).join('');

    bookingsList.innerHTML = `
      <div class="bookings-grid">
        ${bookingsHTML}
      </div>
    `;
  } catch (error) {
    bookingsList.innerHTML = `<p class="error">Error loading bookings: ${error.message}</p>`;
  }
}


async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    await API.bookings.cancel(bookingId);
    alert('Booking cancelled successfully!');
    showMyBookings(); 
  } catch (error) {
    alert('Error cancelling booking: ' + error.message);
  }
}