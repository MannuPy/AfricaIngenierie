import config from '@payload-config'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

/**
 * API REST Payload  -  servie uniquement sur l'hôte d'administration
 * (admin.localhost en local). L'API publique des événements vit sur
 * apps/web (/api/events), sur l'hôte du site : aucune collision possible.
 */
export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
