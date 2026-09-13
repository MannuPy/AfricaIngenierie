import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_gallery360" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "_products_v_version_gallery360" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "homepage_key_figures" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "_homepage_v_version_key_figures" ALTER COLUMN "value" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "unit_price" numeric;
  ALTER TABLE "products" ADD COLUMN "product_sheet_id" integer;
  ALTER TABLE "products" ADD COLUMN "video_media_id" integer;
  ALTER TABLE "products" ADD COLUMN "video_url" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_unit_price" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_product_sheet_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_video_media_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_video_url" varchar;
  ALTER TABLE "products_gallery360" ADD CONSTRAINT "products_gallery360_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery360" ADD CONSTRAINT "products_gallery360_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery360" ADD CONSTRAINT "_products_v_version_gallery360_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery360" ADD CONSTRAINT "_products_v_version_gallery360_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_gallery360_order_idx" ON "products_gallery360" USING btree ("_order");
  CREATE INDEX "products_gallery360_parent_id_idx" ON "products_gallery360" USING btree ("_parent_id");
  CREATE INDEX "products_gallery360_image_idx" ON "products_gallery360" USING btree ("image_id");
  CREATE INDEX "_products_v_version_gallery360_order_idx" ON "_products_v_version_gallery360" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery360_parent_id_idx" ON "_products_v_version_gallery360" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery360_image_idx" ON "_products_v_version_gallery360" USING btree ("image_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_product_sheet_id_media_assets_id_fk" FOREIGN KEY ("product_sheet_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_video_media_id_media_assets_id_fk" FOREIGN KEY ("video_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_product_sheet_id_media_assets_id_fk" FOREIGN KEY ("version_product_sheet_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_video_media_id_media_assets_id_fk" FOREIGN KEY ("version_video_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_product_sheet_idx" ON "products" USING btree ("product_sheet_id");
  CREATE INDEX "products_video_media_idx" ON "products" USING btree ("video_media_id");
  CREATE INDEX "_products_v_version_version_product_sheet_idx" ON "_products_v" USING btree ("version_product_sheet_id");
  CREATE INDEX "_products_v_version_version_video_media_idx" ON "_products_v" USING btree ("version_video_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_gallery360" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_gallery360" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_gallery360" CASCADE;
  DROP TABLE "_products_v_version_gallery360" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_product_sheet_id_media_assets_id_fk";
  
  ALTER TABLE "products" DROP CONSTRAINT "products_video_media_id_media_assets_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_product_sheet_id_media_assets_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_video_media_id_media_assets_id_fk";
  
  DROP INDEX "products_product_sheet_idx";
  DROP INDEX "products_video_media_idx";
  DROP INDEX "_products_v_version_version_product_sheet_idx";
  DROP INDEX "_products_v_version_version_video_media_idx";
  ALTER TABLE "homepage_key_figures" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "_homepage_v_version_key_figures" ALTER COLUMN "value" SET NOT NULL;
  ALTER TABLE "products" DROP COLUMN "unit_price";
  ALTER TABLE "products" DROP COLUMN "product_sheet_id";
  ALTER TABLE "products" DROP COLUMN "video_media_id";
  ALTER TABLE "products" DROP COLUMN "video_url";
  ALTER TABLE "_products_v" DROP COLUMN "version_unit_price";
  ALTER TABLE "_products_v" DROP COLUMN "version_product_sheet_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_video_media_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_video_url";`)
}
