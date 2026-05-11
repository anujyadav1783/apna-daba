let trackingInterval;

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        window.location.href = '/dashboard.html';
        return;
    }

    document.getElementById('order-id-label').innerText = `ORDER #${orderId}`;

    trackOrder(orderId);
    trackingInterval = setInterval(() => trackOrder(orderId), 30000);
});

const trackOrder = async (orderId) => {
    try {
        const res = await fetch(`${API_BASE}/order/${orderId}`, { headers: authHeaders() });

        if (!res.ok) {
            if (res.status === 404) {
                showToast('Order not found', 'error');
                clearInterval(trackingInterval);
            }
            return;
        }

        const order = await res.json();
        updateTrackerUI(order.status);

        if (order.status === 'delivered' || order.status === 'cancelled') {
            clearInterval(trackingInterval);
        }
    } catch (err) {
        console.error('Tracking Error:', err);
    }
};

const statusSteps = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const updateTrackerUI = (currentStatus) => {
    if (currentStatus === 'cancelled') {
        document.getElementById('eta-time').innerText = 'Cancelled';
        document.querySelector('.live-badge').innerText = 'Closed';
        document.querySelector('.live-badge').style.backgroundColor = '#FEE2E2';
        document.querySelector('.live-badge').style.color = '#EF4444';
        return;
    }

    const currentIndex = statusSteps.indexOf(currentStatus);

    statusSteps.forEach((step, i) => {
        const el = document.getElementById(`step-${step}`);
        if (!el) return;

        el.classList.remove('completed', 'active');

        if (i < currentIndex) {
            el.classList.add('completed');
        } else if (i === currentIndex) {
            el.classList.add('active');
        }
    });

    // Simple ETA simulation logic
    if (currentStatus === 'confirmed') document.getElementById('eta-time').innerText = 'In 45 mins';
    else if (currentStatus === 'preparing') document.getElementById('eta-time').innerText = 'In 30 mins';
    else if (currentStatus === 'out_for_delivery') document.getElementById('eta-time').innerText = 'In 15 mins';
    else if (currentStatus === 'delivered') {
        document.getElementById('eta-time').innerText = 'Delivered';
        document.querySelector('.live-badge').innerText = 'Completed';
        document.querySelector('.live-badge').style.backgroundColor = 'var(--text-muted)';
        document.querySelector('.live-badge').style.color = 'white';
    }
};
