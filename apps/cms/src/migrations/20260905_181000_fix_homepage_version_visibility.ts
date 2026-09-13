import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Aligne la table des versions des chiffres clés sur le schéma courant. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_homepage_v_version_key_figures"
      ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true;
    UPDATE "_homepage_v_version_key_figures"
      SET "is_visible" = true
      WHERE "is_visible" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_homepage_v_version_key_figures"
      DROP COLUMN IF EXISTS "is_visible";
  `)
}
