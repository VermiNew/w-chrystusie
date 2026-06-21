import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const input = resolve(__dirname, '..', 'public', 'logo.png')
const outDir = resolve(__dirname, '..', 'public')

mkdirSync(outDir, { recursive: true })

const sizes = [
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  await sharp(input)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(outDir, name))

  console.log(`✓ ${name} (${size}×${size})`)
}

// Maskable icon: logo scaled to 76% with safe-zone padding on a solid background.
// The background color matches the logo's own background so there's no visible border.
const MASKABLE_SIZE = 512
const LOGO_SAFE = Math.round(MASKABLE_SIZE * 0.76)
const BG = { r: 249, g: 246, b: 245 }

const logoResized = await sharp(input)
  .resize(LOGO_SAFE, LOGO_SAFE, { fit: 'contain', background: BG })
  .png()
  .toBuffer()

const padding = Math.round((MASKABLE_SIZE - LOGO_SAFE) / 2)

await sharp({ create: { width: MASKABLE_SIZE, height: MASKABLE_SIZE, channels: 3, background: BG } })
  .composite([{ input: logoResized, top: padding, left: padding }])
  .png()
  .toFile(resolve(outDir, 'icon-512-maskable.png'))

console.log(`✓ icon-512-maskable.png (${MASKABLE_SIZE}×${MASKABLE_SIZE}, maskable)`)
