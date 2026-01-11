# MentorMatch Docker Deployment Guide

## Overview

This guide provides instructions for deploying the MentorMatch application using Docker. The application is containerized as a single image that includes both the Node.js backend API and the static frontend files served by Express.

## Architecture

- **Single Container**: Backend (Node.js/Express) + Frontend (Static files)
- **Base Image**: node:22-alpine (lightweight, ~608MB total)
- **Database**: External PostgreSQL (not included in container)
- **Port**: 5000 (serves both API and frontend)

## Prerequisites

- Docker installed (version 20.10+)
- PostgreSQL database (local, cloud, or containerized)
- Environment variables configured

## Quick Start

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
nano .env
```

**Required environment variables:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `JWT_SECRET` - Secret key for JWT tokens (generate with: `openssl rand -base64 32`)
- `SENDGRID_API_KEY`, `FROM_EMAIL` - SendGrid email service
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` - Google OAuth

### 2. Setup PostgreSQL Database

**Option A: Using Docker**
```bash
# Start PostgreSQL container
docker run -d \
  --name mentormatch-db \
  -e POSTGRES_DB=mentormatch \
  -e POSTGRES_USER=mentormatch \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for PostgreSQL to start
sleep 10

# Import database schema
docker exec -i mentormatch-db \
  psql -U mentormatch -d mentormatch < DataBase/Mentormatch.sql
```

**Option B: Using Existing PostgreSQL**
```bash
# Import schema to existing database
psql -h your-host -U your-user -d mentormatch -f DataBase/Mentormatch.sql
```

### 3. Build Docker Image

```bash
# Build the image (takes 1-2 minutes)
docker build -t mentormatch:latest .

# Verify image was created
docker images mentormatch
```

### 4. Run the Application

```bash
# Run the container
docker run -d \
  --name mentormatch-app \
  -p 5000:5000 \
  --env-file .env \
  mentormatch:latest

# Check if container is running
docker ps

# View logs
docker logs -f mentormatch-app
```

### 5. Access the Application

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/user/test

## Configuration Details

### Environment Variables

See `.env.example` for a complete list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_SCHEMA` | Database schema (optional) | public |
| `PORT` | Application port | 5000 |
| `NODE_ENV` | Environment mode | production |
| `JWT_SECRET` | JWT signing key | (required) |

### Container Networking

If both app and database are in Docker:

```bash
# Create a network
docker network create mentormatch-network

# Run database with network
docker run -d \
  --name mentormatch-db \
  --network mentormatch-network \
  -e POSTGRES_DB=mentormatch \
  -e POSTGRES_USER=mentormatch \
  -e POSTGRES_PASSWORD=your_password \
  postgres:15-alpine

# Run app with network (update .env: DB_HOST=mentormatch-db)
docker run -d \
  --name mentormatch-app \
  --network mentormatch-network \
  -p 5000:5000 \
  --env-file .env \
  mentormatch:latest
```

## Useful Commands

### Container Management

```bash
# Stop container
docker stop mentormatch-app

# Start stopped container
docker start mentormatch-app

# Restart container
docker restart mentormatch-app

# Remove container
docker rm mentormatch-app

# Remove container (force)
docker rm -f mentormatch-app
```

### Logs and Debugging

```bash
# View logs (live)
docker logs -f mentormatch-app

# View last 100 lines
docker logs --tail 100 mentormatch-app

# Execute shell inside container
docker exec -it mentormatch-app sh

# Check container health
docker inspect mentormatch-app --format='{{.State.Health.Status}}'
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi mentormatch:latest

# Remove unused images
docker image prune

# Rebuild after changes
docker build -t mentormatch:latest .
```

## Production Deployment

### Using Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: mentormatch-db
    environment:
      POSTGRES_DB: mentormatch
      POSTGRES_USER: mentormatch
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./DataBase/Mentormatch.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - mentormatch-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mentormatch"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: mentormatch-app
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      DB_HOST: postgres
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - mentormatch-network
    restart: unless-stopped

volumes:
  postgres-data:

networks:
  mentormatch-network:
    driver: bridge
```

Then deploy:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Reverse Proxy with Nginx

For production, add nginx as reverse proxy for SSL/HTTPS:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Cloud Deployment Options

**AWS ECS/Fargate:**
```bash
# Push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account.dkr.ecr.region.amazonaws.com
docker tag mentormatch:latest account.dkr.ecr.region.amazonaws.com/mentormatch:latest
docker push account.dkr.ecr.region.amazonaws.com/mentormatch:latest
```

**Google Cloud Run:**
```bash
# Push to GCR
gcloud builds submit --tag gcr.io/project-id/mentormatch
gcloud run deploy mentormatch --image gcr.io/project-id/mentormatch --platform managed
```

**Azure Container Instances:**
```bash
# Push to ACR
az acr login --name registryname
docker tag mentormatch:latest registryname.azurecr.io/mentormatch:latest
docker push registryname.azurecr.io/mentormatch:latest
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs mentormatch-app

# Common issues:
# - Database connection failed → Check DB_HOST, credentials
# - Port already in use → Change port mapping: -p 3000:5000
# - Missing environment variables → Check .env file
```

### Database connection errors

```bash
# Test database connection from container
docker exec -it mentormatch-app sh
nc -zv $DB_HOST $DB_PORT

# If using Docker network, ensure both containers are on same network
docker network inspect mentormatch-network
```

### Frontend not loading

```bash
# Verify static files are in container
docker exec -it mentormatch-app ls /app/FrontEnd

# Check Express is serving static files
docker exec -it mentormatch-app cat /app/BackEnd/src/app.js | grep "static"
```

### Google OAuth not working

The application requires completing OAuth flow on first run:
1. Access the OAuth endpoint in browser
2. Authorize the application
3. Tokens are stored in `google_meet_token` table

## Security Best Practices

1. **Never commit .env file** - Use `.env.example` template
2. **Use strong secrets** - Generate JWT_SECRET with: `openssl rand -base64 32`
3. **Run as non-root** - Container already uses `nodejs` user (UID 1001)
4. **Keep base image updated** - Regularly rebuild with latest `node:22-alpine`
5. **Use secrets management** - For production, use Docker secrets or cloud secret managers
6. **Enable HTTPS** - Use reverse proxy with SSL certificates
7. **Scan for vulnerabilities** - Use `docker scan mentormatch:latest`

## Health Checks

The container includes built-in health checks:

```bash
# Check container health status
docker inspect mentormatch-app --format='{{.State.Health.Status}}'

# Health check endpoint
curl http://localhost:5000/api/user/test
```

Health check runs every 30 seconds and tests the `/api/user/test` endpoint.

## Monitoring and Logging

### Export logs to file

```bash
docker logs mentormatch-app > app.log 2>&1
```

### Use logging driver

```bash
docker run -d \
  --name mentormatch-app \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 5000:5000 \
  --env-file .env \
  mentormatch:latest
```

## Updates and Maintenance

### Update application

```bash
# Pull latest code
git pull

# Rebuild image
docker build -t mentormatch:latest .

# Stop old container
docker stop mentormatch-app
docker rm mentormatch-app

# Start new container
docker run -d \
  --name mentormatch-app \
  -p 5000:5000 \
  --env-file .env \
  mentormatch:latest
```

### Database migrations

```bash
# Run SQL migration scripts
docker exec -i mentormatch-db \
  psql -U mentormatch -d mentormatch < DataBase/migrations/001_migration.sql
```

## Support

For issues or questions:
- Check logs: `docker logs mentormatch-app`
- Verify environment: `docker exec mentormatch-app env`
- Test database: `docker exec mentormatch-app node -e "require('./src/config/db.js')"`


## Key Features

- ✅ Single container deployment (backend + frontend)
- ✅ Multi-stage build for optimized size
- ✅ Non-root user for security
- ✅ Health checks built-in
- ✅ Production-ready configuration
- ✅ Environment-based configuration
- ✅ Static file serving via Express
- ✅ Configurable database schema
