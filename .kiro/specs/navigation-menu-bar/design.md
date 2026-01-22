# Navigation Menu Bar - Design Document

## Overview

This document outlines the design for implementing a navigation menu bar component for the Overland Maps application. The menu bar will provide a consistent navigation experience across the application, with support for multiple languages, responsive design, and integration with the existing routing system.

## Architecture

### Component Structure

```
NavigationBar (Main Component)
├── Logo Section
│   └── Overland Maps Logo/Text
├── Desktop Navigation
│   └── Menu Items (Map, About, Contact, App)
└── Mobile Navigation
    ├── Hamburger Button
    └── Mobile Menu Overlay
        └── Menu Items (vertical layout)
```

### Integration Points

1. **WorldMapApp Component**: The NavigationBar will be added at the top level of the WorldMapApp component
2. **Language Context**: Will consume the existing LanguageContext for translations
3. **Routing**: Will use Next.js router for navigation between sections
4. **Translation System**: Will integrate with the existing i18n system

## Components and Interfaces

### NavigationBar Component

**File**: `src/components/NavigationBar.tsx`

**Props Interface**:
```typescript
interface NavigationBarProps {
  currentSection?: 'map' | 'about' | 'contact' | 'app'
  className?: string
}
```

**State**:
- `isMobileMenuOpen: boolean` - Controls mobile menu visibility
- `isScrolled: boolean` - Tracks scroll position for styling adjustments

**Key Features**:
- Fixed positioning at top of viewport
- Semi-transparent background with backdrop blur
- Responsive breakpoint at 768px (md in Tailwind)
- Smooth transitions for hover states and mobile menu
- Z-index management to stay above map but below modals

### Menu Item Configuration

**File**: `src/lib/navigation-config.ts`

```typescript
interface MenuItem {
  id: 'map' | 'about' | 'contact' | 'app'
  translationKey: string
  href: string
  external?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'map', translationKey: 'nav_map', href: '/' },
  { id: 'about', translationKey: 'nav_about', href: '/about' },
  { id: 'contact', translationKey: 'nav_contact', href: '/contact' },
  { id: 'app', translationKey: 'nav_app', href: '/app' }
]
```

## Data Models

### Translation Keys

New translation keys to be added to `src/lib/i18n.ts`:

```typescript
{
  // Navigation menu items
  nav_map: string
  nav_about: string
  nav_contact: string
  nav_app: string
  nav_menu: string // For mobile menu button aria-label
  nav_close_menu: string // For close button aria-label
}
```

### Translations for All Languages

- **English**: Map, About, Contact, App, Menu, Close menu
- **German**: Karte, Über, Kontakt, App, Menü, Menü schließen
- **Spanish**: Mapa, Acerca de, Contacto, App, Menú, Cerrar menú
- **French**: Carte, À propos, Contact, App, Menu, Fermer le menu
- **Italian**: Mappa, Chi siamo, Contatto, App, Menu, Chiudi menu
- **Japanese**: マップ, について, お問い合わせ, アプリ, メニュー, メニューを閉じる
- **Dutch**: Kaart, Over, Contact, App, Menu, Menu sluiten
- **Russian**: Карта, О нас, Контакт, Приложение, Меню, Закрыть меню
- **Chinese**: 地图, 关于, 联系, 应用, 菜单, 关闭菜单

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**1.1** WHEN the application loads THEN the system SHALL display a navigation menu bar at the top of the viewport
- Thoughts: This is a UI rendering requirement that can be tested by checking if the navigation component is rendered and positioned correctly
- Testable: yes - example

**1.2** WHEN viewing the menu bar THEN the system SHALL display the Overland Maps logo on the left side
- Thoughts: This is testing that a specific element (logo) is present in the rendered output
- Testable: yes - example

**1.3** WHEN viewing the menu bar THEN the system SHALL display navigation menu items horizontally aligned
- Thoughts: This tests the layout of menu items, which can be verified by checking CSS properties or element positions
- Testable: yes - example

**1.4** WHEN the menu bar is displayed THEN the system SHALL maintain a fixed position at the top during scrolling
- Thoughts: This tests CSS positioning behavior across scroll events
- Testable: yes - example

**2.1-2.4** Menu items display correctly
- Thoughts: These test that specific menu items are rendered with correct text
- Testable: yes - example

**2.5** WHEN a user clicks a navigation link THEN the system SHALL navigate to the corresponding section or page
- Thoughts: This is testing navigation behavior across all menu items. We can generate different menu items and verify navigation occurs
- Testable: yes - property

**3.1-3.3** Active state indicators
- Thoughts: These test that the active menu item is visually distinguished based on current route
- Testable: yes - property

**4.1-4.5** Mobile responsive behavior
- Thoughts: These test responsive behavior at different viewport sizes and interaction patterns
- Testable: yes - example (for specific breakpoints)

**5.1-5.3** Language translation
- Thoughts: For any supported language, all menu items should be translated correctly
- Testable: yes - property

**6.1-6.5** Visual design and styling
- Thoughts: These are subjective design requirements about appearance and feel
- Testable: no

**7.1-7.4** Component architecture
- Thoughts: These are code organization requirements, not functional requirements
- Testable: no

### Property Reflection

After reviewing the prework, the following properties provide unique validation value:

- **Property 1** (Navigation functionality): Covers requirement 2.5
- **Property 2** (Active state): Covers requirements 3.1-3.3
- **Property 3** (Translation completeness): Covers requirements 5.1-5.3

Properties related to specific UI rendering (1.1-1.4, 2.1-2.4, 4.1-4.5) are better tested as examples since they verify specific states rather than universal rules.

### Correctness Properties

**Property 1: Navigation triggers route changes**
*For any* menu item, clicking it should trigger navigation to its corresponding href
**Validates: Requirements 2.5**

**Property 2: Active state matches current route**
*For any* current route, the menu item with matching href should be marked as active
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 3: All menu items are translated**
*For any* supported language, all menu items should have non-empty translated text
**Validates: Requirements 5.1, 5.2, 5.3**

## Error Handling

### Mobile Menu State Management

- Prevent body scroll when mobile menu is open
- Close menu on route change
- Close menu on outside click
- Handle escape key to close menu

### Navigation Errors

- Graceful fallback if translation key is missing
- Handle invalid routes with Next.js error boundaries
- Maintain menu state during navigation errors

### Responsive Behavior

- Smooth transition between mobile and desktop layouts
- Prevent layout shift during hydration
- Handle window resize events efficiently

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Component Rendering**:
   - Menu bar renders with all menu items
   - Logo is displayed correctly
   - Desktop menu is visible on large screens
   - Mobile hamburger button is visible on small screens

2. **Mobile Menu Behavior**:
   - Mobile menu opens when hamburger is clicked
   - Mobile menu closes when close button is clicked
   - Mobile menu closes when clicking outside
   - Body scroll is prevented when menu is open

3. **Translation Integration**:
   - Menu items display correct translations for each language
   - Language changes update menu item text

4. **Active State**:
   - Correct menu item is highlighted for current route
   - Active state updates on navigation

### Property-Based Tests

Property-based tests will verify universal properties using a PBT library (fast-check for TypeScript):

1. **Property Test: Navigation functionality** (Property 1)
   - Generate random menu items
   - Verify clicking triggers navigation to correct href
   - **Feature: navigation-menu-bar, Property 1: Navigation triggers route changes**

2. **Property Test: Active state consistency** (Property 2)
   - Generate random routes
   - Verify correct menu item is marked active
   - **Feature: navigation-menu-bar, Property 2: Active state matches current route**

3. **Property Test: Translation completeness** (Property 3)
   - Generate all supported languages
   - Verify all menu items have translations
   - **Feature: navigation-menu-bar, Property 3: All menu items are translated**

### Integration Tests

- Test navigation bar integration with WorldMapApp
- Verify menu bar doesn't interfere with map interactions
- Test z-index layering with other UI elements (sidebar, popups)
- Verify menu bar works with URL-based navigation

### Testing Library

- **Unit & Integration Tests**: React Testing Library with Jest
- **Property-Based Tests**: fast-check (TypeScript PBT library)
- **Minimum iterations**: 100 iterations per property test

## Styling and Design

### Desktop Layout (≥768px)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Overland Maps    Map  About  Contact  App  [Lang]│
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Overland Maps                          [☰]  [Lang]│
└─────────────────────────────────────────────────────────┘

Mobile Menu Overlay (when open):
┌─────────────────────────────────────────────────────────┐
│                                                      [✕] │
│                                                          │
│                        Map                               │
│                       About                              │
│                      Contact                             │
│                        App                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Styling Specifications

**Colors**:
- Background: `rgba(255, 255, 255, 0.95)` with `backdrop-blur-md`
- Text: `text-gray-900`
- Hover: `text-blue-600`
- Active: `text-blue-600` with `border-b-2 border-blue-600`
- Mobile overlay: `bg-white`

**Spacing**:
- Height: `h-16` (64px)
- Padding: `px-4 md:px-6`
- Menu item spacing: `space-x-6` (desktop), `space-y-4` (mobile)

**Typography**:
- Logo: `text-xl font-bold`
- Menu items: `text-sm font-medium`

**Z-Index**:
- Menu bar: `z-40`
- Mobile overlay: `z-50`

**Transitions**:
- All interactive elements: `transition-colors duration-200`
- Mobile menu: `transition-transform duration-300`

## Implementation Notes

### Accessibility

- Use semantic HTML (`<nav>`, `<button>`)
- Provide aria-labels for icon buttons
- Ensure keyboard navigation works
- Maintain focus management in mobile menu
- Provide skip-to-content link

### Performance

- Use CSS transforms for mobile menu animation
- Debounce window resize events
- Lazy load mobile menu overlay
- Minimize re-renders with React.memo

### Browser Compatibility

- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for backdrop-filter
- Test on iOS Safari and Chrome mobile

## Future Enhancements

1. **Dropdown Menus**: Add support for nested navigation items
2. **Search Integration**: Add search bar to navigation
3. **User Account Menu**: Integrate with authentication system
4. **Breadcrumbs**: Show current location hierarchy
5. **Sticky Behavior**: Hide on scroll down, show on scroll up
