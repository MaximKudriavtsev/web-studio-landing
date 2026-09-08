import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'

type Integration = {
  name: string
  status: string
}

type IntegrationResponse = {
  integrations: Integration[]
}

const apiUrl = (import.meta.env.VITE_AI_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const AiPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    document.title = 'AI Growth Engine — КОТ ДЕЛА'

    Promise.all([
      fetch(`${apiUrl}/health`).then((response) => {
        if (!response.ok) throw new Error('Backend is unavailable')
        return response.json()
      }),
      fetch(`${apiUrl}/api/integrations`).then((response) => {
        if (!response.ok) throw new Error('Integrations are unavailable')
        return response.json() as Promise<IntegrationResponse>
      }),
    ])
      .then(([, integrationData]) => {
        setBackendOnline(true)
        setIntegrations(integrationData.integrations)
      })
      .catch(() => setBackendOnline(false))
  }, [])

  return (
    <div className="ai-page">
      <header className="ai-header shell">
        <BrandMark to="/" />
        <Link className="button button-small button-dark" to="/">
          На главную
        </Link>
      </header>
      <main className="ai-main shell" id="main">
        <p className="eyebrow eyebrow-dark">Локальный эксперимент</p>
        <h1>AI Growth Engine</h1>
        <p className="ai-intro">Безопасный контур для исследования спроса и подготовки предложений роста.</p>

        <section className="ai-status-grid" aria-label="Состояние системы">
          <article className="ai-status-card">
            <span>Backend</span>
            <strong>{backendOnline === null ? 'ПРОВЕРКА' : backendOnline ? 'ONLINE' : 'OFFLINE'}</strong>
          </article>
          <article className="ai-status-card">
            <span>Environment</span>
            <strong>LOCAL</strong>
          </article>
          <article className="ai-status-card">
            <span>Stage</span>
            <strong>FOUNDATION</strong>
          </article>
          <article className="ai-status-card">
            <span>Mode</span>
            <strong>APPROVAL</strong>
          </article>
        </section>

        <section className="ai-integrations">
          <h2>Интеграции</h2>
          {backendOnline ? (
            <ul>
              {integrations.map((integration) => (
                <li key={integration.name}>
                  <span>{integration.name}</span>
                  <strong>{integration.status}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Запустите локальный backend на порту 8000, чтобы увидеть статусы интеграций.</p>
          )}
        </section>
      </main>
    </div>
  )
}
