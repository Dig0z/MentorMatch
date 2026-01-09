# MentorMatch

A mentoring platform connecting mentors and mentees with session booking, availability management, and integrated video meetings.

## Project Structure

```
MentorMatch/
├── src/                 # Backend (Node.js + Express)
│   ├── controllers/     # HTTP request handlers
│   ├── services/        # Business logic
│   ├── repositories/    # Database access layer
│   ├── middlewares/     # Auth, validation, error handling
│   ├── dtos/           # Data Transfer Objects
│   ├── config/         # Configuration (DB, etc.)
│   └── utils/          # Utility functions
├── public/             # Frontend (HTML/CSS/JS)
│   ├── Pages/          # HTML pages
│   ├── JS/             # JavaScript modules
│   ├── CSS/            # Stylesheets
│   └── Components/     # Reusable components
├── database/           # PostgreSQL schema and migrations
├── test/               # Test files
└── package.json        # Dependencies and scripts
```

## Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MentorMatch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentormatch
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=3000
```

4. Set up the database:
- Open pgAdmin 4
- Create a new database named `mentormatch`
- Run the SQL script from `database/Mentormatch.sql`
- Apply migrations from `database/migrations/`

5. Start the application:
```bash
npm start
```

The server will start on `http://localhost:3000` and serve both the API and frontend.

## Features

- User authentication with JWT
- Role-based access (Mentor/Mentee/Admin)
- Mentor availability management
- Session booking system
- Google Meet integration
- Notification system
- Review and rating system

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication
- bcrypt for password hashing

**Frontend:**
- Vanilla JavaScript (ES6 modules)
- HTML5 + CSS3
- Bootstrap 5

## API Endpoints

All API endpoints are prefixed with `/api`:
- `/api/user` - User management
- `/api/session` - Session booking
- `/api/notification` - Notifications
- `/api/mentor_sector` - Mentor sectors
- `/api/mentor_availability` - Availability management
- `/api/google_auth` - Google OAuth
- `/api/user_language` - User languages

For detailed backend documentation, see [Backend.md](Backend.md)

## Database Schema

The database consists of 7 main tables:
- **users** - User accounts (mentors, mentees, admins)
- **mentor_sectors** - Mentor professional sectors
- **mentor_availability** - Mentor scheduling
- **sessions** - Mentoring sessions
- **reviews** - Mentee reviews
- **notifications** - User notifications
- **google_meet_token** - OAuth tokens

## Testing

Run tests with:
```bash
npm test
```

## License

[Add your license here]