# PLEX ERP Automation System

A digital automation layer for PLEX ERP that replaces physical kanban cards and manual processes with automated workflows.

## Overview

This system integrates with PLEX ERP to automate manufacturing processes that currently rely on physical cards:

- **Digital Kanban Cards** - Replace physical withdrawal and production instruction cards
- **Automated Scheduling** - Leveling board functionality with digital workflows
- **Real-time Inventory Tracking** - Container serial number management
- **Production Override System** - Scheduler controls for job prioritization

## Key Features

### 1. Digital Kanban System
- **Withdrawal Kanbans**: Digital cards for material movement
  - Green: End of line stock → TPA (Truck Prep Area)
  - Dark Blue: End of line stock → Pool Stock
  - Light Blue: Pool Stock → TPA
- **Production Instructions**: Digital cards for batch building
  - Color-coded priority system
  - Work center assignment
  - Container tracking

### 2. Container Management
- Unique serial number tracking
- Split/merge container handling
- Quality issue resolution workflows

### 3. Production Scheduling
- Job management with override capabilities
- Real-time schedule updates
- Priority queue management

### 4. PLEX Integration
- API connectivity for real-time data sync
- Job creation and management
- Inventory level monitoring
- Customer order tracking

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PLEX ERP      │◄──►│  Automation      │◄──►│  Digital UI     │
│   (Existing)    │    │  Layer           │    │  (React/Next.js)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Digital Cards   │
                       │  & Workflows     │
                       └──────────────────┘
```

## Getting Started

### Option 1: Development with Mock Data (Recommended for now)
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access the system at `http://localhost:3000`
4. The system will use mock data automatically

### Option 2: Connect to Real PLEX ERP
1. Install dependencies: `npm install`
2. Create `.env.local` file with PLEX credentials (see Configuration section)
3. Start development server: `npm run dev`
4. Access the system at `http://localhost:3000`

## Configuration

The system requires PLEX API configuration in `.env.local`:

```
PLEX_API_URL=your_plex_api_url
PLEX_API_KEY=your_api_key
PLEX_CLIENT_ID=your_client_id
```

## Testing

The project includes comprehensive testing setup:

### Unit Tests (Jest + React Testing Library)
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests (Cypress)
```bash
# Run E2E tests in headless mode
npm run test:e2e

# Open Cypress test runner
npm run test:e2e:open
```

### Test Coverage
- **Unit Tests**: Component testing, API mocking, business logic validation
- **E2E Tests**: Full user workflows, data persistence, UI interactions
- **Mock Data**: Comprehensive test data for all ERP operations

### Test Files Structure
```
src/__tests__/
├── components/
│   └── ProductionScheduler.test.tsx
└── lib/
    └── mock-plex-api.test.ts

cypress/
├── e2e/
│   └── dashboard.cy.ts
└── support/
    ├── e2e.ts
    └── commands.ts
```

## Development

- **Frontend**: React with TypeScript and Tailwind CSS
- **State Management**: Zustand for global state
- **API Integration**: Custom PLEX API client with mock data support
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest + React Testing Library + Cypress
- **Mock Data**: Comprehensive mock API for development and testing

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run test:e2e:open # Open Cypress test runner

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Mock Data Features

The system includes comprehensive mock data for development and testing:

- **Jobs**: 3 sample jobs with different priorities and work centers
- **Inventory**: 3 inventory items with containers and quantities
- **Customer Orders**: 3 orders with different statuses and routes
- **Containers**: Multiple containers with unique serial numbers
- **Work Centers**: 2 active work centers
- **E-Kanban**: Sample kanban cards for different operations

All mock data persists during the session and resets on page refresh, allowing full testing of all ERP functionality without requiring real PLEX access.
