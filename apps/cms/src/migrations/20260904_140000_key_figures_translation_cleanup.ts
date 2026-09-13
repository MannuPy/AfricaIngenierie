import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Nettoie les champs hérités d’une ancienne version de la section Chiffres clés. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage_sections_locales" AS locales
    SET "eyebrow" = NULL, "cta_label" = NULL
    FROM "homepage_sections" AS sections
    WHERE locales."_parent_id" = sections."id"
      AND sections."key" = 'figures';

    UPDATE "_homepage_v_version_sections_locales"
    SET "eyebrow" = NULL, "cta_label" = NULL
    WHERE "title" = 'Chiffres clés' OR "title" = 'Key figures';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Les valeurs supprimées étaient des résidus incohérents et ne peuvent pas
  // être restaurées sans réintroduire une traduction erronée.
}
