// Check local storage for token
const getToken = () => localStorage.getItem('apnadabba_token') || localStorage.getItem('apna_dabba_token');
const getUser = () => {
    const user = localStorage.getItem('apnadabba_user') || localStorage.getItem('apna_dabba_user');
    return user ? JSON.parse(user) : null;
};

// Save token after login/signup
const saveToken = (token, user) => {
    localStorage.setItem('apna_dabba_token', token);
    localStorage.setItem('apna_dabba_user', JSON.stringify(user));
};

// Auth headers
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Logout
const logout = () => {
    localStorage.removeItem('apna_dabba_token');
    localStorage.removeItem('apna_dabba_user');
    localStorage.removeItem('apnadabba_token');
    localStorage.removeItem('apnadabba_user');
    window.location.href = 'login.html';
};

// Protect pages — call on protected pages (dashboard, checkout etc.)
const requireAuth = () => {
    if (!getToken()) window.location.href = '/login.html';
};

// Admin Protection
const requireAdmin = () => {
    const user = getUser();
    if (!user || user.role !== 'admin') window.location.href = 'login.html';
};
