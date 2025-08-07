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

1. Install dependencies: `npm install`
2. Configure PLEX API credentials
3. Start development server: `npm run dev`
4. Access the system at `http://localhost:3000`

## Configuration

The system requires PLEX API configuration in `.env.local`:

```
PLEX_API_URL=your_plex_api_url
PLEX_API_KEY=your_api_key
PLEX_CLIENT_ID=your_client_id
```

## Development

- **Frontend**: React with TypeScript and Tailwind CSS
- **State Management**: Zustand for global state
- **API Integration**: Custom PLEX API client
- **Forms**: React Hook Form with Zod validation
