// Mock PLEX API for development and testing
// Simulates the real PLEX API responses without requiring actual PLEX access

import type { PlexJob, PlexInventory, PlexCustomerOrder, Container, PlexWorkCenter } from './plex-api';

// Mock data
const mockJobs: PlexJob[] = [
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
  {
    id: 'job-003',
    partNumber: 'PART-003',
    quantity: 75,
    completionDate: '2024-02-17',
    sortOrder: 3,
    workCenter: 'WC-01',
    status: 'pending',
    priority: 3,
  },
];

const mockInventory: PlexInventory[] = [
  {
    partNumber: 'PART-001',
    partDescription: 'Steel Bracket Assembly',
    quantityAvailable: 250,
    location: 'end_of_line',
    containers: [
      { serialNumber: 'CONT-001', partNumber: 'PART-001', quantity: 100, location: 'end_of_line', status: 'active' },
      { serialNumber: 'CONT-002', partNumber: 'PART-001', quantity: 150, location: 'end_of_line', status: 'active' },
    ],
  },
  {
    partNumber: 'PART-002',
    partDescription: 'Aluminum Housing',
    quantityAvailable: 120,
    location: 'end_of_line',
    containers: [
      { serialNumber: 'CONT-003', partNumber: 'PART-002', quantity: 70, location: 'end_of_line', status: 'active' },
      { serialNumber: 'CONT-004', partNumber: 'PART-002', quantity: 50, location: 'end_of_line', status: 'active' },
    ],
  },
  {
    partNumber: 'PART-003',
    partDescription: 'Plastic Cover',
    quantityAvailable: 300,
    location: 'end_of_line',
    containers: [
      { serialNumber: 'CONT-005', partNumber: 'PART-003', quantity: 150, location: 'end_of_line', status: 'active' },
      { serialNumber: 'CONT-006', partNumber: 'PART-003', quantity: 150, location: 'end_of_line', status: 'active' },
    ],
  },
];

const mockCustomerOrders: PlexCustomerOrder[] = [
  {
    id: 'order-001',
    customerId: 'CUST-001',
    partNumber: 'PART-001',
    quantity: 50,
    dueDate: '2024-02-20',
    status: 'pending',
    route: 'TPA',
  },
  {
    id: 'order-002',
    customerId: 'CUST-002',
    partNumber: 'PART-002',
    quantity: 25,
    dueDate: '2024-02-22',
    status: 'in_production',
    route: 'TPA',
  },
  {
    id: 'order-003',
    customerId: 'CUST-003',
    partNumber: 'PART-003',
    quantity: 100,
    dueDate: '2024-02-25',
    status: 'pending',
    route: 'Pool',
  },
];

const mockContainers: Container[] = [
  { serialNumber: 'CONT-001', partNumber: 'PART-001', quantity: 100, location: 'end_of_line', status: 'active' },
  { serialNumber: 'CONT-002', partNumber: 'PART-001', quantity: 150, location: 'end_of_line', status: 'active' },
  { serialNumber: 'CONT-003', partNumber: 'PART-002', quantity: 70, location: 'end_of_line', status: 'active' },
  { serialNumber: 'CONT-004', partNumber: 'PART-002', quantity: 50, location: 'end_of_line', status: 'active' },
  { serialNumber: 'CONT-005', partNumber: 'PART-003', quantity: 150, location: 'end_of_line', status: 'active' },
  { serialNumber: 'CONT-006', partNumber: 'PART-003', quantity: 150, location: 'end_of_line', status: 'active' },
];

const mockWorkCenters: PlexWorkCenter[] = [
  { id: 'WC-01', name: 'Assembly Line 1', machineGroup: 'Assembly', capacity: 100, currentLoad: 60 },
  { id: 'WC-02', name: 'Assembly Line 2', machineGroup: 'Assembly', capacity: 100, currentLoad: 40 },
  { id: 'WC-03', name: 'Packaging Station', machineGroup: 'Packaging', capacity: 200, currentLoad: 80 },
];

class MockPlexApiClient {
  private jobs: PlexJob[] = [...mockJobs];
  private inventory: PlexInventory[] = [...mockInventory];
  private customerOrders: PlexCustomerOrder[] = [...mockCustomerOrders];
  private containers: Container[] = [...mockContainers];
  private workCenters: PlexWorkCenter[] = [...mockWorkCenters];

  // Simulate API delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Job Management
  async getJobs(): Promise<PlexJob[]> {
    await this.delay();
    return [...this.jobs];
  }

  async createJob(job: Omit<PlexJob, 'id'>): Promise<PlexJob> {
    await this.delay();
    const newJob: PlexJob = {
      ...job,
      id: `job-${Date.now()}`,
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async updateJob(id: string, updates: Partial<PlexJob>): Promise<PlexJob> {
    await this.delay();
    const jobIndex = this.jobs.findIndex(job => job.id === id);
    if (jobIndex === -1) throw new Error('Job not found');
    
    this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates };
    return this.jobs[jobIndex];
  }

  async deleteJob(id: string): Promise<void> {
    await this.delay();
    this.jobs = this.jobs.filter(job => job.id !== id);
  }

  async reorderJobs(jobIds: string[]): Promise<void> {
    await this.delay();
    // Simulate reordering by updating sort orders
    jobIds.forEach((jobId, index) => {
      const job = this.jobs.find(j => j.id === jobId);
      if (job) job.sortOrder = index + 1;
    });
  }

  // Inventory Management
  async getInventory(): Promise<PlexInventory[]> {
    await this.delay();
    return [...this.inventory];
  }

  async getInventoryByPart(partNumber: string): Promise<PlexInventory> {
    await this.delay();
    const inventory = this.inventory.find(inv => inv.partNumber === partNumber);
    if (!inventory) throw new Error('Inventory not found');
    return inventory;
  }

  async updateInventory(partNumber: string, updates: Partial<PlexInventory>): Promise<PlexInventory> {
    await this.delay();
    const inventoryIndex = this.inventory.findIndex(inv => inv.partNumber === partNumber);
    if (inventoryIndex === -1) throw new Error('Inventory not found');
    
    this.inventory[inventoryIndex] = { ...this.inventory[inventoryIndex], ...updates };
    return this.inventory[inventoryIndex];
  }

  // Container Management
  async getContainers(): Promise<Container[]> {
    await this.delay();
    return [...this.containers];
  }

  async createContainer(container: Omit<Container, 'serialNumber'>): Promise<Container> {
    await this.delay();
    const newContainer: Container = {
      ...container,
      serialNumber: `CONT-${Date.now()}`,
    };
    this.containers.push(newContainer);
    return newContainer;
  }

  async splitContainer(serialNumber: string, quantities: number[]): Promise<Container[]> {
    await this.delay();
    const container = this.containers.find(c => c.serialNumber === serialNumber);
    if (!container) throw new Error('Container not found');
    
    const newContainers: Container[] = quantities.map((quantity, index) => ({
      serialNumber: `${serialNumber}-SPLIT-${index + 1}`,
      partNumber: container.partNumber,
      quantity,
      location: container.location,
      status: 'active',
      parentContainer: serialNumber,
    }));
    
    // Update original container
    container.status = 'split';
    container.childContainers = newContainers.map(c => c.serialNumber);
    
    this.containers.push(...newContainers);
    return newContainers;
  }

  async mergeContainers(serialNumbers: string[], mergeStrategy: 'new_number' | 'keep_first' | 'keep_last'): Promise<Container> {
    await this.delay();
    const containersToMerge = this.containers.filter(c => serialNumbers.includes(c.serialNumber));
    if (containersToMerge.length < 2) throw new Error('Need at least 2 containers to merge');
    
    const totalQuantity = containersToMerge.reduce((sum, c) => sum + c.quantity, 0);
    const firstContainer = containersToMerge[0];
    
    let newSerialNumber: string;
    switch (mergeStrategy) {
      case 'new_number':
        newSerialNumber = `CONT-MERGE-${Date.now()}`;
        break;
      case 'keep_first':
        newSerialNumber = firstContainer.serialNumber;
        break;
      case 'keep_last':
        newSerialNumber = containersToMerge[containersToMerge.length - 1].serialNumber;
        break;
    }
    
    const mergedContainer: Container = {
      serialNumber: newSerialNumber,
      partNumber: firstContainer.partNumber,
      quantity: totalQuantity,
      location: firstContainer.location,
      status: 'merged',
    };
    
    // Remove original containers and add merged one
    this.containers = this.containers.filter(c => !serialNumbers.includes(c.serialNumber));
    this.containers.push(mergedContainer);
    
    return mergedContainer;
  }

  // Customer Orders
  async getCustomerOrders(): Promise<PlexCustomerOrder[]> {
    await this.delay();
    return [...this.customerOrders];
  }

  async updateOrderStatus(orderId: string, status: PlexCustomerOrder['status']): Promise<PlexCustomerOrder> {
    await this.delay();
    const orderIndex = this.customerOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) throw new Error('Order not found');
    
    this.customerOrders[orderIndex] = { ...this.customerOrders[orderIndex], status };
    return this.customerOrders[orderIndex];
  }

  // Work Centers
  async getWorkCenters(): Promise<PlexWorkCenter[]> {
    await this.delay();
    return [...this.workCenters];
  }

  // E-Kanban (mock implementation)
  async getEKanban(): Promise<any[]> {
    await this.delay();
    return [];
  }

  async createEKanban(kanban: any): Promise<any> {
    await this.delay();
    return { id: `ekanban-${Date.now()}`, ...kanban };
  }
}

// Export singleton instance
export const mockPlexApi = new MockPlexApiClient();
