import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
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
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    // Dynamic Custom Form Attributes (Extend product forms per category)
    {
      name: 'customAttributes',
      type: 'array',
      label: 'Custom Specifications',
      fields: [
        {
          name: 'key',
          type: 'text',
          label: 'Attribute Name (e.g., Material, Color, Warranty)',
        },
        {
          name: 'value',
          type: 'text',
          label: 'Attribute Value',
        },
      ],
    },

    // Technical SEO Tab
    {
      type: 'tabs',
      tabs: [
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
