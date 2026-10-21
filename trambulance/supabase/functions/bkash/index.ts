// bKash Tokenized Checkout for Trambulance (Supabase Edge Function, Deno)
//
// Flow: app POSTs { action: "create", rideId } with the user's JWT
//   -> we grant a bKash token, create a payment, return bkashURL
//   -> patient pays in the bKash page -> bKash redirects to /bkash/callback/<rideId>?paymentID=..&status=..
//   -> we execute the payment, mark the ride paid, and redirect to trambulance://payment-result
//
// Deploy:  supabase functions deploy bkash --no-verify-jwt
// Secrets: supabase secrets set BKASH_BASE_URL=... BKASH_APP_KEY=... BKASH_APP_SECRET=... BKASH_USERNAME=... BKASH_PASSWORD=...
// Sandbox base URL: https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout
// Live base URL:    https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout  (bKash gives you this after merchant onboarding)

import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const BASE = Deno.env.get('BKASH_BASE_URL') ?? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout';
const APP_KEY = Deno.env.get('BKASH_APP_KEY') ?? '';
const APP_SECRET = Deno.env.get('BKASH_APP_SECRET') ?? '';
const USERNAME = Deno.env.get('BKASH_USERNAME') ?? '';
const PASSWORD = Deno.env.get('BKASH_PASSWORD') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const APP_RETURN = Deno.env.get('APP_RETURN_URL') ?? 'trambulance://payment-result';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function grantToken(): Promise<string> {
  const res = await fetch(`${BASE}/token/grant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', username: USERNAME, password: PASSWORD },
    body: JSON.stringify({ app_key: APP_KEY, app_secret: APP_SECRET }),
  });
  const j = await res.json();
  if (!j.id_token) throw new Error(j.statusMessage || j.msg || 'bKash token grant failed');
  return j.id_token;
}

async function bkash(path: string, token: string, body: unknown) {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: token, 'X-APP-Key': APP_KEY },
    body: JSON.stringify(body),
  });
  return await res.json();
}

function back(status: string, rideId: string, message = '') {
  const url = `${APP_RETURN}?status=${encodeURIComponent(status)}&rideId=${encodeURIComponent(rideId)}&message=${encodeURIComponent(message)}`;
  return new Response(null, { status: 302, headers: { Location: url } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = new URL(req.url);

  // 1) bKash redirects the patient's browser here after payment
  const cb = url.pathname.match(/\/callback\/([0-9a-f-]{36})$/i);
  if (req.method === 'GET' && cb) {
    const rideId = cb[1];
    const paymentID = url.searchParams.get('paymentID') ?? '';
    const status = url.searchParams.get('status') ?? '';
    if (status !== 'success' || !paymentID) return back(status || 'cancel', rideId, 'Payment was not completed');

    const { data: ride } = await admin.from('rides').select('id, patient_id, final_fare, offered_fare, payment_status').eq('id', rideId).single();
    if (!ride) return back('failure', rideId, 'Trip not found');
    if (ride.payment_status === 'paid') return back('success', rideId);

    try {
      const token = await grantToken();
      let result = await bkash('execute', token, { paymentID });
      // If execute timed out on bKash's side, query the final state
      if (!result.transactionStatus) result = await bkash('payment/status', token, { paymentID });
      const amount = Math.round(Number(result.amount ?? 0));
      const expected = ride.final_fare ?? ride.offered_fare;
      if (result.transactionStatus !== 'Completed') return back('failure', rideId, result.statusMessage ?? 'Payment failed');
      if (amount < expected) return back('failure', rideId, 'Amount paid does not match the fare');

      await admin.from('payments').update({ status: 'failed' }).eq('ride_id', rideId).eq('status', 'pending');
      await admin.from('payments').insert({
        ride_id: rideId, payer_id: ride.patient_id, method: 'bkash', amount, trx_id: result.trxID,
        provider_payment_id: paymentID, status: 'paid', raw: result,
      });
      await admin.from('rides').update({ payment_method: 'bkash', payment_status: 'paid', updated_at: new Date().toISOString() }).eq('id', rideId);
      return back('success', rideId);
    } catch (e) {
      return back('failure', rideId, (e as Error).message);
    }
  }

  // 2) The app asks for a bKash payment page
  if (req.method === 'POST') {
    const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const { data: { user } } = await userClient.auth.getUser(jwt);
    if (!user) return json({ error: 'Sign in again to pay.' }, 401);

    const { action, rideId } = await req.json().catch(() => ({}));
    if (action !== 'create' || !rideId) return json({ error: 'Bad request' }, 400);

    const { data: ride } = await admin.from('rides').select('*').eq('id', rideId).single();
    if (!ride || ride.patient_id !== user.id) return json({ error: 'Trip not found' }, 404);
    if (ride.status !== 'completed') return json({ error: 'You can pay after the drop-off.' }, 400);
    if (ride.payment_status === 'paid') return json({ error: 'This trip is already paid.' }, 400);
    if (!APP_KEY || !USERNAME) return json({ error: 'bKash checkout is not set up yet. Use manual bKash or cash.' }, 503);

    try {
      const token = await grantToken();
      const amount = ride.final_fare ?? ride.offered_fare;
      const created = await bkash('create', token, {
        mode: '0011',
        payerReference: (ride.patient_phone ?? ' ').slice(-11),
        callbackURL: `${SUPABASE_URL}/functions/v1/bkash/callback/${rideId}`,
        amount: String(amount),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `TRB-${rideId.slice(0, 8)}-${Date.now()}`,
      });
      if (!created.bkashURL) return json({ error: created.statusMessage ?? 'bKash could not start the payment.' }, 502);
      return json({ bkashURL: created.bkashURL, paymentID: created.paymentID });
    } catch (e) {
      return json({ error: (e as Error).message }, 502);
    }
  }

  return json({ error: 'Not found' }, 404);
});
