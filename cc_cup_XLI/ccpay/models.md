### A. `users` (The Master List)

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `nis` | String (Unique) | For lookup/mapping. |
| `full_name` | String | |
| `email` | String (Unique) | |
| `role` | Enum | `ADMIN`, `CAPTAIN`, `MEMBER`, `MERCHANT` |
| `division_id` | UUID (FK) | Links to `divisions.id` |
| **`current_saldo`** | **BIGINT** | **Default: 0 (Stored in Rupiah)** |
| `is_active` | Boolean | Default: `true` |

---

### B. `divisions`

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `name` | String | e.g., "Logistik", "Acara" |
| `captain_id` | UUID (FK) | Points to `users.id` |

---

### C. `shifts` (The Logic Gate)

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `user_id` | UUID (FK) | The student |
| `date` | Date | e.g., `2024-08-17` |
| `start_time` | Time | e.g., `14:00` |
| `end_time` | Time | e.g., `17:00` |
| `is_distributed` | Boolean | **True only after the 14:00 script runs** |
| `created_by` | UUID (FK) | The Captain who added them |

---

### D. `transactions` (The Ledger)

| Field | Type | Note |
| :--- | :--- | :--- |
| `id` | UUID (PK) | |
| `sender_id` | UUID (FK) | NULL if System/Admin top-up |
| `receiver_id` | UUID (FK) | NULL if System Clawback/Expiration |
| **`amount`** | **BIGINT** | **Always positive (Logic handled by `type`)** |
| `type` | Enum | `DISTRIBUTION`, `PAYMENT`, `EXPIRATION`, `ADJUSTMENT` |
| `timestamp` | Timestamp | Default: `now()` |
| `description` | String | e.g., "Daily Lunch Coupon", "Daily Expiration" |

---

### 1. The "Neat" Analytics Query
To fetch the **unused coupons** per division (your "Administrative Hell" proof), you can now run this query:
```sql
SELECT 
    d.name as Division,
    SUM(t.amount) as Unused_Rupiah
FROM transactions t
JOIN users u ON t.receiver_id = u.id -- For Expirations, the 'receiver' is the one losing money
JOIN divisions d ON u.division_id = d.id
WHERE t.type = 'EXPIRATION' 
AND t.timestamp::date = CURRENT_DATE
GROUP BY d.name;
```

### 2. Solving the "Mistyped NIS" problem
Because `division_id` is now in the `users` table, your Captain UI will work like this:
* Captain logs in.
* App says: `SELECT * FROM users WHERE division_id = 'Captain_Div_ID'`.
* Captain sees a list of **Names**. They just click checkboxes. No typing involved.



### 3. The 17:00 "Zeroing" Logic
Your script at 17:00 should do this in a **Transaction (ACID)**:
1.  Find all users where `current_saldo > 0`.
2.  For each user, create a `transaction` with `type = 'EXPIRATION'` and `amount = current_saldo`.
3.  Set user `current_saldo = 0`.

This ensures that the "Lost" money is forever recorded in the `transactions` table, giving you the neat analytics you want.

**Does this look solid enough to start building the backend migrations?**