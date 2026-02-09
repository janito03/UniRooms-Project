// API Configuration
const API_URL = 'http://localhost:5000/api';

// Helper: Get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Helper: Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper: Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}


function logout() {
 
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  

  window.location.href = 'index.html';
}