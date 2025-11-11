import { LanguageProvider } from '../contexts/LanguageContext'
import WorldMapApp from '../components/WorldMapApp'

export default function Home() {
  return (
    <LanguageProvider>
      <main className="h-screen">
        <WorldMapApp />
      </main>
    </LanguageProvider>
  )
}