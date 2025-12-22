import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LegendExplanationPopup from '../LegendExplanationPopup'
import { LanguageProvider } from '../../contexts/LanguageContext'

// Mock the LanguageContext
const MockLanguageProvider = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
)

describe('LegendExplanationPopup', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    category: 'overlanding' as const
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render overlanding explanations', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup {...defaultProps} />
      </MockLanguageProvider>
    )

    expect(screen.getByText('Overlanding Status Explanations')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Restricted access')).toBeInTheDocument()
    expect(screen.getByText('Unsafe')).toBeInTheDocument()
    expect(screen.getByText('Forbidden')).toBeInTheDocument()
    expect(screen.getByText(/Travel with a vehicle is open and without restriction/)).toBeInTheDocument()
  })

  it('should render carnet explanations', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup 
          {...defaultProps} 
          category="carnet"
        />
      </MockLanguageProvider>
    )

    expect(screen.getByText('Carnet Requirements Explanations')).toBeInTheDocument()
    expect(screen.getByText('Not required')).toBeInTheDocument()
    expect(screen.getByText('Required in some situations')).toBeInTheDocument()
    expect(screen.getByText('Mandatory')).toBeInTheDocument()
    expect(screen.getByText('Access forbidden')).toBeInTheDocument()
    expect(screen.getByText(/A Carnet de Passage is not required/)).toBeInTheDocument()
  })

  it('should render borders explanations', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup 
          {...defaultProps} 
          category="borders"
        />
      </MockLanguageProvider>
    )

    expect(screen.getByText('Borders Status Explanations')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Restricted')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText(/The border can be crossed at the designated border posts/)).toBeInTheDocument()
  })

  it('should render border posts explanations', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup 
          {...defaultProps} 
          category="border_posts"
        />
      </MockLanguageProvider>
    )

    expect(screen.getByText('Border Posts Status Explanations')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Bilateral')).toBeInTheDocument()
    expect(screen.getByText('Restricted')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText(/The border post allows anybody to cross from one country to another/)).toBeInTheDocument()
  })

  it('should render zones explanations', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup 
          {...defaultProps} 
          category="zones"
        />
      </MockLanguageProvider>
    )

    expect(screen.getByText('Restricted areas Status Explanations')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText('Guide/Escort Needed')).toBeInTheDocument()
    expect(screen.getByText('Permit Needed')).toBeInTheDocument()
    expect(screen.getByText('Restrictions apply')).toBeInTheDocument()
    expect(screen.getByText(/It is forbidden to visit this area/)).toBeInTheDocument()
  })

  it('should close when close button is clicked', () => {
    const onClose = jest.fn()
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup {...defaultProps} onClose={onClose} />
      </MockLanguageProvider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not render when isOpen is false', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup {...defaultProps} isOpen={false} />
      </MockLanguageProvider>
    )

    expect(screen.queryByText('Overlanding Status Explanations')).not.toBeInTheDocument()
  })

  it('should show all status colors correctly', () => {
    render(
      <MockLanguageProvider>
        <LegendExplanationPopup {...defaultProps} />
      </MockLanguageProvider>
    )

    // Check that color indicators are present (we can't easily test the actual colors in jsdom)
    const colorIndicators = document.querySelectorAll('[style*="background-color"]')
    expect(colorIndicators.length).toBeGreaterThan(0)
  })
})