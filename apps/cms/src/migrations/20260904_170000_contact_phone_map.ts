import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Ajoute le téléphone des demandes et les coordonnées cartographiques globales. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "contact_messages"
      ADD COLUMN IF NOT EXISTS "phone" varchar;

    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "map_latitude" numeric,
      ADD COLUMN IF NOT EXISTS "map_longitude" numeric,
      ADD COLUMN IF NOT EXISTS "map_zoom" numeric DEFAULT 15;

    UPDATE "site_settings" SET "map_zoom" = 15 WHERE "map_zoom" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "map_zoom",
      DROP COLUMN IF EXISTS "map_longitude",
      DROP COLUMN IF EXISTS "map_latitude";
    ALTER TABLE "contact_messages"
      DROP COLUMN IF EXISTS "phone";
  `)
}
