


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_email_by_username"("p_username" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.members WHERE username = p_username LIMIT 1;
  RETURN v_email;
END;
$$;


ALTER FUNCTION "public"."get_email_by_username"("p_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_member_tier"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT membership_tier FROM public.members WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."get_member_tier"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_privilege"("user_id" "uuid", "page_slug" "text", "action_slug" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- If user is Super Admin (color = slate), they bypass all checks and have all privileges
  IF EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE member_id = user_id AND color = 'slate' AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;

  -- Otherwise, check granular permissions
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    JOIN public.admin_role_permissions arp ON arp.admin_role_id = ar.id
    JOIN public.privilege_items pi ON arp.privilege_item_id = pi.id
    JOIN public.privilege_actions pa ON arp.action_id = pa.id
    WHERE ar.member_id = user_id
      AND ar.status = 'active'
      AND pi.slug = page_slug
      AND pa.slug = action_slug
  );
END;
$$;


ALTER FUNCTION "public"."has_privilege"("user_id" "uuid", "page_slug" "text", "action_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_akademi"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
      AND admin_role IN ('super_admin', 'admin_akademi')
  );
$$;


ALTER FUNCTION "public"."is_admin_akademi"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_komunitas"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
      AND admin_role IN ('super_admin', 'admin_komunitas')
  );
$$;


ALTER FUNCTION "public"."is_admin_komunitas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND admin_role = 'super_admin'
  );
$$;


ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."use_referral_code"("p_code" "text", "p_member_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_referral_id UUID;
  v_owner_id    UUID;
BEGIN
  SELECT id, owner_member_id INTO v_referral_id, v_owner_id
  FROM public.referral_codes WHERE code = p_code AND is_active = true;

  IF v_referral_id IS NULL THEN RETURN NULL; END IF;

  -- Tambah usage count di referral_codes
  UPDATE public.referral_codes
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = v_referral_id;

  -- Tandai member ini direferral oleh siapa
  UPDATE public.members
  SET referred_by_member_id = v_owner_id WHERE id = p_member_id;

  RETURN v_owner_id;
END;
$$;


ALTER FUNCTION "public"."use_referral_code"("p_code" "text", "p_member_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "module" "text",
    "target_id" "uuid",
    "description" "text",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "ip_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_role_id" "uuid" NOT NULL,
    "privilege_item_id" "uuid" NOT NULL,
    "action_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "label" "text",
    "color" "text" DEFAULT 'slate'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "color_code" "text",
    CONSTRAINT "admin_roles_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'revoked'::"text"])))
);


ALTER TABLE "public"."admin_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "is_present" boolean DEFAULT false,
    "scan_method" "text",
    "scanned_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."attendances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "event_type" "text" DEFAULT 'open_mic'::"text",
    "event_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone,
    "location" "text" NOT NULL,
    "capacity" integer DEFAULT 0 NOT NULL,
    "is_published" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "events_event_type_check" CHECK (("event_type" = ANY (ARRAY['open_mic'::"text", 'sharing_session'::"text", 'networking'::"text", 'level_up'::"text", 'lainnya'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text" DEFAULT 'open-mic'::"text" NOT NULL,
    "event_date" "date" NOT NULL,
    "hero_image_url" "text",
    "album_link" "text",
    "description" "text",
    "is_published" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gallery_albums" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "description" "text",
    "photo_url" "text" NOT NULL,
    "event_id" "uuid",
    "category" "text" DEFAULT 'kegiatan'::"text",
    "taken_at" "date",
    "is_featured" boolean DEFAULT false,
    "is_published" boolean DEFAULT true,
    "order_index" integer DEFAULT 0,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gallery_items_category_check" CHECK (("category" = ANY (ARRAY['kegiatan'::"text", 'open_mic'::"text", 'sharing_session'::"text", 'networking'::"text", 'behind_scene'::"text", 'lainnya'::"text"])))
);


ALTER TABLE "public"."gallery_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."landing_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "section_type" "text" NOT NULL,
    "site" "text" DEFAULT 'akademi'::"text" NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_visible" boolean DEFAULT true,
    "section_order" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "landing_sections_site_check" CHECK (("site" = ANY (ARRAY['akademi'::"text", 'komunitas'::"text"])))
);


ALTER TABLE "public"."landing_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "mime_type" "text",
    "file_size_kb" integer,
    "width" integer,
    "height" integer,
    "alt_text" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "media_library_file_type_check" CHECK (("file_type" = ANY (ARRAY['image'::"text", 'video'::"text", 'document'::"text"])))
);


ALTER TABLE "public"."media_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "stage_name" "text" NOT NULL,
    "whatsapp_number" "text" NOT NULL,
    "email" "text",
    "instagram_username" "text" NOT NULL,
    "occupation" "text" NOT NULL,
    "referral_source" "text",
    "qr_token" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "role" "text" DEFAULT 'member'::"text",
    "membership_tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "package_id" "uuid",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "payment_order_id" "text",
    "username" "text",
    "used_voucher_code" character varying(50),
    "final_price" integer DEFAULT 49000,
    "tiktok_username" "text",
    "description" "text",
    "my_referral_code" "text",
    "referred_by_member_id" "uuid",
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "community" "text" DEFAULT 'panggung_kreator'::"text",
    "tier_changed_at" timestamp with time zone,
    "tier_changed_by" "uuid",
    "tier_note" "text",
    CONSTRAINT "members_membership_tier_check" CHECK (("membership_tier" = ANY (ARRAY['free'::"text", 'regular'::"text", 'mvp'::"text"])))
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentoring_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "mentor_id" "uuid",
    "package_id" "uuid",
    "session_date" "date" NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "platform" "text" DEFAULT 'zoom'::"text",
    "meeting_link" "text",
    "location" "text",
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "session_number" integer DEFAULT 1,
    "notes" "text",
    "member_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "mentoring_sessions_platform_check" CHECK (("platform" = ANY (ARRAY['zoom'::"text", 'gmeet'::"text", 'offline'::"text"]))),
    CONSTRAINT "mentoring_sessions_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text", 'rescheduled'::"text"])))
);


ALTER TABLE "public"."mentoring_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subtitle" "text",
    "price" "text" NOT NULL,
    "original_price" "text",
    "is_highlighted" boolean DEFAULT false,
    "benefits" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "cta_text" "text" NOT NULL,
    "order_index" integer DEFAULT 0,
    "is_default" boolean DEFAULT false NOT NULL,
    "tier" "text" DEFAULT 'regular'::"text" NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "packages_tier_check" CHECK (("tier" = ANY (ARRAY['regular'::"text", 'mvp'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."packages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "logo_url" "text",
    "website_url" "text",
    "instagram_url" "text",
    "contact_person" "text",
    "contact_wa" "text",
    "description" "text",
    "partnership_since" "date",
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "partners_type_check" CHECK (("type" = ANY (ARRAY['kafe'::"text", 'kampus'::"text", 'brand'::"text", 'media'::"text", 'sponsor'::"text", 'lainnya'::"text"])))
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."privilege_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."privilege_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."privilege_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text",
    "icon" "text",
    "status" "text" DEFAULT 'active'::"text",
    CONSTRAINT "privilege_groups_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."privilege_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."privilege_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid",
    "name" "text" NOT NULL,
    "href" "text" NOT NULL,
    "icon_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "available_actions" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    CONSTRAINT "privilege_items_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."privilege_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."referral_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "owner_member_id" "uuid" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "usage_count" integer DEFAULT 0 NOT NULL,
    "total_revenue" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."referral_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "file_url" "text" NOT NULL,
    "file_type" "text" NOT NULL,
    "file_size_kb" integer,
    "package_tier" "text" DEFAULT 'regular'::"text" NOT NULL,
    "category" "text",
    "is_published" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "resources_category_check" CHECK (("category" = ANY (ARRAY['materi'::"text", 'referensi'::"text", 'template'::"text", 'rekaman'::"text", 'lainnya'::"text"]))),
    CONSTRAINT "resources_file_type_check" CHECK (("file_type" = ANY (ARRAY['pdf'::"text", 'youtube'::"text", 'image'::"text", 'link'::"text", 'doc'::"text"]))),
    CONSTRAINT "resources_package_tier_check" CHECK (("package_tier" = ANY (ARRAY['regular'::"text", 'mvp'::"text", 'all'::"text"])))
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "role_title" "text" NOT NULL,
    "bio" "text",
    "photo_url" "text",
    "instagram_url" "text",
    "linkedin_url" "text",
    "is_founder" boolean DEFAULT false,
    "is_published" boolean DEFAULT true,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid",
    "display_name" "text" NOT NULL,
    "photo_url" "text",
    "role_label" "text",
    "quote" "text" NOT NULL,
    "result_highlight" "text",
    "site" "text" DEFAULT 'komunitas'::"text" NOT NULL,
    "is_featured" boolean DEFAULT false,
    "is_published" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "testimonials_site_check" CHECK (("site" = ANY (ARRAY['komunitas'::"text", 'akademi'::"text"])))
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "package_id" "uuid",
    "voucher_id" "uuid",
    "referral_code" "text",
    "referred_by_id" "uuid",
    "order_id" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "gross_amount" integer NOT NULL,
    "final_amount" integer NOT NULL,
    "discount_amount" integer DEFAULT 0 NOT NULL,
    "unique_code" integer DEFAULT 0 NOT NULL,
    "payment_method" "text",
    "paid_at" timestamp with time zone,
    "expired_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'expired'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "city" "text" DEFAULT 'Bandung'::"text" NOT NULL,
    "description" "text",
    "capacity" integer,
    "contact_wa" "text",
    "contact_name" "text",
    "maps_url" "text",
    "photo_urls" "jsonb" DEFAULT '[]'::"jsonb",
    "amenities" "jsonb" DEFAULT '[]'::"jsonb",
    "pros" "jsonb" DEFAULT '[]'::"jsonb",
    "cons" "jsonb" DEFAULT '[]'::"jsonb",
    "last_used_at" "date",
    "internal_notes" "text",
    "is_recommended" boolean DEFAULT false,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."venues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vouchers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "code" character varying(50) NOT NULL,
    "discount_type" character varying(20) DEFAULT 'nominal'::character varying NOT NULL,
    "discount_value" numeric NOT NULL,
    "max_uses" integer DEFAULT 0,
    "current_uses" integer DEFAULT 0,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vouchers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wa_group_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "group_key" "text" NOT NULL,
    "group_name" "text" NOT NULL,
    "wa_group_link" "text",
    "assigned_by" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    CONSTRAINT "wa_group_assignments_group_key_check" CHECK (("group_key" = ANY (ARRAY['btb'::"text", 'general'::"text", 'priority'::"text", 'membership'::"text"])))
);


ALTER TABLE "public"."wa_group_assignments" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_activity_logs"
    ADD CONSTRAINT "admin_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_admin_role_id_privilege_item_id_acti_key" UNIQUE ("admin_role_id", "privilege_item_id", "action_id");



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_member_id_key" UNIQUE ("member_id");



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privilege_groups"
    ADD CONSTRAINT "admin_sidebar_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privilege_groups"
    ADD CONSTRAINT "admin_sidebar_groups_title_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."privilege_items"
    ADD CONSTRAINT "admin_sidebar_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_event_id_member_id_key" UNIQUE ("event_id", "member_id");



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_albums"
    ADD CONSTRAINT "gallery_albums_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_albums"
    ADD CONSTRAINT "gallery_albums_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."landing_sections"
    ADD CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."landing_sections"
    ADD CONSTRAINT "landing_sections_site_section_type_key" UNIQUE ("site", "section_type");



ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_my_referral_code_key" UNIQUE ("my_referral_code");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_qr_token_key" UNIQUE ("qr_token");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_whatsapp_number_key" UNIQUE ("whatsapp_number");



ALTER TABLE ONLY "public"."mentoring_sessions"
    ADD CONSTRAINT "mentoring_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packages"
    ADD CONSTRAINT "packages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privilege_actions"
    ADD CONSTRAINT "privilege_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privilege_actions"
    ADD CONSTRAINT "privilege_actions_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."privilege_groups"
    ADD CONSTRAINT "privilege_groups_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_order_id_key" UNIQUE ("order_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vouchers"
    ADD CONSTRAINT "vouchers_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."vouchers"
    ADD CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wa_group_assignments"
    ADD CONSTRAINT "wa_group_assignments_member_id_group_key_key" UNIQUE ("member_id", "group_key");



ALTER TABLE ONLY "public"."wa_group_assignments"
    ADD CONSTRAINT "wa_group_assignments_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "admin_roles_color_unique_active" ON "public"."admin_roles" USING "btree" ("color") WHERE ("status" <> 'revoked'::"text");



CREATE INDEX "idx_gallery_albums_category" ON "public"."gallery_albums" USING "btree" ("category", "is_published");



CREATE INDEX "idx_gallery_albums_published" ON "public"."gallery_albums" USING "btree" ("is_published", "event_date" DESC);



CREATE INDEX "idx_gallery_category" ON "public"."gallery_items" USING "btree" ("category");



CREATE INDEX "idx_gallery_featured" ON "public"."gallery_items" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_logs_admin_id" ON "public"."admin_activity_logs" USING "btree" ("admin_id");



CREATE INDEX "idx_logs_created_at" ON "public"."admin_activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_mentoring_date" ON "public"."mentoring_sessions" USING "btree" ("session_date");



CREATE INDEX "idx_mentoring_member" ON "public"."mentoring_sessions" USING "btree" ("member_id");



CREATE INDEX "idx_referral_code" ON "public"."referral_codes" USING "btree" ("code");



CREATE INDEX "idx_referral_owner" ON "public"."referral_codes" USING "btree" ("owner_member_id");



CREATE INDEX "idx_transactions_created_at" ON "public"."transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_transactions_member_id" ON "public"."transactions" USING "btree" ("member_id");



CREATE INDEX "idx_transactions_referral" ON "public"."transactions" USING "btree" ("referred_by_id") WHERE ("referred_by_id" IS NOT NULL);



CREATE INDEX "idx_transactions_status" ON "public"."transactions" USING "btree" ("status");



CREATE INDEX "idx_wa_member" ON "public"."wa_group_assignments" USING "btree" ("member_id");



CREATE OR REPLACE TRIGGER "update_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_members_updated_at" BEFORE UPDATE ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_mentoring_updated_at" BEFORE UPDATE ON "public"."mentoring_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_referral_codes_updated_at" BEFORE UPDATE ON "public"."referral_codes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_resources_updated_at" BEFORE UPDATE ON "public"."resources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_team_members_updated_at" BEFORE UPDATE ON "public"."team_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transactions_updated_at" BEFORE UPDATE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_venues_updated_at" BEFORE UPDATE ON "public"."venues" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_activity_logs"
    ADD CONSTRAINT "admin_activity_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."privilege_actions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_admin_role_id_fkey" FOREIGN KEY ("admin_role_id") REFERENCES "public"."admin_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_role_permissions"
    ADD CONSTRAINT "admin_role_permissions_privilege_item_id_fkey" FOREIGN KEY ("privilege_item_id") REFERENCES "public"."privilege_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_roles"
    ADD CONSTRAINT "admin_roles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "gallery_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gallery_items"
    ADD CONSTRAINT "gallery_items_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."media_library"
    ADD CONSTRAINT "media_library_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_referred_by_member_id_fkey" FOREIGN KEY ("referred_by_member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mentoring_sessions"
    ADD CONSTRAINT "mentoring_sessions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mentoring_sessions"
    ADD CONSTRAINT "mentoring_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mentoring_sessions"
    ADD CONSTRAINT "mentoring_sessions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."privilege_items"
    ADD CONSTRAINT "privilege_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."privilege_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_owner_member_id_fkey" FOREIGN KEY ("owner_member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wa_group_assignments"
    ADD CONSTRAINT "wa_group_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."wa_group_assignments"
    ADD CONSTRAINT "wa_group_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can insert logs" ON "public"."admin_activity_logs" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage all transactions" ON "public"."transactions" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage attendance" ON "public"."attendances" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage events" ON "public"."events" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage gallery" ON "public"."gallery_items" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage media library" ON "public"."media_library" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage mentoring sessions" ON "public"."mentoring_sessions" TO "authenticated" USING ("public"."has_privilege"("auth"."uid"(), 'mentoring'::"text", 'view'::"text")) WITH CHECK ("public"."has_privilege"("auth"."uid"(), 'mentoring'::"text", 'edit'::"text"));



CREATE POLICY "Admins can manage packages" ON "public"."packages" TO "authenticated" USING ("public"."has_privilege"("auth"."uid"(), 'packages'::"text", 'view'::"text")) WITH CHECK ("public"."has_privilege"("auth"."uid"(), 'packages'::"text", 'edit'::"text"));



CREATE POLICY "Admins can manage partners" ON "public"."partners" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage referral codes" ON "public"."referral_codes" TO "authenticated" USING ("public"."has_privilege"("auth"."uid"(), 'system'::"text", 'view'::"text")) WITH CHECK ("public"."has_privilege"("auth"."uid"(), 'system'::"text", 'edit'::"text"));



CREATE POLICY "Admins can manage resources" ON "public"."resources" TO "authenticated" USING ("public"."has_privilege"("auth"."uid"(), 'resources'::"text", 'view'::"text")) WITH CHECK ("public"."has_privilege"("auth"."uid"(), 'resources'::"text", 'edit'::"text"));



CREATE POLICY "Admins can manage team members" ON "public"."team_members" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage testimonials" ON "public"."testimonials" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage venues" ON "public"."venues" USING ("public"."is_admin"());



CREATE POLICY "Admins can manage wa group assignments" ON "public"."wa_group_assignments" USING ("public"."is_admin"());



CREATE POLICY "Admins can read activity logs" ON "public"."admin_activity_logs" FOR SELECT TO "authenticated" USING ("public"."has_privilege"("auth"."uid"(), 'system'::"text", 'view'::"text"));



CREATE POLICY "Admins can read all members" ON "public"."members" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can update all members" ON "public"."members" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can write landing sections" ON "public"."landing_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "auth"."uid"()) AND ("members"."role" = 'admin'::"text")))));



CREATE POLICY "Allow read for authenticated users" ON "public"."privilege_groups" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read for authenticated users" ON "public"."privilege_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow write for authenticated users" ON "public"."privilege_groups" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow write for authenticated users" ON "public"."privilege_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can read vouchers" ON "public"."vouchers" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can manage albums" ON "public"."gallery_albums" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Members can read resources by tier" ON "public"."resources" FOR SELECT USING ((("is_published" = true) AND (EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."id" = "auth"."uid"()) AND (("resources"."package_tier" = 'all'::"text") OR (("resources"."package_tier" = 'regular'::"text") AND ("m"."membership_tier" = ANY (ARRAY['regular'::"text", 'mvp'::"text"]))) OR (("resources"."package_tier" = 'mvp'::"text") AND ("m"."membership_tier" = 'mvp'::"text"))))))));



CREATE POLICY "Members can view own attendance" ON "public"."attendances" FOR SELECT USING (("member_id" = "auth"."uid"()));



CREATE POLICY "Members can view own sessions" ON "public"."mentoring_sessions" FOR SELECT USING ((("member_id" = "auth"."uid"()) OR ("mentor_id" = "auth"."uid"())));



CREATE POLICY "Members can view own wa group assignments" ON "public"."wa_group_assignments" FOR SELECT USING (("member_id" = "auth"."uid"()));



CREATE POLICY "Owner can view own referral codes" ON "public"."referral_codes" FOR SELECT USING (("owner_member_id" = "auth"."uid"()));



CREATE POLICY "Public can read active partners" ON "public"."partners" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can read landing sections" ON "public"."landing_sections" FOR SELECT USING (true);



CREATE POLICY "Public can read packages" ON "public"."packages" FOR SELECT USING (true);



CREATE POLICY "Public can read published albums" ON "public"."gallery_albums" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can read published events" ON "public"."events" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can read published gallery" ON "public"."gallery_items" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can read published team members" ON "public"."team_members" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can read published testimonials" ON "public"."testimonials" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Public can validate active referral codes" ON "public"."referral_codes" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Service role can insert transactions" ON "public"."transactions" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role manages vouchers" ON "public"."vouchers" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can insert own data" ON "public"."members" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read own data" ON "public"."members" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own data" ON "public"."members" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."admin_activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_albums" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."landing_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_library" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentoring_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."packages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."privilege_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."privilege_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."privilege_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vouchers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wa_group_assignments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."admin_roles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_email_by_username"("p_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_email_by_username"("p_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_email_by_username"("p_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_member_tier"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_member_tier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_member_tier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_privilege"("user_id" "uuid", "page_slug" "text", "action_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_privilege"("user_id" "uuid", "page_slug" "text", "action_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_privilege"("user_id" "uuid", "page_slug" "text", "action_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_akademi"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_akademi"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_akademi"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_komunitas"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_komunitas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_komunitas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."use_referral_code"("p_code" "text", "p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."use_referral_code"("p_code" "text", "p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."use_referral_code"("p_code" "text", "p_member_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."admin_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."admin_role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_roles" TO "anon";
GRANT ALL ON TABLE "public"."admin_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_roles" TO "service_role";



GRANT ALL ON TABLE "public"."attendances" TO "anon";
GRANT ALL ON TABLE "public"."attendances" TO "authenticated";
GRANT ALL ON TABLE "public"."attendances" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_albums" TO "anon";
GRANT ALL ON TABLE "public"."gallery_albums" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_albums" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_items" TO "anon";
GRANT ALL ON TABLE "public"."gallery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_items" TO "service_role";



GRANT ALL ON TABLE "public"."landing_sections" TO "anon";
GRANT ALL ON TABLE "public"."landing_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."landing_sections" TO "service_role";



GRANT ALL ON TABLE "public"."media_library" TO "anon";
GRANT ALL ON TABLE "public"."media_library" TO "authenticated";
GRANT ALL ON TABLE "public"."media_library" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."mentoring_sessions" TO "anon";
GRANT ALL ON TABLE "public"."mentoring_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."mentoring_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."packages" TO "anon";
GRANT ALL ON TABLE "public"."packages" TO "authenticated";
GRANT ALL ON TABLE "public"."packages" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."privilege_actions" TO "anon";
GRANT ALL ON TABLE "public"."privilege_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."privilege_actions" TO "service_role";



GRANT ALL ON TABLE "public"."privilege_groups" TO "anon";
GRANT ALL ON TABLE "public"."privilege_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."privilege_groups" TO "service_role";



GRANT ALL ON TABLE "public"."privilege_items" TO "anon";
GRANT ALL ON TABLE "public"."privilege_items" TO "authenticated";
GRANT ALL ON TABLE "public"."privilege_items" TO "service_role";



GRANT ALL ON TABLE "public"."referral_codes" TO "anon";
GRANT ALL ON TABLE "public"."referral_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_codes" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."venues" TO "anon";
GRANT ALL ON TABLE "public"."venues" TO "authenticated";
GRANT ALL ON TABLE "public"."venues" TO "service_role";



GRANT ALL ON TABLE "public"."vouchers" TO "anon";
GRANT ALL ON TABLE "public"."vouchers" TO "authenticated";
GRANT ALL ON TABLE "public"."vouchers" TO "service_role";



GRANT ALL ON TABLE "public"."wa_group_assignments" TO "anon";
GRANT ALL ON TABLE "public"."wa_group_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."wa_group_assignments" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Auth delete gallery"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'gallery'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth delete partners"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'partners'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth delete resources"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'resources'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth delete venues"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'venues'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth update gallery"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'gallery'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth update partners"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'partners'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth update resources"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'resources'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth update venues"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'venues'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth upload gallery"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'gallery'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth upload partners"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'partners'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth upload resources"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'resources'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Auth upload venues"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'venues'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Public read gallery"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'gallery'::text));



  create policy "Public read partners"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'partners'::text));



  create policy "Public read resources"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'resources'::text));



  create policy "Public read venues"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'venues'::text));



