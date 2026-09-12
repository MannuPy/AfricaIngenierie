import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_assets" ADD COLUMN "demo_key" varchar;
  CREATE UNIQUE INDEX "media_assets_demo_key_idx" ON "media_assets" USING btree ("demo_key");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_assets_demo_key_idx";
  ALTER TABLE "media_assets" DROP COLUMN "demo_key";`)
}
