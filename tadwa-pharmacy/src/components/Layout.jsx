import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import FAQSection from './FAQSection'
import Chatbot from './Chatbot'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DFF2F3]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <FAQSection />
      <Footer />
      <Chatbot />
      <ScrollToTop />
    </div>
  )
}
