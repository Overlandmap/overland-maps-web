import { useEffect } from 'react'

interface KeyboardShortcuts {
  onEscape?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          shortcuts.onEscape?.()
          break
        case 'Enter':
          if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            shortcuts.onEnter?.()
          }
          break
        case ' ':
          event.preventDefault()
          shortcuts.onSpace?.()
          break
        case 'ArrowUp':
          if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            shortcuts.onArrowUp?.()
          }
          break
        case 'ArrowDown':
          if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            shortcuts.onArrowDown?.()
          }
          break
        case 'ArrowLeft':
          if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            shortcuts.onArrowLeft?.()
          }
          break
        case 'ArrowRight':
          if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault()
            shortcuts.onArrowRight?.()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}