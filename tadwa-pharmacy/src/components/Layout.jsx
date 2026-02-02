import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Chatbot from './Chatbot'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <ScrollToTop />
    </div>
  )
}
