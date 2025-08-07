'use client';

import { useState } from 'react';
import { Container } from '@/lib/plex-api';
import { plexApi } from '@/lib/plex-api';
import { 
  CubeIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ContainerManagerProps {
  containers: Container[];
  onContainerUpdate: () => void;
}

export default function ContainerManager({ containers, onContainerUpdate }: ContainerManagerProps) {
  const [selectedContainers, setSelectedContainers] = useState<string[]>([]);
  const [splitQuantities, setSplitQuantities] = useState<number[]>([]);
  const [mergeStrategy, setMergeStrategy] = useState<'new_number' | 'keep_first' | 'keep_last'>('new_number');
  const [qualityIssue, setQualityIssue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContainerSelect = (serialNumber: string) => {
    setSelectedContainers(prev => 
      prev.includes(serialNumber) 
        ? prev.filter(id => id !== serialNumber)
        : [...prev, serialNumber]
    );
  };

  const handleSplitContainer = async (container: Container) => {
    if (splitQuantities.length < 2) {
      alert('Please specify at least 2 quantities for splitting');
      return;
    }

    try {
      setIsProcessing(true);
      await plexApi.splitContainer(container.serialNumber, splitQuantities);
      setSplitQuantities([]);
      onContainerUpdate();
    } catch (error) {
      console.error('Error splitting container:', error);
      alert('Failed to split container');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergeContainers = async () => {
    if (selectedContainers.length < 2) {
      alert('Please select at least 2 containers to merge');
      return;
    }

    try {
      setIsProcessing(true);
      await plexApi.mergeContainers(selectedContainers, mergeStrategy);
      setSelectedContainers([]);
      onContainerUpdate();
    } catch (error) {
      console.error('Error merging containers:', error);
      alert('Failed to merge containers');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQualityIssue = async (container: Container) => {
    if (!qualityIssue.trim()) {
      alert('Please describe the quality issue');
      return;
    }

    try {
      setIsProcessing(true);
      // Update container status to quality hold
      await plexApi.updateInventory(container.partNumber, {
        containers: containers.map(c => 
          c.serialNumber === container.serialNumber 
            ? { ...c, status: 'quality_hold' }
            : c
        ),
      });
      setQualityIssue('');
      onContainerUpdate();
    } catch (error) {
      console.error('Error handling quality issue:', error);
      alert('Failed to update container status');
    } finally {
      setIsProcessing(false);
    }
  };

  const addSplitQuantity = () => {
    setSplitQuantities([...splitQuantities, 0]);
  };

  const updateSplitQuantity = (index: number, value: number) => {
    const newQuantities = [...splitQuantities];
    newQuantities[index] = value;
    setSplitQuantities(newQuantities);
  };

  const removeSplitQuantity = (index: number) => {
    setSplitQuantities(splitQuantities.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Container Management</h2>
        
        {/* Container List */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Containers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((container) => (
              <ContainerCard
                key={container.serialNumber}
                container={container}
                isSelected={selectedContainers.includes(container.serialNumber)}
                onSelect={() => handleContainerSelect(container.serialNumber)}
                onSplit={() => handleSplitContainer(container)}
                onQualityIssue={() => handleQualityIssue(container)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        </div>

        {/* Split Container Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Split Container</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Split quantities:</span>
              <button
                onClick={addSplitQuantity}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Add Quantity
              </button>
            </div>
            
            <div className="space-y-2">
              {splitQuantities.map((quantity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => updateSplitQuantity(index, parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => removeSplitQuantity(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Merge Containers Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Merge Containers</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merge Strategy
              </label>
              <select
                value={mergeStrategy}
                onChange={(e) => setMergeStrategy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new_number">Create new serial number</option>
                <option value="keep_first">Keep first container's number</option>
                <option value="keep_last">Keep last container's number</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Selected: {selectedContainers.length} containers
              </span>
              <button
                onClick={handleMergeContainers}
                disabled={selectedContainers.length < 2 || isProcessing}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Merging...' : 'Merge Containers'}
              </button>
            </div>
          </div>
        </div>

        {/* Quality Issue Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Quality Issue</h3>
          <div className="space-y-4">
            <textarea
              value={qualityIssue}
              onChange={(e) => setQualityIssue(e.target.value)}
              placeholder="Describe the quality issue..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <p className="text-sm text-gray-600">
              When a quality issue occurs, one container receives a new serial number while the other maintains the old number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Container Card Component
function ContainerCard({ 
  container, 
  isSelected, 
  onSelect, 
  onSplit, 
  onQualityIssue, 
  isProcessing 
}: {
  container: Container;
  isSelected: boolean;
  onSelect: () => void;
  onSplit: () => void;
  onQualityIssue: () => void;
  isProcessing: boolean;
}) {
  const getStatusColor = () => {
    switch (container.status) {
      case 'active':
        return 'border-green-500 bg-green-50';
      case 'split':
        return 'border-yellow-500 bg-yellow-50';
      case 'merged':
        return 'border-blue-500 bg-blue-50';
      case 'quality_hold':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = () => {
    switch (container.status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'quality_hold':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CubeIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{container.serialNumber}</span>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-gray-600">Part: {container.partNumber}</p>
        <p className="text-xs text-gray-600">Qty: {container.quantity}</p>
        <p className="text-xs text-gray-600">Location: {container.location}</p>
        <p className="text-xs text-gray-600">Status: {container.status}</p>
      </div>

      {container.parentContainer && (
        <p className="text-xs text-gray-500 mt-2">
          Parent: {container.parentContainer}
        </p>
      )}

      {container.childContainers && container.childContainers.length > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Children: {container.childContainers.join(', ')}
        </p>
      )}

      <div className="flex space-x-2 mt-3">
        <button
          onClick={onSplit}
          disabled={isProcessing}
          className="flex-1 bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
        >
          Split
        </button>
        <button
          onClick={onQualityIssue}
          disabled={isProcessing}
          className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
        >
          Quality Issue
        </button>
      </div>
    </div>
  );
}
