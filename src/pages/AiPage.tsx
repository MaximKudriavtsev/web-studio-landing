import { useCallback, useEffect, useState } from 'react'
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
type IntelligenceItem = {
  raw_query_id: number; phrase: string; demand: number | null; source_type: string | null
  intent: string; business_relevance: string; commerciality: string; cluster_name: string
  disposition: string; confidence: number
}
type IntelligenceData = {
  raw_queries: number; analyzed: number; ignored: number; watch: number
  opportunity_candidates: number; clusters: number; items: IntelligenceItem[]
}
type GrowthOpportunity = { id:number; title:string; priority:string; opportunity_type:string; service_line:string; platform:string; site_coverage:string; recommended_action:string; rationale:string; evidence_count:number; total_frequency_evidence:number; strongest_queries:{phrase:string;frequency:number}[] }
type StrategicHypothesis = { id:number; title:string; service_line:string; platform:string; evidence_status:string; status:string }

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
  const [intelligence, setIntelligence] = useState<IntelligenceData | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [gigachatChecking, setGigachatChecking] = useState(false)
  const [dispositionFilter, setDispositionFilter] = useState('')
  const [clusterFilter, setClusterFilter] = useState('')
  const [opportunities, setOpportunities] = useState<GrowthOpportunity[]>([])
  const [strategicDirections, setStrategicDirections] = useState<StrategicHypothesis[]>([])

  const wordstat = integrations.find((integration) => integration.name === 'Wordstat')
  const gigachat = integrations.find((integration) => integration.name === 'GigaChat')

  const loadIntelligence = useCallback(async () => {
    const params = new URLSearchParams()
    if (dispositionFilter) params.set('disposition', dispositionFilter)
    if (clusterFilter) params.set('cluster', clusterFilter)
    const response = await fetch(`${apiUrl}/api/intelligence/queries?${params}`)
    if (response.ok) setIntelligence(await response.json() as IntelligenceData)
  }, [clusterFilter, dispositionFilter])

  const analyzeExisting = async () => {
    setAnalyzing(true)
    setMessage('')
    try {
      const response = await fetch(`${apiUrl}/api/intelligence/analyze-existing`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 44 }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'GigaChat analysis failed')
      setMessage(`Обработано: ${data.processed}. Batches: ${data.batches}.`)
      await loadIntelligence()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Ошибка анализа.')
    } finally {
      setAnalyzing(false)
    }
  }

  const checkGigaChat = async () => {
    setGigachatChecking(true)
    setMessage('')
    try {
      const response = await fetch(`${apiUrl}/api/integrations/gigachat/check`, { method: 'POST' })
      const data = await response.json() as { status: string; message?: string; warning?: string }
      setIntegrations((current) => current.map((item) => item.name === 'GigaChat' ? { ...item, status: data.status } : item))
      if (data.message) setMessage(data.message)
      if (data.warning) setMessage(data.warning)
    } catch {
      setMessage('Не удалось связаться с локальным backend.')
    } finally {
      setGigachatChecking(false)
    }
  }

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

  useEffect(() => {
    if (backendOnline) {
      void loadIntelligence()
      void fetch(`${apiUrl}/api/opportunities`).then((response) => response.ok ? response.json() : null).then((data) => data && setOpportunities(data.items))
      void fetch(`${apiUrl}/api/strategy/hypotheses`).then((response) => response.ok ? response.json() : null).then((data) => data && setStrategicDirections(data))
    }
  }, [backendOnline, loadIntelligence])

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

        <section className="ai-intelligence">
          <div className="ai-wordstat-heading">
            <div><p className="eyebrow eyebrow-dark">Semantic layer</p><h2>Search Intelligence</h2></div>
            <strong>{gigachat?.status || 'NOT_CONFIGURED'}</strong>
          </div>
          <div className="ai-intelligence-stats">
            <span>Raw <strong>{intelligence?.raw_queries ?? 0}</strong></span>
            <span>Analyzed <strong>{intelligence?.analyzed ?? 0}</strong></span>
            <span>Opportunity <strong>{intelligence?.opportunity_candidates ?? 0}</strong></span>
            <span>Watch <strong>{intelligence?.watch ?? 0}</strong></span>
            <span>Ignored <strong>{intelligence?.ignored ?? 0}</strong></span>
            <span>Clusters <strong>{intelligence?.clusters ?? 0}</strong></span>
          </div>
          <button className="button button-dark" onClick={checkGigaChat} disabled={!backendOnline || gigachatChecking}>
            {gigachatChecking ? 'Проверяем…' : 'Проверить GigaChat'}
          </button>
          {gigachat?.status === 'CONNECTED' ? (
            <button className="button button-dark ai-action-secondary" onClick={analyzeExisting} disabled={analyzing}>
              {analyzing ? 'Анализируем…' : 'Анализировать существующие запросы'}
            </button>
          ) : null}
          <div className="ai-intelligence-filters">
            <label>Disposition<select value={dispositionFilter} onChange={(event) => setDispositionFilter(event.target.value)}><option value="">Все</option><option>OPPORTUNITY_CANDIDATE</option><option>WATCH</option><option>IGNORE</option></select></label>
            <label>Cluster<select value={clusterFilter} onChange={(event) => setClusterFilter(event.target.value)}><option value="">Все</option>{[...new Set(intelligence?.items.map((item) => item.cluster_name) || [])].map((cluster) => <option key={cluster}>{cluster}</option>)}</select></label>
          </div>
          <div className="ai-intelligence-table"><table><thead><tr><th>Phrase</th><th>Demand</th><th>Intent</th><th>Relevance</th><th>Cluster</th><th>Disposition</th><th>Confidence</th></tr></thead><tbody>{intelligence?.items.slice(0, 50).map((item) => <tr key={item.raw_query_id}><td>{item.phrase}</td><td>{item.demand}</td><td>{item.intent}</td><td>{item.business_relevance}</td><td>{item.cluster_name}</td><td>{item.disposition}</td><td>{Math.round(item.confidence * 100)}%</td></tr>)}</tbody></table></div>
        </section>

        <section className="ai-intelligence">
          <div className="ai-wordstat-heading"><div><p className="eyebrow eyebrow-dark">Advisory mode</p><h2>Growth Opportunities</h2></div><strong>APPROVAL</strong></div>
          <p>Возможности обнаружены только в текущей экспериментальной выборке спроса «создание сайтов» и не описывают весь рынок.</p>
          <div className="ai-status-grid">
            {opportunities.map((item) => <article className="ai-status-card" key={item.id}>
              <span>{item.priority} · {item.opportunity_type}</span><strong>{item.title}</strong>
              <p>{item.service_line} · {item.platform}</p><p>{item.rationale}</p><p>Coverage: {item.site_coverage} · Evidence: {item.evidence_count} · Frequency: {item.total_frequency_evidence.toLocaleString('ru-RU')}</p>
              <p>Рекомендация: <strong>{item.recommended_action}</strong></p>
              <ul>{item.strongest_queries.map((query) => <li key={query.phrase}>{query.phrase} — {query.frequency?.toLocaleString('ru-RU')}</li>)}</ul>
            </article>)}
          </div>
        </section>

        <section className="ai-intelligence">
          <div className="ai-wordstat-heading"><div><p className="eyebrow eyebrow-dark">Advisory hypotheses</p><h2>Strategic Directions</h2></div><strong>RESEARCH</strong></div>
          <p>Стратегические направления отделены от подтверждённых market opportunities и требуют отдельного исследования.</p>
          <div className="ai-status-grid">
            {strategicDirections.map((item) => <article className="ai-status-card" key={item.id}>
              <span>{item.service_line} · {item.platform}</span><strong>{item.title}</strong>
              <p>Evidence: {item.evidence_status}</p><p>Статус: <strong>{item.status}</strong></p>
            </article>)}
          </div>
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
