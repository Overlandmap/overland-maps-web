import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import WorldMapApp from '../components/WorldMapApp'

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="h-screen relative">
          <WorldMapApp />
        </main>
      </LanguageProvider>
    </AuthProvider>
  )
}