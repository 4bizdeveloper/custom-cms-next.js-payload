import type { CollectionConfig } from 'payload'
import sharp from 'sharp'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: () => true, // Fixes "You are not allowed to perform this action"
    update: () => true,
    delete: () => true,
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
        // Auto-generate Alt text from filename if left blank
        if (!data.alt && req.file?.name) {
          data.alt = req.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        }

        if (req.file) {
          try {
            let fileBuffer: Buffer

            // Multi-environment buffer extraction (Next.js / Payload 3)
            if (req.file.data && Buffer.isBuffer(req.file.data)) {
              fileBuffer = req.file.data
            } else if ('buffer' in req.file && Buffer.isBuffer((req.file as any).buffer)) {
              fileBuffer = (req.file as any).buffer
            } else if (typeof (req.file as any).arrayBuffer === 'function') {
              const arrayBuf = await (req.file as any).arrayBuffer()
              fileBuffer = Buffer.from(arrayBuf)
            } else {
              fileBuffer = Buffer.from((req.file as any).data || req.file)
            }

            const MAX_SIZE_BYTES = 100 * 1024 // 100 KB size limit
            let quality = 80
            let targetWidth = 1920

            // Step 1: Initial WebP format pass
            let sharpInstance = sharp(fileBuffer).resize({
              width: targetWidth,
              withoutEnlargement: true,
            })
            let compressedBuffer = await sharpInstance.webp({ quality }).toBuffer()

            // Step 2: Quality compression loop
            while (compressedBuffer.length > MAX_SIZE_BYTES && quality > 20) {
              quality -= 10
              compressedBuffer = await sharp(fileBuffer)
                .resize({ width: targetWidth, withoutEnlargement: true })
                .webp({ quality })
                .toBuffer()
            }

            // Step 3: Dimension reduction loop
            while (compressedBuffer.length > MAX_SIZE_BYTES && targetWidth > 600) {
              targetWidth -= 200
              compressedBuffer = await sharp(fileBuffer)
                .resize({ width: targetWidth, withoutEnlargement: true })
                .webp({ quality: 50 })
                .toBuffer()
            }

            // Sync buffer references back to Payload
            req.file.data = compressedBuffer
            ;(req.file as any).buffer = compressedBuffer
            req.file.size = compressedBuffer.length
            req.file.mimetype = 'image/webp'

            if (req.file.name) {
              req.file.name = req.file.name.replace(/\.[^/.]+$/, '') + '.webp'
            }
          } catch (err) {
            console.error('Error compressing WebP image:', err)
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
      required: false,
      admin: {
        description: 'Optional image description for SEO and accessibility.',
      },
    },
  ],
}
