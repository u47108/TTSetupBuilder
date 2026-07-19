import type { CatalogDocument, CatalogProduct } from '@ttsetupbuilder/types';

export type { CatalogDocument, CatalogProduct };

/** JSON Schema-shaped description for tooling (not a runtime AJV dependency). */
export const catalogDocumentJsonSchema = {
  $id: 'https://ttsetupbuilder.local/schemas/catalog-document.json',
  type: 'object',
  required: ['version', 'generatedAt', 'products'],
  properties: {
    version: { const: 1 },
    generatedAt: { type: 'string', format: 'date-time' },
    products: {
      type: 'array',
      items: { $ref: '#/$defs/catalogProduct' },
    },
  },
  $defs: {
    catalogProduct: {
      type: 'object',
      required: [
        'id',
        'slug',
        'name',
        'brandId',
        'category',
        'images',
        'imageLocalPaths',
        'provenance',
      ],
      properties: {
        id: { type: 'string' },
        slug: { type: 'string' },
        name: { type: 'string' },
        brandId: { type: 'string' },
        category: {
          type: 'string',
          enum: ['blade', 'rubber', 'ball', 'shoe', 'apparel', 'accessory', 'other'],
        },
        description: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'src', 'alt'],
            properties: {
              id: { type: 'string' },
              src: { type: 'string', description: 'Owned path only — never third-party hotlink' },
              alt: { type: 'string' },
              width: { type: 'number' },
              height: { type: 'number' },
              isPrimary: { type: 'boolean' },
            },
          },
        },
        imageLocalPaths: { type: 'array', items: { type: 'string' } },
        provenance: {
          type: 'object',
          required: ['sourceId', 'sourceUrl', 'scrapedAt'],
          properties: {
            sourceId: { type: 'string' },
            sourceUrl: { type: 'string', format: 'uri' },
            scrapedAt: { type: 'string', format: 'date-time' },
            license: { type: 'string' },
            attribution: { type: 'string' },
            mediaRights: { type: 'string' },
          },
        },
      },
    },
  },
} as const;
