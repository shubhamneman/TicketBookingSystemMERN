const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  register: (body) =>
    fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  login: (body) =>
    fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  getEvents: () =>
    fetch(`${BASE_URL}/events`, { headers: getHeaders() }).then(handleResponse),

  getEvent: (id) =>
    fetch(`${BASE_URL}/events/${id}`, { headers: getHeaders() }).then(handleResponse),

  reserve: (body) =>
    fetch(`${BASE_URL}/reserve`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  book: (body) =>
    fetch(`${BASE_URL}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse)
};
