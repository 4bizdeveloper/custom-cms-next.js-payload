import type { CollectionConfig } from 'payload'
import sharp from 'sharp'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public access for headlessly consuming e-commerce frontends
  },
  upload: {
    staticDir: 'media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'product_large',
        width: 1200,
        height: 1200,
        fit: 'inside',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
    ],
  },
  hooks: {
    beforeChange: [
      async ({ req, data }) => {
        // Intercept upload buffer and strictly compress main file to WebP under target size limit
        if (req.file) {
          let fileBuffer: Buffer
          if ('buffer' in req.file && Buffer.isBuffer((req.file as any).buffer)) {
            fileBuffer = (req.file as any).buffer
          } else {
            const arrayBuf = await (req.file as any).arrayBuffer()
            fileBuffer = Buffer.from(arrayBuf)
          }

          let quality = 80
          let compressedBuffer = await sharp(fileBuffer).webp({ quality }).toBuffer()

          // Target max file size: 100 KB (102,400 bytes)
          const MAX_SIZE_BYTES = 100 * 1024

          while (compressedBuffer.length > MAX_SIZE_BYTES && quality > 10) {
            quality -= 10
            compressedBuffer = await sharp(fileBuffer).webp({ quality }).toBuffer()
          }

          ;(req.file as any).buffer = compressedBuffer
          req.file.size = compressedBuffer.length
          ;(req.file as any).mimetype = 'image/webp'

          if (req.file.name) {
            req.file.name = req.file.name.replace(/\.[^/.]+$/, '') + '.webp'
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
