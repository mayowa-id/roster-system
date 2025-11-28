import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
      fullName
      role
    }
  }
`;

export const GET_TIMESLOTS = gql`
  query GetTimeslots {
    timeslots {
      id
      name
      startTime
      endTime
    }
  }
`;

export const GET_SHIFTS = gql`
  query GetShifts($filter: FilterShiftInput) {
    shifts(filter: $filter) {
      id
      date
      status
      requiredStaff
      timeslot {
        id
        name
        startTime
        endTime
      }
      assignments {
        id
        status
        user {
          id
          fullName
        }
      }
    }
  }
`;

export const GET_OPEN_SHIFTS = gql`
  query GetOpenShifts {
    openShifts {
      id
      date
      status
      requiredStaff
      timeslot {
        id
        name
        startTime
        endTime
      }
    }
  }
`;

export const GET_MY_ASSIGNMENTS = gql`
  query GetMyAssignments($userId: String!, $startDate: String, $endDate: String) {
    myAssignments(userId: $userId, startDate: $startDate, endDate: $endDate) {
      id
      status
      unavailableReason
      shift {
        id
        date
        status
        timeslot {
          id
          name
          startTime
          endTime
        }
      }
    }
  }
`;