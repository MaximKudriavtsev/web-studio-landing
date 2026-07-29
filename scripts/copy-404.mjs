import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const indexPath = resolve(distDir, 'index.html')
const notFoundPath = resolve(distDir, '404.html')

if (!existsSync(indexPath)) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

copyFileSync(indexPath, notFoundPath)
console.log('Copied dist/index.html → dist/404.html (SPA fallback)')
