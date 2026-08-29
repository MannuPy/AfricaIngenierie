import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('administrator', 'publisher', 'editor');
  CREATE TYPE "public"."enum_users_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_pages_page_key" AS ENUM('expertises', 'realisations', 'projets', 'formations-evenements', 'evenements', 'produits', 'a-propos', 'contact');
  CREATE TYPE "public"."enum_pages_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_page_key" AS ENUM('expertises', 'realisations', 'projets', 'formations-evenements', 'evenements', 'produits', 'a-propos', 'contact');
  CREATE TYPE "public"."enum__pages_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_expertises_icon_key" AS ENUM('wrench', 'install', 'grad', 'box', 'weld', 'bolt', 'target', 'globe', 'layers');
  CREATE TYPE "public"."enum_expertises_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_expertises_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertises_v_version_icon_key" AS ENUM('wrench', 'install', 'grad', 'box', 'weld', 'bolt', 'target', 'globe', 'layers');
  CREATE TYPE "public"."enum__expertises_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__expertises_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertises_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_projects_project_state" AS ENUM('planned', 'ongoing', 'done');
  CREATE TYPE "public"."enum_projects_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_project_state" AS ENUM('planned', 'ongoing', 'done');
  CREATE TYPE "public"."enum__projects_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_realisations_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_realisations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realisations_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__realisations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realisations_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_formations_theme" AS ENUM('maintenance', 'securite', 'leadership', 'innovation');
  CREATE TYPE "public"."enum_formations_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_formations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__formations_v_version_theme" AS ENUM('maintenance', 'securite', 'leadership', 'innovation');
  CREATE TYPE "public"."enum__formations_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__formations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__formations_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_formation_sessions_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_events_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_products_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_team_members_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_partners_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__partners_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__partners_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_testimonials_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_legal_documents_document_key" AS ENUM('legal_notice', 'privacy_policy');
  CREATE TYPE "public"."enum_legal_documents_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum_legal_documents_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_documents_v_version_document_key" AS ENUM('legal_notice', 'privacy_policy');
  CREATE TYPE "public"."enum__legal_documents_v_version_editorial_status" AS ENUM('draft', 'review', 'published', 'archived');
  CREATE TYPE "public"."enum__legal_documents_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__legal_documents_v_published_locale" AS ENUM('fr', 'en');
  CREATE TYPE "public"."enum_contact_messages_state" AS ENUM('new', 'in_progress', 'replied', 'closed', 'redacted');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '308');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('create', 'update', 'publish', 'unpublish', 'archive', 'delete', 'login', 'logout', 'settings_change');
  CREATE TYPE "public"."enum_site_settings_social_links_network" AS ENUM('li', 'fb', 'yt');
  CREATE TYPE "public"."enum_navigation_main_menu_section" AS ENUM('home', 'expertises', 'realisations', 'projets', 'formationsEvenements', 'evenements', 'produits', 'aPropos', 'contact');
  CREATE TYPE "public"."enum_homepage_sections_key" AS ENUM('trust', 'about', 'expertises', 'products', 'figures', 'realisations', 'trainingEvents', 'leadership', 'testimonials', 'cta');
  CREATE TYPE "public"."enum__homepage_v_version_sections_key" AS ENUM('trust', 'about', 'expertises', 'products', 'figures', 'realisations', 'trainingEvents', 'leadership', 'testimonials', 'cta');
  CREATE TYPE "public"."enum_about_page_pillars_icon" AS ENUM('target', 'globe', 'layers', 'shield', 'grad', 'bolt');
  CREATE TYPE "public"."enum__about_page_v_version_pillars_icon" AS ENUM('target', 'globe', 'layers', 'shield', 'grad', 'bolt');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"must_change_password" boolean DEFAULT true,
  	"locale" "enum_users_locale" DEFAULT 'fr',
  	"last_login_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt_fr" varchar NOT NULL,
  	"alt_en" varchar,
  	"rights_note" varchar,
  	"is_demo" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_assets_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page_key" "enum_pages_page_key",
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_pages_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"empty_state_title" varchar,
  	"empty_state_text" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_page_key" "enum__pages_v_version_page_key",
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__pages_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_empty_state_title" varchar,
  	"version_empty_state_text" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "expertises_service_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "expertises" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"icon_key" "enum_expertises_icon_key",
  	"media_id" integer,
  	"position" numeric DEFAULT 0,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_expertises_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_expertises_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "expertises_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"body" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_expertises_v_version_service_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertises_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_icon_key" "enum__expertises_v_version_icon_key",
  	"version_media_id" integer,
  	"version_position" numeric DEFAULT 0,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__expertises_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__expertises_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__expertises_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_expertises_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"project_state" "enum_projects_project_state" DEFAULT 'planned',
  	"client_name" varchar,
  	"country" varchar,
  	"start_date" timestamp(3) with time zone,
  	"expertise_id" integer,
  	"media_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_projects_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"body" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_project_state" "enum__projects_v_version_project_state" DEFAULT 'planned',
  	"version_client_name" varchar,
  	"version_country" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_expertise_id" integer,
  	"version_media_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__projects_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "realisations_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "realisations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"client_name" varchar,
  	"year" numeric,
  	"country" varchar,
  	"expertise_id" integer,
  	"before_media_id" integer,
  	"after_media_id" integer,
  	"is_featured" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_realisations_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_realisations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "realisations_locales" (
  	"title" varchar,
  	"sector" varchar,
  	"summary" varchar,
  	"context" varchar,
  	"solution" varchar,
  	"results" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_realisations_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_realisations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_client_name" varchar,
  	"version_year" numeric,
  	"version_country" varchar,
  	"version_expertise_id" integer,
  	"version_before_media_id" integer,
  	"version_after_media_id" integer,
  	"version_is_featured" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__realisations_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__realisations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__realisations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_realisations_v_locales" (
  	"version_title" varchar,
  	"version_sector" varchar,
  	"version_summary" varchar,
  	"version_context" varchar,
  	"version_solution" varchar,
  	"version_results" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "formations_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "formations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"theme" "enum_formations_theme",
  	"media_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_formations_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_formations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "formations_locales" (
  	"title" varchar,
  	"duration" varchar,
  	"format" varchar,
  	"summary" varchar,
  	"audience" varchar,
  	"prerequisites" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_formations_v_version_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_formations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_theme" "enum__formations_v_version_theme",
  	"version_media_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__formations_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__formations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__formations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_formations_v_locales" (
  	"version_title" varchar,
  	"version_duration" varchar,
  	"version_format" varchar,
  	"version_summary" varchar,
  	"version_audience" varchar,
  	"version_prerequisites" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "formation_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"formation_id" integer NOT NULL,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"ends_at" timestamp(3) with time zone,
  	"location_name" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"seats" numeric,
  	"editorial_status" "enum_formation_sessions_editorial_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"city" varchar,
  	"country" varchar,
  	"media_id" integer,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_events_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar,
  	"event_type" varchar,
  	"summary" varchar,
  	"body" varchar,
  	"location_name" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_city" varchar,
  	"version_country" varchar,
  	"version_media_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__events_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_locales" (
  	"version_title" varchar,
  	"version_event_type" varchar,
  	"version_summary" varchar,
  	"version_body" varchar,
  	"version_location_name" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"reference" varchar,
  	"media_id" integer,
  	"cta_href" varchar DEFAULT '/fr/contact',
  	"is_featured" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_products_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_locales" (
  	"title" varchar,
  	"category" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"availability" varchar,
  	"lead_time" varchar,
  	"cta_label" varchar DEFAULT 'Demander un devis',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_reference" varchar,
  	"version_media_id" integer,
  	"version_cta_href" varchar DEFAULT '/fr/contact',
  	"version_is_featured" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__products_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__products_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_summary" varchar,
  	"version_description" varchar,
  	"version_availability" varchar,
  	"version_lead_time" varchar,
  	"version_cta_label" varchar DEFAULT 'Demander un devis',
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"portrait_id" integer,
  	"linkedin_url" varchar,
  	"position" numeric DEFAULT 0,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_team_members_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_locales" (
  	"role" varchar,
  	"bio" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_portrait_id" integer,
  	"version_linkedin_url" varchar,
  	"version_position" numeric DEFAULT 0,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__team_members_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_members_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_team_members_v_locales" (
  	"version_role" varchar,
  	"version_bio" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"name" varchar,
  	"logo_id" integer,
  	"external_url" varchar,
  	"position" numeric DEFAULT 0,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_partners_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_partners_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "partners_locales" (
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_logo_id" integer,
  	"version_external_url" varchar,
  	"version_position" numeric DEFAULT 0,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__partners_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__partners_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__partners_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_partners_v_locales" (
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"person_name" varchar,
  	"company" varchar,
  	"portrait_id" integer,
  	"consent_received_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_testimonials_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar,
  	"role" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_person_name" varchar,
  	"version_company" varchar,
  	"version_portrait_id" integer,
  	"version_consent_received_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__testimonials_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_quote" varchar,
  	"version_role" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legal_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_key" "enum_legal_documents_document_key",
  	"seo_og_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"editorial_status" "enum_legal_documents_editorial_status" DEFAULT 'draft',
  	"archive_reason" varchar,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_legal_documents_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "legal_documents_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_legal_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_document_key" "enum__legal_documents_v_version_document_key",
  	"version_seo_og_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_editorial_status" "enum__legal_documents_v_version_editorial_status" DEFAULT 'draft',
  	"version_archive_reason" varchar,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__legal_documents_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__legal_documents_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_legal_documents_v_locales" (
  	"version_title" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subject" varchar,
  	"full_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"need" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"consent_at" timestamp(3) with time zone NOT NULL,
  	"state" "enum_contact_messages_state" DEFAULT 'new',
  	"assigned_to_id" integer,
  	"ip_hash" varchar,
  	"user_agent_hash" varchar,
  	"retention_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '301',
  	"reason" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"summary" varchar,
  	"action" "enum_audit_logs_action" NOT NULL,
  	"entity_type" varchar NOT NULL,
  	"entity_id" varchar,
  	"actor_id" integer,
  	"note" varchar,
  	"before" jsonb,
  	"after" jsonb,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_assets_id" integer,
  	"pages_id" integer,
  	"expertises_id" integer,
  	"projects_id" integer,
  	"realisations_id" integer,
  	"formations_id" integer,
  	"formation_sessions_id" integer,
  	"events_id" integer,
  	"products_id" integer,
  	"team_members_id" integer,
  	"partners_id" integer,
  	"testimonials_id" integer,
  	"legal_documents_id" integer,
  	"contact_messages_id" integer,
  	"redirects_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_site_settings_social_links_network" NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"favicon_id" integer,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"city" varchar,
  	"country" varchar,
  	"phone" varchar,
  	"phone_raw" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"english_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar NOT NULL,
  	"tagline" varchar,
  	"baseline" varchar NOT NULL,
  	"reply_delay" varchar,
  	"cookie_title" varchar NOT NULL,
  	"cookie_text" varchar NOT NULL,
  	"default_seo_title" varchar NOT NULL,
  	"default_seo_description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_main_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_navigation_main_menu_section" NOT NULL,
  	"is_visible" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_main_menu_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"contact_label" varchar DEFAULT 'Contact',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_homepage_sections_key" NOT NULL,
  	"is_visible" boolean DEFAULT true
  );
  
  CREATE TABLE "homepage_sections_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_key_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric
  );
  
  CREATE TABLE "homepage_key_figures_locales" (
  	"suffix" varchar,
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_eyebrow" varchar,
  	"hero_title" varchar NOT NULL,
  	"hero_highlight" varchar,
  	"hero_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"realisations_id" integer,
  	"formations_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum__homepage_v_version_sections_key" NOT NULL,
  	"is_visible" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"intro" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_key_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_key_figures_locales" (
  	"suffix" varchar,
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_media_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar NOT NULL,
  	"version_hero_highlight" varchar,
  	"version_hero_lead" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"realisations_id" integer,
  	"formations_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "ceo_message" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"person_name" varchar NOT NULL,
  	"portrait_id" integer,
  	"video_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ceo_message_locales" (
  	"person_role" varchar NOT NULL,
  	"message_title" varchar NOT NULL,
  	"lead" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_ceo_message_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_person_name" varchar NOT NULL,
  	"version_portrait_id" integer,
  	"version_video_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_ceo_message_v_locales" (
  	"version_person_role" varchar NOT NULL,
  	"version_message_title" varchar NOT NULL,
  	"version_lead" varchar NOT NULL,
  	"version_body" jsonb NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_about_page_pillars_icon"
  );
  
  CREATE TABLE "about_page_pillars_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"presentation" varchar NOT NULL,
  	"vision" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_page_v_version_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__about_page_v_version_pillars_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_page_v_version_pillars_locales" (
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_page_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_media_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_about_page_v_locales" (
  	"version_presentation" varchar NOT NULL,
  	"version_vision" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_assets_locales" ADD CONSTRAINT "media_assets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertises_service_points" ADD CONSTRAINT "expertises_service_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertises" ADD CONSTRAINT "expertises_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertises" ADD CONSTRAINT "expertises_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertises" ADD CONSTRAINT "expertises_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertises" ADD CONSTRAINT "expertises_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertises_locales" ADD CONSTRAINT "expertises_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v_version_service_points" ADD CONSTRAINT "_expertises_v_version_service_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_parent_id_expertises_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertises_v" ADD CONSTRAINT "_expertises_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertises_v_locales" ADD CONSTRAINT "_expertises_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertises_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_expertise_id_expertises_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_expertise_id_expertises_id_fk" FOREIGN KEY ("version_expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations_metrics" ADD CONSTRAINT "realisations_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_expertise_id_expertises_id_fk" FOREIGN KEY ("expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_before_media_id_media_assets_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_after_media_id_media_assets_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realisations_locales" ADD CONSTRAINT "realisations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v_version_metrics" ADD CONSTRAINT "_realisations_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_parent_id_realisations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realisations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_expertise_id_expertises_id_fk" FOREIGN KEY ("version_expertise_id") REFERENCES "public"."expertises"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_before_media_id_media_assets_id_fk" FOREIGN KEY ("version_before_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_after_media_id_media_assets_id_fk" FOREIGN KEY ("version_after_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v_locales" ADD CONSTRAINT "_realisations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_realisations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formations_objectives" ADD CONSTRAINT "formations_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formations" ADD CONSTRAINT "formations_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formations" ADD CONSTRAINT "formations_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formations" ADD CONSTRAINT "formations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formations" ADD CONSTRAINT "formations_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "formations_locales" ADD CONSTRAINT "formations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formations_v_version_objectives" ADD CONSTRAINT "_formations_v_version_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_parent_id_formations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."formations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v" ADD CONSTRAINT "_formations_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_formations_v_locales" ADD CONSTRAINT "_formations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_formations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "formation_sessions" ADD CONSTRAINT "formation_sessions_formation_id_formations_id_fk" FOREIGN KEY ("formation_id") REFERENCES "public"."formations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_portrait_id_media_assets_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_portrait_id_media_assets_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_locales" ADD CONSTRAINT "_team_members_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_assets_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_locales" ADD CONSTRAINT "partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_logo_id_media_assets_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v_locales" ADD CONSTRAINT "_partners_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_partners_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_portrait_id_media_assets_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_portrait_id_media_assets_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_documents_locales" ADD CONSTRAINT "legal_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_parent_id_legal_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."legal_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_version_seo_og_image_id_media_assets_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v" ADD CONSTRAINT "_legal_documents_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_legal_documents_v_locales" ADD CONSTRAINT "_legal_documents_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_legal_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_assets_fk" FOREIGN KEY ("media_assets_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expertises_fk" FOREIGN KEY ("expertises_id") REFERENCES "public"."expertises"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_realisations_fk" FOREIGN KEY ("realisations_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formations_fk" FOREIGN KEY ("formations_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formation_sessions_fk" FOREIGN KEY ("formation_sessions_id") REFERENCES "public"."formation_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_documents_fk" FOREIGN KEY ("legal_documents_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_opening_hours" ADD CONSTRAINT "site_settings_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_assets_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_assets_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu" ADD CONSTRAINT "navigation_main_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_main_menu_locales" ADD CONSTRAINT "navigation_main_menu_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_main_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_locales" ADD CONSTRAINT "homepage_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_key_figures" ADD CONSTRAINT "homepage_key_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_key_figures_locales" ADD CONSTRAINT "homepage_key_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_key_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_media_id_media_assets_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_realisations_fk" FOREIGN KEY ("realisations_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_formations_fk" FOREIGN KEY ("formations_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections" ADD CONSTRAINT "_homepage_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_locales" ADD CONSTRAINT "_homepage_v_version_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_key_figures" ADD CONSTRAINT "_homepage_v_version_key_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_key_figures_locales" ADD CONSTRAINT "_homepage_v_version_key_figures_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_key_figures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_hero_media_id_media_assets_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_realisations_fk" FOREIGN KEY ("realisations_id") REFERENCES "public"."realisations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_formations_fk" FOREIGN KEY ("formations_id") REFERENCES "public"."formations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ceo_message" ADD CONSTRAINT "ceo_message_portrait_id_media_assets_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ceo_message_locales" ADD CONSTRAINT "ceo_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ceo_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ceo_message_v" ADD CONSTRAINT "_ceo_message_v_version_portrait_id_media_assets_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_ceo_message_v_locales" ADD CONSTRAINT "_ceo_message_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_ceo_message_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_pillars" ADD CONSTRAINT "about_page_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_pillars_locales" ADD CONSTRAINT "about_page_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_pillars" ADD CONSTRAINT "_about_page_v_version_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v_version_pillars_locales" ADD CONSTRAINT "_about_page_v_version_pillars_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v_version_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v_locales" ADD CONSTRAINT "_about_page_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_page_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_assets_updated_at_idx" ON "media_assets" USING btree ("updated_at");
  CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_assets_filename_idx" ON "media_assets" USING btree ("filename");
  CREATE INDEX "media_assets_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media_assets" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_assets_sizes_card_sizes_card_filename_idx" ON "media_assets" USING btree ("sizes_card_filename");
  CREATE INDEX "media_assets_sizes_hero_sizes_hero_filename_idx" ON "media_assets" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_assets_sizes_og_sizes_og_filename_idx" ON "media_assets" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_assets_locales_locale_parent_id_unique" ON "media_assets_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_page_key_idx" ON "pages" USING btree ("page_key");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_editorial_status_idx" ON "pages" USING btree ("editorial_status");
  CREATE INDEX "pages_created_by_idx" ON "pages" USING btree ("created_by_id");
  CREATE INDEX "pages_updated_by_idx" ON "pages" USING btree ("updated_by_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_page_key_idx" ON "_pages_v" USING btree ("version_page_key");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_editorial_status_idx" ON "_pages_v" USING btree ("version_editorial_status");
  CREATE INDEX "_pages_v_version_version_created_by_idx" ON "_pages_v" USING btree ("version_created_by_id");
  CREATE INDEX "_pages_v_version_version_updated_by_idx" ON "_pages_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "expertises_service_points_order_idx" ON "expertises_service_points" USING btree ("_order");
  CREATE INDEX "expertises_service_points_parent_id_idx" ON "expertises_service_points" USING btree ("_parent_id");
  CREATE INDEX "expertises_service_points_locale_idx" ON "expertises_service_points" USING btree ("_locale");
  CREATE UNIQUE INDEX "expertises_slug_idx" ON "expertises" USING btree ("slug");
  CREATE INDEX "expertises_media_idx" ON "expertises" USING btree ("media_id");
  CREATE INDEX "expertises_seo_seo_og_image_idx" ON "expertises" USING btree ("seo_og_image_id");
  CREATE INDEX "expertises_editorial_status_idx" ON "expertises" USING btree ("editorial_status");
  CREATE INDEX "expertises_created_by_idx" ON "expertises" USING btree ("created_by_id");
  CREATE INDEX "expertises_updated_by_idx" ON "expertises" USING btree ("updated_by_id");
  CREATE INDEX "expertises_updated_at_idx" ON "expertises" USING btree ("updated_at");
  CREATE INDEX "expertises_created_at_idx" ON "expertises" USING btree ("created_at");
  CREATE INDEX "expertises__status_idx" ON "expertises" USING btree ("_status");
  CREATE UNIQUE INDEX "expertises_locales_locale_parent_id_unique" ON "expertises_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_expertises_v_version_service_points_order_idx" ON "_expertises_v_version_service_points" USING btree ("_order");
  CREATE INDEX "_expertises_v_version_service_points_parent_id_idx" ON "_expertises_v_version_service_points" USING btree ("_parent_id");
  CREATE INDEX "_expertises_v_version_service_points_locale_idx" ON "_expertises_v_version_service_points" USING btree ("_locale");
  CREATE INDEX "_expertises_v_parent_idx" ON "_expertises_v" USING btree ("parent_id");
  CREATE INDEX "_expertises_v_version_version_slug_idx" ON "_expertises_v" USING btree ("version_slug");
  CREATE INDEX "_expertises_v_version_version_media_idx" ON "_expertises_v" USING btree ("version_media_id");
  CREATE INDEX "_expertises_v_version_seo_version_seo_og_image_idx" ON "_expertises_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_expertises_v_version_version_editorial_status_idx" ON "_expertises_v" USING btree ("version_editorial_status");
  CREATE INDEX "_expertises_v_version_version_created_by_idx" ON "_expertises_v" USING btree ("version_created_by_id");
  CREATE INDEX "_expertises_v_version_version_updated_by_idx" ON "_expertises_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_expertises_v_version_version_updated_at_idx" ON "_expertises_v" USING btree ("version_updated_at");
  CREATE INDEX "_expertises_v_version_version_created_at_idx" ON "_expertises_v" USING btree ("version_created_at");
  CREATE INDEX "_expertises_v_version_version__status_idx" ON "_expertises_v" USING btree ("version__status");
  CREATE INDEX "_expertises_v_created_at_idx" ON "_expertises_v" USING btree ("created_at");
  CREATE INDEX "_expertises_v_updated_at_idx" ON "_expertises_v" USING btree ("updated_at");
  CREATE INDEX "_expertises_v_snapshot_idx" ON "_expertises_v" USING btree ("snapshot");
  CREATE INDEX "_expertises_v_published_locale_idx" ON "_expertises_v" USING btree ("published_locale");
  CREATE INDEX "_expertises_v_latest_idx" ON "_expertises_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_expertises_v_locales_locale_parent_id_unique" ON "_expertises_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_project_state_idx" ON "projects" USING btree ("project_state");
  CREATE INDEX "projects_expertise_idx" ON "projects" USING btree ("expertise_id");
  CREATE INDEX "projects_media_idx" ON "projects" USING btree ("media_id");
  CREATE INDEX "projects_seo_seo_og_image_idx" ON "projects" USING btree ("seo_og_image_id");
  CREATE INDEX "projects_editorial_status_idx" ON "projects" USING btree ("editorial_status");
  CREATE INDEX "projects_created_by_idx" ON "projects" USING btree ("created_by_id");
  CREATE INDEX "projects_updated_by_idx" ON "projects" USING btree ("updated_by_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_project_state_idx" ON "_projects_v" USING btree ("version_project_state");
  CREATE INDEX "_projects_v_version_version_expertise_idx" ON "_projects_v" USING btree ("version_expertise_id");
  CREATE INDEX "_projects_v_version_version_media_idx" ON "_projects_v" USING btree ("version_media_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_og_image_idx" ON "_projects_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_projects_v_version_version_editorial_status_idx" ON "_projects_v" USING btree ("version_editorial_status");
  CREATE INDEX "_projects_v_version_version_created_by_idx" ON "_projects_v" USING btree ("version_created_by_id");
  CREATE INDEX "_projects_v_version_version_updated_by_idx" ON "_projects_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "realisations_metrics_order_idx" ON "realisations_metrics" USING btree ("_order");
  CREATE INDEX "realisations_metrics_parent_id_idx" ON "realisations_metrics" USING btree ("_parent_id");
  CREATE INDEX "realisations_metrics_locale_idx" ON "realisations_metrics" USING btree ("_locale");
  CREATE UNIQUE INDEX "realisations_slug_idx" ON "realisations" USING btree ("slug");
  CREATE INDEX "realisations_expertise_idx" ON "realisations" USING btree ("expertise_id");
  CREATE INDEX "realisations_before_media_idx" ON "realisations" USING btree ("before_media_id");
  CREATE INDEX "realisations_after_media_idx" ON "realisations" USING btree ("after_media_id");
  CREATE INDEX "realisations_seo_seo_og_image_idx" ON "realisations" USING btree ("seo_og_image_id");
  CREATE INDEX "realisations_editorial_status_idx" ON "realisations" USING btree ("editorial_status");
  CREATE INDEX "realisations_created_by_idx" ON "realisations" USING btree ("created_by_id");
  CREATE INDEX "realisations_updated_by_idx" ON "realisations" USING btree ("updated_by_id");
  CREATE INDEX "realisations_updated_at_idx" ON "realisations" USING btree ("updated_at");
  CREATE INDEX "realisations_created_at_idx" ON "realisations" USING btree ("created_at");
  CREATE INDEX "realisations__status_idx" ON "realisations" USING btree ("_status");
  CREATE UNIQUE INDEX "realisations_locales_locale_parent_id_unique" ON "realisations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_realisations_v_version_metrics_order_idx" ON "_realisations_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_realisations_v_version_metrics_parent_id_idx" ON "_realisations_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_realisations_v_version_metrics_locale_idx" ON "_realisations_v_version_metrics" USING btree ("_locale");
  CREATE INDEX "_realisations_v_parent_idx" ON "_realisations_v" USING btree ("parent_id");
  CREATE INDEX "_realisations_v_version_version_slug_idx" ON "_realisations_v" USING btree ("version_slug");
  CREATE INDEX "_realisations_v_version_version_expertise_idx" ON "_realisations_v" USING btree ("version_expertise_id");
  CREATE INDEX "_realisations_v_version_version_before_media_idx" ON "_realisations_v" USING btree ("version_before_media_id");
  CREATE INDEX "_realisations_v_version_version_after_media_idx" ON "_realisations_v" USING btree ("version_after_media_id");
  CREATE INDEX "_realisations_v_version_seo_version_seo_og_image_idx" ON "_realisations_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_realisations_v_version_version_editorial_status_idx" ON "_realisations_v" USING btree ("version_editorial_status");
  CREATE INDEX "_realisations_v_version_version_created_by_idx" ON "_realisations_v" USING btree ("version_created_by_id");
  CREATE INDEX "_realisations_v_version_version_updated_by_idx" ON "_realisations_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_realisations_v_version_version_updated_at_idx" ON "_realisations_v" USING btree ("version_updated_at");
  CREATE INDEX "_realisations_v_version_version_created_at_idx" ON "_realisations_v" USING btree ("version_created_at");
  CREATE INDEX "_realisations_v_version_version__status_idx" ON "_realisations_v" USING btree ("version__status");
  CREATE INDEX "_realisations_v_created_at_idx" ON "_realisations_v" USING btree ("created_at");
  CREATE INDEX "_realisations_v_updated_at_idx" ON "_realisations_v" USING btree ("updated_at");
  CREATE INDEX "_realisations_v_snapshot_idx" ON "_realisations_v" USING btree ("snapshot");
  CREATE INDEX "_realisations_v_published_locale_idx" ON "_realisations_v" USING btree ("published_locale");
  CREATE INDEX "_realisations_v_latest_idx" ON "_realisations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_realisations_v_locales_locale_parent_id_unique" ON "_realisations_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "formations_objectives_order_idx" ON "formations_objectives" USING btree ("_order");
  CREATE INDEX "formations_objectives_parent_id_idx" ON "formations_objectives" USING btree ("_parent_id");
  CREATE INDEX "formations_objectives_locale_idx" ON "formations_objectives" USING btree ("_locale");
  CREATE UNIQUE INDEX "formations_slug_idx" ON "formations" USING btree ("slug");
  CREATE INDEX "formations_theme_idx" ON "formations" USING btree ("theme");
  CREATE INDEX "formations_media_idx" ON "formations" USING btree ("media_id");
  CREATE INDEX "formations_seo_seo_og_image_idx" ON "formations" USING btree ("seo_og_image_id");
  CREATE INDEX "formations_editorial_status_idx" ON "formations" USING btree ("editorial_status");
  CREATE INDEX "formations_created_by_idx" ON "formations" USING btree ("created_by_id");
  CREATE INDEX "formations_updated_by_idx" ON "formations" USING btree ("updated_by_id");
  CREATE INDEX "formations_updated_at_idx" ON "formations" USING btree ("updated_at");
  CREATE INDEX "formations_created_at_idx" ON "formations" USING btree ("created_at");
  CREATE INDEX "formations__status_idx" ON "formations" USING btree ("_status");
  CREATE UNIQUE INDEX "formations_locales_locale_parent_id_unique" ON "formations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_formations_v_version_objectives_order_idx" ON "_formations_v_version_objectives" USING btree ("_order");
  CREATE INDEX "_formations_v_version_objectives_parent_id_idx" ON "_formations_v_version_objectives" USING btree ("_parent_id");
  CREATE INDEX "_formations_v_version_objectives_locale_idx" ON "_formations_v_version_objectives" USING btree ("_locale");
  CREATE INDEX "_formations_v_parent_idx" ON "_formations_v" USING btree ("parent_id");
  CREATE INDEX "_formations_v_version_version_slug_idx" ON "_formations_v" USING btree ("version_slug");
  CREATE INDEX "_formations_v_version_version_theme_idx" ON "_formations_v" USING btree ("version_theme");
  CREATE INDEX "_formations_v_version_version_media_idx" ON "_formations_v" USING btree ("version_media_id");
  CREATE INDEX "_formations_v_version_seo_version_seo_og_image_idx" ON "_formations_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_formations_v_version_version_editorial_status_idx" ON "_formations_v" USING btree ("version_editorial_status");
  CREATE INDEX "_formations_v_version_version_created_by_idx" ON "_formations_v" USING btree ("version_created_by_id");
  CREATE INDEX "_formations_v_version_version_updated_by_idx" ON "_formations_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_formations_v_version_version_updated_at_idx" ON "_formations_v" USING btree ("version_updated_at");
  CREATE INDEX "_formations_v_version_version_created_at_idx" ON "_formations_v" USING btree ("version_created_at");
  CREATE INDEX "_formations_v_version_version__status_idx" ON "_formations_v" USING btree ("version__status");
  CREATE INDEX "_formations_v_created_at_idx" ON "_formations_v" USING btree ("created_at");
  CREATE INDEX "_formations_v_updated_at_idx" ON "_formations_v" USING btree ("updated_at");
  CREATE INDEX "_formations_v_snapshot_idx" ON "_formations_v" USING btree ("snapshot");
  CREATE INDEX "_formations_v_published_locale_idx" ON "_formations_v" USING btree ("published_locale");
  CREATE INDEX "_formations_v_latest_idx" ON "_formations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_formations_v_locales_locale_parent_id_unique" ON "_formations_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "formation_sessions_formation_idx" ON "formation_sessions" USING btree ("formation_id");
  CREATE INDEX "formation_sessions_starts_at_idx" ON "formation_sessions" USING btree ("starts_at");
  CREATE INDEX "formation_sessions_editorial_status_idx" ON "formation_sessions" USING btree ("editorial_status");
  CREATE INDEX "formation_sessions_updated_at_idx" ON "formation_sessions" USING btree ("updated_at");
  CREATE INDEX "formation_sessions_created_at_idx" ON "formation_sessions" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_media_idx" ON "events" USING btree ("media_id");
  CREATE INDEX "events_seo_seo_og_image_idx" ON "events" USING btree ("seo_og_image_id");
  CREATE INDEX "events_editorial_status_idx" ON "events" USING btree ("editorial_status");
  CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by_id");
  CREATE INDEX "events_updated_by_idx" ON "events" USING btree ("updated_by_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_media_idx" ON "_events_v" USING btree ("version_media_id");
  CREATE INDEX "_events_v_version_seo_version_seo_og_image_idx" ON "_events_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_events_v_version_version_editorial_status_idx" ON "_events_v" USING btree ("version_editorial_status");
  CREATE INDEX "_events_v_version_version_created_by_idx" ON "_events_v" USING btree ("version_created_by_id");
  CREATE INDEX "_events_v_version_version_updated_by_idx" ON "_events_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_events_v_locales_locale_parent_id_unique" ON "_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_specs_locale_idx" ON "products_specs" USING btree ("_locale");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE UNIQUE INDEX "products_reference_idx" ON "products" USING btree ("reference");
  CREATE INDEX "products_media_idx" ON "products" USING btree ("media_id");
  CREATE INDEX "products_seo_seo_og_image_idx" ON "products" USING btree ("seo_og_image_id");
  CREATE INDEX "products_editorial_status_idx" ON "products" USING btree ("editorial_status");
  CREATE INDEX "products_created_by_idx" ON "products" USING btree ("created_by_id");
  CREATE INDEX "products_updated_by_idx" ON "products" USING btree ("updated_by_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_category_idx" ON "products_locales" USING btree ("category","_locale");
  CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_locale_idx" ON "_products_v_version_specs" USING btree ("_locale");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_reference_idx" ON "_products_v" USING btree ("version_reference");
  CREATE INDEX "_products_v_version_version_media_idx" ON "_products_v" USING btree ("version_media_id");
  CREATE INDEX "_products_v_version_seo_version_seo_og_image_idx" ON "_products_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_products_v_version_version_editorial_status_idx" ON "_products_v" USING btree ("version_editorial_status");
  CREATE INDEX "_products_v_version_version_created_by_idx" ON "_products_v" USING btree ("version_created_by_id");
  CREATE INDEX "_products_v_version_version_updated_by_idx" ON "_products_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v_locales" USING btree ("version_category","_locale");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "team_members_slug_idx" ON "team_members" USING btree ("slug");
  CREATE INDEX "team_members_portrait_idx" ON "team_members" USING btree ("portrait_id");
  CREATE INDEX "team_members_seo_seo_og_image_idx" ON "team_members" USING btree ("seo_og_image_id");
  CREATE INDEX "team_members_editorial_status_idx" ON "team_members" USING btree ("editorial_status");
  CREATE INDEX "team_members_created_by_idx" ON "team_members" USING btree ("created_by_id");
  CREATE INDEX "team_members_updated_by_idx" ON "team_members" USING btree ("updated_by_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_slug_idx" ON "_team_members_v" USING btree ("version_slug");
  CREATE INDEX "_team_members_v_version_version_portrait_idx" ON "_team_members_v" USING btree ("version_portrait_id");
  CREATE INDEX "_team_members_v_version_seo_version_seo_og_image_idx" ON "_team_members_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_team_members_v_version_version_editorial_status_idx" ON "_team_members_v" USING btree ("version_editorial_status");
  CREATE INDEX "_team_members_v_version_version_created_by_idx" ON "_team_members_v" USING btree ("version_created_by_id");
  CREATE INDEX "_team_members_v_version_version_updated_by_idx" ON "_team_members_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_snapshot_idx" ON "_team_members_v" USING btree ("snapshot");
  CREATE INDEX "_team_members_v_published_locale_idx" ON "_team_members_v" USING btree ("published_locale");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_team_members_v_locales_locale_parent_id_unique" ON "_team_members_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "partners_slug_idx" ON "partners" USING btree ("slug");
  CREATE UNIQUE INDEX "partners_name_idx" ON "partners" USING btree ("name");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_seo_seo_og_image_idx" ON "partners" USING btree ("seo_og_image_id");
  CREATE INDEX "partners_editorial_status_idx" ON "partners" USING btree ("editorial_status");
  CREATE INDEX "partners_created_by_idx" ON "partners" USING btree ("created_by_id");
  CREATE INDEX "partners_updated_by_idx" ON "partners" USING btree ("updated_by_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "partners__status_idx" ON "partners" USING btree ("_status");
  CREATE UNIQUE INDEX "partners_locales_locale_parent_id_unique" ON "partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_slug_idx" ON "_partners_v" USING btree ("version_slug");
  CREATE INDEX "_partners_v_version_version_name_idx" ON "_partners_v" USING btree ("version_name");
  CREATE INDEX "_partners_v_version_version_logo_idx" ON "_partners_v" USING btree ("version_logo_id");
  CREATE INDEX "_partners_v_version_seo_version_seo_og_image_idx" ON "_partners_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_partners_v_version_version_editorial_status_idx" ON "_partners_v" USING btree ("version_editorial_status");
  CREATE INDEX "_partners_v_version_version_created_by_idx" ON "_partners_v" USING btree ("version_created_by_id");
  CREATE INDEX "_partners_v_version_version_updated_by_idx" ON "_partners_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version__status_idx" ON "_partners_v" USING btree ("version__status");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_snapshot_idx" ON "_partners_v" USING btree ("snapshot");
  CREATE INDEX "_partners_v_published_locale_idx" ON "_partners_v" USING btree ("published_locale");
  CREATE INDEX "_partners_v_latest_idx" ON "_partners_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_partners_v_locales_locale_parent_id_unique" ON "_partners_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "testimonials_slug_idx" ON "testimonials" USING btree ("slug");
  CREATE INDEX "testimonials_portrait_idx" ON "testimonials" USING btree ("portrait_id");
  CREATE INDEX "testimonials_seo_seo_og_image_idx" ON "testimonials" USING btree ("seo_og_image_id");
  CREATE INDEX "testimonials_editorial_status_idx" ON "testimonials" USING btree ("editorial_status");
  CREATE INDEX "testimonials_created_by_idx" ON "testimonials" USING btree ("created_by_id");
  CREATE INDEX "testimonials_updated_by_idx" ON "testimonials" USING btree ("updated_by_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_slug_idx" ON "_testimonials_v" USING btree ("version_slug");
  CREATE INDEX "_testimonials_v_version_version_portrait_idx" ON "_testimonials_v" USING btree ("version_portrait_id");
  CREATE INDEX "_testimonials_v_version_seo_version_seo_og_image_idx" ON "_testimonials_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_testimonials_v_version_version_editorial_status_idx" ON "_testimonials_v" USING btree ("version_editorial_status");
  CREATE INDEX "_testimonials_v_version_version_created_by_idx" ON "_testimonials_v" USING btree ("version_created_by_id");
  CREATE INDEX "_testimonials_v_version_version_updated_by_idx" ON "_testimonials_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "legal_documents_document_key_idx" ON "legal_documents" USING btree ("document_key");
  CREATE INDEX "legal_documents_seo_seo_og_image_idx" ON "legal_documents" USING btree ("seo_og_image_id");
  CREATE INDEX "legal_documents_editorial_status_idx" ON "legal_documents" USING btree ("editorial_status");
  CREATE INDEX "legal_documents_created_by_idx" ON "legal_documents" USING btree ("created_by_id");
  CREATE INDEX "legal_documents_updated_by_idx" ON "legal_documents" USING btree ("updated_by_id");
  CREATE INDEX "legal_documents_updated_at_idx" ON "legal_documents" USING btree ("updated_at");
  CREATE INDEX "legal_documents_created_at_idx" ON "legal_documents" USING btree ("created_at");
  CREATE INDEX "legal_documents__status_idx" ON "legal_documents" USING btree ("_status");
  CREATE UNIQUE INDEX "legal_documents_locales_locale_parent_id_unique" ON "legal_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_legal_documents_v_parent_idx" ON "_legal_documents_v" USING btree ("parent_id");
  CREATE INDEX "_legal_documents_v_version_version_document_key_idx" ON "_legal_documents_v" USING btree ("version_document_key");
  CREATE INDEX "_legal_documents_v_version_seo_version_seo_og_image_idx" ON "_legal_documents_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_legal_documents_v_version_version_editorial_status_idx" ON "_legal_documents_v" USING btree ("version_editorial_status");
  CREATE INDEX "_legal_documents_v_version_version_created_by_idx" ON "_legal_documents_v" USING btree ("version_created_by_id");
  CREATE INDEX "_legal_documents_v_version_version_updated_by_idx" ON "_legal_documents_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_legal_documents_v_version_version_updated_at_idx" ON "_legal_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_legal_documents_v_version_version_created_at_idx" ON "_legal_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_legal_documents_v_version_version__status_idx" ON "_legal_documents_v" USING btree ("version__status");
  CREATE INDEX "_legal_documents_v_created_at_idx" ON "_legal_documents_v" USING btree ("created_at");
  CREATE INDEX "_legal_documents_v_updated_at_idx" ON "_legal_documents_v" USING btree ("updated_at");
  CREATE INDEX "_legal_documents_v_snapshot_idx" ON "_legal_documents_v" USING btree ("snapshot");
  CREATE INDEX "_legal_documents_v_published_locale_idx" ON "_legal_documents_v" USING btree ("published_locale");
  CREATE INDEX "_legal_documents_v_latest_idx" ON "_legal_documents_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_legal_documents_v_locales_locale_parent_id_unique" ON "_legal_documents_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_messages_state_idx" ON "contact_messages" USING btree ("state");
  CREATE INDEX "contact_messages_assigned_to_idx" ON "contact_messages" USING btree ("assigned_to_id");
  CREATE INDEX "contact_messages_retention_until_idx" ON "contact_messages" USING btree ("retention_until");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");
  CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs" USING btree ("entity_type");
  CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs" USING btree ("entity_id");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("media_assets_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_expertises_id_idx" ON "payload_locked_documents_rels" USING btree ("expertises_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_realisations_id_idx" ON "payload_locked_documents_rels" USING btree ("realisations_id");
  CREATE INDEX "payload_locked_documents_rels_formations_id_idx" ON "payload_locked_documents_rels" USING btree ("formations_id");
  CREATE INDEX "payload_locked_documents_rels_formation_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("formation_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_legal_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_documents_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_opening_hours_order_idx" ON "site_settings_opening_hours" USING btree ("_order");
  CREATE INDEX "site_settings_opening_hours_parent_id_idx" ON "site_settings_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "site_settings_opening_hours_locale_idx" ON "site_settings_opening_hours" USING btree ("_locale");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_main_menu_order_idx" ON "navigation_main_menu" USING btree ("_order");
  CREATE INDEX "navigation_main_menu_parent_id_idx" ON "navigation_main_menu" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_main_menu_locales_locale_parent_id_unique" ON "navigation_main_menu_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_order_idx" ON "homepage_sections" USING btree ("_order");
  CREATE INDEX "homepage_sections_parent_id_idx" ON "homepage_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_sections_locales_locale_parent_id_unique" ON "homepage_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_key_figures_order_idx" ON "homepage_key_figures" USING btree ("_order");
  CREATE INDEX "homepage_key_figures_parent_id_idx" ON "homepage_key_figures" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_key_figures_locales_locale_parent_id_unique" ON "homepage_key_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_hero_media_idx" ON "homepage" USING btree ("hero_media_id");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_products_id_idx" ON "homepage_rels" USING btree ("products_id");
  CREATE INDEX "homepage_rels_realisations_id_idx" ON "homepage_rels" USING btree ("realisations_id");
  CREATE INDEX "homepage_rels_formations_id_idx" ON "homepage_rels" USING btree ("formations_id");
  CREATE INDEX "homepage_rels_events_id_idx" ON "homepage_rels" USING btree ("events_id");
  CREATE INDEX "_homepage_v_version_sections_order_idx" ON "_homepage_v_version_sections" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_parent_id_idx" ON "_homepage_v_version_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_sections_locales_locale_parent_id_unique" ON "_homepage_v_version_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_key_figures_order_idx" ON "_homepage_v_version_key_figures" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_key_figures_parent_id_idx" ON "_homepage_v_version_key_figures" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_key_figures_locales_locale_parent_id_uni" ON "_homepage_v_version_key_figures_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_version_hero_media_idx" ON "_homepage_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_products_id_idx" ON "_homepage_v_rels" USING btree ("products_id");
  CREATE INDEX "_homepage_v_rels_realisations_id_idx" ON "_homepage_v_rels" USING btree ("realisations_id");
  CREATE INDEX "_homepage_v_rels_formations_id_idx" ON "_homepage_v_rels" USING btree ("formations_id");
  CREATE INDEX "_homepage_v_rels_events_id_idx" ON "_homepage_v_rels" USING btree ("events_id");
  CREATE INDEX "ceo_message_portrait_idx" ON "ceo_message" USING btree ("portrait_id");
  CREATE UNIQUE INDEX "ceo_message_locales_locale_parent_id_unique" ON "ceo_message_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_ceo_message_v_version_version_portrait_idx" ON "_ceo_message_v" USING btree ("version_portrait_id");
  CREATE INDEX "_ceo_message_v_created_at_idx" ON "_ceo_message_v" USING btree ("created_at");
  CREATE INDEX "_ceo_message_v_updated_at_idx" ON "_ceo_message_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_ceo_message_v_locales_locale_parent_id_unique" ON "_ceo_message_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_pillars_order_idx" ON "about_page_pillars" USING btree ("_order");
  CREATE INDEX "about_page_pillars_parent_id_idx" ON "about_page_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_pillars_locales_locale_parent_id_unique" ON "about_page_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_media_idx" ON "about_page" USING btree ("media_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_page_v_version_pillars_order_idx" ON "_about_page_v_version_pillars" USING btree ("_order");
  CREATE INDEX "_about_page_v_version_pillars_parent_id_idx" ON "_about_page_v_version_pillars" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_about_page_v_version_pillars_locales_locale_parent_id_uniqu" ON "_about_page_v_version_pillars_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_page_v_version_version_media_idx" ON "_about_page_v" USING btree ("version_media_id");
  CREATE INDEX "_about_page_v_created_at_idx" ON "_about_page_v" USING btree ("created_at");
  CREATE INDEX "_about_page_v_updated_at_idx" ON "_about_page_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_about_page_v_locales_locale_parent_id_unique" ON "_about_page_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media_assets" CASCADE;
  DROP TABLE "media_assets_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "expertises_service_points" CASCADE;
  DROP TABLE "expertises" CASCADE;
  DROP TABLE "expertises_locales" CASCADE;
  DROP TABLE "_expertises_v_version_service_points" CASCADE;
  DROP TABLE "_expertises_v" CASCADE;
  DROP TABLE "_expertises_v_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "realisations_metrics" CASCADE;
  DROP TABLE "realisations" CASCADE;
  DROP TABLE "realisations_locales" CASCADE;
  DROP TABLE "_realisations_v_version_metrics" CASCADE;
  DROP TABLE "_realisations_v" CASCADE;
  DROP TABLE "_realisations_v_locales" CASCADE;
  DROP TABLE "formations_objectives" CASCADE;
  DROP TABLE "formations" CASCADE;
  DROP TABLE "formations_locales" CASCADE;
  DROP TABLE "_formations_v_version_objectives" CASCADE;
  DROP TABLE "_formations_v" CASCADE;
  DROP TABLE "_formations_v_locales" CASCADE;
  DROP TABLE "formation_sessions" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_locales" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_locales" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_locales" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "partners_locales" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  DROP TABLE "_partners_v_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "legal_documents" CASCADE;
  DROP TABLE "legal_documents_locales" CASCADE;
  DROP TABLE "_legal_documents_v" CASCADE;
  DROP TABLE "_legal_documents_v_locales" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_opening_hours" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_main_menu" CASCADE;
  DROP TABLE "navigation_main_menu_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "homepage_sections" CASCADE;
  DROP TABLE "homepage_sections_locales" CASCADE;
  DROP TABLE "homepage_key_figures" CASCADE;
  DROP TABLE "homepage_key_figures_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_version_sections" CASCADE;
  DROP TABLE "_homepage_v_version_sections_locales" CASCADE;
  DROP TABLE "_homepage_v_version_key_figures" CASCADE;
  DROP TABLE "_homepage_v_version_key_figures_locales" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "ceo_message" CASCADE;
  DROP TABLE "ceo_message_locales" CASCADE;
  DROP TABLE "_ceo_message_v" CASCADE;
  DROP TABLE "_ceo_message_v_locales" CASCADE;
  DROP TABLE "about_page_pillars" CASCADE;
  DROP TABLE "about_page_pillars_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "_about_page_v_version_pillars" CASCADE;
  DROP TABLE "_about_page_v_version_pillars_locales" CASCADE;
  DROP TABLE "_about_page_v" CASCADE;
  DROP TABLE "_about_page_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_locale";
  DROP TYPE "public"."enum_pages_page_key";
  DROP TYPE "public"."enum_pages_editorial_status";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_page_key";
  DROP TYPE "public"."enum__pages_v_version_editorial_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_expertises_icon_key";
  DROP TYPE "public"."enum_expertises_editorial_status";
  DROP TYPE "public"."enum_expertises_status";
  DROP TYPE "public"."enum__expertises_v_version_icon_key";
  DROP TYPE "public"."enum__expertises_v_version_editorial_status";
  DROP TYPE "public"."enum__expertises_v_version_status";
  DROP TYPE "public"."enum__expertises_v_published_locale";
  DROP TYPE "public"."enum_projects_project_state";
  DROP TYPE "public"."enum_projects_editorial_status";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_project_state";
  DROP TYPE "public"."enum__projects_v_version_editorial_status";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_realisations_editorial_status";
  DROP TYPE "public"."enum_realisations_status";
  DROP TYPE "public"."enum__realisations_v_version_editorial_status";
  DROP TYPE "public"."enum__realisations_v_version_status";
  DROP TYPE "public"."enum__realisations_v_published_locale";
  DROP TYPE "public"."enum_formations_theme";
  DROP TYPE "public"."enum_formations_editorial_status";
  DROP TYPE "public"."enum_formations_status";
  DROP TYPE "public"."enum__formations_v_version_theme";
  DROP TYPE "public"."enum__formations_v_version_editorial_status";
  DROP TYPE "public"."enum__formations_v_version_status";
  DROP TYPE "public"."enum__formations_v_published_locale";
  DROP TYPE "public"."enum_formation_sessions_editorial_status";
  DROP TYPE "public"."enum_events_editorial_status";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_editorial_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_published_locale";
  DROP TYPE "public"."enum_products_editorial_status";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_editorial_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_published_locale";
  DROP TYPE "public"."enum_team_members_editorial_status";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_editorial_status";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum__team_members_v_published_locale";
  DROP TYPE "public"."enum_partners_editorial_status";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum__partners_v_version_editorial_status";
  DROP TYPE "public"."enum__partners_v_version_status";
  DROP TYPE "public"."enum__partners_v_published_locale";
  DROP TYPE "public"."enum_testimonials_editorial_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_editorial_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_legal_documents_document_key";
  DROP TYPE "public"."enum_legal_documents_editorial_status";
  DROP TYPE "public"."enum_legal_documents_status";
  DROP TYPE "public"."enum__legal_documents_v_version_document_key";
  DROP TYPE "public"."enum__legal_documents_v_version_editorial_status";
  DROP TYPE "public"."enum__legal_documents_v_version_status";
  DROP TYPE "public"."enum__legal_documents_v_published_locale";
  DROP TYPE "public"."enum_contact_messages_state";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_site_settings_social_links_network";
  DROP TYPE "public"."enum_navigation_main_menu_section";
  DROP TYPE "public"."enum_homepage_sections_key";
  DROP TYPE "public"."enum__homepage_v_version_sections_key";
  DROP TYPE "public"."enum_about_page_pillars_icon";
  DROP TYPE "public"."enum__about_page_v_version_pillars_icon";`)
}
