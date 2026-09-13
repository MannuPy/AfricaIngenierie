import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Le versionnage Payload doit refléter chaque champ partagé de la collection. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_partners_v" ADD COLUMN IF NOT EXISTS "version_name_en" varchar;
    UPDATE "_partners_v"
    SET "version_name_en" = 'Beninese cotton sector'
    WHERE "version_name" = 'Filière coton Bénin'
      AND ("version_name_en" IS NULL OR "version_name_en" = '');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "_partners_v" DROP COLUMN IF EXISTS "version_name_en";
  `)
}
