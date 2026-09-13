import { z } from 'zod'

/**
 * Contrat d'environnement serveur.
 *
 * Règle de sécurité : aucune valeur par défaut n'est fournie pour un secret.
 * Un démarrage sans PAYLOAD_SECRET ou sans DATABASE_URL doit échouer
 * immédiatement, plutôt que produire des sessions ou des connexions non sûres.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis').startsWith('postgres'),

  PAYLOAD_SECRET: z
    .string()
    .min(32, 'PAYLOAD_SECRET doit contenir au moins 32 caractères')
    .refine((value) => !value.includes('change-me'), {
      message: 'PAYLOAD_SECRET contient encore la valeur d’exemple : générez un secret aléatoire',
    }),

  NEXT_PUBLIC_SITE_URL: z.url(),
  PAYLOAD_PUBLIC_SERVER_URL: z.url(),
  CMS_INTERNAL_URL: z.url(),

  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_USE_SSL: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  MINIO_BUCKET: z.string().min(1),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_FROM_ADDRESS: z.email(),
  CONTACT_TO: z.email(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Valide `process.env` et rend un message d'erreur exploitable.
 * Ne journalise jamais la valeur d'une variable : uniquement son nom.
 */
export function parseServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const result = serverEnvSchema.safeParse(source)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}  -  ${issue.message}`)
      .join('\n')

    throw new Error(`Configuration d’environnement invalide :\n${details}`)
  }

  return result.data
}
