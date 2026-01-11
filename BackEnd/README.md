# Backend

## Requirements

- Node.js
- Permissions to install npm packages

Main packages used in the project:

npm install express 
npm install pg 
npm install dotenv
npm install jsonwebtoken
npm install bcrypt
npm install googleapis

## Installation

1. Clone the repository and switch to the project folder.
2. Install the dependencies using the commands above.
3. Create a `.env` file in the root and add the configuration variables (e.g., DB connection string).

## Backend Architecture

The proposed architecture is based on three main layers:

- **Controllers**: handle HTTP requests and define endpoints; they receive data from the client, validate/parse where necessary, and call the services.
- **Services**: contain the application logic; they orchestrate complex operations, business validations, and calls to repositories.
- **Repositories**: handle database access (queries, result mapping); they provide a DB abstraction for the services.

This separation helps isolate logic, makes components more testable, and allows changes at the persistence layer without impacting controllers.

## Additional modules

- **Middleware / Auth**: middleware for authentication and JWT token verification.
- **Middleware / DTO**: middleware for input verification and validation of requests.
- **Error handling**: central handler for exceptions and errors, normalizing error responses to the client.
- **Config**: module to centralize reading environment variables and configuration (port, DB, sensitive info).

## Folder structure

src/
	controllers/
	services/
	repositories/
	dtos/
	middleware/
	config/
	app.js

## Email Notifications

The backend sends SendGrid emails for booking and cancellation events:
- Booking: mentor and mentee receive details (names, date, time, modality) including a fixed Meet link.
- Cancellation: the cancelling user receives a confirmation; the other party is notified of the cancellation.

Configure SendGrid in `.env`:

```
SENDGRID_API_KEY=your_key
SENDGRID_FROM=verified@yourdomain.com
SENDGRID_DATA_RESIDENCY=global # or 'eu' if you use an EU subuser key
FAKE_MEET_LINK=https://meet.google.com/lookup/mentormatch-demo
```

If you set `SENDGRID_DATA_RESIDENCY=eu`, ensure the API key is an EU regional subuser key and the `SENDGRID_FROM` is verified for that subuser.
