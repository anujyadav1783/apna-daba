const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, 'client', 'admin.html');
let html = fs.readFileSync(adminHtmlPath, 'utf8');

// 1. Remove login screen
html = html.replace(/<!-- LOGIN SCREEN -->[\s\S]*?<!-- ADMIN DASHBOARD -->/m, `<!-- SCRIPTS -->
    <script src="js/main.js"></script>
    <script src="js/auth.js"></script>
    <script>
      requireAdmin();
    </script>
    <!-- ADMIN DASHBOARD -->`);

// 2. Remove display: none from dashboard
html = html.replace(/<div id="admin-dashboard">/, '<div id="admin-dashboard" style="display: block;">');

// 3. Add IDs to tbodies for easier population
html = html.replace(/<tbody id="menu-table-body">[\s\S]*?<\/tbody>/, '<tbody id="menu-table-body"></tbody>'); 

const recentOrdersStart = /<tbody>\s*<tr>\s*<td><strong>Rahul K\.<\/strong><\/td>/;
if(recentOrdersStart.test(html)) {
    html = html.replace(/<tbody>\s*<tr>\s*<td><strong>Rahul K\.<\/strong><\/td>[\s\S]*?<\/tbody>/, '<tbody id="recent-orders-body"></tbody>');
}

const manageOrdersStart = /<tbody>\s*<tr>\s*<td>#ORD-8942<\/td>/;
if(manageOrdersStart.test(html)) {
    html = html.replace(/<tbody>\s*<tr>\s*<td>#ORD-8942<\/td>[\s\S]*?<\/tbody>/, '<tbody id="manage-orders-body"></tbody>');
}

const manageUsersStart = /<tbody>\s*<tr>\s*<td>\s*<div style="display:flex; align-items:center; gap:10px;"><img\s*src="https:\/\/i.pravatar.cc\/150\?u=1"/;
if(manageUsersStart.test(html)) {
    html = html.replace(/<tbody>\s*<tr>\s*<td>\s*<div style="display:flex; align-items:center; gap:10px;"><img\s*src="https:\/\/i.pravatar.cc\/150\?u=1"[\s\S]*?<\/tbody>/, '<tbody id="manage-users-body"></tbody>');
}

// 4. Update JS logic
const jsReplaceStart = /\/\/ Authentication Logic[\s\S]*?\/\/ Charts/m;
const newJs = `// Admin Fetch Logic
        function handleLogout() {
            logout(); // Uses auth.js
        }

        document.addEventListener('DOMContentLoaded', () => {
            initCharts();
            fetchAdminStats();
            fetchAdminOrders();
            fetchAdminUsers();
        });

        async function api(path, options = {}) {
            const token = localStorage.getItem('apna_dabba_token');
            const res = await fetch(\`\${typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:5000/api/v1'}\${path}\`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`,
                    ...options.headers
                }
            });
            if (!res.ok) throw new Error('API Error');
            return res.json();
        }

        async function fetchAdminStats() {
            try {
                const data = await api('/admin/stats');
                document.getElementById('kpi-orders').innerText = data.totalOrders || 0;
                document.getElementById('kpi-users').innerText = data.totalUsers || 0;
                document.getElementById('kpi-rev').innerText = \`₹\${data.totalRevenue || 0}\`;
            } catch(e) { console.error(e); }
        }

        async function fetchAdminOrders() {
            try {
                const orders = await api('/orders');
                const tbody = document.getElementById('manage-orders-body');
                if(!tbody) return;
                tbody.innerHTML = orders.map(o => \`
                    <tr>
                        <td>#\${o.orderNumber || o._id.substring(0,6)}</td>
                        <td>\${o.userId?.fullName || 'Guest'}</td>
                        <td>\${o.items?.length || 0} items</td>
                        <td>₹\${o.totalAmount}</td>
                        <td><span id="badge-\${o._id}" class="badge badge-\${o.status === 'delivered' ? 'delivered' : 'pending'}">\${o.status}</span></td>
                        <td>
                            <select class="input-control" style="padding: 5px; font-size: 0.85rem;" onchange="updateOrderStatus('\${o._id}', this.value)">
                                <option value="pending" \${o.status==='pending'?'selected':''}>Pending</option>
                                <option value="preparing" \${o.status==='preparing'?'selected':''}>Preparing</option>
                                <option value="otw" \${o.status==='otw'?'selected':''}>On the Way</option>
                                <option value="delivered" \${o.status==='delivered'?'selected':''}>Delivered</option>
                            </select>
                        </td>
                    </tr>
                \`).join('');

                const recentTbody = document.getElementById('recent-orders-body');
                if(recentTbody) {
                    recentTbody.innerHTML = orders.slice(0, 5).map(o => \`
                        <tr>
                            <td><strong>\${o.userId?.fullName || 'Guest'}</strong></td>
                            <td>\${o.items?.length || 0} items</td>
                            <td>₹\${o.totalAmount}</td>
                            <td>\${new Date(o.createdAt).toLocaleTimeString()}</td>
                            <td><span class="badge badge-pending">\${o.status}</span></td>
                        </tr>
                    \`).join('');
                }
            } catch(e) { console.error(e); }
        }

        async function fetchAdminUsers() {
            try {
                const users = await api('/admin/users');
                const tbody = document.getElementById('manage-users-body');
                if(!tbody) return;
                tbody.innerHTML = users.map(u => \`
                    <tr>
                        <td>
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="\${u.profilePic || 'https://i.pravatar.cc/150?u=1'}" style="width:30px; height:30px; border-radius:50%"> 
                                \${u.fullName}
                            </div>
                        </td>
                        <td>\${u.email}</td>
                        <td>Standard</td>
                        <td>
                            <label style="position: relative; display: inline-block; width: 40px; height: 20px;">
                                <input type="checkbox" \${u.isActive ? 'checked' : ''} onchange="toggleUserStatus('\${u._id}', this)" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: \${u.isActive?'var(--success)':'var(--danger)'}; border-radius: 20px; transition: .4s;">
                                    <span style="position: absolute; content: ''; height: 16px; width: 16px; left: \${u.isActive?'22px':'2px'}; bottom: 2px; background-color: white; border-radius: 50%; transition: .4s;"></span>
                                </span>
                            </label>
                        </td>
                        <td>
                            <span style="padding: 4px 8px; background:\${u.role==='admin'?'var(--primary)':'#eee'}; color:\${u.role==='admin'?'white':'#333'}; font-size:10px; border-radius:4px; font-weight:bold;">\${u.role.toUpperCase()}</span>
                        </td>
                    </tr>
                \`).join('');
            } catch(e) { console.error(e); }
        }

        async function updateOrderStatus(orderId, status) {
            try {
                await api(\`/orders/\${orderId}/status\`, { method: 'PATCH', body: JSON.stringify({status}) });
                showAdminToast(\`Order #\${orderId} status updated!\`);
                fetchAdminOrders(); // refresh
            } catch(e) { showAdminToast('Failed to update status'); }
        }

        async function toggleUserStatus(userId, checkbox) {
            try {
                await api(\`/admin/users/\${userId}/block\`, { method: 'PATCH' });
                showAdminToast('User status toggled!');
                fetchAdminUsers(); // refresh
            } catch(e) { showAdminToast('Failed to block user'); }
        }

        window.updateOrderStatus = updateOrderStatus;
        window.toggleUserStatus = toggleUserStatus;

        // Charts`;

html = html.replace(jsReplaceStart, newJs);

// Fix duplicated generic toggleUserStatus and updateOrderStatus functions
html = html.replace(/function updateOrderStatus\(orderId, status\) {[\s\S]*?}/, '');
html = html.replace(/function toggleUserStatus\(checkbox\) {[\s\S]*?}/, '');

fs.writeFileSync(adminHtmlPath, html);
console.log('done updating admin.html!');
