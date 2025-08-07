// PLEX ERP API Integration Layer
// Handles communication with the existing PLEX ERP system

export interface PlexJob {
  id: string;
  partNumber: string;
  quantity: number;
  completionDate: string;
  sortOrder: number;
  workCenter: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
}

export interface PlexInventory {
  partNumber: string;
  partDescription: string;
  quantityAvailable: number;
  location: 'end_of_line' | 'tpa' | 'pool_stock';
  containers: Container[];
}

export interface Container {
  serialNumber: string;
  partNumber: string;
  quantity: number;
  location: string;
  status: 'active' | 'split' | 'merged' | 'quality_hold';
  parentContainer?: string; // for split containers
  childContainers?: string[]; // for merged containers
}

export interface PlexCustomerOrder {
  id: string;
  customerId: string;
  partNumber: string;
  quantity: number;
  dueDate: string;
  status: 'pending' | 'in_production' | 'shipped' | 'cancelled';
  route: string;
}

export interface PlexWorkCenter {
  id: string;
  name: string;
  machineGroup: string;
  capacity: number;
  currentLoad: number;
}

class PlexApiClient {
  private baseUrl: string;
  private apiKey: string;
  private clientId: string;

  constructor() {
    this.baseUrl = process.env.PLEX_API_URL || '';
    this.apiKey = process.env.PLEX_API_KEY || '';
    this.clientId = process.env.PLEX_CLIENT_ID || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Client-ID': this.clientId,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`PLEX API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PLEX API request failed:', error);
      throw error;
    }
  }

  // Job Management
  async getJobs(): Promise<PlexJob[]> {
    return this.request<PlexJob[]>('/jobs');
  }

  async createJob(job: Omit<PlexJob, 'id'>): Promise<PlexJob> {
    return this.request<PlexJob>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, updates: Partial<PlexJob>): Promise<PlexJob> {
    return this.request<PlexJob>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async reorderJobs(jobIds: string[]): Promise<void> {
    return this.request<void>('/jobs/reorder', {
      method: 'POST',
      body: JSON.stringify({ jobIds }),
    });
  }

  // Inventory Management
  async getInventory(): Promise<PlexInventory[]> {
    return this.request<PlexInventory[]>('/inventory');
  }

  async getInventoryByPart(partNumber: string): Promise<PlexInventory> {
    return this.request<PlexInventory>(`/inventory/${partNumber}`);
  }

  async updateInventory(partNumber: string, updates: Partial<PlexInventory>): Promise<PlexInventory> {
    return this.request<PlexInventory>(`/inventory/${partNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Container Management
  async getContainers(): Promise<Container[]> {
    return this.request<Container[]>('/containers');
  }

  async createContainer(container: Omit<Container, 'serialNumber'>): Promise<Container> {
    return this.request<Container>('/containers', {
      method: 'POST',
      body: JSON.stringify(container),
    });
  }

  async splitContainer(serialNumber: string, quantities: number[]): Promise<Container[]> {
    return this.request<Container[]>(`/containers/${serialNumber}/split`, {
      method: 'POST',
      body: JSON.stringify({ quantities }),
    });
  }

  async mergeContainers(serialNumbers: string[], mergeStrategy: 'new_number' | 'keep_first' | 'keep_last'): Promise<Container> {
    return this.request<Container>('/containers/merge', {
      method: 'POST',
      body: JSON.stringify({ serialNumbers, mergeStrategy }),
    });
  }

  // Customer Orders
  async getCustomerOrders(): Promise<PlexCustomerOrder[]> {
    return this.request<PlexCustomerOrder[]>('/customer-orders');
  }

  async updateOrderStatus(orderId: string, status: PlexCustomerOrder['status']): Promise<PlexCustomerOrder> {
    return this.request<PlexCustomerOrder>(`/customer-orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Work Centers
  async getWorkCenters(): Promise<PlexWorkCenter[]> {
    return this.request<PlexWorkCenter[]>('/work-centers');
  }

  // E-Kanban (if PLEX supports it)
  async getEKanban(): Promise<any[]> {
    return this.request<any[]>('/e-kanban');
  }

  async createEKanban(kanban: any): Promise<any> {
    return this.request<any>('/e-kanban', {
      method: 'POST',
      body: JSON.stringify(kanban),
    });
  }
}

// Export singleton instance
export const plexApi = new PlexApiClient();
