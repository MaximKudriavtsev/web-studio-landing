import { Link } from 'react-router-dom'
import { CatLogo } from '../components/CatLogo'
import { site } from '../content/site'
import { usePageSeo } from '../hooks/usePageSeo'

export const NotFoundPage = () => {
  usePageSeo(site.seo.notFound, '/404')

  return (
    <div className="not-found">
      <main>
        <div className="contact-cat" aria-hidden="true">
          <CatLogo />
        </div>
        <p className="eyebrow eyebrow-dark">{site.notFound.eyebrow}</p>
        <h1>
          {site.notFound.title.split('\n').map((line, index) => (
            <span key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </h1>
        <Link className="button button-dark" to="/">
          {site.notFound.cta}
        </Link>
      </main>
    </div>
  )
}
