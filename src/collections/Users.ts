import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true, // Enables header-based API Key authentication for external platforms
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Store Manager', value: 'manager' },
      ],
      defaultValue: 'manager',
      required: true,
    },
  ],
}
