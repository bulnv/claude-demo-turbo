# Turborepo Fleet

A monorepo setup for deploying multiple microservices with independent versioning and release cycles using GitHub Actions.

## Repository Structure

```
.
├── apps/
│   ├── user-service/      # User management service (v1.0.0)
│   └── order-service/     # Order processing service (v1.2.0)
├── packages/
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── .github/workflows/
    ├── ci.yml             # Continuous Integration
    ├── release.yml        # Manual release & deploy
    └── service-release.yml # Tag-triggered release
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| user-service | 3001 | User management (CRUD operations) |
| order-service | 3002 | Order processing and management |

## GitHub Actions Workflows

### 1. CI Workflow (`ci.yml`)

Triggered on: Pull requests and pushes to `main`

- Detects changed services using path filters
- Builds and tests only affected packages (Turborepo filtering)
- Builds Docker images for changed services

### 2. Release Workflow (`release.yml`)

Triggered: Manually via `workflow_dispatch`

**Inputs:**
- `service`: Which service to release (`all`, `user-service`, `order-service`)
- `version_bump`: Version increment (`patch`, `minor`, `major`)
- `environment`: Target environment (`staging`, `production`)

**What it does:**
1. Detects services to release (based on changes or manual selection)
2. Bumps version in `package.json`
3. Builds and tests the service
4. Builds and pushes Docker image to GHCR
5. Creates GitHub Release with changelog
6. Deploys to target environment

### 3. Tag Release Workflow (`service-release.yml`)

Triggered: On tags matching `*-v*` pattern

**Tag format:** `{service-name}-v{version}`

Examples:
```bash
git tag user-service-v1.1.0
git tag order-service-v1.3.0
```

## Usage

### Local Development

```bash
# Install dependencies
npm install

# Run all services in development mode
npm run dev

# Build all services
npm run build

# Run tests
npm run test

# Lint all services
npm run lint
```

### Service-Specific Commands

```bash
# Build specific service
npx turbo run build --filter=@repo/user-service

# Run tests for specific service
npx turbo run test --filter=@repo/order-service

# Run only affected by changes
npx turbo run build --filter='...[HEAD^]'
```

### Creating a Release

#### Option 1: Manual Release (Recommended)

1. Go to Actions → Release & Deploy
2. Click "Run workflow"
3. Select service, version bump type, and environment
4. Click "Run workflow"

#### Option 2: Tag-Based Release

```bash
# Create and push a tag
git tag user-service-v1.1.0
git push origin user-service-v1.1.0
```

### Docker Images

After release, images are available at:
```
ghcr.io/{owner}/user-service:{version}
ghcr.io/{owner}/order-service:{version}
```

## Configuration

### Required Secrets

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions |
| `TURBO_TOKEN` | (Optional) Turborepo Remote Cache token |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `TURBO_TEAM` | Turborepo team name for remote caching |

## Adding a New Service

1. Create the service directory:
   ```bash
   mkdir -p apps/my-service/src
   ```

2. Add `package.json` with unique version:
   ```json
   {
     "name": "@repo/my-service",
     "version": "1.0.0"
   }
   ```

3. Add Dockerfile in `apps/my-service/`

4. Update workflow path filters in `.github/workflows/ci.yml`:
   ```yaml
   my-service:
     - 'apps/my-service/**'
     - 'packages/**'
   ```

5. Update service detection in `.github/workflows/release.yml`

## API Endpoints

### User Service (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /users | List all users |
| GET | /users/:id | Get user by ID |
| POST | /users | Create user |
| DELETE | /users/:id | Delete user |

### Order Service (port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /orders | List orders (filter by userId) |
| GET | /orders/:id | Get order by ID |
| POST | /orders | Create order |
| PATCH | /orders/:id/status | Update order status |
| DELETE | /orders/:id | Delete order |
