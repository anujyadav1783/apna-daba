function injectNavbar() {
    let user = null;
    try {
        const stored = localStorage.getItem('apna_dabba_user') || localStorage.getItem('apnadabba_user');
        if (stored) {
            user = JSON.parse(stored);
            if (!user.name) user.name = user.fullName || 'User';
        }
    } catch (e) { }

    const desktopAuthHTML = user
        ? `<div class="cart-icon" style="margin-right: 24px;" onclick="typeof toggleCartDrawer === 'function' ? toggleCartDrawer() : window.location.href='menu.html'" title="Cart">
             <i class="fas fa-shopping-cart" style="font-size: 1.1rem; color: #4B5563; transition: color 0.2s;"></i>
             <span class="cart-count" id="nav-cart-count">0</span>
           </div>
           <div class="user-profile-dropdown" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: background 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='transparent'" onclick="window.location.href='dashboard.html'">
               <div style="width: 32px; height: 32px; border-radius: 50%; background: #f97316; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;">
                   ${user.name.charAt(0).toUpperCase()}
               </div>
               <span style="font-weight: 600; color: #374151; font-size: 0.9rem;">${user.name.split(' ')[0]}</span>
           </div>
           <a href="#" onclick="logout(); return false;" title="Logout" style="margin-left: 12px; color: #9CA3AF; padding: 8px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.color='#EF4444'; this.style.background='#FEE2E2'" onmouseout="this.style.color='#9CA3AF'; this.style.background='transparent'"><i class="fas fa-sign-out-alt" style="font-size: 1.1rem;"></i></a>`
        : `<div class="cart-icon" style="margin-right: 24px;" onclick="typeof toggleCartDrawer === 'function' ? toggleCartDrawer() : window.location.href='menu.html'" title="Cart">
             <i class="fas fa-shopping-cart" style="font-size: 1.1rem; color: #4B5563; transition: color 0.2s;"></i>
             <span class="cart-count" id="nav-cart-count">0</span>
           </div>
           <a href="login.html" style="color: #374151; font-weight: 600; font-size: 0.95rem; text-decoration: none; padding: 8px 18px; border: 1px solid #D1D5DB; border-radius: 8px; margin-right: 12px; transition: all 0.2s;" onmouseover="this.style.background='#F3F4F6'; this.style.borderColor='#9CA3AF'" onmouseout="this.style.background='transparent'; this.style.borderColor='#D1D5DB'">Log In</a>
           <a href="signup.html" style="background: #f97316; color: white; font-weight: 600; font-size: 0.95rem; text-decoration: none; padding: 8px 18px; border-radius: 8px; box-shadow: 0 2px 4px rgba(249,115,22,0.2); transition: all 0.2s; border: 1px solid #f97316;" onmouseover="this.style.background='#ea580c'; this.style.borderColor='#ea580c'; this.style.boxShadow='0 4px 6px rgba(249,115,22,0.3)'" onmouseout="this.style.background='#f97316'; this.style.borderColor='#f97316'; this.style.boxShadow='0 2px 4px rgba(249,115,22,0.2)'">Sign Up</a>`;

    const mobileAuthHTML = user
        ? `<div class="mobile-link" style="color: #f97316;">Hi, ${user.name.split(' ')[0]}!</div>
           <a href="dashboard.html" class="mobile-link"><i class="fas fa-user-circle mr-2"></i> Dashboard</a>
           <a href="#" onclick="logout(); return false;" class="mobile-link"><i class="fas fa-sign-out-alt mr-2"></i> Logout</a>`
        : `<a href="login.html" class="mobile-link"><i class="fas fa-sign-in-alt mr-2"></i> Log In</a>
           <a href="signup.html" class="mobile-link"><i class="fas fa-user-plus mr-2"></i> Sign Up</a>`;

    const navHTML = `
    <style>
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 5%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #E5E7EB;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .nav-brand {
            color: #f97316;
            font-size: 1.4rem;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .nav-links {
            display: flex;
            gap: 32px;
            align-items: center;
        }
        .nav-link {
            color: #4B5563;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.2s;
        }
        .nav-link:hover {
            color: #f97316;
        }
        .nav-link.active-link {
            color: #f97316;
            font-weight: 600;
        }
        .nav-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .cart-icon {
            font-size: 1.2rem;
            position: relative;
            cursor: pointer;
            color: #1A1D20;
        }
        .cart-count {
            position: absolute;
            top: -8px;
            right: -10px;
            background: #ef4444;
            color: white;
            font-size: 0.7rem;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: bold;
        }
        .btn-dashboard {
            background: transparent;
            color: #f97316;
            border: 1.5px solid #f97316;
            padding: 8px 18px;
            border-radius: 20px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-dashboard:hover {
            background: #fff5ee;
        }
        .hamburger {
            display: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #1A1D20;
        }
        .mobile-nav-dropdown {
            display: none;
            background: white;
            border-bottom: 1px solid #f0ebe4;
            position: fixed;
            top: 65px;
            left: 0;
            width: 100%;
            z-index: 999;
            flex-direction: column;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .mobile-link {
            padding: 15px 5%;
            color: #1a1a1a;
            text-decoration: none;
            font-weight: 600;
            border-bottom: 1px solid #f8f5f1;
        }
        .mobile-link.active-link {
            color: #f97316;
            background: #fff5ee;
        }
        @media (max-width: 768px) {
            .nav-links, .btn-dashboard, .desktop-auth { display: none !important; }
            .hamburger { display: block; }
        }
    </style>
    <nav class="navbar">
        <div class="nav-brand" onclick="window.location.href='index.html'">
            🍱 Apna Dabba
        </div>
        <div class="nav-links">
            <a href="index.html" class="nav-link">Home</a>
            <a href="menu.html" class="nav-link">Menu</a>
            <a href="subscription.html" class="nav-link">Subscriptions</a>
            <a href="support.html" class="nav-link">Support</a>
        </div>
        <div class="nav-actions">
            <div class="desktop-auth" style="display: flex; align-items: center;">
                ${desktopAuthHTML}
            </div>
            <div class="hamburger" style="margin-left: 15px;" onclick="toggleMobileMenu()">
                <i class="fas fa-bars"></i>
            </div>
        </div>
    </nav>
    <div class="mobile-nav-dropdown" id="mobileNavDropdown">
        <a href="index.html" class="mobile-link">Home</a>
        <a href="menu.html" class="mobile-link">Menu</a>
        <a href="subscription.html" class="mobile-link">Subscriptions</a>
        <a href="support.html" class="mobile-link">Support</a>
        <div style="height: 10px; background: #f8f5f1;"></div>
        ${mobileAuthHTML}
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Active link highlight
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const allLinks = document.querySelectorAll('.nav-link, .mobile-link');
    allLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active-link');
        }
    });
}

function toggleMobileMenu() {
    const dropdown = document.getElementById('mobileNavDropdown');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener('DOMContentLoaded', injectNavbar);
