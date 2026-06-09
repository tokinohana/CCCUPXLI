### A. `merchant_stands`

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | Auto-Increment / BigInt (PK) | Unique system key |
| `name` | String | Terminal display name (e.g., "Green Canteen") |
| `token` | String (Unique) | Secret token assigned to the merchant keypad |
| `is_active` | Boolean | Default: `true` |

---

### B. `transactions` (The Ledger)

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | Auto-Increment / BigInt (PK) | Unique ledger sequence |
| `sender` | String | Plain string storage (stores user email, NIS, or stringified ID). Null for system distributions. |
| `receiver` | String | Plain string storage (stores user email, NIS, or stringified ID). Null for payment checkouts/expirations. |
| `merchant_stand_id` | BigInt (FK) | Links directly to localized `merchant_stands.id` |
| `reference_id` | String (Unique) | Unique front-end fingerprint generated for idempotency checks |
| **`amount`** | **BIGINT** | **Always positive (Accounting balance logic managed by `type`)** |
| `type` | Enum | `DISTRIBUTION`, `PAYMENT`, `EXPIRATION`, `ADJUSTMENT` |
| `timestamp` | Timestamp | Default: `now()` |
| `description` | String | Context memo (e.g., "Payment at Green Canteen", "Daily Expiration") |

---

### 1. Simplified Analytical Query
Because `sender` and `receiver` fields are tracked as direct string values containing user properties (like emails or unique account numbers), you no longer need heavy multi-table relational joins to track daily expirations:

```sql
SELECT 
    t.receiver AS Student_Identifier,
    SUM(t.amount) AS Expired_Rupiah
FROM transactions t
WHERE t.type = 'EXPIRATION' 
  AND t.timestamp::date = CURRENT_DATE
GROUP BY t.receiver;
```

2. The 17:00 "Zeroing" Automation Script
Your 17:00 background script operates cleanly without table locking conflicts on scheduling parameters:

Query your global central account database to find all active profiles where current_saldo > 0.

For every profile matched, create an immutable row entry inside the CC PAY transactions ledger table setting type = 'EXPIRATION', sender = NULL, receiver = user.email, and amount = user.current_saldo.

Set that user's core balance parameter current_saldo = 0 inside an atomic transaction block.

This ensures all unused allocations are securely logged for accounting verification and financial tracking while maintaining clean isolation from the active app databases.

3. CC PAY in the Unified Admin Panel
All local transactions and terminal nodes are reviewed and isolated within the Django Admin control panel:

Transaction Overview: Provides filters tracking transaction types (PAYMENT, DISTRIBUTION, EXPIRATION) alongside text matching across flat string entries (sender, receiver, reference_id).

Terminal Management: Allows manual provisioning of access parameters and instant toggle locks (is_active = False) to terminate compromised device tokens instantly.