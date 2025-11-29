'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import Header from '@/components/Header';
import { GET_SHIFTS, GET_USERS, GET_TIMESLOTS, GET_OPEN_SHIFTS } from '@/graphql/queries';
import { ASSIGN_USER_TO_SHIFT, CREATE_SHIFT, REPEAT_SHIFT, REMOVE_ASSIGNMENT } from '@/graphql/mutations';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { Shift, User, Timeslot } from '@/types';

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showCreateShift, setShowCreateShift] = useState(false);
  const [showRepeatShift, setShowRepeatShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  // Form states
  const [assignUserId, setAssignUserId] = useState('');
  const [newShiftDate, setNewShiftDate] = useState('');
  const [newShiftTimeslot, setNewShiftTimeslot] = useState('');
  const [repeatTimeslot, setRepeatTimeslot] = useState('');
  const [repeatDates, setRepeatDates] = useState('');

  // Queries
  const { data: shiftsData, loading: shiftsLoading, refetch: refetchShifts } = useQuery(GET_SHIFTS, {
    variables: selectedDate ? { filter: { date: selectedDate } } : {},
  });

  const { data: usersData } = useQuery(GET_USERS);
  const { data: timeslotsData } = useQuery(GET_TIMESLOTS);
  const { data: openShiftsData } = useQuery(GET_OPEN_SHIFTS);

  // Mutations
  const [assignUser] = useMutation(ASSIGN_USER_TO_SHIFT, {
    onCompleted: () => {
      refetchShifts();
      setShowAssignForm(false);
      setSelectedShift(null);
      setAssignUserId('');
      alert('User assigned successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const [createShift] = useMutation(CREATE_SHIFT, {
    onCompleted: () => {
      refetchShifts();
      setShowCreateShift(false);
      setNewShiftDate('');
      setNewShiftTimeslot('');
      alert('Shift created successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const [repeatShift] = useMutation(REPEAT_SHIFT, {
    onCompleted: () => {
      refetchShifts();
      setShowRepeatShift(false);
      setRepeatTimeslot('');
      setRepeatDates('');
      alert('Shifts repeated successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const [removeAssignment] = useMutation(REMOVE_ASSIGNMENT, {
    onCompleted: () => {
      refetchShifts();
      alert('Assignment removed successfully!');
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleAssignUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift || !assignUserId) return;

    assignUser({
      variables: {
        input: {
          shiftId: selectedShift,
          userId: assignUserId,
        },
      },
    });
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftDate || !newShiftTimeslot) return;

    createShift({
      variables: {
        input: {
          date: newShiftDate,
          timeslotId: newShiftTimeslot,
          requiredStaff: 1,
        },
      },
    });
  };

  const handleRepeatShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repeatTimeslot || !repeatDates) return;

    const datesArray = repeatDates.split(',').map(d => d.trim());

    repeatShift({
      variables: {
        input: {
          timeslotId: repeatTimeslot,
          dates: datesArray,
          requiredStaff: 1,
        },
      },
    });
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      removeAssignment({ variables: { id: assignmentId } });
    }
  };

  const shifts: Shift[] = (shiftsData as any)?.shifts || [];
  const users: User[] = (usersData as any)?.users || [];
  const timeslots: Timeslot[] = (timeslotsData as any)?.timeslots || [];
  const openShifts: Shift[] = (openShiftsData as any)?.openShifts || [];
;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAF9] dark:bg-[#1A1A1A]">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage shifts, assign users, and view schedules
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowCreateShift(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create Shift
            </button>
            <button
              onClick={() => setShowRepeatShift(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              Repeat Shift
            </button>
            <button
              onClick={() => refetchShifts()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Refresh
            </button>
          </div>

          {/* Date Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="ml-2 text-sm text-blue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Open Shifts Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Open Shifts ({openShifts.length})
            </h2>
            <div className="grid gap-4">
              {openShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {shift.timeslot.name}
                        </h3>
                        <StatusBadge status={shift.status} />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        📅 {format(new Date(shift.date), 'EEEE, MMM dd, yyyy')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        ⏰ {shift.timeslot.startTime} - {shift.timeslot.endTime}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        👥 Required: {shift.requiredStaff}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedShift(shift.id);
                        setShowAssignForm(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Assign User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Shifts Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All Shifts ({shifts.length})
            </h2>

            {shiftsLoading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading shifts...</p>
            ) : shifts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No shifts found.</p>
            ) : (
              <div className="grid gap-4">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {shift.timeslot.name}
                          </h3>
                          <StatusBadge status={shift.status} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          📅 {format(new Date(shift.date), 'EEEE, MMM dd, yyyy')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          ⏰ {shift.timeslot.startTime} - {shift.timeslot.endTime}
                        </p>
                      </div>
                      {shift.status === 'OPEN' && (
                        <button
                          onClick={() => {
                            setSelectedShift(shift.id);
                            setShowAssignForm(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Assign User
                        </button>
                      )}
                    </div>

                    {/* Assignments */}
                    {shift.assignments && shift.assignments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Assigned Staff:
                        </h4>
                        <div className="space-y-2">
                          {shift.assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-gray-900 dark:text-white font-medium">
                                  {assignment.user?.fullName}
                                </span>
                                <StatusBadge status={assignment.status} />
                              </div>
                              <button
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assign User Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Assign User to Shift
              </h3>
              <form onSubmit={handleAssignUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User
                  </label>
                  <select
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.filter(u => u.role === 'USER').map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignForm(false);
                      setSelectedShift(null);
                      setAssignUserId('');
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

        {/* Create Shift Modal */}
        {showCreateShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Shift
              </h3>
              <form onSubmit={handleCreateShift}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newShiftDate}
                    onChange={(e) => setNewShiftDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeslot
                  </label>
                  <select
                    value={newShiftTimeslot}
                    onChange={(e) => setNewShiftTimeslot(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a timeslot...</option>
                    {timeslots.map((timeslot) => (
                      <option key={timeslot.id} value={timeslot.id}>
                        {timeslot.name} ({timeslot.startTime} - {timeslot.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateShift(false);
                      setNewShiftDate('');
                      setNewShiftTimeslot('');
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

        {/* Repeat Shift Modal */}
        {showRepeatShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Repeat Shift for Multiple Dates
              </h3>
              <form onSubmit={handleRepeatShift}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeslot
                  </label>
                  <select
                    value={repeatTimeslot}
                    onChange={(e) => setRepeatTimeslot(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a timeslot...</option>
                    {timeslots.map((timeslot) => (
                      <option key={timeslot.id} value={timeslot.id}>
                        {timeslot.name} ({timeslot.startTime} - {timeslot.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dates (comma-separated, e.g., 2025-12-01, 2025-12-02)
                  </label>
                  <textarea
                    value={repeatDates}
                    onChange={(e) => setRepeatDates(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="2025-12-01, 2025-12-02, 2025-12-03"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Repeat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRepeatShift(false);
                      setRepeatTimeslot('');
                      setRepeatDates('');
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