import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Products } from './collections/Products'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  // Enable cross-origin access so external e-commerce applications can query your CMS
  cors: ['*'],
  csrf: ['*'],
  collections: [Users, Products, Media],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'secret-key-change-in-prod',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 10, // Optimized for serverless deployment on Vercel
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }) =>
            `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${filename}`,
        },
      },
      bucket: 'media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: 'ap-south-1', // Matches your Supabase project region
        endpoint: 'https://kzmzaqhmerjhzkpdaytl.storage.supabase.co/storage/v1/s3',
        forcePathStyle: true,
      },
    }),
  ],
})
