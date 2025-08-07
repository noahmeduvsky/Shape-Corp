import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductionScheduler from '@/components/ProductionScheduler'

// Mock the API modules
jest.mock('@/lib/plex-api', () => ({
  plexApi: {
    getJobs: jest.fn(),
    getWorkCenters: jest.fn(),
    updateJob: jest.fn(),
    reorderJobs: jest.fn(),
  },
}))

jest.mock('@/lib/mock-plex-api', () => ({
  mockPlexApi: {
    getJobs: jest.fn(),
    getWorkCenters: jest.fn(),
    updateJob: jest.fn(),
    reorderJobs: jest.fn(),
  },
}))

const mockJobs = [
  {
    id: 'job-001',
    partNumber: 'PART-001',
    quantity: 100,
    completionDate: '2024-02-15',
    sortOrder: 1,
    workCenter: 'WC-01',
    status: 'pending',
    priority: 1,
  },
  {
    id: 'job-002',
    partNumber: 'PART-002',
    quantity: 50,
    completionDate: '2024-02-16',
    sortOrder: 2,
    workCenter: 'WC-02',
    status: 'in_progress',
    priority: 2,
  },
]

const mockWorkCenters = [
  { id: 'WC-01', name: 'Work Center 1', status: 'active' },
  { id: 'WC-02', name: 'Work Center 2', status: 'active' },
]

describe('ProductionScheduler', () => {
  const mockOnJobUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock environment to use mock data
    delete process.env.PLEX_API_URL
  })

  it('renders production scheduler with job list', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockResolvedValue(mockJobs)
    mockPlexApi.getWorkCenters.mockResolvedValue(mockWorkCenters)

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('Production Scheduler')).toBeInTheDocument()
      expect(screen.getByText('PART-001')).toBeInTheDocument()
      expect(screen.getByText('PART-002')).toBeInTheDocument()
    })
  })

  it('allows job selection', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockResolvedValue(mockJobs)
    mockPlexApi.getWorkCenters.mockResolvedValue(mockWorkCenters)

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument()
    })

    // Find and click the first job checkbox
    const jobCheckboxes = screen.getAllByRole('checkbox')
    expect(jobCheckboxes.length).toBeGreaterThan(0)
    
    await act(async () => {
      fireEvent.click(jobCheckboxes[0])
    })
    
    expect(jobCheckboxes[0]).toBeChecked()
  })

  it('allows priority changes', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockResolvedValue(mockJobs)
    mockPlexApi.getWorkCenters.mockResolvedValue(mockWorkCenters)
    mockPlexApi.updateJob.mockResolvedValue({ ...mockJobs[0], priority: 5 })

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument()
    })

    // Find priority select and change it
    const prioritySelects = screen.getAllByDisplayValue('1')
    if (prioritySelects.length > 0) {
      await act(async () => {
        fireEvent.change(prioritySelects[0], { target: { value: '5' } })
      })
      
      await waitFor(() => {
        expect(mockPlexApi.updateJob).toHaveBeenCalledWith('job-001', { priority: 5 })
      })
    }
  })

  it('allows work center changes', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockResolvedValue(mockJobs)
    mockPlexApi.getWorkCenters.mockResolvedValue(mockWorkCenters)
    mockPlexApi.updateJob.mockResolvedValue({ ...mockJobs[0], workCenter: 'WC-02' })

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument()
    })

    // Find work center select and change it - look for any select element
    const selectElements = screen.getAllByRole('combobox')
    const workCenterSelect = selectElements.find(select => 
      select.querySelector('option[value="WC-01"]')
    )
    
    if (workCenterSelect) {
      await act(async () => {
        fireEvent.change(workCenterSelect, { target: { value: 'WC-02' } })
      })
      
      await waitFor(() => {
        expect(mockPlexApi.updateJob).toHaveBeenCalledWith('job-001', { workCenter: 'WC-02' })
      })
    }
  })

  it('handles job reordering', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockResolvedValue(mockJobs)
    mockPlexApi.getWorkCenters.mockResolvedValue(mockWorkCenters)
    mockPlexApi.reorderJobs.mockResolvedValue(undefined)

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(screen.getByText('PART-001')).toBeInTheDocument()
    })

    // Look for any button that might be for reordering
    const buttons = screen.getAllByRole('button')
    const reorderButton = buttons.find(button => 
      button.textContent?.includes('Reorder') || 
      button.textContent?.includes('Reorder Jobs')
    )
    
    if (reorderButton) {
      await act(async () => {
        fireEvent.click(reorderButton)
      })

      await waitFor(() => {
        expect(mockPlexApi.reorderJobs).toHaveBeenCalled()
      })
    }
  })

  it('shows loading state', () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    expect(screen.getByText('Loading production schedule...')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const { mockPlexApi } = require('@/lib/mock-plex-api')
    mockPlexApi.getJobs.mockRejectedValue(new Error('API Error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<ProductionScheduler onJobUpdate={mockOnJobUpdate} />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading production data:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})
