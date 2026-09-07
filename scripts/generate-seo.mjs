import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run vite build first.')
  process.exit(1)
}

const siteUrl = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const rawBase = process.env.VITE_BASE ?? '/web-studio-landing/'
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

const origin = siteUrl || 'https://kotdela.ru'
const root = `${origin}${base === '/' ? '/' : base}`
const rootSlash = root.endsWith('/') ? root : `${root}/`
const ogImage = `${rootSlash}og-image.png`

const paths = ['', 'privacy', 'consent']

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

const indexPath = resolve(distDir, 'index.html')
if (existsSync(indexPath)) {
  let html = readFileSync(indexPath, 'utf8')

  const replacements = [
    [/property="og:url" content="[^"]*"/, `property="og:url" content="${rootSlash}"`],
    [/property="og:image" content="[^"]*"/, `property="og:image" content="${ogImage}"`],
    [/name="twitter:image" content="[^"]*"/, `name="twitter:image" content="${ogImage}"`],
  ]

  for (const [pattern, replacement] of replacements) {
    html = html.replace(pattern, replacement)
  }

  writeFileSync(indexPath, html)
  console.log(`Patched index.html OG urls → ${ogImage}`)
}

console.log(`Wrote robots.txt + sitemap.xml (origin=${origin}, base=${base})`)
