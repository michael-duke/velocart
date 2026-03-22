import {
  cart,
  calculateTotalPrice,
  calculateTotalShipping,
  clearCart,
} from "../../data/cart.js";
import { addOrder, placeOrder } from "../../data/orders.js";
import formatCurrency, { formatTaxCent } from "../utils/money.js";

document
  .querySelector(".payment-summary")
  ?.addEventListener("click", async (event) => {
    if (event.target.classList.contains("place-order-button")) {
      const order = await placeOrder({ cart: cart.items });
      if (order) {
        addOrder(order);
        // Empty the cart after placing order
        clearCart();
        window.location.href = "orders.html";
      }
    }
  });

function renderPaymentSummary() {
  const totalBeforeTaxCents = calculateTotalPrice() + calculateTotalShipping();
  const taxCents = formatTaxCent(totalBeforeTaxCents);
  const orderTotal = totalBeforeTaxCents + taxCents;

  //Refresh the orderSummary for re-renders
  const paymentSummary = document.querySelector(".payment-summary");
  paymentSummary.innerHTML = `
      <div class="payment-summary-title">Order Summary</div>
      <div class="payment-summary-row">
        <div>Items (${cart.totalQuantity}):</div>
        <div class="payment-summary-money">$${formatCurrency(calculateTotalPrice())}</div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money shipping-price">$${formatCurrency(calculateTotalShipping())}</div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money total-before-tax-price">$${formatCurrency(totalBeforeTaxCents)}</div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">$${formatCurrency(orderTotal)}</div>
      </div>

      <button class="place-order-button button-primary">
        Place your order
      </button>
  `;
}

export default renderPaymentSummary;
