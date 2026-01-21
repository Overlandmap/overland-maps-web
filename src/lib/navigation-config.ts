/**
 * Navigation menu configuration
 */

export interface MenuItem {
  id: 'app' | 'faq' | 'support' | 'about'
  translationKey: string
  href: string
  external?: boolean
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: 'app', 
    translationKey: 'nav_app', 
    href: '/app' 
  },
  { 
    id: 'faq', 
    translationKey: 'nav_faq', 
    href: '/faq' 
  },
  { 
    id: 'support', 
    translationKey: 'nav_support', 
    href: '/support' 
  },
  { 
    id: 'about', 
    translationKey: 'nav_about', 
    href: '/about' 
  }
]
