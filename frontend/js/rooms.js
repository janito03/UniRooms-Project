let allRooms = [];

async function showRooms() {
  const contentArea = document.getElementById("content-area");
  updateActiveNav(1);

  contentArea.innerHTML = `
<div class="rooms-section">
<h2> Available Rooms</h2>
  <div class="filters">
    <div class="filter-group">
      <label> Room Type:</label>
      <select id="filter-type" onchange="filterRooms()">
        <option value="">All Types</option>
        <option value="normal">Normal Room</option>
        <option value="lab">Computer Lab</option>
        <option value="lecture_hall">Lecture Hall</option>
        <option value="conference">Conference Room</option>
      </select>
    </div>

    <div class="filter-group">
      <label> Search Room:</label>
      <input type="text" id="search-room" placeholder="Enter room number..." onkeyup="filterRooms()">
    </div>

    <button class="btn btn-primary" onclick="showBookingForm()">
       New Booking
    </button>
  </div>

  <div id="rooms-list" class="rooms-grid">
    <p class="loading">Loading available rooms...</p>
  </div>
</div>
`;
  await loadRooms();
}

async function loadRooms() {
  const roomsList = document.getElementById("rooms-list");

  try {
    allRooms = await API.rooms.getAll();

    if (allRooms.length === 0) {
      roomsList.innerHTML = `
        <div class="info-box">
          <p>No rooms found in database!</p>
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

function displayRooms(rooms) {
  const roomsList = document.getElementById("rooms-list");

  if (rooms.length === 0) {
    roomsList.innerHTML = "<p>No rooms match your filters.</p>";
    return;
  }

  const roomsHTML = rooms
    .map(
      (room) => `
    <div class="room-card">
      <h3>Room ${room.roomNumber}</h3>
      <p><strong>Type:</strong> ${room.type}</p>
      <p><strong>Capacity:</strong> ${room.capacity} people</p>
      <p><strong>Features:</strong> ${room.features.join(", ") || "None"}</p>
      <button class="btn btn-primary" onclick="quickBook('${room._id}', '${room.roomNumber}')">
        Book This Room
      </button>
    </div>
  `,
    )
    .join("");

  roomsList.innerHTML = roomsHTML;
}

function filterRooms() {
  const typeFilter = document.getElementById("filter-type").value;
  const searchText = document.getElementById("search-room").value.toLowerCase();

  let filtered = allRooms;

  if (typeFilter) {
    filtered = filtered.filter((room) => room.type === typeFilter);
  }

  if (searchText) {
    filtered = filtered.filter((room) =>
      room.roomNumber.toLowerCase().includes(searchText),
    );
  }

  displayRooms(filtered);
}

function quickBook(roomId, roomNumber) {
  showBookingForm(roomId, roomNumber);
}

let selectedTimeSlots = [];

function showBookingForm(preselectedRoomId = null, preselectedRoomNumber = "") {
  const contentArea = document.getElementById("content-area");

  contentArea.innerHTML = `
    <div class="booking-form-container">
      <h2>📅 Create New Booking</h2>
      
      <form id="booking-form" onsubmit="handleCreateBooking(event)">
        <div class="form-group">
          <label>Select Room:</label>
          <select id="booking-room-select" required onchange="loadTimeSlots()">
            <option value="">-- Choose a room --</option>
          </select>
        </div>

        <div class="form-group">
          <label>📅 Date:</label>
          <input type="date" id="booking-date" required onchange="loadTimeSlots()">
        </div>

        <div id="time-slots-container" style="display: none;">
          <h3>⏰ Select Time Slot(s)</h3>
          <p class="hint">Click on available time slots to select. Click again to deselect.</p>
          <div id="time-slots-grid"></div>
          <div class="selected-time-info" id="selected-time-info"></div>
        </div>

        <div class="user-info-box">
          ℹ️ <strong>Remember:</strong> Students can book max 2 hours. Teachers can override student bookings.
        </div>

        <div class="button-group">
          <button type="submit" class="btn btn-primary" id="submit-booking-btn" disabled>Create Booking</button>
          <button type="button" class="btn btn-secondary" onclick="showRooms()">Cancel</button>
        </div>

        <div id="booking-error" class="error-message"></div>
        <div id="booking-success" class="success-message"></div>
      </form>
    </div>
  `;

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("booking-date").value = today;

  loadRoomsDropdown(preselectedRoomId);

  if (preselectedRoomId) {
    setTimeout(() => loadTimeSlots(), 100);
  }
}

async function loadRoomsDropdown(preselectedId = null) {
  const select = document.getElementById("booking-room-select");

  try {
    const rooms = await API.rooms.getAll();

    rooms.forEach((room) => {
      const option = document.createElement("option");
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

async function handleCreateBooking(event) {
  event.preventDefault();

  const roomId = document.getElementById("booking-room-select").value;
  const date = document.getElementById("booking-date").value;

  const errorDiv = document.getElementById("booking-error");
  const successDiv = document.getElementById("booking-success");

  errorDiv.textContent = "";
  successDiv.textContent = "";

  if (!roomId) {
    errorDiv.textContent = "Please select a room!";
    return;
  }

  if (selectedTimeSlots.length === 0) {
    errorDiv.textContent = "Please select at least one time slot!";
    return;
  }

  const startHour = selectedTimeSlots[0];
  const endHour = selectedTimeSlots[selectedTimeSlots.length - 1] + 1;

  const startDateTime = new Date(
    `${date}T${String(startHour).padStart(2, "0")}:00:00`,
  );
  const endDateTime = new Date(
    `${date}T${String(endHour).padStart(2, "0")}:00:00`,
  );

  try {
    const result = await API.bookings.create(
      roomId,
      startDateTime.toISOString(),
      endDateTime.toISOString(),
    );

    if (result.overridden) {
      successDiv.textContent = ` ${result.message}`;
    } else {
      successDiv.textContent = " Booking created successfully!";
    }

    setTimeout(() => {
      showMyBookings();
    }, 1500);
  } catch (error) {
    if (error.message.includes("already booked")) {
      if (user.role === "teacher" || user.role === "admin") {
        errorDiv.textContent = ` ${error.message} - Cannot override teacher/admin bookings.`;
      } else {
        errorDiv.textContent = ` ${error.message} - Students cannot override bookings.`;
      }
    } else if (error.message.includes("official class")) {
      errorDiv.textContent = ` ${error.message} - Nobody can override official classes!`;
    } else {
      errorDiv.textContent = `${error.message}`;
    }
  }
}

async function loadTimeSlots() {
  const roomId = document.getElementById("booking-room-select").value;
  const date = document.getElementById("booking-date").value;

  if (!roomId || !date) return;

  const container = document.getElementById("time-slots-container");
  const grid = document.getElementById("time-slots-grid");

  container.style.display = "block";
  grid.innerHTML = '<p class="loading">Loading availability...</p>';

  try {
    const data = await API.bookings.getRoomBookings(roomId, date);
    displayTimeSlots(data.bookings, data.baseSchedules, date);
  } catch (error) {
    grid.innerHTML = `<p class="error">Error loading time slots: ${error.message}</p>`;
  }
}

function displayTimeSlots(bookings, baseSchedules, date) {
  const grid = document.getElementById("time-slots-grid");
  selectedTimeSlots = [];

  const hours = [];
  for (let h = 8; h <= 20; h++) {
    hours.push(h);
  }

  let html =
    '<table class="time-slots-table"><thead><tr><th>Time</th><th>Status</th></tr></thead><tbody>';

  const user = getCurrentUser();

  hours.forEach((hour) => {
    const slotStart = new Date(
      `${date}T${String(hour).padStart(2, "0")}:00:00`,
    );
    const slotEnd = new Date(
      `${date}T${String(hour + 1).padStart(2, "0")}:00:00`,
    );

    const status = getSlotStatus(slotStart, slotEnd, bookings, baseSchedules);
    const hourStr = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;

    let statusClass = "";
    let statusText = "";
    let clickable = false;
    let canOverride = false;

    if (status.type === "base") {
      statusClass = "slot-blocked";
      statusText = `🔒 Official Class: ${status.subject}`;
    } else if (status.type === "booked") {
      statusClass = status.role === "student" ? "slot-student" : "slot-teacher";
      const roleEmoji = status.role === "student" ? "👨‍🎓" : "👨‍🏫";
      statusText = `${roleEmoji} Booked by ${status.bookedBy} (${status.role})`;

      if (user?.role === "admin") {
        canOverride = true;
        statusText += " — Admin can override";
      } else if (user?.role === "teacher" && status.role === "student") {
        canOverride = true;
        statusText += " — Teacher can override";
      }
    } else {
      statusClass = "slot-free";
      statusText = "✅ Available";
      clickable = true;
    }

    if (canOverride) {
      clickable = true;
      statusClass += " slot-override";
    }

    html += `<tr class="time-slot ${statusClass} ${clickable ? "clickable" : ""}" data-hour="${hour}" ${clickable ? `onclick="toggleSlot(${hour})"` : ""}>`;
    html += `<td class="time-cell"><strong>${hourStr}</strong></td>`;
    html += `<td class="status-cell">${statusText}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  grid.innerHTML = html;
  updateSelectedInfo();
}

function getSlotStatus(slotStart, slotEnd, bookings, baseSchedules) {
  // Check base schedules first
  for (let base of baseSchedules) {
    const baseStart = new Date(`2000-01-01T${base.startTime}`);
    const baseEnd = new Date(`2000-01-01T${base.endTime}`);
    const checkStart = new Date(`2000-01-01T${slotStart.getHours()}:00`);
    const checkEnd = new Date(`2000-01-01T${slotEnd.getHours()}:00`);

    if (checkStart < baseEnd && checkEnd > baseStart) {
      return { type: "base", subject: base.subject };
    }
  }

  // Check bookings
  for (let booking of bookings) {
    const bookStart = new Date(booking.startTime);
    const bookEnd = new Date(booking.endTime);

    if (slotStart < bookEnd && slotEnd > bookStart) {
      return {
        type: "booked",
        bookedBy: booking.user_id.username,
        role: booking.user_id.role,
      };
    }
  }

  return { type: "free" };
}

function toggleSlot(hour) {
  const index = selectedTimeSlots.indexOf(hour);

  if (index > -1) {
    selectedTimeSlots.splice(index, 1);
  } else {
    selectedTimeSlots.push(hour);
  }

  selectedTimeSlots.sort((a, b) => a - b);
  updateSelectedInfo();
  updateSlotHighlights();
}

function updateSlotHighlights() {
  document.querySelectorAll(".time-slot.clickable").forEach((slot) => {
    const hour = parseInt(slot.dataset.hour);
    if (selectedTimeSlots.includes(hour)) {
      slot.classList.add("selected");
    } else {
      slot.classList.remove("selected");
    }
  });
}

function updateSelectedInfo() {
  const infoDiv = document.getElementById("selected-time-info");
  const submitBtn = document.getElementById("submit-booking-btn");
  const user = getCurrentUser();

  if (selectedTimeSlots.length === 0) {
    infoDiv.innerHTML = "";
    submitBtn.disabled = true;
    return;
  }

  // Check if slots are consecutive
  let consecutive = true;
  for (let i = 1; i < selectedTimeSlots.length; i++) {
    if (selectedTimeSlots[i] !== selectedTimeSlots[i - 1] + 1) {
      consecutive = false;
      break;
    }
  }

  if (!consecutive) {
    infoDiv.innerHTML =
      '<p class="error">⚠️ Please select consecutive time slots!</p>';
    submitBtn.disabled = true;
    return;
  }

  const startHour = selectedTimeSlots[0];
  const endHour = selectedTimeSlots[selectedTimeSlots.length - 1] + 1;
  const duration = selectedTimeSlots.length;

  if (user.role === "student" && duration > 2) {
    infoDiv.innerHTML =
      '<p class="error">⚠️ Students can only book max 2 hours!</p>';
    submitBtn.disabled = true;
    return;
  }

  infoDiv.innerHTML = `
    <p class="success">✅ Selected: ${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00 (${duration} hour${duration > 1 ? "s" : ""})</p>
  `;
  submitBtn.disabled = false;
}
