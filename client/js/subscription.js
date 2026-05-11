let isSubbed = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Update Navbar Auth
    const user = getUser();
    if (user) {
        document.getElementById('nav-auth-buttons').innerHTML = `
      <a href="dashboard.html" class="btn-outline btn-nav-auth">Dashboard</a>
    `;
        checkActiveSubscription();
    }

    loadPlans();
});

const checkActiveSubscription = async () => {
    try {
        const res = await fetch(`${API_BASE}/subscription/my`, { headers: authHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (data.isActive) {
                isSubbed = true;
                document.getElementById('active-sub-view').style.display = 'block';
                document.getElementById('plan-grid').style.display = 'none';
                document.querySelector('.sub-header p').style.display = 'none';
                document.getElementById('active-plan-name').innerText = data.plan.toUpperCase();
            }
        }
    } catch (e) { }
};

const loadPlans = async () => {
    try {
        const res = await fetch(`${API_BASE}/subscription/plans`);
        const plans = await res.json();

        // Map objects to array to iterate
        const planKeys = Object.keys(plans);

        if (isSubbed) return; // Don't render grid if already subbed

        document.getElementById('plan-grid').innerHTML = planKeys.map(key => {
            const p = plans[key];
            const isPopular = key === 'regular';

            return `
        <div class="plan-card ${isPopular ? 'popular' : ''}">
          ${isPopular ? '<div class="popular-badge">Most Popular</div>' : ''}
          <div class="plan-title">${key.charAt(0).toUpperCase() + key.slice(1)} Plan</div>
          <div class="plan-price">₹${p.price}<span>/mo</span></div>
          <ul class="plan-features">
            <li><i class="fas ${p.mealsPerDay >= 1 ? 'fa-check-circle' : 'fa-times'}"></i> ${p.mealsPerDay} meal(s) per day</li>
            <li><i class="fas fa-check-circle"></i> ${p.features.chapatiCount} chapatis per meal</li>
            <li><i class="fas ${p.features.customization ? 'fa-check-circle' : 'fa-times'}"></i> Menu Customization</li>
            <li><i class="fas ${p.features.weekendMeals ? 'fa-check-circle' : 'fa-times'}"></i> Weekend Meals</li>
            <li><i class="fas ${p.features.priorityDelivery ? 'fa-check-circle' : 'fa-times'}"></i> Priority Delivery</li>
          </ul>
          <button class="${isPopular ? 'btn-primary' : 'btn-outline'}" style="width:100%" onclick="subscribe('${key}')">Subscribe Now</button>
        </div>
      `;
        }).join('');

    } catch (error) {
        console.error('Error fetching plans', error);
    }
};

const subscribe = async (planName) => {
    if (!getToken()) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await apiCall(`${API_BASE}/subscription/subscribe`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ plan: planName })
        });

        showToast(`Successfully subscribed to ${planName} plan!`);

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (err) {
        // handled
    }
};

const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your active subscription?')) return;

    try {
        await apiCall(`${API_BASE}/subscription/cancel`, {
            method: 'PATCH',
            headers: authHeaders()
        });
        showToast('Subscription cancelled');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (err) { }
};
