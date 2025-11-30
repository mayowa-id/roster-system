# Roster System Frontend

Next.js application for shift scheduling and roster management.

## Technology Stack

- Next.js 14 (App Router)
- TailwindCSS
- Apollo Client
- TypeScript
- date-fns

## Prerequisites

- Node.js v18+

## Installation
```bash
npm install
```

## Configuration

Create `.env.local` file:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

For production, use your Render backend URL.

## Running the Application
```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Application runs at: http://localhost:3000

## Features

### Home Page
- Landing page with navigation
- Links to Admin and User dashboards
- Dark mode toggle

### Admin Dashboard
- View all shifts
- Filter by date, status, timeslot
- Create new shifts
- Repeat shifts for multiple dates
- Assign users to shifts
- Remove assignments
- Statistics cards

### User Dashboard
- Select user (simulating logged-in user)
- View assigned shifts
- Day/Week view toggle
- Filter personal shifts
- View open shifts
- Pick up open shifts
- Mark shifts as unavailable with reason
- Statistics cards

## Project Structure
```
frontend/
├── app/
│   ├── admin/
│   │   └── page.tsx
│   ├── user/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── StatusBadge.tsx
│   └── ShiftFilters.tsx
├── graphql/
│   ├── queries.ts
│   └── mutations.ts
├── lib/
│   ├── apollo-client.ts
│   └── apollo-wrapper.tsx
├── types/
│   └── index.ts
└── package.json
```

## GraphQL Integration

### Queries
- GET_USERS
- GET_TIMESLOTS
- GET_SHIFTS
- GET_OPEN_SHIFTS
- GET_MY_ASSIGNMENTS

### Mutations
- ASSIGN_USER_TO_SHIFT
- CREATE_SHIFT
- REPEAT_SHIFT
- PICK_UP_SHIFT
- MARK_UNAVAILABLE
- REMOVE_ASSIGNMENT

## Components

### Header
Navigation bar with links to Home, Admin, and User dashboards.

### StatusBadge
Displays shift/assignment status with color coding:
- OPEN (yellow)
- ASSIGNED (green)
- UNAVAILABLE (red)
- CANCELLED (red)

### ShiftFilters
Collapsible filter component with:
- Date filter
- Status filter
- Timeslot filter
- Active filter badges

## Styling

Uses TailwindCSS with:
- Dark mode support
- Responsive design (mobile-first)
- Custom color scheme
- Smooth transitions

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure:
   - Root Directory: `frontend`
   - Framework: Next.js
4. Add environment variable:
   - `NEXT_PUBLIC_GRAPHQL_URL`: Your backend URL
5. Deploy

## Scripts
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Usage

### Admin Workflow
1. Navigate to Admin Dashboard
2. Use filters to find shifts
3. Click "Create Shift" to add new shifts
4. Click "Repeat Shift" for multiple dates
5. Click "Assign User" on open shifts
6. Remove assignments as needed

### User Workflow
1. Navigate to User Dashboard
2. Select a user from dropdown
3. View assigned shifts in day or week view
4. Use filters to narrow down shifts
5. Pick up open shifts
6. Mark shifts as unavailable with reason

## Dark Mode

Toggle dark mode using the button in the header. Preference is saved in localStorage.
