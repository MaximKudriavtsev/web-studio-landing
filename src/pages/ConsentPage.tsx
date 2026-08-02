import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { site } from '../content/site'
import { usePageSeo } from '../hooks/usePageSeo'

export const ConsentPage = () => {
  const doc = site.legal.consent
  usePageSeo(site.seo.consent, '/consent', { noIndex: true })

  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="shell">
          <BrandMark to="/" />
          <Link className="button button-small button-dark" to="/">
            На главную
          </Link>
        </div>
      </header>
      <main className="legal-main" id="main">
        <article className="legal-document">
          <p className="eyebrow eyebrow-dark">{doc.eyebrow}</p>
          <h1>{doc.title}</h1>
          <p className="legal-warning">
            <strong>Перед публикацией:</strong> {doc.warning.replace(/^Перед публикацией:\s*/i, '')}
          </p>
          <div dangerouslySetInnerHTML={{ __html: doc.html }} />
          <p>
            Пользователь подтверждает, что ознакомился с{' '}
            <Link to="/privacy">политикой конфиденциальности</Link> и понимает условия обработки
            данных.
          </p>
          <p className="legal-date">
            {doc.dateLabel} <mark>{doc.dateValue}</mark>
          </p>
        </article>
      </main>
      <footer className="site-footer">
        <div className="shell footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.brand.name}
          </span>
          <Link to="/privacy">Политика конфиденциальности</Link>
        </div>
      </footer>
    </div>
  )
}
