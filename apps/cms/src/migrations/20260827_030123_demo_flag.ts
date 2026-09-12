import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "expertises" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_expertises_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_projects_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "realisations" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_realisations_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "formations" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_formations_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "formation_sessions" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "events" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "team_members" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_team_members_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "partners" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_partners_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "testimonials" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  ALTER TABLE "legal_documents" ADD COLUMN "is_demo" boolean DEFAULT false;
  ALTER TABLE "_legal_documents_v" ADD COLUMN "version_is_demo" boolean DEFAULT false;
  CREATE INDEX "pages_is_demo_idx" ON "pages" USING btree ("is_demo");
  CREATE INDEX "_pages_v_version_version_is_demo_idx" ON "_pages_v" USING btree ("version_is_demo");
  CREATE INDEX "expertises_is_demo_idx" ON "expertises" USING btree ("is_demo");
  CREATE INDEX "_expertises_v_version_version_is_demo_idx" ON "_expertises_v" USING btree ("version_is_demo");
  CREATE INDEX "projects_is_demo_idx" ON "projects" USING btree ("is_demo");
  CREATE INDEX "_projects_v_version_version_is_demo_idx" ON "_projects_v" USING btree ("version_is_demo");
  CREATE INDEX "realisations_is_demo_idx" ON "realisations" USING btree ("is_demo");
  CREATE INDEX "_realisations_v_version_version_is_demo_idx" ON "_realisations_v" USING btree ("version_is_demo");
  CREATE INDEX "formations_is_demo_idx" ON "formations" USING btree ("is_demo");
  CREATE INDEX "_formations_v_version_version_is_demo_idx" ON "_formations_v" USING btree ("version_is_demo");
  CREATE INDEX "formation_sessions_is_demo_idx" ON "formation_sessions" USING btree ("is_demo");
  CREATE INDEX "events_is_demo_idx" ON "events" USING btree ("is_demo");
  CREATE INDEX "_events_v_version_version_is_demo_idx" ON "_events_v" USING btree ("version_is_demo");
  CREATE INDEX "products_is_demo_idx" ON "products" USING btree ("is_demo");
  CREATE INDEX "_products_v_version_version_is_demo_idx" ON "_products_v" USING btree ("version_is_demo");
  CREATE INDEX "team_members_is_demo_idx" ON "team_members" USING btree ("is_demo");
  CREATE INDEX "_team_members_v_version_version_is_demo_idx" ON "_team_members_v" USING btree ("version_is_demo");
  CREATE INDEX "partners_is_demo_idx" ON "partners" USING btree ("is_demo");
  CREATE INDEX "_partners_v_version_version_is_demo_idx" ON "_partners_v" USING btree ("version_is_demo");
  CREATE INDEX "testimonials_is_demo_idx" ON "testimonials" USING btree ("is_demo");
  CREATE INDEX "_testimonials_v_version_version_is_demo_idx" ON "_testimonials_v" USING btree ("version_is_demo");
  CREATE INDEX "legal_documents_is_demo_idx" ON "legal_documents" USING btree ("is_demo");
  CREATE INDEX "_legal_documents_v_version_version_is_demo_idx" ON "_legal_documents_v" USING btree ("version_is_demo");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "pages_is_demo_idx";
  DROP INDEX "_pages_v_version_version_is_demo_idx";
  DROP INDEX "expertises_is_demo_idx";
  DROP INDEX "_expertises_v_version_version_is_demo_idx";
  DROP INDEX "projects_is_demo_idx";
  DROP INDEX "_projects_v_version_version_is_demo_idx";
  DROP INDEX "realisations_is_demo_idx";
  DROP INDEX "_realisations_v_version_version_is_demo_idx";
  DROP INDEX "formations_is_demo_idx";
  DROP INDEX "_formations_v_version_version_is_demo_idx";
  DROP INDEX "formation_sessions_is_demo_idx";
  DROP INDEX "events_is_demo_idx";
  DROP INDEX "_events_v_version_version_is_demo_idx";
  DROP INDEX "products_is_demo_idx";
  DROP INDEX "_products_v_version_version_is_demo_idx";
  DROP INDEX "team_members_is_demo_idx";
  DROP INDEX "_team_members_v_version_version_is_demo_idx";
  DROP INDEX "partners_is_demo_idx";
  DROP INDEX "_partners_v_version_version_is_demo_idx";
  DROP INDEX "testimonials_is_demo_idx";
  DROP INDEX "_testimonials_v_version_version_is_demo_idx";
  DROP INDEX "legal_documents_is_demo_idx";
  DROP INDEX "_legal_documents_v_version_version_is_demo_idx";
  ALTER TABLE "pages" DROP COLUMN "is_demo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "expertises" DROP COLUMN "is_demo";
  ALTER TABLE "_expertises_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "projects" DROP COLUMN "is_demo";
  ALTER TABLE "_projects_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "realisations" DROP COLUMN "is_demo";
  ALTER TABLE "_realisations_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "formations" DROP COLUMN "is_demo";
  ALTER TABLE "_formations_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "formation_sessions" DROP COLUMN "is_demo";
  ALTER TABLE "events" DROP COLUMN "is_demo";
  ALTER TABLE "_events_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "products" DROP COLUMN "is_demo";
  ALTER TABLE "_products_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "team_members" DROP COLUMN "is_demo";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "partners" DROP COLUMN "is_demo";
  ALTER TABLE "_partners_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "testimonials" DROP COLUMN "is_demo";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_is_demo";
  ALTER TABLE "legal_documents" DROP COLUMN "is_demo";
  ALTER TABLE "_legal_documents_v" DROP COLUMN "version_is_demo";`)
}
