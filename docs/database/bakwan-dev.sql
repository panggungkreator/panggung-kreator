-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.members (
  id uuid NOT NULL,
  full_name text NOT NULL,
  stage_name text NOT NULL,
  whatsapp_number text NOT NULL UNIQUE,
  email text,
  instagram_username text NOT NULL,
  occupation text NOT NULL,
  referral_source text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'inactive'::text])),
  qr_token uuid DEFAULT uuid_generate_v4() UNIQUE,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'admin'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  description text,
  tiktok_username text,
  payment_status text DEFAULT 'pending'::text,
  payment_order_id text,
  username text UNIQUE,
  temporary_password text,
  used_voucher_code character varying,
  final_price integer DEFAULT 49000,
  unique_code integer DEFAULT 0,
  package_id uuid,
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id),
  CONSTRAINT members_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.members(id)
);
CREATE TABLE public.attendances (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  member_id uuid NOT NULL,
  is_present boolean DEFAULT false,
  scan_method text CHECK (scan_method = ANY (ARRAY['qr'::text, 'manual'::text, 'rsvp_only'::text])),
  scanned_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT attendances_pkey PRIMARY KEY (id),
  CONSTRAINT attendances_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT attendances_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  is_published boolean DEFAULT false,
  target_audience text DEFAULT 'all'::text CHECK (target_audience = ANY (ARRAY['all'::text, 'active'::text])),
  publish_at timestamp with time zone,
  expired_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vouchers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  discount_type character varying NOT NULL DEFAULT 'nominal'::character varying,
  discount_value numeric NOT NULL,
  max_uses integer DEFAULT 0,
  current_uses integer DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vouchers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.landing_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_type text NOT NULL UNIQUE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean DEFAULT true,
  section_order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT landing_sections_pkey PRIMARY KEY (id)
);
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subtitle text,
  price text NOT NULL,
  original_price text,
  is_highlighted boolean DEFAULT false,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_text text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  is_default boolean NOT NULL DEFAULT false,
  CONSTRAINT packages_pkey PRIMARY KEY (id)
);