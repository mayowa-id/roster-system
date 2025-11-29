'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import Header from '@/components/Header';
import { GET_MY_ASSIGNMENTS, GET_OPEN_SHIFTS, GET_USERS } from '@/graphql/queries';
import { PICK_UP_SHIFT, MARK_UNAVAILABLE } from '@/graphql/mutations';
import StatusBadge from '@/components/StatusBadge';
import { format, addDays, startOfWeek } from 'date-fns';
import { Assignment, Shift, User } from '@/types';

export default function UserDashboard() {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState('');

  // Get week start and end dates
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  // Queries
  const { data: usersData } = useQuery(GET_USERS);
  
  const { data: assignmentsData, loading: assignmentsLoading, refetch: refetchAssignments } = useQuery(
    GET_MY_ASSIGNMENTS,
    {
      variables: {
        userId: selectedUserId,
        startDate: viewMode === 'week' ? format(weekStart, 'yyyy-MM-dd') : selectedDate,
        endDate: viewMode === 'week' ? format(weekEnd, 'yyyy-MM-dd') : selectedDate,
      },
      skip: !selectedUserId,
    }
  );

  const { data: openShiftsData, refetch: refetchOpenShifts } = useQuery(GET_OPEN_SHIFTS);

  // Mutations
  const [pickUpShift] = useMutation(PICK_UP_SHIFT, {
    onCompleted: () => {
      refetchAssignments();
      refetchOpenShifts();
      alert('Shift picked up successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const [markUnavailable] = useMutation(MARK_UNAVAILABLE, {
    onCompleted: () => {
      refetchAssignments();
      refetchOpenShifts();
      setShowUnavailableForm(false);
      setSelectedAssignment(null);
      setUnavailableReason('');
      alert('Marked as unavailable successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handlePickUpShift = (shiftId: string) => {
    if (!selectedUserId) {
      alert('Please select a user first');
      return;
    }

    if (confirm('Are you sure you want to pick up this shift?')) {
      pickUpShift({
        variables: {
          shiftId,
          userId: selectedUserId,
        },
      });
    }
  };

  const handleMarkUnavailable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !unavailableReason) return;

    markUnavailable({
      variables: {
        input: {
          assignmentId: selectedAssignment,
          reason: unavailableReason,
        },
      },
    });
  };

  const users: User[] = (usersData as any)?.users || [];
  const assignments: Assignment[] = (assignmentsData as any)?.myAssignments || [];
  const openShifts: Shift[] = (openShiftsData as any)?.openShifts || [];

  // Filter open shifts by selected date if in day view
  const filteredOpenShifts = viewMode === 'day' 
    ? openShifts.filter(shift => shift.date === selectedDate)
    : openShifts;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAF9] dark:bg-[#1A1A1A]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              User Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your shifts, pick up open shifts, and manage availability
            </p>
          </div>

          {/* User Selection */}
          <div className="mb-8 bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select User (Simulating logged-in user)
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Choose a user...</option>
              {users.filter(u => u.role === 'USER').map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <>
              {/* View Mode Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('day')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      viewMode === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Day View
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      viewMode === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Week View
                  </button>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* My Assignments Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  My Shifts {viewMode === 'week' && `(${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')})`}
                </h2>

                {assignmentsLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading assignments...</p>
                ) : assignments.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No shifts assigned yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {assignment.shift.timeslot.name}
                              </h3>
                              <StatusBadge status={assignment.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">
                              📅 {format(new Date(assignment.shift.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              ⏰ {assignment.shift.timeslot.startTime} - {assignment.shift.timeslot.endTime}
                            </p>
                            {assignment.status === 'UNAVAILABLE' && assignment.unavailableReason && (
                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                  <strong>Reason:</strong> {assignment.unavailableReason}
                                </p>
                              </div>
                            )}
                          </div>
                          {assignment.status === 'ASSIGNED' && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment.id);
                                setShowUnavailableForm(true);
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              Mark Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Open Shifts Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Available Open Shifts ({filteredOpenShifts.length})
                </h2>

                {filteredOpenShifts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No open shifts available.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredOpenShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {shift.timeslot.name}
                              </h3>
                              <StatusBadge status={shift.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">
                              📅 {format(new Date(shift.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              ⏰ {shift.timeslot.startTime} - {shift.timeslot.endTime}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePickUpShift(shift.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Pick Up Shift
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedUserId && (
            <div className="bg-white dark:bg-gray-900 p-12 rounded-lg border border-gray-200 dark:border-gray-800 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Please select a user to view shifts
              </p>
            </div>
          )}
        </div>

        {/* Mark Unavailable Modal */}
        {showUnavailableForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Mark Shift as Unavailable
              </h3>
              <form onSubmit={handleMarkUnavailable}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (minimum 10 characters)
                  </label>
                  <textarea
                    value={unavailableReason}
                    onChange={(e) => setUnavailableReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Please provide a detailed reason..."
                    minLength={10}
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Mark Unavailable
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnavailableForm(false);
                      setSelectedAssignment(null);
                      setUnavailableReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}