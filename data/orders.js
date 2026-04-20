export const orders = JSON.parse(localStorage.getItem("orders")) || [];

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

export function getOrder(orderId) {
  return orders.find((order) => order.id === orderId);
}

export async function placeOrder(cart) {
  try {
    const response = await fetch("https://supersimplebackend.dev/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cart),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw {
        status: response.status,
        message: errorData.errorMessage || "Order failed. Please try again",
        details: errorData,
      };
    }
    const order = await response.json();
    return order;
  } catch (error) {
    console.log(
      "Status:",
      error.status,
      error.message,
      "Details:",
      error.details,
    );
  }
}

function saveToStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}
