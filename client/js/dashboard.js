let dashboardData = {};

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    loadDashboard();
});

const loadDashboard = async () => {
    try {
        const token = localStorage.getItem('apna_dabba_token') || localStorage.getItem('apnadabba_token');
        const userRes = await fetch(`${typeof API_BASE !== 'undefined' ? API_BASE : '/api'}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const user = userRes.ok ? await userRes.json() : JSON.parse(localStorage.getItem('apna_dabba_user') || '{}');
        if (!user.name) user.name = user.fullName || 'User';

        const nutrition = [
            { day: 'Mon', orders: 0, spend: 0 },
            { day: 'Tue', orders: 0, spend: 0 },
            { day: 'Wed', orders: 0, spend: 0 },
            { day: 'Thu', orders: 0, spend: 0 },
            { day: 'Fri', orders: 0, spend: 0 },
            { day: 'Sat', orders: 0, spend: 0 },
            { day: 'Sun', orders: 0, spend: 0 }
        ];

        // Simulate network delay to show off skeletons
        setTimeout(() => {
            removeSkeletons();
            renderUser(user);
            renderCharts(nutrition);
        }, 1200);

    } catch (error) {
        console.error("Dashboard failed to load data:", error);
        removeSkeletons();
    }
}

const removeSkeletons = () => {
    document.querySelectorAll('.skeleton').forEach(el => el.classList.remove('skeleton'));
    document.querySelectorAll('.skeleton-text').forEach(el => el.classList.remove('skeleton-text'));
    document.querySelectorAll('.skeleton-avatar').forEach(el => el.classList.remove('skeleton-avatar'));
}

const renderUser = (user) => {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 17) greeting = 'Good Afternoon';

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = `${greeting}, ${user.name.split(' ')[0]}!`;

    const avatarEl = document.getElementById('user-avatar-initial');
    if (avatarEl && user.name) avatarEl.textContent = user.name.charAt(0).toUpperCase();

    const currentDt = document.getElementById('current-date');
    if (currentDt) {
        currentDt.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    if (document.getElementById('total-orders')) document.getElementById('total-orders').textContent = user.totalOrders ?? 0;
    if (document.getElementById('health-score')) document.getElementById('health-score').innerHTML = `${user.healthScore ?? 100}<span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">/100</span>`;
    
    // Formatted spend
    const spend = user.monthlyExpenses ?? 0;
    if (document.getElementById('monthly-expenses')) document.getElementById('monthly-expenses').textContent = `₹${spend.toLocaleString()}`;
    
    if (document.getElementById('active-plan')) document.getElementById('active-plan').textContent = user.memberType || 'Pro Standard';
}

const initSidebar = () => {
    // Mobile Toggle
    window.toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        } else {
            sidebar.classList.add('open');
        }
    };

    // Active state
    const navItems = document.querySelectorAll('.dash-sidebar .nav-item');
    navItems.forEach(item => {
        if(item.classList.contains('logout-link')) return;
        item.addEventListener('click', (e) => {
            if(item.getAttribute('href') === '#') e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
};

const renderCharts = (nutrition) => {
    if (typeof Chart === 'undefined') return;

    const labels = nutrition.map(n => n.day);
    const spend = nutrition.map(n => n.spend);

    const ctxTrend = document.getElementById('mainChart');
    if (ctxTrend) {
        new Chart(ctxTrend, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { 
                        label: 'Spend (₹)', 
                        data: spend, 
                        backgroundColor: '#f97316', 
                        borderRadius: 8, 
                        borderSkipped: false,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111827',
                        padding: 12,
                        titleFont: { family: "'Inter', sans-serif", size: 13 },
                        bodyFont: { family: "'Inter', sans-serif", size: 14, weight: 'bold' },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.raw;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: '#6b7280', font: { family: "'Inter', sans-serif" } }
                    },
                    y: { 
                        position: 'left', 
                        grid: { color: '#f3f4f6', drawBorder: false },
                        border: { display: false },
                        ticks: { color: '#6b7280', font: { family: "'Inter', sans-serif" } }
                    }
                }
            }
        });
    }
};
