import { AuthProvider } from '../contexts/AuthContext'
import WorldMapApp from '../components/WorldMapApp'

export default function Home() {
  return (
    <AuthProvider>
      <main className="h-screen relative">
        <WorldMapApp />
      </main>
    </AuthProvider>
  )
}