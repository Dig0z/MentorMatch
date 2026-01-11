# GitHub Actions CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration to ensure code quality, security, and proper Docker builds on every push and pull request.

## Triggers

The CI workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

## Jobs Overview

The CI pipeline consists of 4 jobs that run in parallel:

### 1. Code Quality & Linting
**Duration:** ~1-2 minutes

**Steps:**
- ✅ Checkout code
- ✅ Setup Node.js 22.x
- ✅ Install dependencies (with caching)
- ✅ Run ESLint on backend code
- ✅ Security audit (npm audit)
- ✅ Validate required files exist
- ✅ Check for console.log in production code
- ✅ Validate package.json scripts

**What it checks:**
- Code style and quality issues (== vs ===, unused variables, etc.)
- Security vulnerabilities in npm packages
- Required files present (Dockerfile, .env.example, etc.)
- Package.json has required scripts (start, test)

### 2. Docker Build & Security Scan
**Duration:** ~2-4 minutes (first run), ~1-2 minutes (cached)

**Steps:**
- ✅ Checkout code
- ✅ Setup Docker Buildx
- ✅ Build Docker image with caching
- ✅ Report image size
- ✅ Run Trivy security scanner
- ✅ Test container health

**What it checks:**
- Dockerfile builds successfully
- Image size is reasonable (~608MB)
- No critical/high vulnerabilities in base image or dependencies
- Container starts and runs properly

### 3. Configuration Validation
**Duration:** ~30 seconds

**Steps:**
- ✅ Validate .env.example completeness
- ✅ Validate SQL schema syntax (using PostgreSQL container)
- ✅ Check for outdated dependencies
- ✅ Validate API routes configuration

**What it checks:**
- All required environment variables documented
- SQL schema is syntactically correct
- Routes file exports properly
- Dependencies are up-to-date (informational)

### 4. CI Summary
**Duration:** ~5 seconds

**Steps:**
- ✅ Aggregate results from all jobs
- ✅ Display summary table
- ✅ Report overall success/failure

## ESLint Configuration

**File:** `BackEnd/.eslintrc.json`

**Rules:**
- **Warnings (won't fail build):**
  - Use === instead of ==
  - Avoid console.log (except console.warn, console.error, console.info)
  - Prefer const over let when possible
  - Code style issues (quotes, semicolons, etc.)
  
- **Errors (will fail build):**
  - Undefined variables
  - Duplicate variable declarations
  - Unreachable code
  - Syntax errors

**Ignored:**
- Test files (*.test.js, *.spec.js)
- node_modules
- Test directory

## Security

### Secrets Management

The workflow doesn't require any secrets for basic CI checks. If you add deployment steps, use GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets like `DOCKER_USERNAME`, `DOCKER_PASSWORD`, etc.
3. Reference in workflow: `${{ secrets.SECRET_NAME }}`

### Trivy Scanner

Trivy scans for:
- OS vulnerabilities (Alpine base image)
- Library vulnerabilities (npm packages)
- Misconfigurations

**Severity levels checked:** CRITICAL, HIGH  
**Behavior:** Reports vulnerabilities but doesn't fail build (informational)

## Performance Optimization

The workflow is optimized for speed:

1. **Parallel execution:** All jobs run simultaneously
2. **Dependency caching:** npm packages cached between runs
3. **Docker layer caching:** Reuses unchanged layers
4. **Targeted checks:** Only scans what's necessary

## Customization

### Change Strictness

To make ESLint fail on warnings:

In `BackEnd/.eslintrc.json`, change rules from `"warn"` to `"error"`:

```json
{
  "rules": {
    "eqeqeq": ["error", "always"]  // Changed from "warn"
  }
}
```

### Add Deployment

To add deployment after successful build:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [code-quality, docker-build, config-validation]
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy
      run: |
        # Deployment commands
```

## Maintenance

### Updating Dependencies

The workflow runs `npm outdated` to check for updates. To update:

```bash
cd BackEnd
npm outdated          # See what's outdated
npm update           # Update minor/patch versions
npm install package@latest  # Update major versions
```

### Updating Workflow

The workflow uses pinned versions of GitHub Actions:

- `actions/checkout@v4`
- `actions/setup-node@v4`
- `docker/build-push-action@v5`
- `aquasecurity/trivy-action@master`

Check for updates periodically and test in a branch before updating main.
