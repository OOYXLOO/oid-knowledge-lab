# JavaScript Reviewer Drill: Invoice Total Calculator

## Candidate Code

```js
export function calculateInvoiceTotal(items, discountPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * discountPercent / 100;
  return Math.round((subtotal - discount) * 100) / 100;
}
```

## Expected Contract

The function should calculate a customer-facing invoice total from line items.

- `items` must be an array.
- Each item must have a finite non-negative `price`.
- Each item must have an integer non-negative `quantity`.
- `discountPercent` must be a finite number from 0 to 100.
- The function should reject invalid input instead of silently returning `NaN` or a negative total.
- The final amount should be rounded to two decimal places.

## Review Verdict

Revise before acceptance.

The implementation is readable and handles the happy path, but it trusts all inputs. That makes the function risky for customer-facing billing, invoice previews, or checkout flows.

## Findings

### High - Invalid item values can produce `NaN`

Evidence:

```js
calculateInvoiceTotal([{ price: "abc", quantity: 2 }])
```

`"abc" * 2` becomes `NaN`, and the final return value is `NaN`.

Action:

Validate every `price` and `quantity` before calculating the subtotal.

### High - Negative values can create impossible invoices

Evidence:

```js
calculateInvoiceTotal([{ price: -100, quantity: 1 }])
calculateInvoiceTotal([{ price: 100, quantity: -2 }])
```

Both cases produce negative or misleading totals.

Action:

Reject negative prices and negative quantities.

### Medium - Discount is not bounded

Evidence:

```js
calculateInvoiceTotal([{ price: 100, quantity: 1 }], 150)
```

This returns a negative total.

Action:

Reject discounts below 0 or above 100.

### Medium - Non-integer quantities are accepted

Evidence:

```js
calculateInvoiceTotal([{ price: 10, quantity: 1.5 }])
```

For most invoice line items, fractional quantities should be a product decision, not an accidental side effect.

Action:

If the product expects whole-unit quantities, require `Number.isInteger(quantity)`.

## Tests I Would Add

```js
import assert from "node:assert/strict";
import { calculateInvoiceTotal } from "./invoice.js";

assert.equal(calculateInvoiceTotal([{ price: 10, quantity: 2 }]), 20);
assert.equal(calculateInvoiceTotal([{ price: 19.99, quantity: 2 }], 10), 35.98);

assert.throws(() => calculateInvoiceTotal(null), /items must be an array/);
assert.throws(() => calculateInvoiceTotal([{ price: "abc", quantity: 2 }]), /price/);
assert.throws(() => calculateInvoiceTotal([{ price: -1, quantity: 2 }]), /price/);
assert.throws(() => calculateInvoiceTotal([{ price: 10, quantity: -1 }]), /quantity/);
assert.throws(() => calculateInvoiceTotal([{ price: 10, quantity: 1.5 }]), /quantity/);
assert.throws(() => calculateInvoiceTotal([{ price: 10, quantity: 1 }], 150), /discount/);
```

## One Reasonable Revision

```js
export function calculateInvoiceTotal(items, discountPercent = 0) {
  if (!Array.isArray(items)) {
    throw new TypeError("items must be an array");
  }

  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new RangeError("discountPercent must be between 0 and 100");
  }

  const subtotal = items.reduce((sum, item, index) => {
    const price = item?.price;
    const quantity = item?.quantity;

    if (!Number.isFinite(price) || price < 0) {
      throw new TypeError(`items[${index}].price must be a non-negative finite number`);
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new TypeError(`items[${index}].quantity must be a non-negative integer`);
    }

    return sum + price * quantity;
  }, 0);

  return Math.round((subtotal * (1 - discountPercent / 100)) * 100) / 100;
}
```

## Residual Product Question

If the product supports fractional quantities, such as billing by weight or time, the quantity validation should be changed intentionally and documented in the function contract.

## Private Assessment Boundary

This drill is synthetic and original. It does not include private candidate code, private assessment prompts, customer data, credentials, payment records, or platform screenshots.
