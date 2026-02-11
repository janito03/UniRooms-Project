/**
 * ADMIN.JS - User and Room Management
 */

// Main function to render the Admin Panel
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
            </div>

            <div id="admin-content">
                </div>
        </div>
    `;

    showUsersManagement(); // Load users by default
}

// --- USER MANAGEMENT ---

async function showUsersManagement() {
    updateAdminTabs(0);
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = '<p class="loading">Loading users...</p>';

    try {
        // Note: Requires /api/auth/users endpoint in backend
        const users = await API.request('/auth/users');
        
        let html = `
            <div class="management-section">
                <h3>User List</h3>
                <div class="info-box">Total registered: ${users.length}</div>
                <table class="time-slots-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Registration Date</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        users.forEach(u => {
            const date = new Date(u.createdAt).toLocaleDateString();
            html += `
                <tr>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="status-badge upcoming">${u.role.toUpperCase()}</span></td>
                    <td>${date}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
        adminContent.innerHTML = html;
    } catch (error) {
        adminContent.innerHTML = `
            <div class="error-message" style="display:block">
                Error loading users: ${error.message}<br>
                <small>Ensure the /api/auth/users backend endpoint is added.</small>
            </div>
        `;
    }
}

// --- ROOM MANAGEMENT ---

async function showRoomsManagement() {
    updateAdminTabs(1);
    const adminContent = document.getElementById('admin-content');
    
    adminContent.innerHTML = `
        <div class="management-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Room Management</h3>
                <button class="btn btn-primary" onclick="showAddRoomForm()">➕ Add New Room</button>
            </div>
            <div id="admin-rooms-list">
                <p class="loading">Loading rooms...</p>
            </div>
        </div>
    `;

    try {
        const rooms = await API.rooms.getAll();
        const listContainer = document.getElementById('admin-rooms-list');

        if (rooms.length === 0) {
            listContainer.innerHTML = '<p class="info">No rooms found in database.</p>';
            return;
        }

        let html = `
            <table class="time-slots-table">
                <thead>
                    <tr>
                        <th>Room №</th>
                        <th>Type</th>
                        <th>Capacity</th>
                        <th>Features</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rooms.forEach(room => {
            html += `
                <tr>
                    <td><strong>${room.roomNumber}</strong></td>
                    <td>${room.type.replace('_', ' ')}</td>
                    <td>${room.capacity} seats</td>
                    <td><small>${room.features.join(', ') || '-'}</small></td>
                    <td>
                        <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" 
                                onclick="handleDeleteRoom('${room._id}', '${room.roomNumber}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        listContainer.innerHTML = html;
    } catch (error) {
        document.getElementById('admin-rooms-list').innerHTML = `<p class="error-message" style="display:block">Error: ${error.message}</p>`;
    }
}

function showAddRoomForm() {
    const adminContent = document.getElementById('admin-content');
    
    adminContent.innerHTML = `
        <div class="management-section">
            <h3>Create New Room</h3>
            <div class="form-container">
                <form id="add-room-form" onsubmit="handleAdminAddRoom(event)">
                    <div class="form-group">
                        <label>Room Number:</label>
                        <input type="text" id="room-number" required placeholder="e.g., 302B">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Capacity:</label>
                            <input type="number" id="room-capacity" required min="1">
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
                    </div>

                    <div class="form-group">
                        <label>Features (comma-separated):</label>
                        <input type="text" id="room-features" placeholder="Projector, AC, Whiteboard">
                    </div>

                    <div class="button-group">
                        <button type="submit" class="btn btn-primary">Save Room</button>
                        <button type="button" class="btn btn-secondary" onclick="showRoomsManagement()">Cancel</button>
                    </div>

                    <div id="room-error" class="error-message"></div>
                </form>
            </div>
        </div>
    `;
}

async function handleAdminAddRoom(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('room-error');
    
    const roomData = {
        roomNumber: document.getElementById('room-number').value,
        capacity: parseInt(document.getElementById('room-capacity').value),
        type: document.getElementById('room-type').value,
        features: document.getElementById('room-features').value.split(',').map(f => f.trim()).filter(f => f !== "")
    };

    try {
        await API.rooms.create(roomData.roomNumber, roomData.capacity, roomData.type, roomData.features);
        showRoomsManagement();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

async function handleDeleteRoom(id, number) {
    if (!confirm(`Are you sure you want to delete room ${number}?`)) return;

    try {
        await API.rooms.delete(id);
        showRoomsManagement();
    } catch (error) {
        alert('Error deleting room: ' + error.message);
    }
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