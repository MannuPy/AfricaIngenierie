import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Sépare le nom d’entreprise français et anglais des témoignages. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "company_en" varchar;
    ALTER TABLE "_testimonials_v" ADD COLUMN IF NOT EXISTS "version_company_en" varchar;

    UPDATE "testimonials"
    SET "company" = CASE "company"
      WHEN 'Production unit (example)' THEN 'Unité de production (exemple)'
      WHEN 'Industrial site (example)' THEN 'Site industriel (exemple)'
      WHEN 'Agro-industrial sector (example)' THEN 'Filière agro-industrielle (exemple)'
      ELSE "company"
    END,
    "company_en" = CASE "company"
      WHEN 'Production unit (example)' THEN 'Production unit (example)'
      WHEN 'Industrial site (example)' THEN 'Industrial site (example)'
      WHEN 'Agro-industrial sector (example)' THEN 'Agro-industrial sector (example)'
      ELSE "company_en"
    END
    WHERE "company" IN ('Production unit (example)', 'Industrial site (example)', 'Agro-industrial sector (example)');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_testimonials_v" DROP COLUMN IF EXISTS "version_company_en";
    ALTER TABLE "testimonials" DROP COLUMN IF EXISTS "company_en";
  `)
}
