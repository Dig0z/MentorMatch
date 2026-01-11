# MentorMatch Dockerfile
# Full-stack application: Backend (Node.js + Express) serving Frontend (Static files)

# ==================================
# Stage 1: Build Dependencies
# ==================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files from root
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# ==================================
# Stage 2: Production Runtime
# ==================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy backend source code
COPY BackEnd ./BackEnd

# Copy package.json to root (needed for imports)
COPY package.json ./

# Copy frontend files (static assets)
COPY FrontEnd ./FrontEnd

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check for application
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/user/test', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 201 ? 0 : 1)})"

# Set environment to production
ENV NODE_ENV=production

# Start the application server (serves both API and static files)
CMD ["node", "BackEnd/src/app.js"]
