'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../../../contexts/LanguageContext'
import NavigationBar from '../../../components/NavigationBar'
import { signInWithEmail, getCurrentUser } from '../../../lib/firebase-client'
import { deleteUser } from 'firebase/auth'

const translations = {
  en: {
    back_to_support: 'Back to Support',
    title: 'Delete Your Account',
    subtitle: 'Login to your account to delete it',
    email_label: 'Email Address',
    password_label: 'Password',
    login_button: 'Login to Delete Account',
    logging_in: 'Logging in...',
    success_title: 'Account Successfully Deleted',
    success_message: 'Your account has been permanently deleted. All your data has been removed from our systems.',
    return_home: 'Return to Home',
    confirm_title: 'Delete Your Account?',
    confirm_message: 'Do you want to delete your account at Overland Map? You will lose access to all purchases and all your settings. This is irreversible.',
    cancel: 'Cancel',
    ok_delete: 'OK, Delete',
    deleting: 'Deleting...'
  },
  de: {
    back_to_support: 'Zurück zum Support',
    title: 'Ihr Konto Löschen',
    subtitle: 'Melden Sie sich bei Ihrem Konto an, um es zu löschen',
    email_label: 'E-Mail-Adresse',
    password_label: 'Passwort',
    login_button: 'Anmelden zum Löschen des Kontos',
    logging_in: 'Anmeldung läuft...',
    success_title: 'Konto Erfolgreich Gelöscht',
    success_message: 'Ihr Konto wurde dauerhaft gelöscht. Alle Ihre Daten wurden aus unseren Systemen entfernt.',
    return_home: 'Zurück zur Startseite',
    confirm_title: 'Ihr Konto Löschen?',
    confirm_message: 'Möchten Sie Ihr Konto bei Overland Map löschen? Sie verlieren den Zugriff auf alle Käufe und alle Ihre Einstellungen. Dies ist unwiderruflich.',
    cancel: 'Abbrechen',
    ok_delete: 'OK, Löschen',
    deleting: 'Wird gelöscht...'
  },
  es: {
    back_to_support: 'Volver a Soporte',
    title: 'Eliminar Tu Cuenta',
    subtitle: 'Inicia sesión en tu cuenta para eliminarla',
    email_label: 'Dirección de Correo Electrónico',
    password_label: 'Contraseña',
    login_button: 'Iniciar Sesión para Eliminar Cuenta',
    logging_in: 'Iniciando sesión...',
    success_title: 'Cuenta Eliminada Exitosamente',
    success_message: 'Tu cuenta ha sido eliminada permanentemente. Todos tus datos han sido eliminados de nuestros sistemas.',
    return_home: 'Volver al Inicio',
    confirm_title: '¿Eliminar Tu Cuenta?',
    confirm_message: '¿Quieres eliminar tu cuenta de Overland Map? Perderás el acceso a todas las compras y toda tu configuración. Esto es irreversible.',
    cancel: 'Cancelar',
    ok_delete: 'OK, Eliminar',
    deleting: 'Eliminando...'
  },
  fr: {
    back_to_support: 'Retour au Support',
    title: 'Supprimer Votre Compte',
    subtitle: 'Connectez-vous à votre compte pour le supprimer',
    email_label: 'Adresse E-mail',
    password_label: 'Mot de Passe',
    login_button: 'Se Connecter pour Supprimer le Compte',
    logging_in: 'Connexion en cours...',
    success_title: 'Compte Supprimé avec Succès',
    success_message: 'Votre compte a été définitivement supprimé. Toutes vos données ont été supprimées de nos systèmes.',
    return_home: 'Retour à l\'Accueil',
    confirm_title: 'Supprimer Votre Compte ?',
    confirm_message: 'Voulez-vous supprimer votre compte Overland Map ? Vous perdrez l\'accès à tous vos achats et tous vos paramètres. Cette action est irréversible.',
    cancel: 'Annuler',
    ok_delete: 'OK, Supprimer',
    deleting: 'Suppression en cours...'
  },
  it: {
    back_to_support: 'Torna al Supporto',
    title: 'Elimina il Tuo Account',
    subtitle: 'Accedi al tuo account per eliminarlo',
    email_label: 'Indirizzo Email',
    password_label: 'Password',
    login_button: 'Accedi per Eliminare l\'Account',
    logging_in: 'Accesso in corso...',
    success_title: 'Account Eliminato con Successo',
    success_message: 'Il tuo account è stato eliminato permanentemente. Tutti i tuoi dati sono stati rimossi dai nostri sistemi.',
    return_home: 'Torna alla Home',
    confirm_title: 'Eliminare il Tuo Account?',
    confirm_message: 'Vuoi eliminare il tuo account Overland Map? Perderai l\'accesso a tutti gli acquisti e tutte le tue impostazioni. Questa azione è irreversibile.',
    cancel: 'Annulla',
    ok_delete: 'OK, Elimina',
    deleting: 'Eliminazione in corso...'
  },
  nl: {
    back_to_support: 'Terug naar Ondersteuning',
    title: 'Verwijder Je Account',
    subtitle: 'Log in op je account om het te verwijderen',
    email_label: 'E-mailadres',
    password_label: 'Wachtwoord',
    login_button: 'Inloggen om Account te Verwijderen',
    logging_in: 'Inloggen...',
    success_title: 'Account Succesvol Verwijderd',
    success_message: 'Je account is permanent verwijderd. Al je gegevens zijn uit onze systemen verwijderd.',
    return_home: 'Terug naar Home',
    confirm_title: 'Je Account Verwijderen?',
    confirm_message: 'Wil je je Overland Map account verwijderen? Je verliest toegang tot alle aankopen en al je instellingen. Dit is onomkeerbaar.',
    cancel: 'Annuleren',
    ok_delete: 'OK, Verwijderen',
    deleting: 'Verwijderen...'
  },
  ru: {
    back_to_support: 'Назад в Поддержку',
    title: 'Удалить Ваш Аккаунт',
    subtitle: 'Войдите в свой аккаунт, чтобы удалить его',
    email_label: 'Адрес Электронной Почты',
    password_label: 'Пароль',
    login_button: 'Войти для Удаления Аккаунта',
    logging_in: 'Вход...',
    success_title: 'Аккаунт Успешно Удален',
    success_message: 'Ваш аккаунт был навсегда удален. Все ваши данные были удалены из наших систем.',
    return_home: 'Вернуться на Главную',
    confirm_title: 'Удалить Ваш Аккаунт?',
    confirm_message: 'Вы хотите удалить свой аккаунт Overland Map? Вы потеряете доступ ко всем покупкам и всем вашим настройкам. Это необратимо.',
    cancel: 'Отмена',
    ok_delete: 'OK, Удалить',
    deleting: 'Удаление...'
  }
}

function DeleteAccountPageContent() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] || translations.en
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [error, setError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      await signInWithEmail(email, password)
      setIsLoggedIn(true)
      setShowConfirmDialog(true)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const user = getCurrentUser()
      if (!user) {
        throw new Error('No user logged in')
      }

      await deleteUser(user)
      setIsDeleted(true)
      setShowConfirmDialog(false)
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete account. Please try again.')
      setShowConfirmDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar currentSection="support" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/support" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.back_to_support}
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 mt-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t.subtitle}
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {isDeleted ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t.success_title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {t.success_message}
                </p>
                <Link 
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.return_home}
                </Link>
              </div>
            ) : !isLoggedIn ? (
              <form onSubmit={handleLogin} className="max-w-md mx-auto">
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email_label}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.password_label}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? t.logging_in : t.login_button}
                </button>
              </form>
            ) : null}
          </div>

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {t.confirm_title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {t.confirm_message}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? t.deleting : t.ok_delete}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DeleteAccountPage() {
  return <DeleteAccountPageContent />
}
