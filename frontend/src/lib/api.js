const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthToken() {
  try {
    return JSON.parse(localStorage.getItem('herbalife_session') || 'null')?.token || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  getMembers: () => request('/members'),
  createMember: (body) => request('/members', { method: 'POST', body: JSON.stringify(body) }),
  updateMember: (id, body) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  renewMember: (id, body) => request(`/members/${id}/renew`, { method: 'POST', body: JSON.stringify(body) }),
  getTeams: () => request('/teams'),
  getPlans: () => request('/plans'),
  getVisits: () => request('/visits'),
  markVisit: (memberId) => request('/visits', { method: 'POST', body: JSON.stringify({ memberId }) })
};
