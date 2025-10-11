# LTI - Talent Tracking System (ATS) - Project Documentation

## Project Overview

**LTI** is a complete Applicant Tracking System (ATS) / Talent Tracking System built with modern web technologies and following industry best practices.

### Core Technology Stack

- **Language**: TypeScript (Full-stack)
- **Frontend**: React 18
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest with Testing Library

### Development Principles

This project strictly follows three core development principles:

1. **Domain-Driven Design (DDD)**: Organizing code around business domains and logic
2. **Test-Driven Development (TDD)**: Writing tests before implementation
3. **Object-Oriented Programming (OOP)**: Using classes, encapsulation, and inheritance patterns

## Project Structure

The project is organized as a monorepo with two main directories:

```
AI4Devs-lab-ides-2509/
├── PROJECT_DOCUMENTATION.md    # This file
├── README.md                   # Setup and initialization guide
├── docker-compose.yml          # PostgreSQL database configuration
├── LICENSE.md
├── VERSION
├── backend/                    # Backend API application
│   ├── jest.config.js         # Backend test configuration
│   ├── package.json           # Backend dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── prisma/
│   │   └── schema.prisma      # Database schema definition
│   └── src/
│       ├── index.ts           # Backend entry point
│       └── tests/             # Backend test files
└── frontend/                   # React frontend application
    ├── jest.config.js         # Frontend test configuration
    ├── package.json           # Frontend dependencies
    ├── tsconfig.json          # TypeScript configuration
    ├── README.md              # Frontend-specific documentation
    ├── build/                 # Production build output
    ├── public/                # Static assets
    └── src/
        ├── App.tsx            # Main application component
        ├── index.tsx          # Frontend entry point
        └── tests/             # Frontend test files
```

## Architecture

### Backend Architecture

**Port**: 3010  
**Entry Point**: `backend/src/index.ts`

#### Components

- **Express Server**: RESTful API server
- **Prisma ORM**: Type-safe database client for PostgreSQL
- **Database Models**: Currently includes `User` model (defined in `backend/prisma/schema.prisma`)
- **Environment Configuration**: Database credentials and settings in `backend/.env`

#### Database Schema

The database uses PostgreSQL with the following models:

- **User Model**: Basic user entity with id, email, name, and timestamps

### Frontend Architecture

**Port**: 3000 (development)  
**Framework**: React 18 with Create React App  
**Entry Point**: `frontend/src/index.tsx`

#### Components

- **React Components**: TypeScript-based React components
- **Styling**: CSS modules and standard CSS
- **Testing**: Jest with React Testing Library
- **Build System**: Create React App's built-in Webpack configuration

### Database Infrastructure

**Technology**: PostgreSQL  
**Deployment**: Docker container (via docker-compose)

The database is containerized for easy setup and consistency across development environments.

## Project Initialization

> **For complete setup and installation instructions, please refer to [README.md](README.md).**

The README.md contains detailed step-by-step instructions for:
- Installing dependencies for both frontend and backend
- Starting the PostgreSQL database with Docker
- Configuring environment variables
- Running the development servers
- Accessing the applications (Backend on port 3010, Frontend on port 3000)

## Development Workflow

### Following TDD Principles

1. Write tests first in the appropriate `tests/` directory
2. Implement the minimum code to pass tests
3. Refactor while keeping tests green
4. Run test suites frequently: `npm test`

### Following DDD Principles

- Organize code around business domains (e.g., Candidates, Jobs, Applications)
- Keep domain logic separate from infrastructure concerns
- Use repositories for data access abstraction
- Define clear bounded contexts

### Following OOP Principles

- Use TypeScript classes for domain entities
- Apply encapsulation to protect internal state
- Implement interfaces for contracts
- Use inheritance and composition appropriately

## Testing

### Backend Testing

- **Framework**: Jest
- **Configuration**: `backend/jest.config.js`
- **Test Location**: `backend/src/tests/`
- **Run Tests**: `npm test` (from backend directory)

### Frontend Testing

- **Framework**: Jest + React Testing Library
- **Configuration**: `frontend/jest.config.js`
- **Test Location**: `frontend/src/tests/`
- **Run Tests**: `npm test` (from frontend directory)

## Code Quality

### TypeScript Configuration

Both frontend and backend use strict TypeScript configurations (`tsconfig.json`) to ensure type safety and catch errors at compile time.

### Linting and Formatting

- ESLint for code quality
- Prettier for consistent code formatting
- Pre-configured in backend with standard rules

## Deployment

### Frontend Build

```bash
cd frontend
npm run build
```

Production-ready static files will be generated in `frontend/build/`

### Backend Deployment

The backend is designed to be deployed as a Node.js application with:
- Environment variables for configuration
- PostgreSQL database connection
- Prisma for database migrations

## Current Features

### Implemented

- Basic Express server setup (backend)
- React application scaffold (frontend)
- PostgreSQL database with Docker
- Prisma ORM integration
- User model in database
- Testing infrastructure for both frontend and backend
- TypeScript configuration across the stack

### Planned

- Complete ATS/Talent Tracking features
- Authentication and authorization
- Candidate management
- Job posting management
- Application workflow
- Interview scheduling
- Reporting and analytics

## Additional Resources

- **Main Setup Guide**: See [README.md](README.md) for initialization steps
- **Frontend Details**: See [frontend/README.md](frontend/README.md)
- **Database Schema**: Review [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- **API Entry**: Check [backend/src/index.ts](backend/src/index.ts) for current endpoints

## Version Information

Current version can be found in the [VERSION](VERSION) file at the root of the project.

## License

This project is licensed under the terms specified in [LICENSE.md](LICENSE.md).

---

**Note**: This documentation should be updated as the project evolves and new features are added. Always refer to this document for architectural decisions and project context.
