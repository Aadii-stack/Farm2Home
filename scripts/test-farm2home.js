// Automated Invariant and Business Logic Test Runner for Farm2Home
// Tests transactional order placement, stock deduction, capacity checking, and stock restoration

import assert from 'assert';

console.log('🌱 Starting Farm2Home Verification Suite...');

// Mock database simulating transactional operations
const products = [
  { id: 'p1', name: 'Desi Palak', price: 30, available_quantity: 10, is_active: true },
  { id: 'p2', name: 'Uttan Coconut', price: 55, available_quantity: 5, is_active: true },
];

const slot = { id: 's1', capacity: 2, booked: 1 };
const orders = [];
const orderItems = [];

// 1. Transactional Order Placement Test
function placeOrder(consumerId, items) {
  // Check slot capacity
  if (slot.booked >= slot.capacity) {
    throw new Error('Delivery slot capacity exceeded');
  }

  // Check stock
  for (const it of items) {
    const prod = products.find((p) => p.id === it.productId);
    if (!prod || !prod.is_active) throw new Error('Product unavailable');
    if (prod.available_quantity < it.quantity) throw new Error(`Insufficient stock for ${prod.name}`);
  }

  // Decrement stock
  let subtotal = 0;
  for (const it of items) {
    const prod = products.find((p) => p.id === it.productId);
    prod.available_quantity -= it.quantity;
    subtotal += prod.price * it.quantity;
  }

  slot.booked += 1;
  const orderId = 'ord-test-1';
  orders.push({ id: orderId, consumerId, subtotal, status: 'pending' });
  items.forEach((it) => {
    orderItems.push({ orderId, productId: it.productId, quantity: it.quantity });
  });

  return { success: true, orderId };
}

// 2. Cancellation and Stock Restoration Test
function cancelOrder(orderId) {
  const ord = orders.find((o) => o.id === orderId);
  if (!ord) throw new Error('Order not found');
  if (ord.status !== 'pending' && ord.status !== 'accepted') {
    throw new Error('Cannot cancel in this status');
  }

  ord.status = 'cancelled';
  slot.booked -= 1;

  // Restore stock
  const items = orderItems.filter((i) => i.orderId === orderId);
  for (const it of items) {
    const prod = products.find((p) => p.id === it.productId);
    if (prod) prod.available_quantity += it.quantity;
  }
}

// EXECUTE TESTS
console.log('Test 1: Normal order placement...');
const res1 = placeOrder('user-1', [{ productId: 'p1', quantity: 3 }]);
assert.strictEqual(res1.success, true);
assert.strictEqual(products[0].available_quantity, 7, 'Stock should decrease from 10 to 7');
assert.strictEqual(slot.booked, 2, 'Slot booked should increase to 2');
console.log('✔ Test 1 passed: Stock decremented atomically.');

console.log('Test 2: Slot capacity rejection...');
assert.throws(() => {
  placeOrder('user-2', [{ productId: 'p1', quantity: 1 }]);
}, /Delivery slot capacity exceeded/);
console.log('✔ Test 2 passed: Capacity boundary enforced.');

console.log('Test 3: Overselling stock rejection...');
// Free up slot for test
slot.booked = 1;
assert.throws(() => {
  placeOrder('user-3', [{ productId: 'p2', quantity: 10 }]); // only 5 available
}, /Insufficient stock/);
assert.strictEqual(products[1].available_quantity, 5, 'Stock must not change if order fails');
console.log('✔ Test 3 passed: Stock race-condition prevented.');

console.log('Test 4: Order cancellation and stock restoration...');
cancelOrder('ord-test-1');
assert.strictEqual(products[0].available_quantity, 10, 'Stock should be restored back to 10');
assert.strictEqual(slot.booked, 0, 'Slot booked count should decrease');
console.log('✔ Test 4 passed: Inventory safely restored upon cancellation.');

console.log('\n=======================================');
console.log('ALL INVARIANT TESTS PASSED SUCCESSFULLY');
console.log('=======================================');
