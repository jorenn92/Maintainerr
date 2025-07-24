# Maintainerr - Custom Copilot Instructions

## Project Overview
Maintainerr is a media management application that helps users automatically manage their media libraries by creating rules to handle unused or unwatched content. It integrates with Plex, *arr applications (Radarr/Sonarr), Overseerr/Jellyseerr, and Tautulli to provide comprehensive media lifecycle management.

## Repository Structure

This is a **TypeScript monorepo** managed with **Turborepo** and **Yarn workspaces**:

```
├── server/          # Nest.js backend API
├── ui/             # Next.js frontend application  
├── packages/
│   └── contracts/  # Shared TypeScript types, DTOs, and interfaces
├── package.json    # Root package with Turborepo scripts
└── turbo.json      # Turborepo configuration
```

## Technology Stack

### Backend (`server/`)
- **Framework**: Nest.js with TypeScript
- **Database**: TypeORM with SQLite
- **Testing**: Jest with custom test utilities (@automock, @suites)
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod schemas with nestjs-zod
- **Architecture**: Event-driven with schedulers, graceful shutdown support

### Frontend (`ui/`)
- **Framework**: Next.js 15+ with React 19+
- **Styling**: TailwindCSS with Headless UI components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Heroicons

### Shared (`packages/contracts/`)
- **Purpose**: Shared TypeScript types, DTOs, validation schemas
- **Technologies**: Zod schemas, class-validator decorators, Nest.js decorators

## Development Workflow

### Key Commands
```bash
# Install dependencies
yarn install

# Development (all packages)
yarn dev

# Build entire project
yarn build

# Lint all packages
yarn lint

# Format code
yarn format

# Run tests
yarn test

# Type checking
yarn check-types
```

### Package-Specific Commands
```bash
# Server development
yarn workspace @maintainerr/server dev

# UI development  
yarn workspace @maintainerr/ui dev

# Contracts build (required by server/ui)
yarn workspace @maintainerr/contracts build
```

## Coding Standards

### Code Style
- **ESLint**: Strict TypeScript rules across all packages
- **Prettier**: Consistent formatting (run `yarn format`)
- **Commits**: Follow [Conventional Commits](https://conventionalcommits.org/) specification
- **Import Organization**: Prefer absolute imports, group by type (external, internal, relative)

### TypeScript Guidelines
- Use strict type checking
- Prefer `interface` for object shapes, `type` for unions/computed types
- Use Zod schemas for runtime validation (especially in contracts package)
- Leverage Nest.js decorators for API documentation and validation

### Architecture Patterns

#### Backend Patterns
- **Controllers**: Handle HTTP requests, delegate to services
- **Services**: Business logic, integrate with external APIs
- **DTOs**: Use Zod schemas from contracts package
- **Entities**: TypeORM entities for database models
- **Modules**: Feature-based module organization
- **Events**: Use Nest.js EventEmitter for decoupled communication

#### Frontend Patterns
- **Pages**: Next.js app router structure
- **Components**: Reusable UI components in `/src/components`
- **Hooks**: Custom hooks for data fetching (TanStack Query)
- **Forms**: React Hook Form with Zod resolvers
- **API**: Axios client with TypeScript contracts

#### Shared Contracts
- **DTOs**: Request/response shapes with validation
- **Events**: Type-safe event definitions
- **Enums**: Shared constants and enumerations

## File Organization

### Server Structure
```
server/src/
├── modules/        # Feature modules (collections, rules, settings, etc.)
├── common/         # Shared utilities, decorators, filters
├── database/       # TypeORM entities and migrations
├── events/         # Event definitions and handlers
└── main.ts         # Application bootstrap
```

### UI Structure
```
ui/src/
├── pages/          # Next.js pages (app router)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── utils/          # Client-side utilities
└── styles/         # Global styles and Tailwind config
```

## External Integrations

The application integrates with several external services:
- **Plex**: Media server API for collections and metadata
- **Radarr/Sonarr**: Movie/TV show management APIs
- **Overseerr/Jellyseerr**: Request management systems
- **Tautulli**: Plex analytics and statistics

When working with these integrations:
- Use proper error handling and retry logic (axios-retry)
- Implement caching where appropriate (node-cache)
- Follow rate limiting best practices
- Use TypeScript interfaces for external API responses

## Testing Guidelines

### Backend Testing
- **Unit Tests**: Jest with @automock for dependency mocking
- **File Pattern**: `*.spec.ts` files alongside source code
- **Coverage**: Focus on service logic and complex business rules
- **Test Database**: Use in-memory SQLite for integration tests

### Frontend Testing
- Testing infrastructure exists but keep tests focused on critical user flows
- Use React Testing Library patterns when adding tests

## Development Notes

### Environment Setup
- **Node.js**: Version 20.19.0+ or 22.12.0+
- **Package Manager**: Yarn 4.5.1 (managed via corepack)
- **Data Directory**: Requires `data/` folder with proper permissions for development

### Key Configuration Files
- `turbo.json`: Turborepo task configuration and caching
- `tsconfig.json`: TypeScript configuration per package
- `.yarnrc.yml`: Yarn package manager configuration
- Docker support available via `Dockerfile`

### Performance Considerations
- Use Turborepo caching for faster builds
- Leverage Next.js optimizations (SSG, image optimization)
- Implement proper database indexing in TypeORM entities
- Use React Query for efficient data fetching and caching

## Contributing Guidelines

Before contributing:
1. Read `CONTRIBUTING.md` for detailed guidelines
2. Follow the branching strategy (meaningful branch names)
3. Ensure all tests pass: `yarn test`
4. Verify linting: `yarn lint`
5. Format code: `yarn format`
6. Use conventional commit messages

When suggesting code changes:
- Maintain consistency with existing patterns
- Consider performance and maintainability
- Update relevant documentation
- Add appropriate error handling
- Follow TypeScript best practices