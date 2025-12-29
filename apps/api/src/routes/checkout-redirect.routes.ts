import { Hono } from "hono";
import type { HonoEnv } from "../env";

export const checkoutRedirectRoutes = new Hono<HonoEnv>();

/**
 * GET /checkout/success
 * Redirect page after successful Polar checkout.
 * Returns an HTML page that redirects to the mobile app deep link.
 */
checkoutRedirectRoutes.get("/success", async (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - Mirai Dub AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg { width: 40px; height: 40px; }
    h1 { color: #111827; font-size: 24px; margin-bottom: 12px; }
    p { color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
    }
    .btn:hover { background: #2563eb; }
    .note { color: #9ca3af; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1>Payment Successful!</h1>
    <p>Your credits have been added to your account. You can now close this window and return to the app.</p>
    <a href="miraidub://credits/success" class="btn">Return to App</a>
    <p class="note">If the button doesn't work, please open the Mirai Dub AI app manually.</p>
  </div>
  <script>
    // Try to redirect to the app automatically
    setTimeout(function() {
      window.location.href = 'miraidub://credits/success';
    }, 1500);
  </script>
</body>
</html>`;

  return c.html(html);
});

/**
 * GET /checkout/cancel
 * Redirect page when checkout is cancelled.
 * Returns an HTML page that redirects to the mobile app deep link.
 */
checkoutRedirectRoutes.get("/cancel", async (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Cancelled - Mirai Dub AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: #f59e0b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg { width: 40px; height: 40px; }
    h1 { color: #111827; font-size: 24px; margin-bottom: 12px; }
    p { color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
    }
    .btn:hover { background: #2563eb; }
    .note { color: #9ca3af; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
    <h1>Payment Cancelled</h1>
    <p>Your payment was cancelled. No charges were made. You can try again whenever you're ready.</p>
    <a href="miraidub://credits/cancel" class="btn">Return to App</a>
    <p class="note">If the button doesn't work, please open the Mirai Dub AI app manually.</p>
  </div>
  <script>
    // Try to redirect to the app automatically
    setTimeout(function() {
      window.location.href = 'miraidub://credits/cancel';
    }, 1500);
  </script>
</body>
</html>`;

  return c.html(html);
});
