import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      {/* pt-[72px] to offset fixed navbar */}
      <main className="flex-1 pt-[72px]">
        {children}
      </main>
      <Footer />
    </div>
  )
}
