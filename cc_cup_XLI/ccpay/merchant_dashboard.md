Merchant Dashboard Access Design

How it works:

You (Admin) generate a Special Access QR Code for each merchant.

You print this code and give it to the merchant (or stick it behind their counter).

When the merchant scans their own code with their phone, it takes them to a signed URL (e.g., ccpay.com/m/auth?token=xyz123).

The backend sees the token, recognizes "Stand 04," and drops a "Merchant JWT" into their browser.

The Result: No typing, no passwords, no Google accounts. Just "Scan to see my money."