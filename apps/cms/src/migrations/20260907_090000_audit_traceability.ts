import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Étend le journal immuable avec le contexte technique de chaque action. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'read';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'export';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'preview';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'login_failed';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'access_denied';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'purge';
    ALTER TYPE "public"."enum_audit_logs_action" ADD VALUE IF NOT EXISTS 'security';

    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "request_id" varchar;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "method" varchar;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "path" varchar;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "status_code" numeric;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "result" varchar;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "user_agent_hash" varchar;
    ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

    CREATE INDEX IF NOT EXISTS "audit_logs_request_id_idx"
      ON "audit_logs" USING btree ("request_id");
    CREATE INDEX IF NOT EXISTS "audit_logs_path_created_at_idx"
      ON "audit_logs" USING btree ("path", "created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "audit_logs_request_id_idx";
    DROP INDEX IF EXISTS "audit_logs_path_created_at_idx";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "metadata";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "user_agent_hash";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "result";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "status_code";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "path";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "method";
    ALTER TABLE "audit_logs" DROP COLUMN IF EXISTS "request_id";
  `)
}
