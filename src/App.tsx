import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ServicesPage } from './pages/ServicesPage'
import { WorkPage } from './pages/WorkPage'
import { ContactPage } from './pages/ContactPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const App = () => {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
