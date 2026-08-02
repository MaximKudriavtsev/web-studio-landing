import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsent } from './CookieConsent'
import { ScrollToTop } from './layout/ScrollToTop'

type LayoutProps = {
  hideChrome?: boolean
}

export const Layout = ({ hideChrome = false }: LayoutProps) => {
  if (hideChrome) {
    return (
      <>
        <ScrollToTop />
        <Outlet />
      </>
    )
  }

  return (
    <>
      <a className="skip-link" href="#main">
        К содержанию
      </a>
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
      <CookieConsent />
    </>
  )
}
