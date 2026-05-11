let cartState = { items: [], totalAmount: 0 };

const IMAGE_MAP_GLOB = {
    "Dal Makhani Thali": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    "Paneer Butter Masala": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    "Rajma Chawal": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    "Aloo Paratha": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    "Chole Bhature": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400",
    "Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    "Veg Biryani Bowl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    "Palak Paneer": "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400",
    "Masala Dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400"
};

function getCartImageUrl(name) {
    for (let key in IMAGE_MAP_GLOB) {
        if (name.includes(key)) return IMAGE_MAP_GLOB[key];
    }
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"; // Default
}


document.addEventListener('DOMContentLoaded', () => {
    if (getToken()) {
        fetchCart();
    }
});

const fetchCart = async () => {
    try {
        const data = await apiCall(`${API_BASE}/cart`, { headers: authHeaders() });
        cartState = data;
        updateCartUI();
    } catch (err) {
        console.error('Error fetching cart', err);
    }
};

const addToCart = async (foodId) => {
    if (!getToken()) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const data = await apiCall(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ foodId, quantity: 1 })
        });
        cartState = data.cart;
        showToast('Item added to cart!');
        updateCartUI();
    } catch (err) {
        // Error handled in apiCall
    }
};

const updateCartItemQuantity = async (foodId, quantity) => {
    if (quantity < 1) {
        removeCartItem(foodId);
        return;
    }

    try {
        const data = await apiCall(`${API_BASE}/cart/update`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ foodId, quantity })
        });
        cartState = data.cart;
        updateCartUI();
    } catch (err) {
        // err
    }
};

const removeCartItem = async (foodId) => {
    try {
        const data = await apiCall(`${API_BASE}/cart/remove/${foodId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        cartState = data.cart;
        updateCartUI();
    } catch (err) {
        // err
    }
};

const updateCartUI = () => {
    const floatCart = document.getElementById('floating-cart');
    const cartBadge = document.getElementById('cart-badge');
    const floatTotal = document.getElementById('float-total');
    const floatItems = document.getElementById('float-items');

    if (!floatCart) return;

    if (cartState.items.length > 0) {
        floatCart.classList.add('visible');
        cartBadge.innerText = cartState.items.length;
        floatTotal.innerText = `₹${cartState.totalAmount}`;
        floatItems.innerText = `${cartState.items.length} items from Apna Dabba`;
    } else {
        floatCart.classList.remove('visible');
    }

    renderCartDrawer();
};

const toggleCartDrawer = () => {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');

    if (overlay.style.display === 'block') {
        drawer.classList.remove('open');
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
    } else {
        overlay.style.display = 'block';
        setTimeout(() => { drawer.classList.add('open'); }, 10);
        renderCartDrawer();
    }
};

const renderCartDrawer = () => {
    const list = document.getElementById('cart-items-list');
    const subtotal = document.getElementById('drawer-subtotal');
    const total = document.getElementById('drawer-total');

    if (!list) return;

    list.innerHTML = cartState.items.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-img" style="background-image: url('${getCartImageUrl(item.name)}')"></div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateCartItemQuantity('${item.foodId}', ${item.quantity - 1})">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="updateCartItemQuantity('${item.foodId}', ${item.quantity + 1})">+</button>
      </div>
    </div>
  `).join('');

    if (cartState.items.length === 0) {
        list.innerHTML = `<p class="text-center text-muted mt-4">Your cart is empty</p>`;
    }

    const deliveryFee = cartState.items.length > 0 ? 30 : 0;

    subtotal.innerText = `₹${cartState.totalAmount}`;
    total.innerText = `₹${cartState.totalAmount + deliveryFee}`;
};

const placeOrder = async () => {
    const address = prompt("Please confirm your delivery address:");
    if (!address) return;

    try {
        const data = await apiCall(`${API_BASE}/order/place`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ deliveryAddress: address, paymentMethod: 'cod' })
        });

        showToast('Order placed successfully!');
        cartState = { items: [], totalAmount: 0 };
        updateCartUI();
        toggleCartDrawer();

        setTimeout(() => {
            window.location.href = `/track-order.html?orderId=${data.order.orderNumber}`;
        }, 1500);
    } catch (err) {
        // Handled in apiCall
    }
};
