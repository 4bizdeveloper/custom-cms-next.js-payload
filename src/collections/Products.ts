import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    // Order: Title (clickable to product), Images (not clickable), Price, Slug, Updated At
    defaultColumns: ['title', 'images', 'price', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Product Details',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                position: 'sidebar',
              },
              hooks: {
                beforeValidate: [
                  ({ value, siblingData }) => {
                    if (!value && siblingData?.title) {
                      return siblingData.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'price',
              type: 'number',
              required: true,
              min: 0,
            },
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: 'Upload product images or select existing media from library',
              },
            },
            {
              name: 'description',
              type: 'richText',
            },
            {
              name: 'customAttributes',
              type: 'array',
              label: 'Custom Specifications',
              fields: [
                {
                  name: 'key',
                  type: 'text',
                  label: 'Attribute Name (e.g., Material, Color, Warranty)',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  label: 'Attribute Value',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Technical SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              label: 'Meta Title',
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              label: 'Meta Description',
            },
            {
              name: 'canonicalURL',
              type: 'text',
              label: 'Canonical URL',
            },
            {
              name: 'metaRobots',
              type: 'select',
              defaultValue: 'index, follow',
              options: [
                { label: 'Index, Follow', value: 'index, follow' },
                { label: 'Noindex, Follow', value: 'noindex, follow' },
                { label: 'Index, Nofollow', value: 'index, nofollow' },
                { label: 'Noindex, Nofollow', value: 'noindex, nofollow' },
              ],
            },
            {
              name: 'schemaMarkup',
              type: 'json',
              label: 'JSON-LD Schema Markup',
            },
          ],
        },
      ],
    },
  ],
}
