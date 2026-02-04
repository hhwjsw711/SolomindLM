# Stripe setup and verification

Use this checklist to confirm Stripe is correctly configured and to debug `createCheckoutSession` / "Server Error" issues.

## 1. Environment variables (Convex)

In **Convex Dashboard → Settings → Environment Variables**, set:

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) from [Stripe API keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) from your Stripe webhook endpoint (see step 3) |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe Price ID for monthly plan (e.g. `price_xxx`) from [Products](https://dashboard.stripe.com/products) |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Stripe Price ID for yearly plan (e.g. `price_xxx`) |

**Note:** If you use separate Convex deployments (e.g. dev vs prod), set these for each deployment. Project-level defaults apply only to new deployments.

## 2. Quick config check (no secrets exposed)

Run the `checkStripeConfig` action to see which variables are set:

1. Open **Convex Dashboard → Logs** or **Functions**.
2. Run the action `subscriptions.checkStripeConfig` with args `{}`.
3. You should see something like:
   - `stripeSecretKeySet: true/false`
   - `stripeWebhookSecretSet: true/false`
   - `monthlyPriceIdSet: true/false`
   - `yearlyPriceIdSet: true/false`
   - `allSet: true` when everything is configured.

If any value is `false`, add the corresponding env var in Convex and redeploy if needed.

## 3. Webhook endpoint (Stripe Dashboard)

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks).
2. Add endpoint URL: `https://<your-deployment>.convex.site/stripe/webhook`  
   (Find `<your-deployment>` in Convex Dashboard; it’s the part before `.convex.cloud`.)
3. Select events (at least):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
4. After creating the endpoint, copy the **Signing secret** and set it as `STRIPE_WEBHOOK_SECRET` in Convex.

## 4. Stripe products and prices

1. In [Stripe Dashboard → Products](https://dashboard.stripe.com/products), create a product (e.g. "Pro").
2. Add two prices: one recurring monthly, one recurring yearly.
3. Copy each Price ID (`price_...`) and set:
   - Monthly → `STRIPE_PRO_MONTHLY_PRICE_ID`
   - Yearly → `STRIPE_PRO_YEARLY_PRICE_ID`

Use **test** keys and **test** products when testing; switch to **live** keys and live products for production.

## 5. "No such price" / invalid price ID

If you see **`No such price: 'price_xxx'`** or **"Invalid Stripe price"**:

- The price ID in Convex does **not** exist in the Stripe account that `STRIPE_SECRET_KEY` uses, or you have a **test vs live** mismatch.
- **Fix:**
  1. In [Stripe Dashboard](https://dashboard.stripe.com) (use **Test** or **Live** to match your key), go to **Products**.
  2. Open your product and copy the **Price ID** (`price_...`) for the correct interval (monthly/yearly).
  3. In **Convex Dashboard → Environment Variables**, set `STRIPE_PRO_MONTHLY_PRICE_ID` and/or `STRIPE_PRO_YEARLY_PRICE_ID` to those IDs.
  4. Ensure `STRIPE_SECRET_KEY` is from the **same** Stripe account and **same** mode (test key → test prices; live key → live prices).

## 6. When you still see "Server Error"

Convex often returns a generic "Server Error" to the client for security. To see the real error:

1. Open **Convex Dashboard → Logs**.
2. Trigger checkout again and find the log for `subscriptions:createCheckoutSession`.
3. The log will show the actual thrown error (e.g. missing env var, invalid price ID, or Stripe API error).

Common causes:

- **STRIPE_SECRET_KEY not set or wrong** → Set/correct it in Convex env; key must match the Stripe account that owns the prices.
- **Price ID not set or invalid** → Set `STRIPE_PRO_MONTHLY_PRICE_ID` / `STRIPE_PRO_YEARLY_PRICE_ID` to valid `price_xxx` IDs from the same Stripe account and same mode (test/live).
- **Unauthenticated / No identity** → User must be signed in (Convex Auth) before calling checkout.
- **Stripe API error** → Check Logs for the message; ensure the secret key and price IDs are from the same mode (test vs live).

## 7. Stripe CLI (recommended for webhook testing)

The [Stripe CLI](https://docs.stripe.com/stripe-cli) forwards Stripe events to your Convex webhook and gives you a **temporary** signing secret, so you can test payments and see events in one place.

### Install Stripe CLI

- **Windows (scoop):** `scoop install stripe`
- **macOS (Homebrew):** `brew install stripe/stripe-cli/stripe`
- Or download from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases).

### Log in and get your webhook URL

1. Run `stripe login` (one-time).
2. In **Convex Dashboard**, copy your deployment URL base, e.g. `https://happy-animal-123.convex.site`. Your webhook path is that base + `/stripe/webhook`.

### Forward events to Convex

1. Start the listener (replace with your Convex webhook URL):

   ```bash
   stripe listen --forward-to https://<your-deployment>.convex.site/stripe/webhook
   ```

   Example:

   ```bash
   stripe listen --forward-to https://happy-animal-123.convex.site/stripe/webhook
   ```

2. The CLI will print a **webhook signing secret** like `whsec_...`. Copy it.
3. In **Convex Dashboard → Settings → Environment Variables**, set `STRIPE_WEBHOOK_SECRET` to that value (temporarily overwrite the Dashboard secret so the CLI’s signatures verify).
4. Leave the CLI running. In another terminal or in the app, run a test checkout (card `4242 4242 4242 4242`). The CLI will forward `checkout.session.completed` (and other events) to Convex.
5. Check **Convex Dashboard → Logs** for `[Stripe webhook]` and **Data → stripeSubscriptions** to confirm the subscription was created. Then refresh your app’s billing page.
6. When you’re done testing, set `STRIPE_WEBHOOK_SECRET` in Convex back to the **Dashboard** webhook signing secret (from step 3 in section 3) so live Stripe events still work.

### Optional: trigger a test event

To send a sample event without doing a real checkout (useful to see if the endpoint is reachable; the payload won’t have your real `userId`):

```bash
stripe trigger checkout.session.completed
```

For the subscription to show correctly in the app, use a real test checkout while `stripe listen` is running, so the event contains your real subscription and metadata.

## 8. Testing the full flow

1. Ensure `checkStripeConfig` returns `allSet: true`.
2. (Optional) Run `stripe listen --forward-to https://<your-deployment>.convex.site/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET` in Convex to the CLI secret (see section 7).
3. Sign in to the app and open the billing/upgrade page.
4. Click upgrade (monthly or yearly); you should be redirected to Stripe Checkout.
5. Use Stripe test card `4242 4242 4242 4242` and complete checkout.
6. In **Convex Dashboard → Data**, check that `stripeSubscriptions` has a new row and the user’s subscription shows as active in the app.

If checkout fails or the plan doesn’t update, use **Convex Dashboard → Logs** and look for `[Stripe webhook]` and any errors.
