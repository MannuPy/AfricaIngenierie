import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_hero_media_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_hero_media_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "about_page" ADD COLUMN "video_media_id" integer;
  ALTER TABLE "about_page" ADD COLUMN "video_url" varchar;
  ALTER TABLE "_about_page_v" ADD COLUMN "version_video_media_id" integer;
  ALTER TABLE "_about_page_v" ADD COLUMN "version_video_url" varchar;
  ALTER TABLE "homepage_hero_media_carousel" ADD CONSTRAINT "homepage_hero_media_carousel_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_media_carousel" ADD CONSTRAINT "homepage_hero_media_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_hero_media_carousel" ADD CONSTRAINT "_homepage_v_version_hero_media_carousel_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_hero_media_carousel" ADD CONSTRAINT "_homepage_v_version_hero_media_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_hero_media_carousel_order_idx" ON "homepage_hero_media_carousel" USING btree ("_order");
  CREATE INDEX "homepage_hero_media_carousel_parent_id_idx" ON "homepage_hero_media_carousel" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_media_carousel_media_idx" ON "homepage_hero_media_carousel" USING btree ("media_id");
  CREATE INDEX "_homepage_v_version_hero_media_carousel_order_idx" ON "_homepage_v_version_hero_media_carousel" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_hero_media_carousel_parent_id_idx" ON "_homepage_v_version_hero_media_carousel" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_hero_media_carousel_media_idx" ON "_homepage_v_version_hero_media_carousel" USING btree ("media_id");
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_video_media_id_media_assets_id_fk" FOREIGN KEY ("video_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_page_v" ADD CONSTRAINT "_about_page_v_version_video_media_id_media_assets_id_fk" FOREIGN KEY ("version_video_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_page_video_media_idx" ON "about_page" USING btree ("video_media_id");
  CREATE INDEX "_about_page_v_version_version_video_media_idx" ON "_about_page_v" USING btree ("version_video_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_hero_media_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_hero_media_carousel" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_hero_media_carousel" CASCADE;
  DROP TABLE "_homepage_v_version_hero_media_carousel" CASCADE;
  ALTER TABLE "about_page" DROP CONSTRAINT "about_page_video_media_id_media_assets_id_fk";
  
  ALTER TABLE "_about_page_v" DROP CONSTRAINT "_about_page_v_version_video_media_id_media_assets_id_fk";
  
  DROP INDEX "about_page_video_media_idx";
  DROP INDEX "_about_page_v_version_version_video_media_idx";
  ALTER TABLE "about_page" DROP COLUMN "video_media_id";
  ALTER TABLE "about_page" DROP COLUMN "video_url";
  ALTER TABLE "_about_page_v" DROP COLUMN "version_video_media_id";
  ALTER TABLE "_about_page_v" DROP COLUMN "version_video_url";`)
}
