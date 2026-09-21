import deliveryOptions, { getDeliveryOption } from "./deliveryOptions.js";
import { getProduct, setProducts } from "./products.js";

class LocalStorage {
  constructor() {
    this.storage = {};
  }
  setItem(key, item) {
    this.storage[key] = String(item);
  }
  getItem(key) {
    return this.storage[key] || null;
  }
  removeItem(key) {
    delete this.storage[key];
  }
  clear() {
    this.storage = {};
  }
}

const localStorage = new LocalStorage();

class Cart {
  #localStorageKey;

  constructor(localStorageKey) {
    this.#localStorageKey = localStorageKey;
    this.items = undefined;
    this.totalQuantity = 0;
    this.totalPriceCents = 0;
    this.totalShippingCents = 0;
    this.grandTotalCents = 0;
    this.#loadFromStorage();
  }
  #loadFromStorage() {
    const storedData = JSON.parse(localStorage.getItem(this.#localStorageKey));

    if (storedData) {
      this.items = storedData;
      this.calculateTotalQuantity();
      this.calculateTotalPrice();
      this.calculateTotalShipping();
      this.calculateGrandTotal();
    } else {
      this.items = [
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
      this.calculateTotalQuantity();
      this.calculateTotalPrice();
      this.calculateTotalShipping();
      this.calculateGrandTotal();
    }
  }
  addToCart(productId, selectedQuantity = 1) {
    let matchingItem;

    this.items.forEach((cartItem) => {
      if (cartItem.productId === productId) matchingItem = cartItem;
    });

    if (matchingItem) matchingItem.quantity += selectedQuantity;
    else
      this.items.push({
        productId,
        quantity: selectedQuantity,
        deliveryOptionId: "1",
      });

    this.calculateTotalQuantity();
    this.calculateTotalPrice();
    this.calculateTotalShipping();
    this.calculateGrandTotal();
    this.saveToStorage();
  }
  calculateTotalQuantity() {
    this.totalQuantity = this.items.reduce(
      (total, cartItem) => total + cartItem.quantity,
      0,
    );

    return this.totalQuantity;
  }
  calculateTotalPrice() {
    this.totalPriceCents = this.items.reduce(
      (total, cartItem) =>
        total + getProduct(cartItem.productId).priceCents * cartItem.quantity,
      0,
    );

    return this.totalPriceCents;
  }
  calculateTotalShipping() {
    this.totalShippingCents = this.items.reduce(
      (totalShipping, cartItem) =>
        totalShipping + getDeliveryOption(cartItem.deliveryOptionId).priceCents,
      0,
    );
    return this.totalShippingCents;
  }
  calculateGrandTotal() {
    const subtotal = this.totalPriceCents + this.totalShippingCents;
    const hstCents = Math.round(subtotal * 0.13);
    this.grandTotalCents = subtotal + hstCents;
    return this.grandTotalCents;
  }
  updateQuantity(productId, newQuantity) {
    const matchingItem = this.items.find((i) => i.productId === productId);
    matchingItem.quantity = newQuantity;
    this.calculateTotalQuantity();
    this.calculateTotalPrice();
    this.calculateTotalShipping();
    this.calculateGrandTotal();
    this.saveToStorage();
  }
  removeFromCart(productId) {
    this.items = this.items.filter((item) => item.productId !== productId);
    this.calculateTotalQuantity();
    this.calculateTotalPrice();
    this.calculateTotalShipping();
    this.calculateGrandTotal();
    this.saveToStorage();
  }
  updateDeliveryOption(productId, newDeliveryOptionId) {
    const validOption = deliveryOptions.find(
      (option) => option.id === newDeliveryOptionId,
    );
    if (!validOption) return;

    const cartItem = this.items.find((item) => item.productId === productId);

    if (!cartItem) return;

    if (cartItem.deliveryOptionId !== newDeliveryOptionId) {
      cartItem.deliveryOptionId = newDeliveryOptionId;
      this.calculateTotalShipping();
      this.calculateGrandTotal();
      this.saveToStorage();
    }
  }
  saveToStorage() {
    console.log("Saving to store...");
    localStorage.setItem(this.#localStorageKey, JSON.stringify(this.items));
  }
}

setProducts([
  {
    id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image: "images/products/athletic-cotton-socks-6-pairs.jpg",
    name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
    rating: {
      stars: 4.5,
      count: 87,
    },
    priceCents: 1090,
    keywords: ["socks", "sports", "apparel"],
  },
  {
    id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    image: "images/products/intermediate-composite-basketball.jpg",
    name: "Intermediate Size Basketball",
    rating: {
      stars: 4,
      count: 127,
    },
    priceCents: 2095,
    keywords: ["sports", "basketballs"],
  },
  {
    id: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
    image: "images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
    name: "Adults Plain Cotton T-Shirt - 2 Pack",
    rating: {
      stars: 4.5,
      count: 56,
    },
    priceCents: 799,
    keywords: ["tshirts", "apparel", "mens"],
    type: "clothing",
    sizeChartLink: "images/clothing-size-chart.png",
  },
  {
    id: "54e0eccd-8f36-462b-b68a-8182611d9add",
    image: "images/products/black-2-slot-toaster.jpg",
    name: "2 Slot Toaster - Black",
    rating: {
      stars: 5,
      count: 2197,
    },
    type: "appliance",
    warrantyLink: "images/appliance-warranty.png",
    instructionsLink: "images/appliance-instructions.png",
    priceCents: 1899,
    keywords: ["toaster", "kitchen", "appliances"],
  },
]);

const cart = new Cart("cart-oop");
const businessCart = new Cart("cart-business");

businessCart.addToCart("83d4ca15-0f35-48f5-b7a3-1ea210004f2e");

console.log(cart);
console.log(businessCart);
businessCart.updateDeliveryOption("83d4ca15-0f35-48f5-b7a3-1ea210004f2e", "3");
console.log("Deliver Option Updated ->");
console.log(businessCart);
