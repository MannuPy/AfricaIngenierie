import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Ajoute la publication individuelle des chiffres clés. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage_key_figures"
      ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true;
    UPDATE "homepage_key_figures" SET "is_visible" = true WHERE "is_visible" IS NULL;

    ALTER TABLE "_homepage_v_version_key_figures"
      ADD COLUMN IF NOT EXISTS "version_is_visible" boolean DEFAULT true;
    UPDATE "_homepage_v_version_key_figures"
      SET "version_is_visible" = true
      WHERE "version_is_visible" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_homepage_v_version_key_figures"
      DROP COLUMN IF EXISTS "version_is_visible";
    ALTER TABLE "homepage_key_figures"
      DROP COLUMN IF EXISTS "is_visible";
  `)
}
