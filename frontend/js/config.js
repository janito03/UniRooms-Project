const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
  return !!getToken();
}


function logout() {
 
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  

  window.location.href = 'index.html';
}