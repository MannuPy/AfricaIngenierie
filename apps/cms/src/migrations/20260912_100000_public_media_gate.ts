import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Les médias sont privés par défaut et deviennent publics après validation. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "is_public" boolean DEFAULT false;
    UPDATE "media_assets" SET "is_public" = false WHERE "is_public" IS NULL;
    ALTER TABLE "media_assets" ALTER COLUMN "is_public" SET DEFAULT false;
    ALTER TABLE "media_assets" ALTER COLUMN "is_public" SET NOT NULL;
    CREATE INDEX IF NOT EXISTS "media_assets_is_public_idx"
      ON "media_assets" USING btree ("is_public");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_assets_is_public_idx";
    ALTER TABLE "media_assets" DROP COLUMN IF EXISTS "is_public";
  `)
}
