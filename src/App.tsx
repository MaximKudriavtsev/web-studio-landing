import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const ConsentPage = lazy(() =>
  import('./pages/ConsentPage').then((m) => ({ default: m.ConsentPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const RouteFallback = () => (
  <div className="shell" style={{ padding: '120px 0', textAlign: 'center' }} aria-busy="true">
    Загрузка…
  </div>
)

export const App = () => {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<Navigate to="/#services" replace />} />
            <Route path="work" element={<Navigate to="/#work" replace />} />
            <Route path="contact" element={<Navigate to="/#contact" replace />} />
            <Route path="personal-data" element={<Navigate to="/consent" replace />} />
          </Route>
          <Route element={<Layout hideChrome />}>
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="consent" element={<ConsentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
