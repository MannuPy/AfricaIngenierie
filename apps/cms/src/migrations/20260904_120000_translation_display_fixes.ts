import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Corrections de données visibles en anglais.
 *
 * Les contenus réels ne sont jamais réécrits : seules les valeurs exactes
 * provenant du seed de démonstration ou du défaut historique sont corrigées.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "name_en" varchar;
    UPDATE "partners"
    SET "name_en" = 'Beninese cotton sector'
    WHERE "name" = 'Filière coton Bénin' AND ("name_en" IS NULL OR "name_en" = '');
  `)

  await db.execute(sql`
    UPDATE "navigation_locales"
    SET "testimonial_label" = 'Leave a testimonial'
    WHERE "_locale" = 'en'
      AND ("testimonial_label" IS NULL OR "testimonial_label" = 'Laisser un témoignage');
  `)

  await db.execute(sql`
    UPDATE "testimonials"
    SET "person_name" = regexp_replace("person_name", ' \\(témoignage de démonstration\\)$', '')
    WHERE "person_name" ~ ' \\(témoignage de démonstration\\)$';
  `)

  await db.execute(sql`
    UPDATE "testimonials"
    SET "company" = CASE "company"
      WHEN 'Unité de production — exemple' THEN 'Production unit (example)'
      WHEN 'Site industriel — exemple' THEN 'Industrial site (example)'
      WHEN 'Filière agro-industrielle — exemple' THEN 'Agro-industrial sector (example)'
      ELSE "company"
    END
    WHERE "company" IN ('Unité de production — exemple', 'Site industriel — exemple', 'Filière agro-industrielle — exemple');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "partners" DROP COLUMN IF EXISTS "name_en";
  `)
}
