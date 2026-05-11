// auth-guard.js — include in protected pages (dashboard)
(function () {
    const token = localStorage.getItem('apnadabba_token') || localStorage.getItem('apna_dabba_token');
    if (!token) {
        window.location.href = 'login.html';
    }
})();
