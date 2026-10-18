# Ratho Park Golf Club Account (PWA)

A lightweight, installable static web app for tracking a personal club balance and running food/drink order.

## Included
- iPhone-friendly responsive layout and custom icon
- Add money popup (manual tracker only; does not transfer money to the club)
- Searchable menu and favourites
- Running order with quantity controls
- Checkout only on Done; insufficient funds are rejected and order remains
- Balance/order/history saved together in localStorage; duplicate taps are blocked while checkout runs
- Activity history, add-menu-item UI and JSON backup export
- PWA manifest and service worker for install/offline shell

## Menu prices
Prices are stored as integer pence and shown as the amount you pay. Enter already-discounted prices (e.g. £3.00 menu price becomes £2.70 after 10% discount). Cappuccino £2.70 is seeded as a starter example; replace it with the verified club menu.

## Deploy to Vercel
1. Create a GitHub repository and upload all files in this folder to its root.
2. In Vercel, choose **Add New → Project**, import that repository, and deploy using the default static settings (no build command; output/root directory `.`).
3. Open the deployed HTTPS URL on iPhone in Safari → Share → Add to Home Screen.

## Important limitations
- This is a local personal tracker, not connected to Ratho Park Golf Club or any payment system.
- Browser localStorage is not a secure financial ledger and may be cleared by browser data removal. The current checkout prevents rapid double-clicks in one running page, but robust crash-proof/idempotent transactions require a backend database.
- For an installable PWA on iOS, use HTTPS. The service worker caches the app shell, while localStorage keeps account data on that browser/device.
