# Node.js REST API with Authentication

A production-ready REST API built with Node.js, Express, TypeScript, PostgreSQL, and Sequelize ORM featuring comprehensive authentication and user management.

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Sequelize with sequelize-cli
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcrypt
- **Logging**: Winston
- **Development**: nodemon, ts-node
- **Code Quality**: ESLint, Prettier

## Features

- User registration with email/password or OTP
- Email/password authentication
- OTP-based authentication (login, registration, password reset)
- JWT token-based authorization
- Protected endpoints with middleware
- Role-based access control (ADMIN, USER)
- Password reset flow with OTP
- Comprehensive error handling
- Request validation with Zod
- PostgreSQL database with migrations and seeders
- Clean architecture (Controller → Service → Model)

## Project Structure

```
src/
├── app.ts                      # Express app configuration
├── server.ts                   # Server entry point
├── routes.ts                   # Main router
├── config/
│   ├── env.ts                  # Environment configuration
│   ├── database.ts             # Database configuration
│   └── sequelize.ts            # Sequelize instance
├── models/
│   ├── user.model.ts           # User model
│   ├── role.model.ts           # Role model
│   ├── userRole.model.ts       # User-Role junction model
│   ├── otp.model.ts            # OTP model
│   └── index.ts                # Model associations
├── migrations/                 # Database migrations
├── seeders/                    # Database seeders
├── modules/
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.validator.ts
│   └── users/                  # User module
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── user.routes.ts
├── middlewares/
│   ├── auth.middleware.ts      # JWT authentication
│   ├── error.middleware.ts     # Error handling
│   └── validate.middleware.ts  # Request validation
└── utils/
    ├── jwt.ts                  # JWT utilities
    ├── otp.ts                  # OTP utilities
    ├── logger.ts               # Winston logger
    └── response.ts             # Response formatters
```

## Prerequisites

- Node.js 18+ (LTS)
- PostgreSQL 12+
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd th_feedback_analytics
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3010

# PostgreSQL Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 4. Build the project

```bash
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/` directory.

### 5. Run database migrations

```bash
npm run db:migrate
```

This creates the following tables:
- `users` - User accounts
- `roles` - User roles (ADMIN, USER)
- `user_roles` - User-role associations
- `otps` - One-time passwords

### 6. Seed default data

```bash
npm run db:seed
```

This seeds:
- Default roles (ADMIN, USER)

## Running the Application

### Development Mode

Uses nodemon for automatic restarts on file changes:

```bash
npm run dev
```

### Production Mode

First build the project, then start:

```bash
npm run build
npm start
```

The server will start on the port specified in `.env` (default: 3010).

## Database Management

### Create a new migration

```bash
npx sequelize-cli migration:generate --name migration-name
```

### Run migrations

```bash
npm run db:migrate
```

### Rollback last migration

```bash
npm run db:migrate:undo
```

### Create a new seeder

```bash
npx sequelize-cli seed:generate --name seeder-name
```

### Run all seeders

```bash
npm run db:seed
```

## API Documentation

See [server_apis.md](./server_apis.md) for detailed API documentation with curl examples.

### Quick Start Endpoints

**Health Check:**
```bash
curl http://localhost:3010/api/v1/health
```

**Register:**
```bash
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Get Profile (Protected):**
```bash
curl http://localhost:3010/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment on Ubuntu

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PostgreSQL Client (if needed)

```bash
sudo apt-get install -y postgresql-client
```

### 3. Clone and setup project

```bash
cd /home/ubuntu/newapps
git clone <repository-url> th_feedback_analytics
cd th_feedback_analytics
npm install
```

### 4. Configure environment

```bash
nano .env
# Update with your production values
```

### 5. Build and run migrations

```bash
npm run build
npm run db:migrate
npm run db:seed
```

### 6. Start the application

**Using node directly:**
```bash
npm start
```

**Using PM2 (recommended for production):**
```bash
sudo npm install -g pm2
pm2 start dist/server.js --name "feedback-api"
pm2 save
pm2 startup
```

### 7. Setup as a system service (optional)

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/feedback-api.service
```

Add the following:

```ini
[Unit]
Description=Feedback Analytics API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/newapps/th_feedback_analytics
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable feedback-api
sudo systemctl start feedback-api
sudo systemctl status feedback-api
```

## Troubleshooting

### "Cannot find module" errors

Make sure you've built the project:
```bash
npm run build
```

The compiled JavaScript files should be in the `dist/` directory.

### Database connection errors

1. Verify PostgreSQL is running
2. Check `.env` database credentials
3. Ensure database exists
4. Test connection:
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

### Port already in use

Change the `PORT` in `.env` file or stop the process using the port:
```bash
lsof -ti:3010 | xargs kill -9
```

## Development

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Project Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Rollback last migration
- `npm run db:seed` - Run database seeders

## Security Best Practices

- Always change `JWT_SECRET` in production
- Use strong database passwords
- Keep dependencies updated
- Never commit `.env` file
- Use HTTPS in production
- Implement rate limiting for auth endpoints
- Set up proper CORS configuration
- Use environment-specific configurations

## License

Private - All rights reserved
