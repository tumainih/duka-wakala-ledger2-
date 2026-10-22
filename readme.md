# Duka & Wakala Ledger

Static, offline-first bookkeeping page for a small shop and mobile-money agent in Tanzania. The page tracks today's sales and expenses, simple Airtel Money/M-Pesa/Mixx/HaloPesa balances, and recent ledger entries.

## Run or deploy

This is a plain static web app; no build command or server-side database is required. Open `index.html` locally for basic use, or publish this folder to Netlify Drop / another static host. For app installation and offline caching, use the HTTPS hosted version and open it once online before installing.

## Install and offline use

Open the HTTPS hosted page once while online, then tap **Install app** in the top bar. If the browser does not show a direct install prompt, use its menu and choose **Install app** or **Add to Home Screen**. On iPhone/iPad, open the page in Safari and choose **Share → Add to Home Screen**. The service worker caches the app shell so the ledger can be used offline after that first online visit. Ledger records remain in localStorage on that browser/device; there is no account or cloud sync.

## Storage and caution

Ledger information is stored in this browser's localStorage on this device. It does not sync to an account or cloud database. Use the browser on one device and export/back up browser data separately; clearing site data can erase the ledger. This app is a simple recordkeeping aid, not a payment processor or verified financial statement. Confirm agent balances against provider statements.
