# MentorMatch Dockerfile
# Full-stack application: Backend (Node.js + Express) serving Frontend (Static files)

# ==================================
# Stage 1: Build Backend Dependencies
# ==================================
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY BackEnd/package*.json ./

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

# Copy backend dependencies from builder
COPY --from=backend-builder /app/backend/node_modules ./BackEnd/node_modules

# Copy backend source code
COPY BackEnd ./BackEnd

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
WORKDIR /app/BackEnd
CMD ["node", "src/app.js"]
