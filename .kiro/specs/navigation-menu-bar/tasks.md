# Implementation Plan

- [x] 1. Add navigation translation keys to i18n system
  - Add translation keys for all menu items (nav_map, nav_about, nav_contact, nav_app, nav_menu, nav_close_menu)
  - Provide translations for all 9 supported languages
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Create navigation configuration
  - [x] 2.1 Create navigation-config.ts file with menu item definitions
    - Define MenuItem interface
    - Export MENU_ITEMS array with all navigation items
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implement NavigationBar component
  - [x] 3.1 Create NavigationBar component structure
    - Set up component file with props interface
    - Implement fixed positioning and layout structure
    - Add logo section
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 3.2 Implement desktop navigation menu
    - Render menu items horizontally
    - Add hover states and transitions
    - Implement active state highlighting based on current route
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_
  
  - [x] 3.3 Implement mobile navigation menu
    - Add hamburger button for mobile
    - Create mobile menu overlay component
    - Implement open/close functionality
    - Add body scroll lock when menu is open
    - Handle outside click and escape key to close
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.4 Add responsive styling
    - Apply Tailwind responsive classes
    - Implement semi-transparent background with backdrop blur
    - Add smooth transitions
    - Ensure proper z-index layering
    - _Requirements: 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 3.5 Integrate language context
    - Connect to useLanguage hook
    - Implement translation for all menu items
    - Ensure translations update on language change
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Integrate NavigationBar into WorldMapApp
  - Add NavigationBar component to WorldMapApp
  - Pass current section prop based on route
  - Ensure menu bar doesn't interfere with map interactions
  - Test z-index layering with sidebar and popups
  - _Requirements: 1.1, 7.1, 7.2, 7.3_

- [ ]* 5. Write unit tests for NavigationBar
  - Test component renders with all menu items
  - Test logo is displayed
  - Test desktop menu visibility on large screens
  - Test mobile hamburger button visibility on small screens
  - Test mobile menu open/close functionality
  - Test body scroll lock
  - Test translation integration
  - Test active state highlighting
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1_

- [ ]* 5.1 Write property test for navigation functionality
  - **Property 1: Navigation triggers route changes**
  - **Validates: Requirements 2.5**

- [ ]* 5.2 Write property test for active state consistency
  - **Property 2: Active state matches current route**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ]* 5.3 Write property test for translation completeness
  - **Property 3: All menu items are translated**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 6. Create placeholder pages for navigation targets
  - [x] 6.1 Create /about page
    - Create src/app/about/page.tsx
    - Add basic content structure
    - _Requirements: 2.2, 2.5_
  
  - [x] 6.2 Create /contact page
    - Create src/app/contact/page.tsx
    - Add basic content structure
    - _Requirements: 2.3, 2.5_
  
  - [x] 6.3 Create /app page
    - Create src/app/app/page.tsx
    - Add mobile app information and download links
    - Reuse AppStoreButtons component
    - _Requirements: 2.4, 2.5_

- [x] 7. Final integration and testing
  - Test navigation bar across all pages
  - Verify responsive behavior on different screen sizes
  - Test language switching
  - Verify accessibility (keyboard navigation, screen readers)
  - Test on mobile devices (iOS Safari, Chrome mobile)
  - Ensure all tests pass, ask the user if questions arise
