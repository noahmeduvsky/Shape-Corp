# API Documentation

This document provides comprehensive API documentation for the PLEX ERP Automation System.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
- [Mock API](#mock-api)

## 🎯 Overview

The PLEX ERP Automation System provides a RESTful API for managing manufacturing operations, including jobs, inventory, containers, and kanban workflows.

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Content Type

All requests and responses use JSON:

```
Content-Type: application/json
```

## 🔐 Authentication

### API Key Authentication

For production use, API requests require authentication:

```http
Authorization: Bearer YOUR_API_KEY
```

### Development Mode

In development mode, authentication is optional and mock data is used automatically.

## 📊 Data Models

### Job Model

```typescript
interface PlexJob {
  id: string;
  partNumber: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  workCenter: string;
  completionDate: string; // ISO 8601 format
  createdAt: string;
  updatedAt: string;
}
```

### Inventory Model

```typescript
interface PlexInventory {
  partNumber: string;
  partDescription: string;
  quantity: number;
  location: 'end_of_line' | 'pool_stock' | 'tpa';
  containers: Container[];
  lastUpdated: string;
}
```

### Container Model

```typescript
interface Container {
  serialNumber: string;
  partNumber: string;
  quantity: number;
  location: 'end_of_line' | 'pool_stock' | 'tpa';
  status: 'active' | 'split' | 'merged' | 'quality_issue';
  createdAt: string;
  updatedAt: string;
}
```

### Kanban Model

```typescript
interface DigitalKanban {
  id: string;
  type: 'withdrawal' | 'production';
  status: 'pending' | 'in_progress' | 'completed';
  partNumber: string;
  partDescription: string;
  quantity: number;
  withdrawalType?: 'end_to_tpa' | 'end_to_pool' | 'pool_to_tpa';
  workCenter?: string;
  priority?: number;
  containerIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Customer Order Model

```typescript
interface PlexCustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  partNumber: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'shipped' | 'cancelled';
  route: string;
  dueDate: string;
  createdAt: string;
}
```

### Work Center Model

```typescript
interface WorkCenter {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'inactive';
  capacity: number;
  currentLoad: number;
  lastUpdated: string;
}
```

## 🔗 Endpoints

### Jobs

#### Get All Jobs

```http
GET /api/jobs
```

**Query Parameters:**
- `status` (optional): Filter by job status
- `workCenter` (optional): Filter by work center
- `priority` (optional): Filter by priority level

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-1",
      "partNumber": "PART-001",
      "quantity": 100,
      "status": "pending",
      "priority": 1,
      "workCenter": "WC-01",
      "completionDate": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Job by ID

```http
GET /api/jobs/{id}
```

**Response:**
```json
{
  "job": {
    "id": "job-1",
    "partNumber": "PART-001",
    "quantity": 100,
    "status": "pending",
    "priority": 1,
    "workCenter": "WC-01",
    "completionDate": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Job

```http
POST /api/jobs
```

**Request Body:**
```json
{
  "partNumber": "PART-001",
  "quantity": 100,
  "priority": 1,
  "workCenter": "WC-01",
  "completionDate": "2024-01-15T00:00:00Z"
}
```

**Response:**
```json
{
  "job": {
    "id": "job-2",
    "partNumber": "PART-001",
    "quantity": 100,
    "status": "pending",
    "priority": 1,
    "workCenter": "WC-01",
    "completionDate": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Job

```http
PUT /api/jobs/{id}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": 2
}
```

**Response:**
```json
{
  "job": {
    "id": "job-1",
    "partNumber": "PART-001",
    "quantity": 100,
    "status": "in_progress",
    "priority": 2,
    "workCenter": "WC-01",
    "completionDate": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Delete Job

```http
DELETE /api/jobs/{id}
```

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

### Inventory

#### Get All Inventory

```http
GET /api/inventory
```

**Query Parameters:**
- `partNumber` (optional): Filter by part number
- `location` (optional): Filter by location

**Response:**
```json
{
  "inventory": [
    {
      "partNumber": "PART-001",
      "partDescription": "Widget A",
      "quantity": 500,
      "location": "end_of_line",
      "containers": [
        {
          "serialNumber": "CONT-001",
          "partNumber": "PART-001",
          "quantity": 100,
          "location": "end_of_line",
          "status": "active",
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z"
        }
      ],
      "lastUpdated": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Inventory by Part Number

```http
GET /api/inventory/{partNumber}
```

**Response:**
```json
{
  "inventory": {
    "partNumber": "PART-001",
    "partDescription": "Widget A",
    "quantity": 500,
    "location": "end_of_line",
    "containers": [...],
    "lastUpdated": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Inventory

```http
PUT /api/inventory/{partNumber}
```

**Request Body:**
```json
{
  "quantity": 600,
  "location": "tpa",
  "containers": [...]
}
```

### Containers

#### Get All Containers

```http
GET /api/containers
```

**Query Parameters:**
- `partNumber` (optional): Filter by part number
- `location` (optional): Filter by location
- `status` (optional): Filter by status

**Response:**
```json
{
  "containers": [
    {
      "serialNumber": "CONT-001",
      "partNumber": "PART-001",
      "quantity": 100,
      "location": "end_of_line",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Container by Serial Number

```http
GET /api/containers/{serialNumber}
```

#### Split Container

```http
POST /api/containers/{serialNumber}/split
```

**Request Body:**
```json
{
  "newQuantity": 50,
  "reason": "quality_issue"
}
```

#### Merge Containers

```http
POST /api/containers/merge
```

**Request Body:**
```json
{
  "containerIds": ["CONT-001", "CONT-002"],
  "mergeStrategy": "new_serial_number"
}
```

### Kanbans

#### Get All Kanbans

```http
GET /api/kanbans
```

**Query Parameters:**
- `type` (optional): Filter by kanban type
- `status` (optional): Filter by status

**Response:**
```json
{
  "kanbans": [
    {
      "id": "kanban-1",
      "type": "withdrawal",
      "status": "pending",
      "partNumber": "PART-001",
      "partDescription": "Widget A",
      "quantity": 100,
      "withdrawalType": "end_to_tpa",
      "containerIds": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Kanban

```http
POST /api/kanbans
```

**Request Body:**
```json
{
  "type": "withdrawal",
  "partNumber": "PART-001",
  "quantity": 100,
  "withdrawalType": "end_to_tpa"
}
```

#### Update Kanban Status

```http
PUT /api/kanbans/{id}/status
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

### Customer Orders

#### Get All Customer Orders

```http
GET /api/customer-orders
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `customerId` (optional): Filter by customer ID

#### Get Customer Order by ID

```http
GET /api/customer-orders/{id}
```

### Work Centers

#### Get All Work Centers

```http
GET /api/work-centers
```

**Response:**
```json
{
  "workCenters": [
    {
      "id": "WC-01",
      "name": "Work Center 1",
      "status": "active",
      "capacity": 1000,
      "currentLoad": 500,
      "lastUpdated": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Work Center by ID

```http
GET /api/work-centers/{id}
```

## ❌ Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid part number provided",
    "details": {
      "field": "partNumber",
      "value": "INVALID-PART"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Examples

#### Validation Error

```http
POST /api/jobs
Content-Type: application/json

{
  "partNumber": "",
  "quantity": -1
}
```

**Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid job data",
    "details": [
      {
        "field": "partNumber",
        "message": "Part number is required"
      },
      {
        "field": "quantity",
        "message": "Quantity must be positive"
      }
    ]
  }
}
```

#### Not Found Error

```http
GET /api/jobs/non-existent-id
```

**Response:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Job not found",
    "details": {
      "resource": "job",
      "id": "non-existent-id"
    }
  }
}
```

## ⚡ Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 1000,
      "reset": 1640995200
    }
  }
}
```

## 📝 Examples

### Complete Workflow Example

#### 1. Create a Production Job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "partNumber": "PART-001",
    "quantity": 100,
    "priority": 1,
    "workCenter": "WC-01",
    "completionDate": "2024-01-15T00:00:00Z"
  }'
```

#### 2. Create a Withdrawal Kanban

```bash
curl -X POST http://localhost:3000/api/kanbans \
  -H "Content-Type: application/json" \
  -d '{
    "type": "withdrawal",
    "partNumber": "PART-001",
    "quantity": 50,
    "withdrawalType": "end_to_tpa"
  }'
```

#### 3. Update Job Status

```bash
curl -X PUT http://localhost:3000/api/jobs/job-1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

#### 4. Split Container

```bash
curl -X POST http://localhost:3000/api/containers/CONT-001/split \
  -H "Content-Type: application/json" \
  -d '{
    "newQuantity": 25,
    "reason": "quality_issue"
  }'
```

### JavaScript/TypeScript Examples

#### Using Fetch API

```typescript
// Get all jobs
const response = await fetch('/api/jobs');
const { jobs } = await response.json();

// Create a new job
const newJob = await fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    partNumber: 'PART-001',
    quantity: 100,
    priority: 1,
    workCenter: 'WC-01',
    completionDate: '2024-01-15T00:00:00Z',
  }),
});
```

#### Using Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Get inventory by part number
const inventory = await api.get(`/inventory/${partNumber}`);

// Update job
const updatedJob = await api.put(`/jobs/${jobId}`, {
  status: 'in_progress',
  priority: 2,
});
```

## 🎭 Mock API

### Development Mode

When PLEX credentials are not configured, the system automatically uses the mock API with sample data:

```typescript
// Mock data is automatically used
const api = await getApiClient();
const jobs = await api.getJobs(); // Returns mock data
```

### Mock Data Structure

```typescript
// Available mock part numbers
const mockPartNumbers = ['PART-001', 'PART-002', 'PART-003'];

// Available work centers
const mockWorkCenters = ['WC-01', 'WC-02', 'WC-03'];

// Sample job data
const mockJobs = [
  {
    id: 'job-1',
    partNumber: 'PART-001',
    quantity: 100,
    status: 'pending',
    priority: 1,
    workCenter: 'WC-01',
    completionDate: '2024-01-15T00:00:00Z',
  },
  // ... more mock jobs
];
```

### Testing with Mock API

```typescript
// Test API interactions
describe('API Integration', () => {
  it('should create a job', async () => {
    const api = await getApiClient();
    const job = await api.createJob({
      partNumber: 'PART-001',
      quantity: 100,
      priority: 1,
      workCenter: 'WC-01',
    });
    
    expect(job.partNumber).toBe('PART-001');
    expect(job.status).toBe('pending');
  });
});
```

## 📚 Additional Resources

- [PLEX ERP Documentation](https://plex.com/docs)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [JSON Schema](https://json-schema.org/)

---

**For API support or questions, please create an issue in the repository or contact the development team.**
