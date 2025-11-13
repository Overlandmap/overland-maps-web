# Firebase Authentication

The application now includes Firebase Authentication with anonymous login and email/password sign-in.

## Features

### Anonymous Authentication
- **Automatic**: Users are automatically signed in anonymously when they first visit the app
- **Seamless**: No user interaction required
- **Persistent**: Anonymous session persists across page reloads

### Email/Password Authentication
- **Login Panel**: Click "Sign In" button in the top-right corner
- **User Menu**: Shows user email and logout option when authenticated
- **Secure**: Uses Firebase Authentication for secure credential management

## User Flow

1. **First Visit**: User is automatically signed in anonymously
2. **Sign In**: User clicks "Sign In" button to access login panel
3. **Authenticate**: User enters email and password
4. **Authenticated**: User menu shows email and logout option
5. **Sign Out**: User clicks "Sign Out" to return to anonymous mode

## Components

### AuthContext (`src/contexts/AuthContext.tsx`)
- Provides authentication state throughout the app
- Manages user session and authentication methods
- Handles automatic anonymous sign-in

### LoginPanel (`src/components/LoginPanel.tsx`)
- Modal dialog for email/password authentication
- Form validation and error handling
- User-friendly error messages

### UserMenu (`src/components/UserMenu.tsx`)
- Shows "Sign In" button for anonymous users
- Shows user email and dropdown menu for authenticated users
- Provides logout functionality

### Firebase Client (`src/lib/firebase-client.ts`)
- Initializes Firebase client SDK
- Provides authentication methods
- Handles auth state changes

## Configuration

Firebase configuration is loaded from environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."
```

## Firebase Console Setup

To enable authentication in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Anonymous** authentication
5. Enable **Email/Password** authentication
6. Add users in the **Users** tab

## Error Handling

The login panel provides user-friendly error messages for common scenarios:

- **Invalid email**: "Invalid email address"
- **User not found**: "No account found with this email"
- **Wrong password**: "Incorrect password"
- **Invalid credentials**: "Invalid email or password"
- **Generic error**: "Login failed. Please try again."

## Security

- Passwords are never stored in the application
- Authentication is handled entirely by Firebase
- Anonymous users have limited permissions (configure in Firebase Rules)
- Authenticated users can have elevated permissions

## Usage in Code

### Check Authentication Status

```typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, isAnonymous, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  if (isAnonymous) {
    return <div>You are browsing anonymously</div>
  }
  
  return <div>Welcome, {user?.email}!</div>
}
```

### Programmatic Sign In

```typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { signInWithEmailAndPassword } = useAuth()
  
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword('user@example.com', 'password')
      console.log('Logged in successfully')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
}
```

### Programmatic Sign Out

```typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { logout } = useAuth()
  
  const handleLogout = async () => {
    try {
      await logout()
      console.log('Logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
}
```

## Testing

### Test Anonymous Authentication
1. Open the application
2. Check browser console for: "✅ Signed in anonymously: [uid]"
3. Verify "Sign In" button appears in top-right corner

### Test Email/Password Authentication
1. Click "Sign In" button
2. Enter valid email and password
3. Click "Sign In"
4. Verify user menu appears with email
5. Click user menu to see dropdown
6. Click "Sign Out" to return to anonymous mode

## Troubleshooting

### "Sign in anonymously failed"
- Check that Anonymous authentication is enabled in Firebase Console
- Verify Firebase configuration in `.env` file

### "Login failed" errors
- Check that Email/Password authentication is enabled in Firebase Console
- Verify user exists in Firebase Console → Authentication → Users
- Check browser console for detailed error messages

### User menu not appearing
- Check that authentication is working (browser console)
- Verify AuthProvider is wrapping the application
- Check that UserMenu component is rendered

## Future Enhancements

Potential additions to the authentication system:

- Password reset functionality
- Email verification
- Social authentication (Google, Facebook, etc.)
- User profile management
- Remember me functionality
- Two-factor authentication
