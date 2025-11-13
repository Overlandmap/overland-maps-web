import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import WorldMapApp from '../components/WorldMapApp'
import UserMenu from '../components/UserMenu'

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <main className="h-screen relative">
          <UserMenu />
          <WorldMapApp />
        </main>
      </LanguageProvider>
    </AuthProvider>
  )
}