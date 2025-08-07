// Digital Kanban System
// Replaces physical cards with automated digital workflows

import { plexApi } from './plex-api';
import type { PlexJob, PlexInventory, PlexCustomerOrder, Container } from './plex-api';

export type KanbanType = 'withdrawal' | 'production';
export type WithdrawalType = 'end_to_tpa' | 'end_to_pool' | 'pool_to_tpa';
export type KanbanStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface DigitalKanban {
  id: string;
  type: KanbanType;
  status: KanbanStatus;
  createdAt: string;
  completedAt?: string;
  
  // Withdrawal Kanban specific fields
  withdrawalType?: WithdrawalType;
  fromLocation?: string;
  toLocation?: string;
  quantity?: number;
  
  // Production Kanban specific fields
  workCenter?: string;
  priority?: number;
  jobId?: string;
  
  // Common fields
  partNumber: string;
  partDescription: string;
  customerId?: string;
  route?: string;
  containerIds: string[];
}

export interface KanbanWorkflow {
  id: string;
  name: string;
  description: string;
  steps: KanbanWorkflowStep[];
  isActive: boolean;
}

export interface KanbanWorkflowStep {
  id: string;
  name: string;
  type: 'create_kanban' | 'move_inventory' | 'update_job' | 'notify_team';
  parameters: Record<string, any>;
  order: number;
}

class DigitalKanbanSystem {
  private kanbans: Map<string, DigitalKanban> = new Map();
  private workflows: Map<string, KanbanWorkflow> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  private initializeDefaultWorkflows() {
    // Customer Order Fulfillment Workflow
    const customerOrderWorkflow: KanbanWorkflow = {
      id: 'customer-order-fulfillment',
      name: 'Customer Order Fulfillment',
      description: 'Automated workflow for fulfilling customer orders',
      isActive: true,
      steps: [
        {
          id: 'check-inventory',
          name: 'Check Available Inventory',
          type: 'move_inventory',
          parameters: { action: 'check_availability' },
          order: 1,
        },
        {
          id: 'create-withdrawal',
          name: 'Create Withdrawal Kanban',
          type: 'create_kanban',
          parameters: { type: 'withdrawal', withdrawalType: 'end_to_tpa' },
          order: 2,
        },
        {
          id: 'update-order',
          name: 'Update Order Status',
          type: 'update_job',
          parameters: { status: 'in_production' },
          order: 3,
        },
      ],
    };

    // Production Scheduling Workflow
    const productionWorkflow: KanbanWorkflow = {
      id: 'production-scheduling',
      name: 'Production Scheduling',
      description: 'Automated workflow for production scheduling',
      isActive: true,
      steps: [
        {
          id: 'create-production-kanban',
          name: 'Create Production Kanban',
          type: 'create_kanban',
          parameters: { type: 'production' },
          order: 1,
        },
        {
          id: 'assign-work-center',
          name: 'Assign Work Center',
          type: 'update_job',
          parameters: { assignWorkCenter: true },
          order: 2,
        },
        {
          id: 'notify-production',
          name: 'Notify Production Team',
          type: 'notify_team',
          parameters: { team: 'production', message: 'New production kanban created' },
          order: 3,
        },
      ],
    };

    this.workflows.set(customerOrderWorkflow.id, customerOrderWorkflow);
    this.workflows.set(productionWorkflow.id, productionWorkflow);
  }

  // Create a new digital kanban
  async createKanban(kanbanData: Omit<DigitalKanban, 'id' | 'createdAt'>): Promise<DigitalKanban> {
    const kanban: DigitalKanban = {
      ...kanbanData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    this.kanbans.set(kanban.id, kanban);
    
    // Trigger workflow if this is a withdrawal kanban
    if (kanban.type === 'withdrawal') {
      await this.processWithdrawalKanban(kanban);
    } else if (kanban.type === 'production') {
      await this.processProductionKanban(kanban);
    }

    return kanban;
  }

  // Process withdrawal kanban (replaces physical withdrawal cards)
  private async processWithdrawalKanban(kanban: DigitalKanban): Promise<void> {
    try {
      // Get current inventory levels
      const inventory = await plexApi.getInventoryByPart(kanban.partNumber);
      
      // Determine withdrawal type and create appropriate kanban
      if (kanban.withdrawalType === 'end_to_tpa') {
        // Green card equivalent - end of line stock to TPA
        await this.createEndToTpaWithdrawal(kanban, inventory);
      } else if (kanban.withdrawalType === 'end_to_pool') {
        // Dark blue card equivalent - end of line stock to pool stock
        await this.createEndToPoolWithdrawal(kanban, inventory);
      } else if (kanban.withdrawalType === 'pool_to_tpa') {
        // Light blue card equivalent - pool stock to TPA
        await this.createPoolToTpaWithdrawal(kanban, inventory);
      }
    } catch (error) {
      console.error('Error processing withdrawal kanban:', error);
      throw error;
    }
  }

  // Process production kanban (replaces physical production instruction cards)
  private async processProductionKanban(kanban: DigitalKanban): Promise<void> {
    try {
      // Create or update job in PLEX
      if (kanban.jobId) {
        await plexApi.updateJob(kanban.jobId, {
          status: 'in_progress',
          priority: kanban.priority || 1,
        });
      } else {
        // Create new job
        const job = await plexApi.createJob({
          partNumber: kanban.partNumber,
          quantity: kanban.quantity || 0,
          completionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          sortOrder: kanban.priority || 1,
          workCenter: kanban.workCenter || '',
          status: 'pending',
          priority: kanban.priority || 1,
        });
        
        // Update kanban with job ID
        kanban.jobId = job.id;
        this.kanbans.set(kanban.id, kanban);
      }

      // Notify production team (digital equivalent of physical card)
      await this.notifyProductionTeam(kanban);
    } catch (error) {
      console.error('Error processing production kanban:', error);
      throw error;
    }
  }

  // Create end of line stock to TPA withdrawal (green card)
  private async createEndToTpaWithdrawal(kanban: DigitalKanban, inventory: PlexInventory): Promise<void> {
    const availableContainers = inventory.containers.filter(c => 
      c.location === 'end_of_line' && c.status === 'active'
    );

    if (availableContainers.length === 0) {
      throw new Error(`No available containers for part ${kanban.partNumber} at end of line`);
    }

    // Select containers to move
    const containersToMove = this.selectContainersForWithdrawal(availableContainers, kanban.quantity || 0);
    
    // Update container locations
    for (const container of containersToMove) {
      await plexApi.updateInventory(kanban.partNumber, {
        containers: inventory.containers.map(c => 
          c.serialNumber === container.serialNumber 
            ? { ...c, location: 'tpa' }
            : c
        ),
      });
    }

    // Update kanban status
    kanban.status = 'active';
    kanban.containerIds = containersToMove.map(c => c.serialNumber);
    this.kanbans.set(kanban.id, kanban);
  }

  // Create end of line stock to pool stock withdrawal (dark blue card)
  private async createEndToPoolWithdrawal(kanban: DigitalKanban, inventory: PlexInventory): Promise<void> {
    const availableContainers = inventory.containers.filter(c => 
      c.location === 'end_of_line' && c.status === 'active'
    );

    if (availableContainers.length === 0) {
      throw new Error(`No available containers for part ${kanban.partNumber} at end of line`);
    }

    // Select containers to move
    const containersToMove = this.selectContainersForWithdrawal(availableContainers, kanban.quantity || 0);
    
    // Update container locations
    for (const container of containersToMove) {
      await plexApi.updateInventory(kanban.partNumber, {
        containers: inventory.containers.map(c => 
          c.serialNumber === container.serialNumber 
            ? { ...c, location: 'pool_stock' }
            : c
        ),
      });
    }

    // Update kanban status
    kanban.status = 'active';
    kanban.containerIds = containersToMove.map(c => c.serialNumber);
    this.kanbans.set(kanban.id, kanban);
  }

  // Create pool stock to TPA withdrawal (light blue card)
  private async createPoolToTpaWithdrawal(kanban: DigitalKanban, inventory: PlexInventory): Promise<void> {
    const availableContainers = inventory.containers.filter(c => 
      c.location === 'pool_stock' && c.status === 'active'
    );

    if (availableContainers.length === 0) {
      throw new Error(`No available containers for part ${kanban.partNumber} in pool stock`);
    }

    // Select containers to move
    const containersToMove = this.selectContainersForWithdrawal(availableContainers, kanban.quantity || 0);
    
    // Update container locations
    for (const container of containersToMove) {
      await plexApi.updateInventory(kanban.partNumber, {
        containers: inventory.containers.map(c => 
          c.serialNumber === container.serialNumber 
            ? { ...c, location: 'tpa' }
            : c
        ),
      });
    }

    // Update kanban status
    kanban.status = 'active';
    kanban.containerIds = containersToMove.map(c => c.serialNumber);
    this.kanbans.set(kanban.id, kanban);
  }

  // Select containers for withdrawal based on quantity needed
  private selectContainersForWithdrawal(containers: Container[], quantityNeeded: number): Container[] {
    let selectedContainers: Container[] = [];
    let totalQuantity = 0;

    // Sort containers by quantity (largest first for efficiency)
    const sortedContainers = [...containers].sort((a, b) => b.quantity - a.quantity);

    for (const container of sortedContainers) {
      if (totalQuantity >= quantityNeeded) break;
      
      selectedContainers.push(container);
      totalQuantity += container.quantity;
    }

    if (totalQuantity < quantityNeeded) {
      throw new Error(`Insufficient inventory. Need ${quantityNeeded}, available ${totalQuantity}`);
    }

    return selectedContainers;
  }

  // Notify production team (digital equivalent of physical production instruction card)
  private async notifyProductionTeam(kanban: DigitalKanban): Promise<void> {
    // This would integrate with their notification system
    // For now, we'll log the notification
    console.log(`Production Kanban Created:`, {
      partNumber: kanban.partNumber,
      workCenter: kanban.workCenter,
      priority: kanban.priority,
      jobId: kanban.jobId,
    });
  }

  // Complete a kanban
  async completeKanban(kanbanId: string): Promise<DigitalKanban> {
    const kanban = this.kanbans.get(kanbanId);
    if (!kanban) {
      throw new Error(`Kanban ${kanbanId} not found`);
    }

    kanban.status = 'completed';
    kanban.completedAt = new Date().toISOString();
    this.kanbans.set(kanbanId, kanban);

    return kanban;
  }

  // Get all kanbans
  getKanbans(): DigitalKanban[] {
    return Array.from(this.kanbans.values());
  }

  // Get kanbans by type
  getKanbansByType(type: KanbanType): DigitalKanban[] {
    return this.getKanbans().filter(k => k.type === type);
  }

  // Get kanbans by status
  getKanbansByStatus(status: KanbanStatus): DigitalKanban[] {
    return this.getKanbans().filter(k => k.status === status);
  }

  // Get workflows
  getWorkflows(): KanbanWorkflow[] {
    return Array.from(this.workflows.values());
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string, parameters: Record<string, any>): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (!workflow.isActive) {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    // Execute workflow steps in order
    for (const step of workflow.steps.sort((a, b) => a.order - b.order)) {
      await this.executeWorkflowStep(step, parameters);
    }
  }

  // Execute a single workflow step
  private async executeWorkflowStep(step: KanbanWorkflowStep, parameters: Record<string, any>): Promise<void> {
    switch (step.type) {
      case 'create_kanban':
        // Ensure required fields are present for kanban creation
        const kanbanData = {
          type: step.parameters.type as KanbanType,
          status: 'pending' as KanbanStatus,
          partNumber: parameters.partNumber || step.parameters.partNumber,
          partDescription: parameters.partDescription || step.parameters.partDescription,
          containerIds: parameters.containerIds || step.parameters.containerIds || [],
          ...step.parameters,
          ...parameters,
        };
        
        // Validate required fields
        if (!kanbanData.type || !kanbanData.partNumber || !kanbanData.partDescription) {
          throw new Error('Missing required fields for kanban creation');
        }
        
        await this.createKanban(kanbanData);
        break;
      case 'move_inventory':
        // Handle inventory movement
        break;
      case 'update_job':
        // Handle job updates
        break;
      case 'notify_team':
        // Handle team notifications
        break;
      default:
        throw new Error(`Unknown workflow step type: ${step.type}`);
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `kanban_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const kanbanSystem = new DigitalKanbanSystem();
