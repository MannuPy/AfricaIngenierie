import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Bouton « Laisser un témoignage » du pied de page.
 *
 * Le libellé est un appel à l'action, donc du contenu éditorial : il vient du
 * CMS, jamais du code. Le réglage global Navigation porte déjà les libellés de
 * navigation ; le champ y est ajouté. Il est traduit, donc il vit dans la table
 * `navigation_locales`, une ligne par langue. Navigation n'est pas versionné :
 * aucune table miroir à modifier.
 *
 * Le champ est laissé nullable : un libellé vide retire simplement le bouton du
 * site, ce qui est le comportement attendu si le Client n'en veut pas.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "navigation_locales" ADD COLUMN IF NOT EXISTS "testimonial_label" varchar DEFAULT 'Laisser un témoignage';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "navigation_locales" DROP COLUMN IF EXISTS "testimonial_label";`)
}
