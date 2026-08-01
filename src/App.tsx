import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })),
)
const WorkPage = lazy(() =>
  import('./pages/WorkPage').then((m) => ({ default: m.WorkPage })),
)
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const PersonalDataPage = lazy(() =>
  import('./pages/PersonalDataPage').then((m) => ({ default: m.PersonalDataPage })),
)

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true">
    <span className="sr-only">Загрузка страницы</span>
  </div>
)

export const App = () => {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="work" element={<WorkPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="personal-data" element={<PersonalDataPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
