const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'

export const eventsOpenApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Africa Ingénierie - API événements',
    version: '1.0.0',
    description: 'API publique en lecture seule exposant les événements publiés. Elle ne gère ni paiement, ni billetterie, ni panier, ni commande.',
  },
  servers: [{ url: `${siteUrl}/api`, description: 'API publique' }],
  tags: [{ name: 'Events', description: 'Événements publiés' }],
  paths: {
    '/events': { get: { tags: ['Events'], summary: 'Liste des événements publiés', parameters: [
      { name: 'locale', in: 'query', required: false, schema: { type: 'string', enum: ['fr', 'en'], default: 'fr' } },
      { name: 'from', in: 'query', required: false, schema: { type: 'string', format: 'date-time' } },
      { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
    ], responses: { '200': { description: 'Liste paginée des événements publiés', content: { 'application/json': { schema: { $ref: '#/components/schemas/EventList' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '503': { $ref: '#/components/responses/Unavailable' } } } },
    '/events/{slug}': { get: { tags: ['Events'], summary: 'Détail d’un événement', parameters: [
      { $ref: '#/components/parameters/Slug' }, { name: 'locale', in: 'query', required: false, schema: { type: 'string', enum: ['fr', 'en'], default: 'fr' } },
    ], responses: { '200': { description: 'Événement publié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' } } } },
    '/events/{slug}/calendar': { get: { tags: ['Events'], summary: 'Export ICS d’un événement publié', parameters: [
      { $ref: '#/components/parameters/Slug' }, { name: 'locale', in: 'query', required: false, schema: { type: 'string', enum: ['fr', 'en'], default: 'fr' } },
    ], responses: { '200': { description: 'Fichier iCalendar', content: { 'text/calendar': { schema: { type: 'string' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' } } } },
  },
  components: {
    parameters: { Slug: { name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } } },
    schemas: {
      LocalizedText: { type: 'object', required: ['fr', 'en'], properties: { fr: { type: 'string' }, en: { type: 'string' } } },
      Event: { type: 'object', required: ['slug', 'type', 'title', 'summary', 'startsAt', 'location', 'status', 'calendarUrl'], properties: {
        slug: { type: 'string' }, type: { $ref: '#/components/schemas/LocalizedText' }, title: { $ref: '#/components/schemas/LocalizedText' }, summary: { $ref: '#/components/schemas/LocalizedText' }, body: { $ref: '#/components/schemas/LocalizedText' },
        startsAt: { type: 'string', format: 'date-time' }, endsAt: { type: 'string', format: 'date-time', nullable: true }, location: { type: 'object', required: ['name', 'city', 'country'], properties: { name: { $ref: '#/components/schemas/LocalizedText' }, city: { type: 'string' }, country: { type: 'string' } } }, status: { type: 'string', enum: ['published'] }, calendarUrl: { type: 'string', format: 'uri' },
      } },
      EventList: { type: 'object', required: ['items', 'total', 'locale'], properties: { items: { type: 'array', items: { $ref: '#/components/schemas/Event' } }, total: { type: 'integer' }, locale: { type: 'string', enum: ['fr', 'en'] } } },
      Error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' } } },
    },
    responses: { BadRequest: { description: 'Paramètre invalide', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }, NotFound: { description: 'Événement inexistant ou non publié', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }, Unavailable: { description: 'Service amont temporairement indisponible', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } } },
  },
} as const
