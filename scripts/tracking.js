import { getOrder } from "../data/orders.js";
import { getProduct, loadProductsFetch } from "../data/products.js";
import { updateCartQuantity } from "./utils/cart.js";
import { formatDeliveryDate } from "./utils/date.js";
import { handleError } from "./utils/errors.js";
import { renderCartLoader, renderTrackingSkeleton } from "./utils/loader.js";
import { calculateDeliveryProgress } from "./utils/progress.js";
import { initializeSearch } from "./utils/search.js";
import { getCachedProducts } from "./utils/cache.js";

loadPage();

async function loadPage() {
  const cachedData = getCachedProducts();
  const controller = new AbortController();
  const controllerTimeout = setTimeout(() => controller.abort(), 8000);

  // ONLY show the skeleton if we don't have cache
  if (!cachedData) {
    renderTrackingSkeleton();
    renderCartLoader();

    // Create a 2.3-second delay
    await new Promise((resolve) => {
      setTimeout(resolve, 2300);
    });
  }

  try {
    await loadProductsFetch({ signal: controller.signal });
    clearTimeout(controllerTimeout);

    renderOrderTracking();
    updateCartQuantity();
    initializeSearch();
  } catch (error) {
    console.log("Unexpected error. Please try again later.", error);

    if (error.name === "AbortError")
      handleError(".order-tracking", "Connection timed out.");
    else handleError(".order-tracking", "Failed to load tracking info.");
    updateCartQuantity("!");
  }
}

function renderOrderTracking() {
  const url = new URL(window.location.href);
  const order = getOrder(url.searchParams.get("orderId"));
  const productDetails = getProduct(url.searchParams.get("productId"));
  const orderProduct = order.products.find(
    (p) => p.productId === productDetails.id,
  );
  const progress = calculateDeliveryProgress(
    order.orderTime,
    orderProduct.estimatedDeliveryTime,
  );

  const orderTracking = document.querySelector(".order-tracking");
  orderTracking.innerHTML = `
      <a class="back-to-orders-link link-primary" href="orders.html">
        View all orders
      </a>

      <div class="delivery-date">Arriving on ${formatDeliveryDate(orderProduct.estimatedDeliveryTime)}</div>

      <div class="product-info">
        ${productDetails.name}
      </div>

      <div class="product-info">Quantity: ${orderProduct.quantity}</div>

      <img
        class="product-image"
        src="${productDetails.image}"
      />

      <div class="progress-labels-container">
        <div class="progress-label">Preparing</div>
        <div class="progress-label current-status">Shipped</div>
        <div class="progress-label">Delivered</div>
      </div>

      <div class="progress-bar-container">
        <div style="width:${progress}%" class="progress-bar"></div>
      </div>
  `;
  orderTracking.classList.add("is-visible");
}
