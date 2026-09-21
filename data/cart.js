import deliveryOptions, { getDeliveryOption } from "./deliveryOptions.js";
import { getProduct } from "./products.js";

export const cart = {
  items: [],
  totalQuantity: 0,
  totalPriceCents: 0,
};

loadFromStorage();

export function loadFromStorage() {
  const storedData = JSON.parse(localStorage.getItem("cart"));
  if (storedData) Object.assign(cart, storedData);
  /* In development uncomment this
  else {
    cart.items = [
      {
        productId: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
        quantity: 1,
        deliveryOptionId: "1",
      },
      {
        productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
        quantity: 2,
        deliveryOptionId: "2",
      },
    ];
    cart.totalQuantity = calculateTotalQuantity();
    cart.totalPriceCents = calculateTotalPrice();
  }
    */
}

export function addToCart(productId, selectedQuantity = 1) {
  let matchingItem;

  cart.items.forEach((cartItem) => {
    if (cartItem.productId === productId) matchingItem = cartItem;
  });

  if (matchingItem) matchingItem.quantity += selectedQuantity;
  else
    cart.items.push({
      productId,
      quantity: selectedQuantity,
      deliveryOptionId: "1",
    });

  calculateTotalQuantity();
  calculateTotalPrice();
  saveToStorage();
}

export function calculateTotalQuantity() {
  cart.totalQuantity = cart.items.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0,
  );
  return cart.totalQuantity;
}

export function calculateTotalPrice() {
  cart.totalPriceCents = cart.items.reduce((total, cartItem) => {
    const product = getProduct(cartItem.productId);
    if (product) total += product.priceCents * cartItem.quantity;

    return total;
  }, 0);

  return cart.totalPriceCents;
}

export function calculateTotalShipping() {
  return cart.items.reduce(
    (totalShipping, cartItem) =>
      totalShipping + getDeliveryOption(cartItem.deliveryOptionId).priceCents,
    0,
  );
}

export function updateQuantity(productId, newQuantity) {
  let matchingItem = cart.items.find((i) => i.productId === productId);
  matchingItem.quantity = newQuantity;
  calculateTotalQuantity();
  calculateTotalPrice();
  saveToStorage();
}

export function removeFromCart(productId) {
  cart.items = cart.items.filter((item) => item.productId !== productId);
  calculateTotalQuantity();
  calculateTotalPrice();
  saveToStorage();
}

export function updateDeliveryOption(productId, newDeliveryOptionId) {
  const validOption = deliveryOptions.find(
    (option) => option.id === newDeliveryOptionId,
  );
  if (!validOption) return;

  const cartItem = cart.items.find((item) => item.productId === productId);

  if (!cartItem) return;

  if (cartItem.deliveryOptionId !== newDeliveryOptionId) {
    cartItem.deliveryOptionId = newDeliveryOptionId;
    saveToStorage();
  }
}

export function saveToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function loadCartFetch({ signal }) {
  return fetch("https://supersimplebackend.dev/cart", { signal })
    .then((response) => response.text())
    .then((cartData) => console.log(cartData));
}

export function loadCart(callback) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener("load", () => {
    console.log(xhr.response);
    callback();
  });
  xhr.open("GET", "https://supersimplebackend.dev/cart");
  xhr.send();
}

export function clearCart() {
  Object.assign(cart, {
    items: [],
    totalQuantity: 0,
    totalPriceCents: 0,
  });
  saveToStorage();
}
