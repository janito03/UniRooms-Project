// Main App Controller

// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Initialize App
function initApp() {
  if (!isLoggedIn()) {
    // Show login page
    renderLogin();
  } else {
    // Show dashboard
    renderDashboard();
  }
}

// Render Dashboard (placeholder for now)// Render Dashboard
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
        <button class="nav-btn" onclick="showDashboardHome()">🏠 Home</button>
        <button class="nav-btn" onclick="showRooms()">📅 Rooms & Schedule</button>
        <button class="nav-btn" onclick="showMyBookings()">📋 My Bookings</button>
        ${user.role === 'admin' ? '<button class="nav-btn" onclick="showAdminPanel()">⚙️ Admin Panel</button>' : ''}
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

// Dashboard Home
function showDashboardHome() {
  renderDashboard();
}

// Get role description
function getRoleDescription(role) {
  const descriptions = {
    student: 'You can browse rooms and create bookings up to 2 hours.',
    teacher: 'You can browse rooms, create bookings, and override student bookings.',
    admin: 'You have full access to manage users, rooms, and schedules.'
  };
  return descriptions[role] || '';
}

// Show My Bookings
async function showMyBookings() {
  const contentArea = document.getElementById('content-area');
  
  try {
    const bookings = await API.bookings.getMyBookings();
    
    if (bookings.length === 0) {
      contentArea.innerHTML = '<p>You have no bookings yet.</p>';
      return;
    }

    const bookingsHTML = bookings.map(booking => `
      <div class="booking-card">
        <h3>Room ${booking.room_id.roomNumber}</h3>
        <p>📅 ${new Date(booking.startTime).toLocaleString()}</p>
        <p>⏰ ${new Date(booking.endTime).toLocaleString()}</p>
        <button onclick="cancelBooking('${booking._id}')" class="btn btn-danger">Cancel</button>
      </div>
    `).join('');

    contentArea.innerHTML = `
      <h3>My Bookings</h3>
      <div class="bookings-grid">
        ${bookingsHTML}
      </div>
    `;
  } catch (error) {
    contentArea.innerHTML = `<p class="error">Error loading bookings: ${error.message}</p>`;
  }
}

// Cancel Booking
async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    await API.bookings.cancel(bookingId);
    alert('Booking cancelled successfully!');
    showMyBookings(); // Refresh list
  } catch (error) {
    alert('Error cancelling booking: ' + error.message);
  }
}