function renderLogin() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="auth-container">
      <div class="auth-box">
        <h1>🎓 UniRoom Scheduler</h1>
        <p class="subtitle">University Room Booking System</p>

        <div class="tabs">
          <button class="tab active" onclick="showLoginForm()">Login</button>
          <button class="tab" onclick="showRegisterForm()">Register</button>
        </div>

        <div id="auth-form-container">
          <!-- Form will be inserted here -->
        </div>
      </div>
    </div>
  `;

  showLoginForm();
}

function showLoginForm() {
  const container = document.getElementById('auth-form-container');
  
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab')[0].classList.add('active');

  container.innerHTML = `
    <form id="login-form" onsubmit="handleLogin(event)">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="login-username" required>
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" id="login-password" required>
      </div>

      <button type="submit" class="btn btn-primary">Login</button>

      <div id="login-error" class="error-message"></div>
    </form>
  `;
}

function showRegisterForm() {
  const container = document.getElementById('auth-form-container');
  
  // Update tabs
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab')[1].classList.add('active');

  container.innerHTML = `
    <form id="register-form" onsubmit="handleRegister(event)">
      <div class="form-group">
        <label>Username</label>
        <input type="text" id="register-username" required>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" id="register-email" required>
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" id="register-password" required>
      </div>

      <div class="form-group">
        <label>Role</label>
        <select id="register-role">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">Register</button>

      <div id="register-error" class="error-message"></div>
      <div id="register-success" class="success-message"></div>
    </form>
  `;
}

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const response = await API.auth.login(username, password);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    window.location.reload();
  } catch (error) {
    errorDiv.textContent = error.message || 'Login failed';
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');

  try {
    await API.auth.register(username, email, password, role);
    
    successDiv.textContent = 'Registration successful! Please login.';
    errorDiv.textContent = '';
    
    setTimeout(showLoginForm, 2000);
  } catch (error) {
    errorDiv.textContent = error.message || 'Registration failed';
    successDiv.textContent = '';
  }
}