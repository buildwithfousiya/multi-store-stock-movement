# Design Document — Multi-Store Stock Movement

## Data Model

The application uses four MongoDB collections:

| Collection | Key Fields | Indexes |
|------------|-----------|---------|
| **Users** | `name`, `email`, `password` (bcrypt), `role` (admin/shopper) | Unique `email` |
| **Products** | `name`| Unique on `sku` |
| **Stores** | Unique `name` |
| **StockEntries** | `product` (ref), `store` (ref), `quantity` |

## Preventing Negative Stock
every negative stock change (whether an adjustment or the source side of a transfer) uses a **single atomic MongoDB `findOneAndUpdate`** with a conditional filter

## Atomic Transfers

A transfer moves stock from one store to another for the same product. It must be all-or-nothing: if the source decrement succeeds but the destination increment fails, the data would be left in an inconsistent state.

1. **Decrement Source:** We perform an atomic `findOneAndUpdate` with a `$gte` guard on the source store.
2. **Increment Destination:** Under a `try-catch` block, we increment the destination store (creating it if it does not yet exist).
3. **Compensate on Failure:** If the destination increment fails for any reason (e.g. database timeout or validation issue), the `catch` block catches the error and executes a compensating update to restore the decremented quantity back to the source store before re-throwing the error.
