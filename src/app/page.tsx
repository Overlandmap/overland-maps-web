import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import WorldMapApp from '../components/WorldMapApp'
import TopMenu from '../components/TopMenu'

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="h-screen relative">
          <div className="absolute top-4 right-4 z-50">
            <TopMenu />
          </div>
          <WorldMapApp />
        </main>
      </LanguageProvider>
    </AuthProvider>
  )
}