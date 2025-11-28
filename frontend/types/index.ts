export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum ShiftStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  CANCELLED = 'CANCELLED',
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  UNAVAILABLE = 'UNAVAILABLE',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
}

export interface Timeslot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface Shift {
  id: string;
  date: string;
  status: ShiftStatus;
  requiredStaff: number;
  timeslot: Timeslot;
  assignments?: Assignment[];
}

export interface Assignment {
  id: string;
  status: AssignmentStatus;
  unavailableReason?: string;
  markedUnavailableAt?: string;
  user?: User;
  shift: Shift;
}