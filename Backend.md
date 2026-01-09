# Backend Architecture

## Prerequisites

- Node.js (v14+)
- npm with permissions to install packages

Main packages used:
- `express` - Web framework
- `pg` - PostgreSQL client
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `googleapis` - Google OAuth integration
- `cors` - Cross-origin resource sharing

## Quick Installation

1. Clone the repository and navigate to the project folder
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with your configuration variables (DB connection string, JWT secret, etc.)
4. Start the server:
```bash
npm start
```

## Architecture

The backend follows a 3-layer architecture pattern:

### Controllers (`src/controllers/`)
- Handle HTTP requests and define API endpoints
- Receive data from clients
- Validate and parse input
- Invoke services
- Return HTTP responses

### Services (`src/services/`)
- Contain business logic
- Orchestrate complex operations
- Perform business validations
- Call repositories for data access
- Independent of HTTP layer

### Repositories (`src/repositories/`)
- Handle database access (queries, inserts, updates)
- Map database results to application objects
- Provide abstraction layer for data persistence
- Enable easy database changes without impacting services

This separation of concerns provides:
- Better testability
- Easier maintenance
- Clear responsibilities
- Flexible data layer

## Additional Modules

### Middlewares (`src/middlewares/`)
- **auth_middleware.js** - JWT token verification and authentication
- **dto_middleware.js** - Request input validation
- **exception_handler.js** - Central error handling
- **async_handler.js** - Async route wrapper

### DTOs (`src/dtos/`)
Data Transfer Objects for request validation:
- `user/` - User-related DTOs
- `session/` - Session DTOs
- `mentor_availability/` - Availability DTOs
- `mentor_sector/` - Sector DTOs
- `notifications/` - Notification DTOs
- `user_languages/` - Language DTOs

### Configuration (`src/config/`)
- **db.js** - Database connection pool
- Environment variable configuration

### Utils (`src/utils/`)
- **time.js** - Time manipulation utilities
- **date.js** - Date handling utilities

## Project Structure

```
src/
├── controllers/              # HTTP request handlers
│   ├── user_controller.js
│   ├── session_controller.js
│   ├── notification_controller.js
│   ├── mentor_sector_controller.js
│   ├── availability_controller.js
│   ├── google_auth_controller.js
│   ├── user_language_controller.js
│   └── index.js
├── services/                 # Business logic
│   ├── user_service.js
│   ├── session_service.js
│   ├── notification_service.js
│   ├── mentor_sector_service.js
│   ├── availability_service.js
│   ├── google_auth_service.js
│   └── user_language_service.js
├── repositories/             # Data access layer
│   ├── user_repository.js
│   ├── session_repository.js
│   ├── notification_repository.js
│   ├── mentor_sector_repository.js
│   ├── availability_repository.js
│   ├── google_auth_repository.js
│   └── user_language_repository.js
├── middlewares/              # Request processing
│   ├── auth_middleware.js
│   ├── dto_middleware.js
│   ├── exception_handler.js
│   └── async_handler.js
├── dtos/                     # Validation schemas
├── config/                   # Configuration
│   └── db.js
├── utils/                    # Utilities
│   ├── time.js
│   └── date.js
├── app.js                    # Express app setup
├── bootstrap.js              # Server initialization
└── routes.js                 # Route definitions
```

## API Routes

All routes are prefixed with `/api`:

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User authentication
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/session` - List sessions
- `POST /api/session` - Create session
- `PUT /api/session/:id` - Update session
- `GET /api/notification` - Get notifications
- `POST /api/mentor_sector` - Add mentor sector
- `GET /api/mentor_availability` - Get availability
- `POST /api/mentor_availability` - Set availability
- `GET /api/google_auth` - Google OAuth flow

## Error Handling

All errors are handled centrally by `exception_handler.js` middleware:
- Normalizes error responses
- Logs errors appropriately
- Returns consistent error format to clients

## Authentication

JWT-based authentication:
1. User logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in `Authorization` header
4. `auth_middleware.js` validates token on protected routes

## Testing

Run tests with:
```bash
npm test
```

Test files are located in the `test/` directory.