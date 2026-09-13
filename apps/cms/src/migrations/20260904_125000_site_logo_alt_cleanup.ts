import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Corrige le dernier alt historique répété sur le logo du partenaire Site. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media_assets"
    SET "alt_fr" = 'Logo de Site', "alt_en" = 'Site logo'
    WHERE "filename" = 'images_nikes.jpg'
      AND "alt_en" LIKE 'Site Site%';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media_assets"
    SET "alt_fr" = 'Site Site Site Site Site',
        "alt_en" = 'Site Site Site Site Site Site'
    WHERE "filename" = 'images_nikes.jpg'
      AND "alt_en" = 'Site logo';
  `)
}
