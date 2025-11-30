# Roster System Backend

NestJS GraphQL API for shift scheduling and roster management.

## Technology Stack

- NestJS 10
- GraphQL (Code-First)
- TypeORM
- PostgreSQL
- TypeScript

## Prerequisites

- Node.js v18+
- PostgreSQL 14+

## Installation
```bash
npm install
```

## Configuration

Create `.env` file:
```env
NODE_ENV=development
PORT=4000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=roster_system

GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=true
```

## Database Setup
```bash
# Create database
createdb roster_system

# Run seed data
npm run seed
```

Seed creates:
- 8 users (1 admin, 7 staff)
- 4 timeslots
- 60+ shifts for next 3 weeks
- Sample assignments

## Running the Application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server runs at: http://localhost:4000/graphql

## Database Schema

### Entities

**User**
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- firstName (VARCHAR)
- lastName (VARCHAR)
- role (ENUM: ADMIN, USER)
- createdAt, updatedAt

**Timeslot**
- id (UUID, PK)
- name (VARCHAR)
- startTime (TIME)
- endTime (TIME)
- createdAt, updatedAt

**Shift**
- id (UUID, PK)
- date (DATE)
- timeslotId (UUID, FK)
- status (ENUM: OPEN, ASSIGNED, CANCELLED)
- requiredStaff (INTEGER)
- createdAt, updatedAt

**Assignment**
- id (UUID, PK)
- shiftId (UUID, FK)
- userId (UUID, FK)
- status (ENUM: ASSIGNED, UNAVAILABLE, COMPLETED)
- unavailableReason (TEXT)
- markedUnavailableAt (TIMESTAMP)
- createdAt, updatedAt
- UNIQUE(shiftId, userId)

## GraphQL API

### Sample Queries
```graphql
# Get all users
query {
  users {
    id
    email
    fullName
    role
  }
}

# Get shifts with filters
query {
  shifts(filter: {
    startDate: "2025-11-27"
    endDate: "2025-12-31"
    status: OPEN
  }) {
    id
    date
    status
    timeslot {
      name
      startTime
      endTime
    }
  }
}

# Get open shifts
query {
  openShifts {
    id
    date
    timeslot {
      name
    }
  }
}

# Get user assignments
query {
  myAssignments(userId: "user-id") {
    id
    status
    shift {
      date
      timeslot {
        name
      }
    }
  }
}
```

### Sample Mutations
```graphql
# Assign user to shift
mutation {
  assignUserToShift(input: {
    shiftId: "shift-id"
    userId: "user-id"
  }) {
    id
    status
  }
}

# Create shift
mutation {
  createShift(input: {
    date: "2025-12-15"
    timeslotId: "timeslot-id"
    requiredStaff: 2
  }) {
    id
    date
  }
}

# Repeat shift
mutation {
  repeatShift(input: {
    timeslotId: "timeslot-id"
    dates: ["2025-12-01", "2025-12-02", "2025-12-03"]
    requiredStaff: 1
  }) {
    id
    date
  }
}

# Mark unavailable
mutation {
  markShiftUnavailable(input: {
    assignmentId: "assignment-id"
    reason: "Personal emergency"
  }) {
    id
    status
    unavailableReason
  }
}

# Pick up shift
mutation {
  pickUpOpenShift(shiftId: "shift-id", userId: "user-id") {
    id
    status
  }
}

# Remove assignment
mutation {
  removeAssignment(id: "assignment-id")
}
```

## Deployment (Render)

### Database
1. Create PostgreSQL database on Render
2. Copy Internal Database URL

### Web Service
1. Connect GitHub repository
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`

### Environment Variables
```env
NODE_ENV=production
PORT=4000
DATABASE_HOST=<from-render>
DATABASE_PORT=5432
DATABASE_USERNAME=<from-render>
DATABASE_PASSWORD=<from-render>
DATABASE_NAME=roster_system
DATABASE_SSL=true
GRAPHQL_PLAYGROUND=true
GRAPHQL_DEBUG=false
```

### Seed Production
After deployment, run in Render Shell:
```bash
npm run seed
```

Or use GraphQL mutation:
```graphql
mutation {
  seedDatabase
}
```

## Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.config.ts
│   ├── modules/
│   │   ├── user/
│   │   ├── timeslot/
│   │   ├── shift/
│   │   └── assignment/
│   ├── database/
│   │   └── seeds/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
└── README.md
```

## Scripts
```bash
npm run start:dev     # Development mode with hot reload
npm run start:prod    # Production mode
npm run build         # Compile TypeScript
npm run seed          # Populate database
npm run lint          # Run ESLint
npm run test          # Run tests
```
