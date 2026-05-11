let allFoods = [];
let currentCategory = 'all';
let vegOnly = false;
let searchQuery = '';

const IMAGE_MAP = {
  "Dal Makhani Thali": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80",
  "Paneer Butter Masala": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "Rajma Chawal": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80",
  "Aloo Paratha": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
  "Chole Bhature": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80",
  "Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
  "Palak Paneer": "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&q=80",
  "Masala Dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80"
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80"
];

function getImageUrl(name, index) {
  for (let key in IMAGE_MAP) {
    if (name.includes(key)) return IMAGE_MAP[key];
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

document.addEventListener('DOMContentLoaded', () => {
  fetchFood();

  // Category listeners
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-cat');
      renderFoodCards();
    });
  });

  // Veg only toggle
  const vegToggle = document.getElementById('veg-toggle');
  if (vegToggle) {
    vegToggle.addEventListener('change', (e) => {
      vegOnly = e.target.checked;
      renderFoodCards();
    });
  }

  // Search bar
  const searchInput = document.getElementById('menu-search-input');
  if (searchInput) {
    // Pre-fill if coming from homepage
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      searchInput.value = query;
      searchQuery = query.toLowerCase();
    }

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderFoodCards();
    });
  }
});

const showSkeletons = () => {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = Array(6).fill(`
    <div class="food-card">
      <div class="food-image-wrapper skeleton"></div>
      <div class="food-details">
        <div class="skeleton" style="height: 20px; width: 70%; margin-bottom: 8px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 12px; width: 100%; margin-bottom: 4px; border-radius: 4px;"></div>
        <div class="skeleton" style="height: 12px; width: 50%; margin-bottom: 16px; border-radius: 4px;"></div>
        <div class="food-bottom">
          <div class="skeleton" style="height: 20px; width: 60px; border-radius: 4px;"></div>
          <div class="skeleton" style="height: 36px; width: 80px; border-radius: 8px;"></div>
        </div>
      </div>
    </div>
  `).join('');
};

const fetchFood = async () => {
  try {
    showSkeletons();
    const res = await fetch(`${API_BASE}/food`);
    allFoods = await res.json();
    setTimeout(() => {
      renderFoodCards();
    }, 800); // Simulate network load to show premium skeleton UX
  } catch (err) {
    console.error('Failed to load foods', err);
  }
};

const renderFoodCards = () => {
  const grid = document.getElementById('food-grid');
  let filtered = allFoods;

  // Filter by category
  const categoryMap = {
    'all': ['thali', 'roti', 'rice', 'breakfast', 'snacks'],
    'breakfast': ['breakfast'],
    'lunch': ['thali', 'rice', 'roti'],
    'dinner': ['thali', 'rice', 'roti'],
    'snacks': ['snacks']
  };

  if (currentCategory !== 'all') {
    const validCats = categoryMap[currentCategory] || [currentCategory];
    filtered = filtered.filter(f => validCats.includes(f.category));
  }

  if (vegOnly) {
    filtered = filtered.filter(f => f.foodType === 'veg');
  }

  if (searchQuery) {
    filtered = filtered.filter(f => f.name.toLowerCase().includes(searchQuery) || f.description.toLowerCase().includes(searchQuery));
  }

  grid.innerHTML = filtered.map((food, i) => `
    <div class="food-card">
      <div class="food-tag ${food.foodType}">
        <i class="fas fa-circle"></i> ${food.foodType.toUpperCase()}
      </div>
      <div class="food-image-wrapper">
        <img class="food-image" src="${getImageUrl(food.name, i)}" alt="${food.name}" loading="lazy" />
      </div>
      <div class="food-details" style="display: flex; flex-direction: column; flex: 1;">
        <h3 class="food-name">${food.name}</h3>
        <p class="food-desc" style="flex: 1;">${food.description}</p>
        <div class="food-bottom" style="margin-top: auto; padding-top: 10px;">
          <div>
            <span class="food-price">₹${food.price}</span>
            <span class="food-cals">${food.calories || 350} kcal</span>
          </div>
          <button class="add-btn" onclick="addToCart('${food._id}')">
            ADD <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
};
