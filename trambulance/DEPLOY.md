# Deploying Trambulance

This takes about an hour the first time. You need a computer with Node.js 20 or newer, a Google account, and an Android phone for testing. Everything used here is free to start.

The order matters: backend first, then the app, then the portal.

---

## Step 1. Create the backend (Supabase)

Supabase is an open-source backend (PostgreSQL database, sign-in, file storage and live updates). You can use their hosted service or self-host it later.

1. Go to https://supabase.com, create an account and a **New project**. Choose the **Singapore** region (closest to Bangladesh). Save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and press **Run**. It should finish with "Success. No rows returned".
3. Open a new query, paste `supabase/seed.sql`, and press **Run**. This loads the 28 hospitals and 22 ambulance services from your directories.
4. Open **Project Settings → API** and copy two values. You'll paste them in several places:
   - **Project URL**, like `https://abcdxyz.supabase.co`
   - **anon public key**, a long string starting with `eyJ`

   The anon key is safe to put in the app. Never put the **service_role** key in the app or portal.

### Sign-in settings

5. Open **Authentication → URL Configuration**. Under **Redirect URLs**, add:
   - `trambulance://**` (the Android app)
   - your portal address once you have it (Step 4), for example `https://trambulance-drivers.netlify.app`
6. Open **Authentication → Providers → Email**. For testing you can turn **Confirm email** off so new accounts work immediately. Turn it back on before launch.

### Google ("Login with Gmail")

7. Go to https://console.cloud.google.com, create a project, then **APIs & Services → OAuth consent screen**. Choose **External**, fill in the app name "Trambulance" and your email, and save.
8. **APIs & Services → Credentials → Create credentials → OAuth client ID**. Choose **Web application**. Under **Authorized redirect URIs** add the callback URL that Supabase shows you in **Authentication → Providers → Google** (it looks like `https://abcdxyz.supabase.co/auth/v1/callback`).
9. Copy the Google **Client ID** and **Client secret** into **Supabase → Authentication → Providers → Google**, turn it on and save.

### Make yourself the admin

10. Sign up once (in the app or portal) with your own email. Then in the SQL Editor run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Admins see the admin panel in the portal: driver approvals, trips, support reports and hospital verification.

---

## Step 2. Configure the app

Open `app/eas.json` and replace the placeholder values under `build → base → env`:

| Setting | What to put |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL from Step 1 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | anon public key from Step 1 |
| `EXPO_PUBLIC_BKASH_NUMBER` | the bKash number patients send money to |
| `EXPO_PUBLIC_NAGAD_NUMBER` | the Nagad number patients send money to |
| `EXPO_PUBLIC_SUPPORT_PHONE` | your support hotline |
| `EXPO_PUBLIC_BKASH_MODE` | leave as `manual` until Step 6 |

For local development with `npx expo start`, copy `app/.env.example` to `app/.env` and fill in the same values.

---

## Step 3. Build the APK

Pick one option. Option A is the easiest.

### Option A: Expo EAS cloud build (recommended)

```bash
cd app
npm install
npx eas-cli@latest login            # create a free account at expo.dev if you don't have one
npx eas-cli@latest build -p android --profile preview
```

The first time, answer **Yes** when it asks to create the project and to generate an Android keystore. EAS keeps the keystore safe for you; you need the same one for every future update.

After about 10–20 minutes you get a link and a QR code. Open it on your Android phone, download the APK and install it (allow "Install unknown apps" when asked).

### Option B: GitHub Actions (free, no Expo account)

1. Push this whole folder to a GitHub repository (private is fine).
2. In the repository, open **Settings → Secrets and variables → Actions**:
   - Under **Secrets**, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - Under **Variables**, add `BKASH_NUMBER`, `NAGAD_NUMBER` and `SUPPORT_PHONE`.
3. Open **Actions → Build Android APK → Run workflow**.
4. When it finishes (about 15 minutes), download **trambulance-apk** from the run's Artifacts.

This APK is signed with a test key. It's fine for testing and sharing directly, but use Option A's `production` profile for the Play Store.

### Option C: On your own computer

Install Android Studio, then:

```bash
cd app
npm install
npx expo run:android --variant release
```

### Note about Expo Go

The Expo Go app from the Play Store can't run everything here: the driver's background location and the `trambulance://` sign-in links need a real build. Use the APK.

---

## Step 4. Put the driver portal online

The portal is one file: `portal/index.html`. It lets drivers register from a computer and gives admins the approval panel.

1. Open `portal/index.html`, find the `CONFIG` block near the bottom, and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPPORT_PHONE`, and `APK_URL` (the download link from Step 3).
2. Host it anywhere that serves static files. The quickest: go to https://app.netlify.com/drop and drag the `portal` folder onto the page. You get an address like `https://something.netlify.app`. GitHub Pages, Vercel and Cloudflare Pages work too.
3. Add that address to **Supabase → Authentication → URL Configuration → Redirect URLs** (Step 1, item 5), otherwise Google sign-in on the portal won't return.

---

## Step 5. Test the whole trip with two phones

Use two Android phones (or one phone plus a friend's).

1. **Phone A (driver):** install the APK, sign up, choose "I drive an ambulance", fill in the vehicle form and take a licence photo.
2. **Portal (admin):** sign in, open **Drivers → Pending**, check the documents and press **Approve**.
3. **Phone A:** press **Check status**, then **Go online**. Allow location. You should see a "Trambulance: you are on duty" notification.
4. **Phone B (patient):** sign up as a patient, press **Book an Ambulance**, pick an emergency and a hospital. Phone A's ambulance should appear on the map. Tap it to see the driver profile.
5. Send a request with a lower offer. On Phone A, press **Counter offer** and send a higher price. On Phone B, accept the counter-offer.
6. On Phone A, press **Navigate** (opens Google Maps), then **Arrived at pickup**, **Patient picked up**, **Complete drop-off**. Phone B should follow each step live.
7. On Phone B, pay with Nagad by entering any test TrxID. On Phone A, press **Confirm payment received**. Both sides rate each other.
8. Try **Support → Report a problem** on Phone B and answer it from the portal's **Support** tab.

---

## Step 6. Payments

### Now: manual bKash and Nagad (works without merchant accounts)

The patient sends money to the number you set in Step 2, types the Transaction ID, and the driver (or an admin in the portal) confirms it. Cash works the same way. Every payment is recorded in the `payments` table.

### Later: automatic bKash checkout

1. Apply for a bKash merchant account with Payment Gateway (Tokenized Checkout) at https://www.bkash.com/en/business. bKash gives you sandbox credentials first: app key, app secret, username and password.
2. Install the Supabase CLI (https://supabase.com/docs/guides/cli), then from this folder:

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase secrets set BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout \
  BKASH_APP_KEY=... BKASH_APP_SECRET=... BKASH_USERNAME=... BKASH_PASSWORD=...
supabase functions deploy bkash --no-verify-jwt
```

3. In `app/eas.json`, set `EXPO_PUBLIC_BKASH_MODE` to `checkout` and build again. Patients now pay inside the bKash page and the trip is marked paid automatically.
4. When bKash approves you for live payments, change `BKASH_BASE_URL` to the live URL they give you and update the four credentials with `supabase secrets set`.

### Nagad

Nagad's merchant API needs a merchant agreement and RSA key exchange with Nagad. Keep using manual Nagad until you have it, then the same edge-function pattern as bKash applies.

---

## Step 7. Before you launch publicly

### Maps and routing

Out of the box the app uses OpenStreetMap's free public servers, which are meant for light use. Before launch, run your own free map server on Oracle Cloud's Always Free plan: follow **`server/README.md`** (written in Bangla). One script sets up routing (OSRM), address search (Nominatim) and the Bangladesh map file (PMTiles) with free HTTPS. Then put the four values it prints into `app/eas.json` and build again.

The app always tries your server first and switches to the public servers automatically if yours is down, so bookings never depend on one server.

### Data

- Hospital map pins in `seed.sql` are **approximate**. In the portal's **Hospitals** tab, click **Check pin** for each one, correct any wrong ones in Supabase's Table Editor, and tick **Verified** once you've confirmed the phone number and services.
- Supabase's free plan pauses projects after a week without activity. Upgrade to the Pro plan before real patients depend on it, and turn on daily backups.
- Set up your own email sender in **Authentication → SMTP Settings** so confirmation emails don't hit the free-tier limit.

### Google Play Store

1. Build the store version: `npx eas-cli@latest build -p android --profile production`. This produces an `.aab` file.
2. Create a Google Play Developer account (one-time US$25) and a new app.
3. Play Console will ask for:
   - a **privacy policy URL** (you can host it next to the portal),
   - the **Data safety** form (you collect location, name, phone, photos and health notes),
   - a **foreground service declaration** for location, with a short screen recording of a driver going online and the notification appearing.
4. Upload to **Internal testing** first, then Production.

### Updates

For small changes to screens and text, publish over the air without a new APK:

```bash
npx eas-cli@latest update --branch preview --message "Fix hospital list"
```

Changes to `app.json`, permissions or new native libraries need a new build.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| App shows "Connect your backend" | The Supabase URL or key in `eas.json` is still the placeholder. Fix it and build again. |
| Google sign-in opens the browser and never comes back | `trambulance://**` is missing from Supabase Redirect URLs. |
| Patients don't see any ambulances | The driver must be approved, online, and have shared a location in the last 10 minutes. Check the portal's Drivers tab. |
| Map is grey | No internet, or the public tile server is limiting you. See Step 7. |
| "Location is off for Trambulance" | Android Settings → Apps → Trambulance → Permissions → Location → Allow while using the app. |
| Driver location stops updating in Google Maps | Make sure the "on duty" notification is showing. On Xiaomi, Oppo, Vivo and Realme phones, also set Trambulance's battery saver to **No restrictions**. |
| An error mentions a missing column or function | Run `supabase/schema.sql` again. It's safe to re-run. |
