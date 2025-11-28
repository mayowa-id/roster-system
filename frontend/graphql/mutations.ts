import { gql } from '@apollo/client';

export const ASSIGN_USER_TO_SHIFT = gql`
  mutation AssignUserToShift($input: CreateAssignmentInput!) {
    assignUserToShift(input: $input) {
      id
      status
      user {
        id
        fullName
      }
      shift {
        id
        date
        timeslot {
          name
        }
      }
    }
  }
`;

export const PICK_UP_SHIFT = gql`
  mutation PickUpOpenShift($shiftId: String!, $userId: String!) {
    pickUpOpenShift(shiftId: $shiftId, userId: $userId) {
      id
      status
      user {
        fullName
      }
      shift {
        date
        timeslot {
          name
        }
      }
    }
  }
`;

export const MARK_UNAVAILABLE = gql`
  mutation MarkShiftUnavailable($input: MarkUnavailableInput!) {
    markShiftUnavailable(input: $input) {
      id
      status
      unavailableReason
      markedUnavailableAt
    }
  }
`;

export const REMOVE_ASSIGNMENT = gql`
  mutation RemoveAssignment($id: String!) {
    removeAssignment(id: $id)
  }
`;

export const CREATE_SHIFT = gql`
  mutation CreateShift($input: CreateShiftInput!) {
    createShift(input: $input) {
      id
      date
      status
      requiredStaff
      timeslot {
        name
      }
    }
  }
`;

export const REPEAT_SHIFT = gql`
  mutation RepeatShift($input: RepeatShiftInput!) {
    repeatShift(input: $input) {
      id
      date
      status
      timeslot {
        name
      }
    }
  }
`;