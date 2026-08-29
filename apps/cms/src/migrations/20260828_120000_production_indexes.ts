import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Indexes ciblés par les lectures publiques et la boîte de réception. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "events_editorial_status_starts_at_idx"
      ON "events" USING btree ("editorial_status", "starts_at");
    CREATE INDEX IF NOT EXISTS "contact_messages_state_created_at_idx"
      ON "contact_messages" USING btree ("state", "created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "events_editorial_status_starts_at_idx";
    DROP INDEX IF EXISTS "contact_messages_state_created_at_idx";
  `)
}
