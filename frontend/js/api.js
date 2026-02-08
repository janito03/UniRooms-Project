const API = {
  async request(endpoint, options = {}) {
    const token = getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  auth: {
    login: async (username, password) => {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    },

    register: async (username, email, password, role = 'student') => {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role })
      });
    }
  },

  // ADD ROOMS API
  rooms: {
    getAll: async (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return API.request(`/rooms${query ? '?' + query : ''}`);
    },

    getById: async (roomId) => {
      return API.request(`/rooms/${roomId}`);
    },

    create: async (roomNumber, capacity, type, features) => {
      return API.request('/rooms', {
        method: 'POST',
        body: JSON.stringify({ roomNumber, capacity, type, features })
      });
    },

    delete: async (roomId) => {
      return API.request(`/rooms/${roomId}`, {
        method: 'DELETE'
      });
    }
  },

  bookings: {
    create: async (room_id, startTime, endTime) => {
      return API.request('/bookings', {
        method: 'POST',
        body: JSON.stringify({ room_id, startTime, endTime })
      });
    },

    getMyBookings: async () => {
      return API.request('/bookings/my-bookings');
    },

    cancel: async (bookingId) => {
      return API.request(`/bookings/${bookingId}`, {
        method: 'DELETE'
      });
    },

    override: async (bookingId, room_id, startTime, endTime) => {
      return API.request('/bookings/override', {
        method: 'POST',
        body: JSON.stringify({ bookingId, room_id, startTime, endTime })
      });
    }
  }
};