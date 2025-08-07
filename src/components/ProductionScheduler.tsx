'use client';

import { useState, useEffect } from 'react';
import { plexApi, PlexJob, PlexWorkCenter } from '@/lib/plex-api';
import { mockPlexApi } from '@/lib/mock-plex-api';
import { 
  CalendarIcon, 
  ClockIcon, 
  CogIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ProductionSchedulerProps {
  onJobUpdate: () => void;
}

export default function ProductionScheduler({ onJobUpdate }: ProductionSchedulerProps) {
  const [jobs, setJobs] = useState<PlexJob[]>([]);
  const [workCenters, setWorkCenters] = useState<PlexWorkCenter[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Use mock API if PLEX credentials are not configured
      const api = process.env.PLEX_API_URL ? plexApi : mockPlexApi;
      
      const [jobsData, workCentersData] = await Promise.all([
        api.getJobs(),
        api.getWorkCenters(),
      ]);
      setJobs(jobsData);
      setWorkCenters(workCentersData);
    } catch (error) {
      console.error('Error loading production data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handlePriorityChange = async (jobId: string, newPriority: number) => {
    try {
      setIsProcessing(true);
      const api = process.env.PLEX_API_URL ? plexApi : mockPlexApi;
      await api.updateJob(jobId, { priority: newPriority });
      await loadData();
      onJobUpdate();
    } catch (error) {
      console.error('Error updating job priority:', error);
      alert('Failed to update job priority');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWorkCenterChange = async (jobId: string, workCenter: string) => {
    try {
      setIsProcessing(true);
      const api = process.env.PLEX_API_URL ? plexApi : mockPlexApi;
      await api.updateJob(jobId, { workCenter });
      await loadData();
      onJobUpdate();
    } catch (error) {
      console.error('Error updating work center:', error);
      alert('Failed to update work center');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJobReorder = async (jobIds: string[]) => {
    try {
      setIsProcessing(true);
      const api = process.env.PLEX_API_URL ? plexApi : mockPlexApi;
      await api.reorderJobs(jobIds);
      await loadData();
      onJobUpdate();
    } catch (error) {
      console.error('Error reordering jobs:', error);
      alert('Failed to reorder jobs');
    } finally {
      setIsProcessing(false);
    }
  };

  const moveJobToFront = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedJobs = jobs.filter(j => j.id !== jobId);
    const newJobIds = [jobId, ...updatedJobs.map(j => j.id)];
    
    await handleJobReorder(newJobIds);
  };

  const moveJobToBack = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedJobs = jobs.filter(j => j.id !== jobId);
    const newJobIds = [...updatedJobs.map(j => j.id), jobId];
    
    await handleJobReorder(newJobIds);
  };

  const getStatusColor = (status: PlexJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 6) return 'text-orange-600';
    if (priority >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Loading production schedule...</span>
      </div>
    );
  }

  // Ensure jobs and workCenters are loaded before filtering
  if (!jobs || !workCenters) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2 text-gray-600">Loading production schedule...</span>
      </div>
    );
  }

  const pendingJobs = jobs.filter(job => job.status === 'pending');
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress');
  const completedJobs = jobs.filter(job => job.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Production Scheduler</h2>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{inProgressJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedJobs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Management */}
        <div className="space-y-6">
          {/* Pending Jobs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Pending Jobs ({pendingJobs.length})</h3>
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  workCenters={workCenters}
                  isSelected={selectedJobs.includes(job.id)}
                  onSelect={() => handleJobSelect(job.id)}
                  onPriorityChange={(priority) => handlePriorityChange(job.id, priority)}
                  onWorkCenterChange={(workCenter) => handleWorkCenterChange(job.id, workCenter)}
                  onMoveToFront={() => moveJobToFront(job.id)}
                  onMoveToBack={() => moveJobToBack(job.id)}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          </div>

          {/* In Progress Jobs */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">In Progress Jobs ({inProgressJobs.length})</h3>
            <div className="space-y-3">
              {inProgressJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  workCenters={workCenters}
                  isSelected={selectedJobs.includes(job.id)}
                  onSelect={() => handleJobSelect(job.id)}
                  onPriorityChange={(priority) => handlePriorityChange(job.id, priority)}
                  onWorkCenterChange={(workCenter) => handleWorkCenterChange(job.id, workCenter)}
                  onMoveToFront={() => moveJobToFront(job.id)}
                  onMoveToBack={() => moveJobToBack(job.id)}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          </div>

          {/* Completed Jobs */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Completed Jobs ({completedJobs.length})</h3>
            <div className="space-y-3">
              {completedJobs.slice(0, 5).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  workCenters={workCenters}
                  isSelected={selectedJobs.includes(job.id)}
                  onSelect={() => handleJobSelect(job.id)}
                  onPriorityChange={(priority) => handlePriorityChange(job.id, priority)}
                  onWorkCenterChange={(workCenter) => handleWorkCenterChange(job.id, workCenter)}
                  onMoveToFront={() => moveJobToFront(job.id)}
                  onMoveToBack={() => moveJobToBack(job.id)}
                  isProcessing={isProcessing}
                  readOnly
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Bulk Actions ({selectedJobs.length} selected)</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleJobReorder(selectedJobs)}
                disabled={isProcessing}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Reorder Selected
              </button>
              <button
                onClick={() => setSelectedJobs([])}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({ 
  job, 
  workCenters, 
  isSelected, 
  onSelect, 
  onPriorityChange, 
  onWorkCenterChange, 
  onMoveToFront, 
  onMoveToBack, 
  isProcessing,
  readOnly = false 
}: {
  job: PlexJob;
  workCenters: PlexWorkCenter[];
  isSelected: boolean;
  onSelect: () => void;
  onPriorityChange: (priority: number) => void;
  onWorkCenterChange: (workCenter: string) => void;
  onMoveToFront: () => void;
  onMoveToBack: () => void;
  isProcessing: boolean;
  readOnly?: boolean;
}) {
  const getStatusColor = (status: PlexJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600';
    if (priority >= 6) return 'text-orange-600';
    if (priority >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {!readOnly && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium">{job.partNumber}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              <span className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                Priority: {job.priority}
              </span>
            </div>
            <p className="text-xs text-gray-600">Qty: {job.quantity}</p>
            <p className="text-xs text-gray-600">WC: {job.workCenter}</p>
            <p className="text-xs text-gray-600">
              Due: {new Date(job.completionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={onMoveToFront}
              disabled={isProcessing}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              title="Move to front"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveToBack}
              disabled={isProcessing}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              title="Move to back"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">Priority:</label>
            <select
              value={job.priority}
              onChange={(e) => onPriorityChange(parseInt(e.target.value))}
              disabled={isProcessing}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-medium text-gray-700">Work Center:</label>
            <select
              value={job.workCenter}
              onChange={(e) => onWorkCenterChange(e.target.value)}
              disabled={isProcessing}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {workCenters.map(wc => (
                <option key={wc.id} value={wc.id}>{wc.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
