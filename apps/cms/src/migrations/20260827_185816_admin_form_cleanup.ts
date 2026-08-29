import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  ALTER TABLE "realisations" ADD COLUMN "media_id" integer;
  ALTER TABLE "_realisations_v" ADD COLUMN "version_media_id" integer;
  ALTER TABLE "realisations" ADD CONSTRAINT "realisations_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realisations_v" ADD CONSTRAINT "_realisations_v_version_media_id_media_assets_id_fk" FOREIGN KEY ("version_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "realisations_media_idx" ON "realisations" USING btree ("media_id");
  CREATE INDEX "_realisations_v_version_version_media_idx" ON "_realisations_v" USING btree ("version_media_id");
  ALTER TABLE "products" DROP COLUMN "cta_href";
  ALTER TABLE "_products_v" DROP COLUMN "version_cta_href";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  ALTER TABLE "realisations" DROP CONSTRAINT "realisations_media_id_media_assets_id_fk";
  
  ALTER TABLE "_realisations_v" DROP CONSTRAINT "_realisations_v_version_media_id_media_assets_id_fk";
  
  DROP INDEX "realisations_media_idx";
  DROP INDEX "_realisations_v_version_version_media_idx";
  ALTER TABLE "products" ADD COLUMN "cta_href" varchar DEFAULT '/fr/contact';
  ALTER TABLE "_products_v" ADD COLUMN "version_cta_href" varchar DEFAULT '/fr/contact';
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  ALTER TABLE "realisations" DROP COLUMN "media_id";
  ALTER TABLE "_realisations_v" DROP COLUMN "version_media_id";`)
}
