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
  cors: ['*'],
  csrf: ['*'],
  collections: [Users, Products, Media],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
      max: 10,
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }) => {
            const supabaseUrl =
              process.env.SUPABASE_URL || 'https://kzmzaqhmerjhzkpdaytl.supabase.co'
            return `${supabaseUrl}/storage/v1/object/public/media/${filename}`
          },
        },
      },
      bucket: 'media',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: 'ap-south-1',
        endpoint: 'https://kzmzaqhmerjhzkpdaytl.storage.supabase.co/storage/v1/s3',
        forcePathStyle: true,
      },
    }),
  ],
})
