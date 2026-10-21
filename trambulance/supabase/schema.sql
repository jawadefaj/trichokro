-- ============================================================================
-- Trambulance database schema (Supabase / PostgreSQL)
-- Run this whole file once in Supabase → SQL Editor, then run seed.sql.
-- Safe to re-run: objects are created with "if not exists" / "or replace".
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.km_between(lat1 float8, lng1 float8, lat2 float8, lng2 float8)
returns float8 language sql immutable as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ))
$$;

-- Fare formula. Keep in sync with app/src/lib/fare.js
create or replace function public.calc_fare(p_type text, p_km numeric)
returns int language plpgsql immutable as $$
declare base int; per_km int; fee int;
begin
  if p_type = 'icu' then base := 3000; per_km := 250; fee := 500;
  elsif p_type = 'oxygen' then base := 1500; per_km := 200; fee := 300;
  else base := 1000; per_km := 150; fee := 225;
  end if;
  return (round((base + round(coalesce(p_km, 0) * per_km) + fee) / 10.0) * 10)::int;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'driver', 'admin')),
  email text,
  full_name text,
  phone text,
  gender text,
  date_of_birth date,
  blood_group text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_notes text,
  avatar_url text,
  language text default 'en',
  profile_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  photo_url text,
  vehicle_type text not null check (vehicle_type in ('basic', 'oxygen', 'icu')),
  vehicle_model text,
  vehicle_number text not null,
  vehicle_photo_url text,
  organization text,
  base_area text,
  equipment text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason text,
  is_online boolean not null default false,
  lat float8,
  lng float8,
  heading float8,
  location_updated_at timestamptz,
  rating numeric(3,2) not null default 5.00,
  rating_count int not null default 0,
  trips_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Private verification documents (only the driver and admins can read)
create table if not exists public.driver_documents (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  nid_number text,
  license_number text not null,
  license_photo_path text,
  nid_photo_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id text primary key default ('h' || substr(gen_random_uuid()::text, 1, 8)),
  name text not null,
  area text,
  address text,
  type text,
  phone text,
  phone_label text,
  emergency_info text,
  icu_info text,
  about text,
  note text,
  source_url text,
  specialties text[] not null default '{}',
  lat float8,
  lng float8,
  verified boolean not null default false,
  rating numeric(2,1),
  image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ambulance_services (
  id text primary key,
  name text not null,
  area text,
  zone text,
  base text,
  phone text,
  alt_phone text,
  description text,
  source_url text,
  source_grade text,
  kinds text[] not null default '{}'
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid references public.drivers(id),
  target_driver_id uuid references public.drivers(id),
  emergency_type text not null,
  ambulance_type text not null check (ambulance_type in ('basic', 'oxygen', 'icu')),
  patient_name text,
  patient_phone text,
  notes text,
  pickup_lat float8 not null,
  pickup_lng float8 not null,
  pickup_address text,
  hospital_id text references public.hospitals(id),
  dest_lat float8 not null,
  dest_lng float8 not null,
  dest_address text,
  distance_km numeric(7,2),
  duration_min numeric(7,1),
  suggested_fare int not null,
  offered_fare int not null,
  final_fare int,
  status text not null default 'searching'
    check (status in ('searching', 'accepted', 'arrived', 'picked_up', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  cancel_reason text,
  cancelled_by uuid,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'bkash', 'nagad')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'paid', 'failed')),
  accepted_at timestamptz,
  arrived_at timestamptz,
  picked_up_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rides_status_idx on public.rides (status, created_at desc);
create index if not exists rides_patient_idx on public.rides (patient_id, created_at desc);
create index if not exists rides_driver_idx on public.rides (driver_id, created_at desc);

create table if not exists public.ride_offers (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  amount int not null,
  eta_min int,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn', 'declined')),
  created_at timestamptz not null default now(),
  unique (ride_id, driver_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  payer_id uuid references public.profiles(id),
  method text not null check (method in ('cash', 'bkash', 'nagad')),
  amount int not null,
  trx_id text,
  provider_payment_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  raw jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  ratee_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now(),
  unique (ride_id, rater_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists messages_ride_idx on public.messages (ride_id, created_at);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  ride_id uuid references public.rides(id) on delete set null,
  category text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  lat float8,
  lng float8,
  action text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so they can be used inside RLS policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.is_approved_driver() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.drivers where id = auth.uid() and status = 'approved')
$$;

create or replace function public.driver_busy(p_driver uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rides r
    where r.driver_id = p_driver
      and r.status in ('accepted', 'arrived', 'picked_up')
      and (r.scheduled_at is null or r.scheduled_at < now() + interval '1 hour')
  )
$$;

create or replace function public.is_ride_participant(p_ride uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rides r
    where r.id = p_ride and (r.patient_id = auth.uid() or r.driver_id = auth.uid())
  )
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- New auth user → profile row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users may not promote themselves (role changes only via admin / server functions)
create or replace function public.guard_profiles() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.role := 'patient';
    elsif new.role is distinct from old.role then
      raise exception 'You cannot change your account role';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists guard_profiles on public.profiles;
create trigger guard_profiles before insert or update on public.profiles
  for each row execute function public.guard_profiles();

-- Drivers cannot approve themselves or edit their own rating / trip count
create or replace function public.guard_drivers() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.rating := 5.00; new.rating_count := 0; new.trips_count := 0; new.is_online := false;
    else
      if new.status is distinct from old.status
         and not (old.status = 'rejected' and new.status = 'pending') then
        raise exception 'Only Trambulance staff can change your approval status';
      end if;
      if new.rating is distinct from old.rating or new.rating_count is distinct from old.rating_count
         or new.trips_count is distinct from old.trips_count then
        raise exception 'Ratings and trip counts are updated automatically';
      end if;
    end if;
  end if;
  if new.is_online and new.status <> 'approved' then
    raise exception 'Your driver account must be approved before you go online';
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists guard_drivers on public.drivers;
create trigger guard_drivers before insert or update on public.drivers
  for each row execute function public.guard_drivers();

-- Registering as a driver switches the account role to driver
create or replace function public.on_driver_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set role = 'driver' where id = new.id and role = 'patient';
  return new;
end $$;

drop trigger if exists on_driver_created on public.drivers;
create trigger on_driver_created after insert on public.drivers
  for each row execute function public.on_driver_created();

-- Server-side fare check: the app cannot under-price a ride
create or replace function public.guard_new_ride() returns trigger
language plpgsql as $$
declare km numeric;
begin
  if current_user in ('authenticated', 'anon') then
    km := greatest(coalesce(new.distance_km, 0),
                   public.km_between(new.pickup_lat, new.pickup_lng, new.dest_lat, new.dest_lng) * 1.2);
    new.distance_km := round(km, 2);
    new.suggested_fare := public.calc_fare(new.ambulance_type, km);
    new.offered_fare := greatest(coalesce(new.offered_fare, new.suggested_fare), ceil(new.suggested_fare * 0.7)::int);
    new.offered_fare := least(new.offered_fare, new.suggested_fare * 3);
    new.status := 'searching';
    new.driver_id := null;
    new.final_fare := null;
    new.payment_status := 'unpaid';
  end if;
  return new;
end $$;

drop trigger if exists guard_new_ride on public.rides;
create trigger guard_new_ride before insert on public.rides
  for each row execute function public.guard_new_ride();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.driver_documents enable row level security;
alter table public.hospitals enable row level security;
alter table public.ambulance_services enable row level security;
alter table public.rides enable row level security;
alter table public.ride_offers enable row level security;
alter table public.payments enable row level security;
alter table public.ratings enable row level security;
alter table public.messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.sos_events enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- drivers (approved drivers are visible to signed-in users, like cars on a ride-hailing map)
drop policy if exists drivers_select on public.drivers;
create policy drivers_select on public.drivers for select to authenticated
  using (status = 'approved' or id = auth.uid() or public.is_admin());
drop policy if exists drivers_insert on public.drivers;
create policy drivers_insert on public.drivers for insert to authenticated with check (id = auth.uid());
drop policy if exists drivers_update on public.drivers;
create policy drivers_update on public.drivers for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- driver_documents
drop policy if exists docs_select on public.driver_documents;
create policy docs_select on public.driver_documents for select to authenticated
  using (driver_id = auth.uid() or public.is_admin());
drop policy if exists docs_insert on public.driver_documents;
create policy docs_insert on public.driver_documents for insert to authenticated with check (driver_id = auth.uid());
drop policy if exists docs_update on public.driver_documents;
create policy docs_update on public.driver_documents for update to authenticated
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

-- hospitals & ambulance directory: public read, admin write
drop policy if exists hospitals_read on public.hospitals;
create policy hospitals_read on public.hospitals for select using (true);
drop policy if exists hospitals_admin on public.hospitals;
create policy hospitals_admin on public.hospitals for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists services_read on public.ambulance_services;
create policy services_read on public.ambulance_services for select using (true);
drop policy if exists services_admin on public.ambulance_services;
create policy services_admin on public.ambulance_services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- rides: read by participants, admins, and approved drivers while the ride is open.
-- All changes after creation go through the functions below.
drop policy if exists rides_select on public.rides;
create policy rides_select on public.rides for select to authenticated using (
  patient_id = auth.uid() or driver_id = auth.uid() or public.is_admin()
  or (status = 'searching' and public.is_approved_driver()
      and (target_driver_id is null or target_driver_id = auth.uid()))
);
drop policy if exists rides_insert on public.rides;
create policy rides_insert on public.rides for insert to authenticated with check (patient_id = auth.uid());

-- ride_offers
drop policy if exists offers_select on public.ride_offers;
create policy offers_select on public.ride_offers for select to authenticated using (
  driver_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.rides r where r.id = ride_id and r.patient_id = auth.uid())
);

-- payments
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated
  using (public.is_ride_participant(ride_id) or public.is_admin());

-- ratings
drop policy if exists ratings_select on public.ratings;
create policy ratings_select on public.ratings for select to authenticated
  using (rater_id = auth.uid() or ratee_id = auth.uid() or public.is_admin());

-- messages
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated
  using (public.is_ride_participant(ride_id) or public.is_admin());
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_ride_participant(ride_id));

-- support tickets
drop policy if exists tickets_select on public.support_tickets;
create policy tickets_select on public.support_tickets for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists tickets_insert on public.support_tickets;
create policy tickets_insert on public.support_tickets for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists tickets_admin on public.support_tickets;
create policy tickets_admin on public.support_tickets for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- sos events
drop policy if exists sos_insert on public.sos_events;
create policy sos_insert on public.sos_events for insert to authenticated with check (user_id = auth.uid());
drop policy if exists sos_select on public.sos_events;
create policy sos_select on public.sos_events for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Trip functions (called from the app with supabase.rpc)
-- ---------------------------------------------------------------------------

-- Online, approved, free ambulances near a point
create or replace function public.nearby_drivers(
  p_lat float8, p_lng float8, p_radius_km float8 default 20, p_type text default null
) returns table (
  id uuid, full_name text, phone text, photo_url text, vehicle_type text, vehicle_model text,
  vehicle_number text, vehicle_photo_url text, organization text, equipment text[],
  rating numeric, rating_count int, trips_count int, lat float8, lng float8, distance_km float8
) language sql stable security definer set search_path = public as $$
  select d.id, d.full_name, d.phone, d.photo_url, d.vehicle_type, d.vehicle_model, d.vehicle_number,
         d.vehicle_photo_url, d.organization, d.equipment, d.rating, d.rating_count, d.trips_count,
         d.lat, d.lng, public.km_between(p_lat, p_lng, d.lat, d.lng) as distance_km
  from public.drivers d
  where d.status = 'approved' and d.is_online and d.lat is not null
    and d.location_updated_at > now() - interval '10 minutes'
    and (p_type is null or d.vehicle_type = p_type)
    and not public.driver_busy(d.id)
    and public.km_between(p_lat, p_lng, d.lat, d.lng) <= p_radius_km
  order by distance_km
  limit 40
$$;

-- Ride requests a driver can respond to
create or replace function public.open_requests(p_radius_km float8 default 25)
returns table (
  id uuid, emergency_type text, ambulance_type text, pickup_lat float8, pickup_lng float8,
  pickup_address text, dest_address text, hospital_name text, distance_km numeric,
  suggested_fare int, offered_fare int, patient_name text, notes text, scheduled_at timestamptz,
  created_at timestamptz, targeted boolean, pickup_km float8, my_offer int
) language sql stable security definer set search_path = public as $$
  select r.id, r.emergency_type, r.ambulance_type, r.pickup_lat, r.pickup_lng, r.pickup_address,
         coalesce(r.dest_address, h.address), h.name, r.distance_km, r.suggested_fare, r.offered_fare,
         r.patient_name, r.notes, r.scheduled_at, r.created_at,
         coalesce(r.target_driver_id = d.id, false) as targeted,
         case when d.lat is null then null else public.km_between(d.lat, d.lng, r.pickup_lat, r.pickup_lng) end,
         (select o.amount from public.ride_offers o where o.ride_id = r.id and o.driver_id = d.id and o.status = 'pending')
  from public.drivers d
  join public.rides r on r.status = 'searching' and (r.target_driver_id is null or r.target_driver_id = d.id)
  left join public.hospitals h on h.id = r.hospital_id
  where d.id = auth.uid() and d.status = 'approved'
    and (r.ambulance_type = d.vehicle_type or r.target_driver_id = d.id or d.vehicle_type = 'icu'
         or (d.vehicle_type = 'oxygen' and r.ambulance_type = 'basic'))
    and ((r.scheduled_at is not null and r.scheduled_at > now() - interval '1 hour')
         or r.created_at > now() - interval '45 minutes')
    and (d.lat is null or r.target_driver_id = d.id
         or public.km_between(d.lat, d.lng, r.pickup_lat, r.pickup_lng) <= p_radius_km)
    and not exists (select 1 from public.ride_offers x
                    where x.ride_id = r.id and x.driver_id = d.id and x.status in ('declined', 'withdrawn'))
  order by coalesce(r.target_driver_id = d.id, false) desc, r.scheduled_at nulls first, r.created_at
  limit 30
$$;

-- Driver accepts the patient's offer (amount <= offer) or sends a counter-offer
create or replace function public.driver_respond(p_ride_id uuid, p_amount int, p_eta_min int default null)
returns text language plpgsql security definer set search_path = public as $$
declare r public.rides; d public.drivers;
begin
  select * into d from public.drivers where id = auth.uid();
  if d.id is null or d.status <> 'approved' then raise exception 'Your driver account is not approved yet'; end if;
  if public.driver_busy(d.id) then raise exception 'Finish your current trip before taking another'; end if;

  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null or r.status <> 'searching' then raise exception 'This request already has a driver'; end if;
  if r.target_driver_id is not null and r.target_driver_id <> d.id then raise exception 'This request was sent to another driver'; end if;
  if p_amount < ceil(r.suggested_fare * 0.5) or p_amount > r.suggested_fare * 3 then
    raise exception 'Offer must be between ৳% and ৳%', ceil(r.suggested_fare * 0.5)::int, r.suggested_fare * 3;
  end if;

  if p_amount <= r.offered_fare then
    update public.rides set driver_id = d.id, final_fare = p_amount, status = 'accepted',
      accepted_at = now(), updated_at = now() where id = r.id;
    insert into public.ride_offers (ride_id, driver_id, amount, eta_min, status)
      values (r.id, d.id, p_amount, p_eta_min, 'accepted')
      on conflict (ride_id, driver_id) do update set amount = excluded.amount, eta_min = excluded.eta_min, status = 'accepted';
    update public.ride_offers set status = 'rejected' where ride_id = r.id and driver_id <> d.id and status = 'pending';
    return 'accepted';
  end if;

  insert into public.ride_offers (ride_id, driver_id, amount, eta_min, status)
    values (r.id, d.id, p_amount, p_eta_min, 'pending')
    on conflict (ride_id, driver_id) do update
      set amount = excluded.amount, eta_min = excluded.eta_min, status = 'pending', created_at = now();
  return 'offered';
end $$;

create or replace function public.driver_decline(p_ride_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  if not public.is_approved_driver() then raise exception 'Not an approved driver'; end if;
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null then return; end if;
  insert into public.ride_offers (ride_id, driver_id, amount, status)
    values (r.id, auth.uid(), r.offered_fare, 'declined')
    on conflict (ride_id, driver_id) do update set status = 'declined';
  -- A request sent to one driver is broadcast to everyone nearby when they decline
  if r.target_driver_id = auth.uid() and r.status = 'searching' then
    update public.rides set target_driver_id = null, updated_at = now() where id = r.id;
  end if;
end $$;

-- Patient accepts a driver's counter-offer
create or replace function public.accept_offer(p_offer_id uuid)
returns public.rides language plpgsql security definer set search_path = public as $$
declare o public.ride_offers; r public.rides;
begin
  select * into o from public.ride_offers where id = p_offer_id;
  if o.id is null then raise exception 'Offer not found'; end if;
  select * into r from public.rides where id = o.ride_id for update;
  if r.patient_id <> auth.uid() then raise exception 'Offer not found'; end if;
  if r.status <> 'searching' then raise exception 'This request already has a driver'; end if;
  if o.status <> 'pending' then raise exception 'This offer is no longer available'; end if;
  if public.driver_busy(o.driver_id) then raise exception 'This driver just took another trip. Choose another offer.'; end if;

  update public.rides set driver_id = o.driver_id, final_fare = o.amount, status = 'accepted',
    accepted_at = now(), updated_at = now() where id = r.id returning * into r;
  update public.ride_offers set status = case when id = o.id then 'accepted' else 'rejected' end
    where ride_id = r.id and status = 'pending';
  return r;
end $$;

-- Patient raises or lowers their offer while searching
create or replace function public.update_offer_fare(p_ride_id uuid, p_amount int)
returns public.rides language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null or r.patient_id <> auth.uid() then raise exception 'Trip not found'; end if;
  if r.status <> 'searching' then raise exception 'A driver has already accepted this trip'; end if;
  if p_amount < ceil(r.suggested_fare * 0.7) or p_amount > r.suggested_fare * 3 then
    raise exception 'Offer must be between ৳% and ৳%', ceil(r.suggested_fare * 0.7)::int, r.suggested_fare * 3;
  end if;
  update public.rides set offered_fare = p_amount, updated_at = now() where id = r.id returning * into r;
  return r;
end $$;

-- Driver moves the trip forward: accepted → arrived → picked_up → completed
create or replace function public.advance_ride(p_ride_id uuid, p_status text)
returns public.rides language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null or r.driver_id is distinct from auth.uid() then raise exception 'Trip not found'; end if;
  if not ((r.status = 'accepted' and p_status = 'arrived')
       or (r.status in ('accepted', 'arrived') and p_status = 'picked_up')
       or (r.status = 'picked_up' and p_status = 'completed')) then
    raise exception 'Cannot change trip from % to %', r.status, p_status;
  end if;
  update public.rides set status = p_status, updated_at = now(),
    arrived_at   = case when p_status = 'arrived'   then now() else arrived_at end,
    picked_up_at = case when p_status = 'picked_up' then now() else picked_up_at end,
    completed_at = case when p_status = 'completed' then now() else completed_at end
  where id = r.id returning * into r;
  if p_status = 'completed' then
    update public.drivers set trips_count = trips_count + 1 where id = r.driver_id;
  end if;
  return r;
end $$;

-- Patient cancels (trip ends) or driver cancels (trip goes back to searching)
create or replace function public.cancel_ride(p_ride_id uuid, p_reason text default null)
returns public.rides language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null then raise exception 'Trip not found'; end if;
  if r.patient_id = auth.uid() then
    if r.status not in ('searching', 'accepted', 'arrived') then raise exception 'This trip can no longer be cancelled'; end if;
    update public.rides set status = 'cancelled', cancel_reason = p_reason, cancelled_by = auth.uid(), updated_at = now()
      where id = r.id returning * into r;
    update public.ride_offers set status = 'rejected' where ride_id = r.id and status = 'pending';
  elsif r.driver_id = auth.uid() then
    if r.status not in ('accepted', 'arrived') then raise exception 'This trip can no longer be cancelled'; end if;
    update public.ride_offers set status = 'withdrawn' where ride_id = r.id and driver_id = auth.uid();
    update public.rides set status = 'searching', driver_id = null, final_fare = null, accepted_at = null,
      arrived_at = null, target_driver_id = null, cancel_reason = coalesce(p_reason, 'Driver cancelled'), updated_at = now()
      where id = r.id returning * into r;
  else
    raise exception 'Trip not found';
  end if;
  return r;
end $$;

-- Patient picks how they paid (cash / bKash / Nagad with transaction ID)
create or replace function public.set_payment(p_ride_id uuid, p_method text, p_trx_id text default null)
returns public.rides language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null or r.patient_id <> auth.uid() then raise exception 'Trip not found'; end if;
  if r.status <> 'completed' then raise exception 'You can pay after the drop-off'; end if;
  if r.payment_status = 'paid' then raise exception 'This trip is already paid'; end if;
  if p_method not in ('cash', 'bkash', 'nagad') then raise exception 'Choose cash, bKash or Nagad'; end if;
  if p_method <> 'cash' and coalesce(trim(p_trx_id), '') = '' then raise exception 'Enter the transaction ID from your % app', p_method; end if;

  update public.payments set status = 'failed' where ride_id = r.id and status = 'pending';
  insert into public.payments (ride_id, payer_id, method, amount, trx_id, status)
    values (r.id, auth.uid(), p_method, coalesce(r.final_fare, r.offered_fare), nullif(trim(p_trx_id), ''), 'pending');
  update public.rides set payment_method = p_method, payment_status = 'pending', updated_at = now()
    where id = r.id returning * into r;
  return r;
end $$;

-- Driver (or admin) confirms money was received
create or replace function public.confirm_payment(p_ride_id uuid)
returns public.rides language plpgsql security definer set search_path = public as $$
declare r public.rides;
begin
  select * into r from public.rides where id = p_ride_id for update;
  if r.id is null or not (r.driver_id = auth.uid() or public.is_admin()) then raise exception 'Trip not found'; end if;
  if r.status <> 'completed' then raise exception 'Complete the drop-off first'; end if;
  if not exists (select 1 from public.payments where ride_id = r.id and status = 'pending') then
    insert into public.payments (ride_id, payer_id, method, amount, status)
      values (r.id, r.patient_id, r.payment_method, coalesce(r.final_fare, r.offered_fare), 'pending');
  end if;
  update public.payments set status = 'paid' where ride_id = r.id and status = 'pending';
  update public.rides set payment_status = 'paid', updated_at = now() where id = r.id returning * into r;
  return r;
end $$;

-- Rate the other person on a completed trip
create or replace function public.rate_ride(p_ride_id uuid, p_stars int, p_tags text[] default '{}', p_comment text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.rides; v_ratee uuid;
begin
  select * into r from public.rides where id = p_ride_id;
  if r.id is null or r.status <> 'completed' then raise exception 'You can rate after the trip is completed'; end if;
  if r.patient_id = auth.uid() then v_ratee := r.driver_id;
  elsif r.driver_id = auth.uid() then v_ratee := r.patient_id;
  else raise exception 'Trip not found'; end if;
  if v_ratee is null then return; end if;

  insert into public.ratings (ride_id, rater_id, ratee_id, stars, tags, comment)
    values (r.id, auth.uid(), v_ratee, greatest(1, least(5, p_stars)), coalesce(p_tags, '{}'), p_comment)
    on conflict (ride_id, rater_id) do update set stars = excluded.stars, tags = excluded.tags, comment = excluded.comment;

  if v_ratee = r.driver_id then
    update public.drivers d set
      rating = coalesce((select round(avg(stars)::numeric, 2) from public.ratings where ratee_id = d.id), 5),
      rating_count = (select count(*) from public.ratings where ratee_id = d.id)
    where d.id = v_ratee;
  end if;
end $$;

-- Admin: approve / reject / suspend a driver
create or replace function public.admin_set_driver_status(p_driver uuid, p_status text, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.drivers set status = p_status, rejection_reason = p_reason,
    is_online = case when p_status = 'approved' then is_online else false end
  where id = p_driver;
end $$;

-- Only signed-in users may call trip functions
do $$
declare f text;
begin
  foreach f in array array[
    'nearby_drivers(float8,float8,float8,text)', 'open_requests(float8)', 'driver_respond(uuid,int,int)',
    'driver_decline(uuid)', 'accept_offer(uuid)', 'update_offer_fare(uuid,int)', 'advance_ride(uuid,text)',
    'cancel_ride(uuid,text)', 'set_payment(uuid,text,text)', 'confirm_payment(uuid)',
    'rate_ride(uuid,int,text[],text)', 'admin_set_driver_status(uuid,text,text)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Realtime (live trip status, offers, chat, ambulance locations)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['rides', 'ride_offers', 'messages', 'drivers'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage buckets: avatars (public photos) and driver-docs (private documents)
-- Files are stored under a folder named after the user id: <uid>/file.jpg
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('driver-docs', 'driver-docs', false) on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars own write" on storage.objects;
create policy "avatars own write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars own update" on storage.objects;
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "docs own write" on storage.objects;
create policy "docs own write" on storage.objects for insert to authenticated
  with check (bucket_id = 'driver-docs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "docs own or admin read" on storage.objects;
create policy "docs own or admin read" on storage.objects for select to authenticated
  using (bucket_id = 'driver-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
