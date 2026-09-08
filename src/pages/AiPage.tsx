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

type TopResult = { phrase: string; count: number }
type TopResponse = {
  seedPhrase: string
  totalCount: number
  results: TopResult[]
  associations: TopResult[]
}

const apiUrl = (import.meta.env.VITE_AI_API_URL || 'http://localhost:8000').replace(/\/$/, '')

export const AiPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  const [phrase, setPhrase] = useState('создание сайтов')
  const [numPhrases, setNumPhrases] = useState(20)
  const [searching, setSearching] = useState(false)
  const [topData, setTopData] = useState<TopResponse | null>(null)
  const [message, setMessage] = useState('')

  const wordstat = integrations.find((integration) => integration.name === 'Wordstat')

  const checkWordstat = async () => {
    setChecking(true)
    setMessage('')
    try {
      const response = await fetch(`${apiUrl}/api/integrations/wordstat/check`, { method: 'POST' })
      const data = (await response.json()) as { status: string; message?: string }
      setIntegrations((current) => current.map((item) =>
        item.name === 'Wordstat' ? { ...item, status: data.status } : item,
      ))
      if (data.message) setMessage(data.message)
    } catch {
      setMessage('Не удалось связаться с локальным backend.')
    } finally {
      setChecking(false)
    }
  }

  const searchWordstat = async (event: React.FormEvent) => {
    event.preventDefault()
    setSearching(true)
    setMessage('')
    setTopData(null)
    try {
      const response = await fetch(`${apiUrl}/api/wordstat/top`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, numPhrases, regions: [], devices: ['DEVICE_ALL'] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Wordstat request failed')
      setTopData(data as TopResponse)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ошибка запроса Wordstat.')
    } finally {
      setSearching(false)
    }
  }

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

        <section className="ai-wordstat">
          <div className="ai-wordstat-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Первый источник спроса</p>
              <h2>Yandex Wordstat</h2>
            </div>
            <strong>{wordstat?.status || 'NOT_CONFIGURED'}</strong>
          </div>
          <p>Credentials: {wordstat?.status === 'NOT_CONFIGURED' ? 'не настроены' : 'настроены локально'}</p>
          <button className="button button-dark" type="button" onClick={checkWordstat} disabled={!backendOnline || checking}>
            {checking ? 'Проверяем…' : 'Проверить подключение'}
          </button>

          {wordstat?.status === 'CONNECTED' ? (
            <form className="ai-wordstat-form" onSubmit={searchWordstat}>
              <label>
                Поисковая фраза
                <input value={phrase} onChange={(event) => setPhrase(event.target.value)} maxLength={400} required />
              </label>
              <label>
                Количество результатов
                <input type="number" value={numPhrases} onChange={(event) => setNumPhrases(Number(event.target.value))} min={1} max={100} required />
              </label>
              <button className="button button-dark" disabled={searching}>{searching ? 'Получаем…' : 'Получить данные'}</button>
            </form>
          ) : null}

          {message ? <p className="ai-message" role="status">{message}</p> : null}
          {topData ? (
            <div className="ai-wordstat-results">
              <p>Seed: <strong>{topData.seedPhrase}</strong> · Total count: <strong>{topData.totalCount.toLocaleString('ru-RU')}</strong></p>
              <div>
                <ResultList title="Популярные запросы" items={topData.results.slice(0, 5)} />
                <ResultList title="Ассоциации" items={topData.associations.slice(0, 5)} />
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

const ResultList = ({ title, items }: { title: string; items: TopResult[] }) => (
  <section>
    <h3>{title}</h3>
    <ol>
      {items.map((item) => <li key={item.phrase}><span>{item.phrase}</span><strong>{item.count.toLocaleString('ru-RU')}</strong></li>)}
    </ol>
  </section>
)
