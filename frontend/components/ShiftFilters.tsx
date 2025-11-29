'use client';

import { ShiftStatus } from '@/types';

interface ShiftFiltersProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedStatus: ShiftStatus | '';
  setSelectedStatus: (status: ShiftStatus | '') => void;
  selectedTimeslot: string;
  setSelectedTimeslot: (id: string) => void;
  timeslots: Array<{ id: string; name: string }>;
  showTimeslotFilter?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ShiftFilters({
  selectedDate,
  setSelectedDate,
  selectedStatus,
  setSelectedStatus,
  selectedTimeslot,
  setSelectedTimeslot,
  timeslots,
  showTimeslotFilter = true,
  isOpen,
  onToggle,
}: ShiftFiltersProps) {
  const clearFilters = () => {
    setSelectedDate('');
    setSelectedStatus('');
    setSelectedTimeslot('');
  };

  const hasActiveFilters = selectedDate || selectedStatus || selectedTimeslot;

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Show Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
              {[selectedDate, selectedStatus, selectedTimeslot].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Hide
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📅 Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🏷️ Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ShiftStatus | '')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Timeslot Filter */}
        {showTimeslotFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⏰ Timeslot
            </label>
            <select
              value={selectedTimeslot}
              onChange={(e) => setSelectedTimeslot(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Timeslots</option>
              {timeslots.map((timeslot) => (
                <option key={timeslot.id} value={timeslot.id}>
                  {timeslot.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {selectedDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              Date: {selectedDate}
              <button
                onClick={() => setSelectedDate('')}
                className="hover:text-blue-900 dark:hover:text-blue-200"
              >
                ✕
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
              Status: {selectedStatus}
              <button
                onClick={() => setSelectedStatus('')}
                className="hover:text-green-900 dark:hover:text-green-200"
              >
                ✕
              </button>
            </span>
          )}
          {selectedTimeslot && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              Timeslot: {timeslots.find(t => t.id === selectedTimeslot)?.name}
              <button
                onClick={() => setSelectedTimeslot('')}
                className="hover:text-purple-900 dark:hover:text-purple-200"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}