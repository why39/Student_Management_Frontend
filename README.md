# Simple Student Frontend

A React-based frontend for the Simple Student management system, providing role-based interfaces for teachers, students, and administrators.

## Features

- **Role-Based Dashboards**: Different interfaces for students, teachers, and admins
- **Authentication**: Login, registration, and protected routes
- **User Management**: View and manage user profiles
- **Group Management**: Create and manage student groups (for teachers)
- **Group Membership**: View and interact with groups (for students)
- **Activities**: Teachers can create and manage activities
- **Activity Participation**: Students can view and join activities

## Tech Stack

- **Framework**: [React](https://react.dev/) with TypeScript
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React Context API
- **API Communication**: [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL
- **UI**: [TailwindCSS](https://tailwindcss.com/) for styling
- **Form Handling**: React hooks for form state management

## Component Structure

- **Auth Components**: Login and Registration forms
- **Dashboard Components**:
  - StudentDashboard: Shows student's groups and activities
  - TeacherDashboard: Manages teacher's groups and students
  - AdminDashboard: User and group management
- **Group Components**: Group creation, member management
- **Activity Components**: Activity creation, management, and participation
- **Shared Components**: Layouts, navigation, notifications

## Getting Started

### Prerequisites

- Node.js (>=14.x)
- npm or yarn
- Backend server running

### Environment Setup

Create a `.env` file in the root directory with:

```
REACT_APP_API_URL=http://localhost:3000/graphql
```

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode
npm start

# Production build
npm run build
```

The application will be available at `http://localhost:3000`

## Role-Based Access

### Student Users
- View their groups
- View activities from their groups
- Join activities
- Track participation in activities

### Teacher Users
- Create and manage student groups
- Add/remove students from groups
- Create activities for their groups
- Track student participation in activities

### Admin Users
- Manage all users in the system
- View and manage all groups
- System-wide oversight

## Folder Structure

```
src/
├── components/         # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   └── shared/         # Shared/reusable components
├── context/            # React context providers
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
├── styles/             # Global styles and tailwind config
└── utils/              # Utility functions
```

## API Integration

The frontend communicates with the backend GraphQL API using Apollo Client. The main GraphQL operations are defined in their respective component files.

## Authentication Flow

1. User logs in through the Login page
2. On successful authentication, a JWT token is stored
3. Apollo Client includes the token in subsequent requests
4. Role-based routing directs users to appropriate dashboard
