import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Harmonise les textes alternatifs de quelques médias historiques importés
 * avant la règle bilingue. Les filtres portent sur le nom de fichier et sur
 * les anciennes valeurs exactes afin de ne jamais écraser une correction
 * éditoriale ultérieure.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media_assets"
    SET "alt_fr" = 'Logo de Site', "alt_en" = 'Site logo'
    WHERE "filename" = 'images_nikes.jpg'
      AND "alt_en" = ' image  logo de nike ';

    UPDATE "media_assets"
    SET "alt_fr" = 'Portrait de Kylian Mbappé au Real Madrid',
        "alt_en" = 'Portrait of Kylian Mbappe at Real Madrid'
    WHERE "filename" = 'kiki_Mbappée4fafaf438.webp'
      AND "alt_en" = 'images de kylian mbappe au real madrid';

    UPDATE "media_assets"
    SET "alt_fr" = 'Logo de Nike', "alt_en" = 'Nike logo'
    WHERE "filename" = 'nike_humbnail.png'
      AND "alt_en" = ' image  logo de nike ';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "media_assets"
    SET "alt_fr" = ' image  logo de nike ', "alt_en" = ' image  logo de nike '
    WHERE "filename" IN ('images_nikes.jpg', 'nike_humbnail.png');
  `)
}
