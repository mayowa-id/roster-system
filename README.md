The web application is live on 

# Roster System - Full Stack Application

A comprehensive shift scheduling and roster management system built with NestJS, GraphQL, TypeORM, PostgreSQL, Next.js, and TailwindCSS.

## Live Deployments

- Backend API: https://roster-system-api.onrender.com/graphql
- Frontend Application: https://roster-system-five.vercel.app/
- Repository: https://github.com/mayowa-id/roster-system

## Project Structure
```
roster-system/
├── backend/          NestJS + GraphQL + TypeORM + PostgreSQL
├── frontend/         Next.js + TailwindCSS
├── schema-design/    Database ERD (Draw.io)
└── README.md
```

## Technology Stack

### Backend
- NestJS 10
- GraphQL (Code-First with Apollo Server)
- TypeORM
- PostgreSQL
- TypeScript

### Frontend
- Next.js 14 (App Router)
- TailwindCSS
- Apollo Client
- TypeScript

## Features

### Admin Dashboard
- Assign users to shifts
- Delete assignments
- Repeat shifts for multiple dates
- View all open shifts
- Filter shifts by date, status, and timeslot
- Create new shifts

### User Dashboard
- View assigned shifts (day/week views)
- See available open shifts
- Pick up open shifts
- Mark shifts as unavailable with reason
- Filter personal shifts

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run seed
npm run start:dev
```

Backend runs at: http://localhost:4000/graphql

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

Frontend runs at: http://localhost:3000

## Database Schema

See `schema-design/roster-system-erd.drawio` and `roster-system-erd.png` for the complete ERD.

### Entities
- User (id, email, firstName, lastName, role)
- Timeslot (id, name, startTime, endTime)
- Shift (id, date, timeslotId, status, requiredStaff)
- Assignment (id, shiftId, userId, status, unavailableReason)

### Relationships
- User → Assignments (1:N)
- Timeslot → Shifts (1:N)
- Shift → Assignments (1:N)

## Testing

### Backend
Visit the GraphQL Playground at the backend URL and test with sample queries provided in backend/README.md

### Frontend
1. Visit the frontend URL
2. Select a user from the dropdown
3. Test admin and user features

### Sample Users
- Admin: admin@roster.com
- Users: Multiple test users available in dropdown

## Deployment

### Backend (Render)
- PostgreSQL database on Render
- Web service with environment variables
- Seed data available via GraphQL mutation

### Frontend (Vercel)
- Automatic deployment from GitHub
- Environment variable for backend URL

## Documentation

- Backend README: Complete API documentation and setup
- Frontend README: Component structure and usage
- Schema Design: Database ERD in Draw.io format

## Development

### Backend Commands
```bash
npm run start:dev     # Development mode
npm run build         # Build for production
npm run start:prod    # Production mode
npm run seed          # Populate database
```

### Frontend Commands
```bash
npm run dev           # Development mode
npm run build         # Build for production
npm run start         # Production mode
```

## License

MIT