/**
 * Test track pack loading functionality
 */

import { loadTrackPackData, getTrackPackById } from '../data-loader'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Track Pack Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should load track pack data successfully', async () => {
    const mockTrackPackData = {
      metadata: {
        generatedAt: "2025-12-15T13:50:32.754Z",
        totalTrackPacks: 1,
        editor: "GOA"
      },
      trackPacks: [
        {
          id: "test-track-pack-id",
          name: "Test Track Pack",
          region: "Test Region"
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrackPackData
    })

    const result = await loadTrackPackData()
    
    expect(result).toEqual(mockTrackPackData)
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/data/trackpack.json'),
      expect.any(Object)
    )
  })

  test('should get track pack by ID successfully', async () => {
    const mockTrackPackData = {
      metadata: {
        generatedAt: "2025-12-15T13:50:32.754Z",
        totalTrackPacks: 2,
        editor: "GOA"
      },
      trackPacks: [
        {
          id: "2kGHC7VtNDJGUrdSVSIa",
          name: "Mongolia",
          region: "Central Asia"
        },
        {
          id: "uisU0mliXUGARtjlVVZM", 
          name: "Tajikistan",
          region: "Central Asia"
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrackPackData
    })

    const result = await getTrackPackById("uisU0mliXUGARtjlVVZM")
    
    console.log('Test result:', result)
    console.log('Mock data trackPacks:', mockTrackPackData.trackPacks)
    
    expect(result).toEqual({
      id: "uisU0mliXUGARtjlVVZM",
      name: "Tajikistan", 
      region: "Central Asia"
    })
  })

  test('should return null for non-existent track pack ID', async () => {
    const mockTrackPackData = {
      metadata: {
        generatedAt: "2025-12-15T13:50:32.754Z",
        totalTrackPacks: 1,
        editor: "GOA"
      },
      trackPacks: [
        {
          id: "existing-track-pack",
          name: "Existing Track Pack",
          region: "Test Region"
        }
      ]
    }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTrackPackData
    })

    const result = await getTrackPackById("non-existent-id")
    
    expect(result).toBeNull()
  })

  test('should handle fetch errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await getTrackPackById("test-id")
    
    expect(result).toBeNull()
  })
})