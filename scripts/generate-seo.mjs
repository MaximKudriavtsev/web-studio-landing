import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run vite build first.')
  process.exit(1)
}

const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const rawBase = process.env.VITE_BASE ?? '/web-studio-landing/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

const origin = siteUrl || 'https://example.com'
const root = `${origin}${base === '/' ? '/' : base}`

const paths = ['', 'services', 'work', 'contact', 'privacy', 'personal-data']

const sitemapUrls = paths
  .map((path) => {
    const loc = path ? `${root}${path}` : root.replace(/\/?$/, '/')
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`
  })
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${root}sitemap.xml
`

writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap)
writeFileSync(resolve(distDir, 'robots.txt'), robots)
console.log(`Wrote robots.txt + sitemap.xml (origin=${origin}, base=${base})`)
