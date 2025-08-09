'use client';

import { useState, useEffect } from 'react';
import { plexApi, PlexJob, PlexInventory, PlexCustomerOrder, Container } from '@/lib/plex-api';
import { mockPlexApi } from '@/lib/mock-plex-api';
import { config } from '@/lib/config';
import { kanbanSystem, DigitalKanban, KanbanType } from '@/lib/kanban-system';
import ContainerManager from '@/components/ContainerManager';
import ProductionScheduler from '@/components/ProductionScheduler';
import { 
  CalendarIcon, 
  CubeIcon, 
  TruckIcon, 
  CogIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [jobs, setJobs] = useState<PlexJob[]>([]);
  const [inventory, setInventory] = useState<PlexInventory[]>([]);
  const [customerOrders, setCustomerOrders] = useState<PlexCustomerOrder[]>([]);
  const [kanbans, setKanbans] = useState<DigitalKanban[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leveling' | 'kanbans' | 'inventory' | 'orders' | 'containers' | 'scheduler'>('leveling');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use mock API if PLEX credentials are not configured
      const api = config.features.useMockData ? mockPlexApi : plexApi;
      
      const [jobsData, inventoryData, ordersData, containersData] = await Promise.all([
        api.getJobs(),
        api.getInventory(),
        api.getCustomerOrders(),
        api.getContainers(),
      ]);
      
      setJobs(jobsData);
      setInventory(inventoryData);
      setCustomerOrders(ordersData);
      setContainers(containersData);
      setKanbans(kanbanSystem.getKanbans());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawalKanban = async (partNumber: string, quantity: number, withdrawalType: 'end_to_tpa' | 'end_to_pool' | 'pool_to_tpa') => {
    try {
      const inventoryItem = inventory.find(inv => inv.partNumber === partNumber);
      if (!inventoryItem) {
        alert(`Part number "${partNumber}" not found. Available parts: ${inventory.map(inv => inv.partNumber).join(', ')}`);
        return;
      }

      const kanban = await kanbanSystem.createKanban({
        type: 'withdrawal',
        withdrawalType,
        partNumber,
        partDescription: inventoryItem.partDescription,
        quantity,
        status: 'pending',
        containerIds: [],
      });

      setKanbans(kanbanSystem.getKanbans());
      alert('Withdrawal kanban created successfully!');
    } catch (error) {
      console.error('Error creating withdrawal kanban:', error);
      alert('Failed to create withdrawal kanban. Please try again.');
    }
  };

  const createProductionKanban = async (partNumber: string, quantity: number, workCenter: string, priority: number) => {
    try {
      const inventoryItem = inventory.find(inv => inv.partNumber === partNumber);
      if (!inventoryItem) {
        alert(`Part number "${partNumber}" not found. Available parts: ${inventory.map(inv => inv.partNumber).join(', ')}`);
        return;
      }

      const kanban = await kanbanSystem.createKanban({
        type: 'production',
        partNumber,
        partDescription: inventoryItem.partDescription,
        quantity,
        workCenter,
        priority,
        status: 'pending',
        containerIds: [],
      });

      setKanbans(kanbanSystem.getKanbans());
      alert('Production kanban created successfully!');
    } catch (error) {
      console.error('Error creating production kanban:', error);
      alert('Failed to create production kanban. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PLEX data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PLEX Automation Dashboard</h1>
              <p className="text-gray-600">Digital leveling board and kanban system</p>
            </div>
            <div className="flex items-center space-x-4">
              {config.features.useMockData && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-md text-sm">
                  🔧 Using Mock Data
                </div>
              )}
              <button
                onClick={loadData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'leveling', name: 'Leveling Board', icon: CalendarIcon },
              { id: 'kanbans', name: 'Digital Kanbans', icon: CubeIcon },
              { id: 'inventory', name: 'Inventory', icon: TruckIcon },
              { id: 'orders', name: 'Customer Orders', icon: CogIcon },
              { id: 'containers', name: 'Container Management', icon: ArchiveBoxIcon },
              { id: 'scheduler', name: 'Production Scheduler', icon: WrenchScrewdriverIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'leveling' && (
          <LevelingBoard 
            jobs={jobs}
            kanbans={kanbans}
            inventory={inventory}
            onCreateWithdrawalKanban={createWithdrawalKanban}
          />
        )}
        
        {activeTab === 'kanbans' && (
          <KanbanBoard kanbans={kanbans} onRefresh={loadData} />
        )}
        
        {activeTab === 'inventory' && (
          <InventoryView inventory={inventory} />
        )}
        
        {activeTab === 'orders' && (
          <CustomerOrdersView orders={customerOrders} />
        )}
        
        {activeTab === 'containers' && (
          <ContainerManager containers={containers} onContainerUpdate={loadData} />
        )}
        
        {activeTab === 'scheduler' && (
          <ProductionScheduler onJobUpdate={loadData} />
        )}
      </main>
    </div>
  );
}

// Leveling Board Component (Digital equivalent of physical leveling board)
function LevelingBoard({ 
  jobs, 
  kanbans, 
  inventory,
  onCreateWithdrawalKanban
}: {
  jobs: PlexJob[];
  kanbans: DigitalKanban[];
  inventory: PlexInventory[];
  onCreateWithdrawalKanban: (partNumber: string, quantity: number, type: 'end_to_tpa' | 'end_to_pool' | 'pool_to_tpa') => void;
}) {
  const [selectedPart, setSelectedPart] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Leveling Board Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Leveling Board</h2>
          <div className="text-2xl font-mono bg-red-600 text-white px-4 py-2 rounded">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Main Board Layout */}
        <div className="grid grid-cols-12 gap-4">
          {/* Part Numbers Section */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Part Numbers</h3>
            <div className="space-y-2">
              {inventory.map((item) => (
                <div key={item.partNumber} className="bg-white p-2 rounded shadow-sm text-sm">
                  {item.partNumber}
                </div>
              ))}
            </div>
          </div>

          {/* Return Slots */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Return Slots</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded shadow-sm border-2 border-dashed border-gray-300" />
              ))}
            </div>
          </div>

          {/* WK Slots */}
          <div className="col-span-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">WK Slots</h3>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded shadow-sm border-2 border-dashed border-gray-300" />
              ))}
            </div>
          </div>

          {/* Batch Building Box */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Batch Building</h3>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded shadow-sm border-2 border-dashed border-gray-300" />
              ))}
            </div>
          </div>

          {/* Safety Stock Slots */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Safety Stock</h3>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded shadow-sm border-2 border-dashed border-gray-300" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Kanban Creation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Withdrawal Kanban</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Part Number</option>
              {inventory.map((item) => (
                <option key={item.partNumber} value={item.partNumber}>
                  {item.partNumber} - {item.partDescription}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                if (selectedPart && quantity) {
                  onCreateWithdrawalKanban(selectedPart, parseInt(quantity) || 0, 'end_to_tpa');
                }
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              EOL → TPA
            </button>
            <button
              onClick={() => {
                if (selectedPart && quantity) {
                  onCreateWithdrawalKanban(selectedPart, parseInt(quantity) || 0, 'end_to_pool');
                }
              }}
              className="flex-1 bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-900"
            >
              EOL → Pool
            </button>
            <button
              onClick={() => {
                if (selectedPart && quantity) {
                  onCreateWithdrawalKanban(selectedPart, parseInt(quantity) || 0, 'pool_to_tpa');
                }
              }}
              className="flex-1 bg-blue-400 text-white px-4 py-2 rounded-md hover:bg-blue-500"
            >
              Pool → TPA
            </button>
          </div>
        </div>
      </div>

      {/* Active Kanbans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Withdrawal Kanbans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbans
            .filter(k => k.status === 'active' && k.type === 'withdrawal')
            .map((kanban) => (
              <div key={kanban.id} className={`border-l-4 rounded-lg p-4 ${
                kanban.withdrawalType === 'end_to_tpa' 
                  ? 'border-l-green-600'
                  : kanban.withdrawalType === 'end_to_pool'
                  ? 'border-l-blue-800'
                  : 'border-l-blue-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    kanban.withdrawalType === 'end_to_tpa'
                      ? 'bg-green-100 text-green-800'
                      : kanban.withdrawalType === 'end_to_pool'
                      ? 'bg-blue-800 text-white'
                      : 'bg-blue-400 text-white'
                  }`}>
                    {kanban.withdrawalType ? kanban.withdrawalType.replace(/_/g, ' ').toUpperCase() : ''}
                  </span>
                  <span className="text-xs text-gray-500">{kanban.partNumber}</span>
                </div>
                <p className="text-sm font-medium">{kanban.partDescription}</p>
                <p className="text-xs text-gray-500">Qty: {kanban.quantity}</p>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Kanban Board Component
function KanbanBoard({ kanbans, onRefresh }: { kanbans: DigitalKanban[]; onRefresh: () => void }) {
  const pendingKanbans = kanbans.filter(k => k.status === 'pending');
  const activeKanbans = kanbans.filter(k => k.status === 'active');
  const completedKanbans = kanbans.filter(k => k.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Digital Kanban Board</h2>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Kanbans */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Pending ({pendingKanbans.length})</h3>
          <div className="space-y-3">
            {pendingKanbans.map((kanban) => (
              <KanbanCard key={kanban.id} kanban={kanban} />
            ))}
          </div>
        </div>

        {/* Active Kanbans */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Active ({activeKanbans.length})</h3>
          <div className="space-y-3">
            {activeKanbans.map((kanban) => (
              <KanbanCard key={kanban.id} kanban={kanban} />
            ))}
          </div>
        </div>

        {/* Completed Kanbans */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Completed ({completedKanbans.length})</h3>
          <div className="space-y-3">
            {completedKanbans.map((kanban) => (
              <KanbanCard key={kanban.id} kanban={kanban} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Kanban Card Component
function KanbanCard({ kanban }: { kanban: DigitalKanban }) {
  const getStatusIcon = () => {
    switch (kanban.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'active':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CubeIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = () => {
    if (kanban.type === 'withdrawal') {
      switch (kanban.withdrawalType) {
        case 'end_to_tpa':
          return 'border-l-green-500';
        case 'end_to_pool':
          return 'border-l-blue-800';
        case 'pool_to_tpa':
          return 'border-l-blue-400';
        default:
          return 'border-l-gray-400';
      }
    } else {
      return 'border-l-purple-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 p-4 ${getTypeColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{kanban.partNumber}</span>
          </div>
          <p className="text-xs text-gray-600 mb-1">{kanban.partDescription}</p>
          <p className="text-xs text-gray-500">Qty: {kanban.quantity}</p>
          {kanban.workCenter && (
            <p className="text-xs text-gray-500">WC: {kanban.workCenter}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {new Date(kanban.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Inventory View Component
function InventoryView({ inventory }: { inventory: PlexInventory[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Inventory Levels</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available Qty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Containers
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.partNumber}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.partNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.partDescription}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantityAvailable}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.location.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.containers.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Customer Orders View Component
function CustomerOrdersView({ orders }: { orders: PlexCustomerOrder[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Customer Orders</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Part Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customerId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.partNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'shipped' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'in_production'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'pending'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
