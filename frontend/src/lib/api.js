function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }

  return 'https://herbalife-one.vercel.app/api';
}

const API_BASE_URL = resolveApiBaseUrl();

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
  googleAuth: (body) => request('/auth/google', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyResetOtp: (body) => request('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMembers: () => request('/members'),
  createMember: (body) => request('/members', { method: 'POST', body: JSON.stringify(body) }),
  updateMember: (id, body) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  renewMember: (id, body) => request(`/members/${id}/renew`, { method: 'POST', body: JSON.stringify(body) }),
  getTeams: () => request('/teams'),
  getPlans: () => request('/plans'),
  markVisit: (memberId) => request('/visits', { method: 'POST', body: JSON.stringify({ memberId }) })
};
