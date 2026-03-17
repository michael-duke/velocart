import { getFilteredProducts } from "../../data/products.js";

const getSearchElements = () => ({
  bar: document.querySelector(".search-bar"),
  button: document.querySelector(".search-button"),
  clear: document.querySelector(".clear-search-button"),
  dropdown: document.querySelector(".search-results-dropdown"),
  grid: document.querySelector(".products-grid"),
});

export function toggleClearButton() {
  const { bar, clear } = getSearchElements();
  if (!clear || !bar) return;

  const hasText = bar.value.trim().length > 0;
  hasText ? clear.classList.add("visible") : clear.classList.remove("visible");
}

export function setupSearch(onSearch) {
  const el = getSearchElements();
  if (!el.button || !el.bar) return;

  const hideDropdown = () => {
    el.dropdown.style.display = "none";
  };

  const getNormalized = () => el.bar.value.trim().toLowerCase();

  toggleClearButton();

  // Commit Action (Click/Enter)
  const commit = () => {
    onSearch(el.bar.value);
    hideDropdown();
  };

  // Click & Enter Search
  el.button.addEventListener("click", commit);
  el.bar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
  });

  // Real-time debounced search
  let searchTimeout;
  el.bar.addEventListener("input", () => {
    const normalizedQuery = getNormalized();
    toggleClearButton();

    // Debounce if we are already on the index.html page
    if (el.grid) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => onSearch(el.bar.value), 300);
    }
    // Other Pages (Show Dropdown)
    else if (normalizedQuery) {
      const matches = getFilteredProducts(normalizedQuery);
      renderDropdown(matches, el, commit);
    } else {
      hideDropdown();
    }
  });

  // Clear Button
  el.clear?.addEventListener("click", () => {
    el.bar.value = "";
    toggleClearButton();
    hideDropdown();
    if (el.grid) onSearch("");
    el.bar.focus();
  });

  // Click Outside
  document.addEventListener("click", (e) => {
    const isClickInside =
      el.bar.contains(e.target) || el.dropdown.contains(e.target);

    if (!isClickInside) {
      hideDropdown();
    } else {
      const normalizedQuery = getNormalized();
      if (normalizedQuery) {
        const matches = getFilteredProducts(normalizedQuery);
        renderDropdown(matches, el, commit);
      }
    }
  });
}

function renderDropdown(matches, el, performSearch) {
  if (matches.length === 0) return (el.dropdown.style.display = "none");

  el.dropdown.style.display = "block";
  el.dropdown.innerHTML = matches
    .slice(0, 6)
    .map(
      (p) => `
      <div class="dropdown-item" data-id="${p.id}">
        <img src="${p.image}">
        <div class="dropdown-item-name">${p.name}</div>
      </div>
    `,
    )
    .join("");

  el.dropdown.onclick = (e) => {
    const item = e.target.closest(".dropdown-item");
    if (item) {
      const selectedName = item.querySelector(".dropdown-item-name").innerText;
      el.bar.value = selectedName;
      performSearch();
    }
  };
}

// This helper handles the "Redirect vs Filter" logic
export function processSearch(query, renderCallback) {
  const productsGrid = document.querySelector(".products-grid");

  // On Orders or Tracking -> Redirect
  if (!productsGrid) {
    window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    return;
  }

  // On Home -> Update URL silently and Filter
  const newUrl = new URL(window.location);
  query.trim()
    ? newUrl.searchParams.set("search", query)
    : newUrl.searchParams.delete("search");
  window.history.replaceState({}, "", newUrl);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = getFilteredProducts(normalizedQuery);

  if (filteredProducts.length === 0) {
    console.log(filteredProducts.length, "filt");
    console.log(productsGrid);
    productsGrid.classList.remove("fade-entrance");
    productsGrid.innerHTML = `
      <div class="no-results">
        <p>No products match "<strong>${query}</strong>"</p>
        <button class="back-link button-primary" id="reset-search">View all products</button>
      </div>
    `;

    document.getElementById("reset-search").onclick = () => {
      const el = getSearchElements();
      el.bar.value = "";
      processSearch("", renderCallback);
      toggleClearButton();
    };
    return;
  }

  productsGrid.innerHTML = "";
  renderCallback(filteredProducts);
}

/**
 * Attaches the listeners and handles the redirection/filtering logic
 * automatically based on which page the user is on.
 */
export function initializeSearch(uiRenderer) {
  setupSearch((query) => {
    processSearch(query, uiRenderer);
  });
}
