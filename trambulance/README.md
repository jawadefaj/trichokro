# Trambulance

**Emergency Transport, Connected. সময়ের সাথে, মানুষের পাশে**

An Uber-style ambulance booking app for Dhaka: patients book an ambulance for their emergency, see nearby ambulances live, negotiate the fare, track the driver, and pay with bKash, Nagad or cash.

Start with **[DEPLOY.md](DEPLOY.md)** for step-by-step setup and building the APK.

## What's in this folder

| Folder | What it is |
|---|---|
| `app/` | The Android app (Expo / React Native). One app for both patients and drivers. |
| `supabase/schema.sql` | Database tables, security rules and trip logic. Run once in Supabase. |
| `supabase/seed.sql` | 28 Dhaka hospitals and 22 ambulance services from your directories. |
| `supabase/functions/bkash/` | Server function for automatic bKash checkout (optional). |
| `portal/index.html` | Web portal: driver registration and the admin panel. |
| `server/` | Your own free map server on Oracle Cloud: routing, address search and the Bangladesh map. Guide in Bangla: `server/README.md`. |
| `.github/workflows/` | Free APK build on GitHub Actions. |

## Features

**Patients**
- Sign in with Google (Gmail) or email and password; profile with photo, blood group, medical notes and an emergency contact
- SOS: call 999, text your emergency contact your location, or quick-book the nearest ambulance
- Choose the emergency (Road Accident, Heart, Stroke, Burn, ICU Patient, Eye, Other) and get recommended hospitals ranked by specialty and distance, plus Nearby and All lists with a map
- Pick pickup by GPS, search or tapping the map; see Basic, Oxygen and ICU ambulances with fares and ETAs
- See nearby ambulances live on the map, open a driver's profile, call them or request them directly
- Offer your own price; drivers accept or counter-offer and you choose
- Live tracking with ETA, status timeline, chat, call, share trip and Google Maps route
- Pay after drop-off with bKash, Nagad or cash, then rate the driver
- Trip history, receipts, report a problem, support centre and hotlines
- Schedule an ambulance for later; book for someone else
- English and Bangla

**Drivers**
- Register with licence, NID and vehicle photos; admin approval
- Go online and offline; location keeps updating while navigating in Google Maps
- Incoming requests with emergency type, pickup distance and the patient's offer; accept, counter or decline
- One-tap navigation to the pickup and hospital in Google Maps
- Trip steps: arrived, picked up, drop-off; confirm payment received
- Earnings for today, this week and 30 days

**Admin (web portal)**
- Approve, reject or suspend drivers with document review
- Watch all trips and mark payments received
- Answer support reports
- Mark hospitals as verified

## Open-source stack

| Part | Technology |
|---|---|
| App | Expo SDK 57, React Native 0.86, React Navigation |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime), self-hostable |
| Maps | Leaflet (bundled in the app) drawing a Bangladesh PMTiles map from your Oracle server, with OpenStreetMap tiles as backup |
| Routing | OSRM on your Oracle server, public OSRM as backup |
| Address search | Nominatim on your Oracle server, public Nominatim as backup |
| Navigation hand-off | Google Maps app, via a link (no API key) |

No Google Maps API key or paid map service is needed to run it.

## How the fare works

Fare = base fare + per-km charge + booking fee, rounded to ৳10:

| Type | Base | Per km | Fee | 8.5 km example |
|---|---|---|---|---|
| Basic Transport | ৳1,000 | ৳150 | ৳225 | ৳2,500 |
| Oxygen Support | ৳1,500 | ৳200 | ৳300 | ৳3,500 |
| ICU Capable | ৳3,000 | ৳250 | ৳500 | ৳5,630 |

Patients can offer between 70% and 300% of the suggested fare; drivers can counter between 50% and 300%. The server recalculates the suggested fare so it can't be changed from a phone. To change prices, edit both `app/src/lib/fare.js` and `public.calc_fare()` in `supabase/schema.sql`.

## Safety notes

Trambulance helps people reach an ambulance faster. It doesn't replace the national emergency number. The app tells users to call 999 in life-threatening situations, and hospital information comes from public sources and should be confirmed with the hospital.
