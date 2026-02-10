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

  const roleEmojis = {
    student: '🎓',
    teacher: '👨‍🏫',
    admin: '👑'
  };

  const emoji = roleEmojis[user.role] || '👤';

  app.innerHTML = `
    <div class="dashboard">
      <nav class="navbar">
        <h1>🎓 UniRoom Scheduler</h1>
        <div class="nav-right">
          <div class="user-info">
            <div class="user-avatar">${emoji}</div>
            <span>${user.username}</span>
          </div>
          <button onclick="logout()" class="btn btn-secondary">Logout</button>
        </div>
      </nav>

      <div class="sidebar">
        <button class="nav-btn active" onclick="showDashboardHome()">
          <span></span> Home
        </button>
        <button class="nav-btn" onclick="showRooms()">
          <span></span> Rooms & Schedule
        </button>
        <button class="nav-btn" onclick="showMyBookings()">
          <span></span> My Bookings
        </button>
        ${user.role === 'admin' ? '<button class="nav-btn" onclick="showAdminPanel()"><span></span> Admin Panel</button>' : ''}
      </div>

      <div class="content-wrapper" id="content-area">
        <div class="welcome-box">
          <h2>Welcome back, ${user.username}! ${emoji}</h2>
          <p>You're logged in as <strong>${user.role}</strong></p>
          
          <div class="dashboard-stats">
            <div class="stat-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <button class="btn btn-primary" onclick="showRooms()"> Browse Rooms</button>
                <button class="btn btn-primary" onclick="showMyBookings()"> My Bookings</button>
                ${user.role === 'admin' ? '<button class="btn btn-primary" onclick="showAdminPanel()"> Admin Panel</button>' : ''}
              </div>
            </div>

            <div class="stat-card">
              <h3>Your Role: ${emoji} ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h3>
              <p class="role-description">
                ${getRoleDescription(user.role)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}


function showDashboardHome() {
  renderDashboard();
  updateActiveNav(0);
}
function updateActiveNav(index) {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn, i) => {
    if (i === index) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function getRoleDescription(role) {
  const descriptions = {
    student: '✨ You can browse available rooms and create bookings for up to 2 hours. Perfect for study sessions and group work!',
    teacher: '⭐ You have priority access! Browse rooms, create bookings without time limits, and override student reservations when needed.',
    admin: '🔥 Full system control! Manage users, rooms, schedules, and oversee all bookings across the platform.'
  };
  return descriptions[role] || '';
}

async function showMyBookings() {
  const contentArea = document.getElementById('content-area');
  updateActiveNav(2);
  
  contentArea.innerHTML = `
    <div class="bookings-section">
      <h2> My Bookings</h2>
      <button class="btn btn-primary" onclick="showRooms()" style="margin-bottom: 30px;">
        Create New Booking
      </button>
      <div id="notifications-panel"></div>
      <div id="bookings-list"></div>
    </div>
  `;
  
  const bookingsList = document.getElementById('bookings-list');
  bookingsList.innerHTML = '<p class="loading">Loading your bookings...</p>';
  
  try {
    const bookings = await API.bookings.getMyBookings();
    
    if (bookings.length === 0) {
      bookingsList.innerHTML = `
        <div class="info-box">
          <p style="font-size: 1.2em; margin-bottom: 16px;"> No bookings yet!</p>
          <p>You haven't made any room reservations. Start by browsing available rooms!</p>
          <button class="btn btn-primary" onclick="showRooms()" style="margin-top: 20px; max-width: 300px;">
            Browse Rooms
          </button>
        </div>
      `;
      return;
    }

    const notificationsPanel = document.getElementById('notifications-panel');
    const overriddenBookings = bookings.filter(b => b.status === 'overridden');

    if (overriddenBookings.length > 0) {
      const notificationsHtml = overriddenBookings.map(b => {
        const startDate = new Date(b.startTime);
        const endDate = new Date(b.endTime);
        const byUser = b.overriddenBy ? `${b.overriddenBy.username} (${b.overriddenBy.role})` : 'higher priority user';
        return `
          <div class="notification-card">
            <strong>⚠️ Booking overridden</strong>
            <div>Room ${b.room_id.roomNumber} on ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
            <div>Overridden by: ${byUser}</div>
          </div>
        `;
      }).join('');

      notificationsPanel.innerHTML = `
        <div class="notifications-panel">
          <h3>🔔 Notifications</h3>
          ${notificationsHtml}
        </div>
      `;
    } else {
      notificationsPanel.innerHTML = '';
    }

    const bookingsHTML = bookings.map(booking => {
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      const duration = Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10;
      
      const today = new Date();
      const isToday = startDate.toDateString() === today.toDateString();
      const isFuture = startDate > today;
      
      const statusBadge = booking.status === 'overridden'
        ? '<span class="status-badge overridden">OVERRIDDEN</span>'
        : '';

      const overriddenInfo = booking.status === 'overridden'
        ? `<p class="overridden-text">⚠️ This booking was overridden by ${booking.overriddenBy ? booking.overriddenBy.username : 'a higher priority user'}.</p>`
        : '';

      return `
        <div class="booking-card">
          <h3>
             Room ${booking.room_id.roomNumber}
            ${isToday ? '<span class="status-badge today">TODAY</span>' : ''}
            ${isFuture ? '<span class="status-badge upcoming">UPCOMING</span>' : ''}
            ${statusBadge}
          </h3>
          <p><strong>Type:</strong> ${booking.room_id.type.replace('_', ' ').toUpperCase()}</p>
          <p> <strong>Date:</strong> ${startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p> <strong>Time:</strong> ${startDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</p>
          <p><strong>Duration:</strong> ${duration} hour${duration !== 1 ? 's' : ''}</p>
          ${overriddenInfo}
          ${booking.status === 'overridden'
            ? '<button class="btn btn-secondary" disabled>Overridden</button>'
            : `<button onclick="cancelBooking('${booking._id}')" class="btn btn-danger">Cancel Booking</button>`}
        </div>
      `;
    }).join('');

    bookingsList.innerHTML = `
      <div class="bookings-grid">
        ${bookingsHTML}
      </div>
    `;
  } catch (error) {
    bookingsList.innerHTML = `
      <div class="info-box" style="background: #fef2f2; border-left-color: #ef4444; color: #991b1b;">
        <p style="font-size: 1.1em; font-weight: 600;"> Error loading bookings</p>
        <p>${error.message}</p>
      </div>
    `;
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