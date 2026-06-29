# 🚗 National Vehicle Registry (NVR)

> A production-grade, cloud-native vehicle registration and plate management system built on Google Cloud Platform — featuring microservices, CI/CD automation, infrastructure-as-code, and real-time observability.

[![CI](https://github.com/UvereAnn/national_vehicle_registry/actions/workflows/ci.yml/badge.svg)](https://github.com/UvereAnn/national_vehicle_registry/actions/workflows/ci.yml)
[![CD](https://github.com/UvereAnn/national_vehicle_registry/actions/workflows/cd.yml/badge.svg)](https://github.com/UvereAnn/national_vehicle_registry/actions/workflows/cd.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=UvereAnn_national_vehicle_registry&metric=alert_status)](https://sonarcloud.io/dashboard?id=UvereAnn_national_vehicle_registry)

**Live Site:** [https://nationalvehicleregistry.com.ng](https://nationalvehicleregistry.com.ng)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Services](#services)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [CI/CD Pipeline](#cicd-pipeline)
- [Infrastructure](#infrastructure)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Overview

The National Vehicle Registry is a full-stack microservices application that digitises the vehicle registration process. It supports three user roles — **Staff**, **Admin**, and **Superadmin** — with a complete workflow from vehicle submission through plate assignment to public verification.

The project was built specifically to demonstrate production-level DevOps engineering skills including:

- Microservices design with an API gateway pattern
- Containerisation with Docker and Docker Compose for local development
- Cloud deployment to Google Cloud Run (serverless, scale-to-zero)
- Infrastructure-as-Code with Terraform
- Fully automated CI/CD using GitHub Actions
- Static analysis with SonarCloud and vulnerability scanning with Trivy
- Keyless GCP authentication via Workload Identity Federation
- Custom domain with Google-managed SSL
- Real-time observability with GCP Cloud Monitoring dashboards

---

## Architecture

```
                        ┌─────────────────────────────────────┐
                        │         Browser / Public             │
                        └──────────────┬──────────────────────┘
                                       │ HTTPS
                        ┌──────────────▼──────────────────────┐
                        │     frontend (React + Nginx)         │
                        │  nationalvehicleregistry.com.ng      │
                        └──────────────┬──────────────────────┘
                                       │ VITE_API_URL (baked at build time)
                        ┌──────────────▼──────────────────────┐
                        │         api-gateway (Node.js)        │
                        │   JWT verification · Rate limiting   │
                        │   Helmet · CORS · Proxy routing      │
                        └──┬──────────┬──────────┬────────────┘
                           │          │          │
             ┌─────────────▼─┐  ┌─────▼──────┐  ┌▼──────────────┐
             │  auth-service  │  │vehicle-svc │  │ plate-service  │
             │   (Node.js)    │  │ (Node.js)  │  │   (Python)     │
             │  JWT · bcrypt  │  │ CRUD · Approval│ Plate gen     │
             └───────┬────────┘  └─────┬──────┘  └──────┬────────┘
                     │                 │                 │
                     └─────────────────▼─────────────────┘
                                       │
                        ┌──────────────▼──────────────────────┐
                        │         MongoDB Atlas (M0)            │
                        │            nvr_db                    │
                        └─────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| No `pathRewrite` on any proxy block | Every backend service mounts routes at its full `/api/<service>` path internally — avoids the silent double-path bug |
| JWT verified only at api-gateway | Downstream services receive `x-user-id` and `x-user-role` headers instead of re-verifying the token — keeps `JWT_SECRET` isolated |
| `plateNumber` index is `sparse: true` | Prevents null collision on pending vehicles that don't yet have a plate assigned |
| Scale-to-zero on all Cloud Run services | Reduces cost to near-zero during idle periods; instance count panel in monitoring proves this |
| Keyless GCP auth via Workload Identity Federation | Eliminates long-lived service account keys; more secure than JSON key files |

---

## Tech Stack

### Application

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Axios, React Router v6 |
| API Gateway | Node.js, Express, http-proxy-middleware, jsonwebtoken |
| Auth Service | Node.js, Express, Mongoose, bcryptjs, jsonwebtoken |
| Vehicle Service | Node.js, Express, Mongoose, express-validator |
| Plate Service | Python 3, Flask, PyMongo |
| Database | MongoDB Atlas M0 (production), MongoDB 7 Docker (local dev) |

### DevOps & Infrastructure

| Area | Technology |
|------|-----------|
| Containerisation | Docker, Docker Compose |
| Cloud Platform | Google Cloud Platform (GCP) |
| Compute | Cloud Run (serverless, scale-to-zero) |
| Container Registry | GCP Artifact Registry |
| Secrets | GCP Secret Manager |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Static Analysis | SonarCloud |
| Vulnerability Scanning | Trivy (filesystem + image) |
| GCP Auth | Workload Identity Federation (keyless) |
| Monitoring | GCP Cloud Monitoring, Cloud Logging |
| Domain & SSL | Google-managed SSL, custom domain via Cloud Run domain mapping |

---

## Features

### Staff
- Submit new vehicle registrations with full owner and vehicle details
- View and edit their own pending submissions
- Track registration status (pending → approved / rejected)

### Admin
- View all vehicle registrations across all staff
- Approve pending vehicles (triggers automatic plate number generation)
- Reject vehicles with a reason
- Manage staff accounts (activate / deactivate)
- Dashboard with real-time stats (total, pending, approved, rejected today)

### Superadmin
- All admin capabilities
- Manage admin accounts

### Public
- Verify any plate number without logging in at `/verify`
- Returns plate status, issue date, and expiry date

---

## Services

### `auth-service` — Port 3001
Handles authentication and user management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | None | Register a new user |
| `/api/auth/login` | POST | None | Login, returns JWT |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/:id/toggle` | PUT | Admin | Activate/deactivate user |
| `/api/admin/users/:id` | DELETE | Admin | Delete user |

### `vehicle-service` — Port 3002
Handles vehicle registration lifecycle.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/vehicles` | GET | Staff+ | List vehicles (filtered by role) |
| `/api/vehicles` | POST | Staff+ | Submit new registration |
| `/api/vehicles/:id` | GET | Staff+ | Get vehicle details |
| `/api/vehicles/:id` | PUT | Staff+ | Edit pending registration |
| `/api/vehicles/:id/approve` | PUT | Admin+ | Approve and generate plate |
| `/api/vehicles/:id/reject` | PUT | Admin+ | Reject with reason |
| `/api/stats` | GET | Admin+ | Dashboard statistics |

### `plate-service` — Port 3003
Handles plate number generation and verification.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/plates/generate` | POST | Internal | Generate unique plate number |
| `/api/plates/verify/:plate` | GET | None | Public plate verification |

### `api-gateway` — Port 3000
Single entry point. Verifies JWT, injects user headers, proxies to services.

### `frontend` — Port 8080
React SPA served by Nginx. VITE_API_URL baked in at build time.

---

## Project Structure

```
national_vehicle_registry/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: SonarCloud, Trivy, build matrix
│       └── cd.yml              # CD: Build, push, deploy to Cloud Run
├── api-gateway/
│   ├── src/index.js            # Proxy routing, JWT middleware
│   └── Dockerfile
├── auth-service/
│   ├── src/
│   │   ├── models/User.js
│   │   ├── routes/auth.js
│   │   ├── routes/admin.js
│   │   └── index.js
│   └── Dockerfile
├── vehicle-service/
│   ├── src/
│   │   ├── models/Vehicle.js
│   │   ├── models/AuditLog.js
│   │   ├── routes/vehicles.js
│   │   ├── routes/public.js
│   │   ├── routes/stats.js
│   │   └── index.js
│   └── Dockerfile
├── plate-service/
│   ├── app.py                  # Flask app
│   ├── db.py                   # PyMongo connection
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── VehicleForm.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── PlateVerification.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── ConfirmModal.jsx
│   │       └── ProtectedRoute.jsx
│   ├── nginx.conf
│   ├── docker-entrypoint.sh
│   └── Dockerfile
├── database/
│   └── seed.js                 # Seed script for local dev
├── devops/
│   ├── sonarqube/
│   │   └── sonar-project.properties
│   └── terraform/
│       └── gcp-cloudrun/
│           ├── backend.tf
│           ├── provider.tf
│           ├── variables.tf
│           ├── apis.tf
│           ├── artifact_registry.tf
│           ├── secrets.tf
│           ├── cloud_run_services.tf
│           └── outputs.tf
└── docker-compose.yml
```

---

## Local Development

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- Python 3.11+
- `gcloud` CLI (for cloud operations)

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/UvereAnn/national_vehicle_registry.git
cd national_vehicle_registry
```

**2. Start all services**

```bash
docker-compose up --build
```

This starts:
- MongoDB on port 27017
- auth-service on port 3001
- vehicle-service on port 3002
- plate-service on port 3003
- api-gateway on port 3000
- frontend on port 8080

**3. Seed the database**

```bash
node database/seed.js
```

This creates:

| Email | Password | Role |
|-------|----------|------|
| `staff@nvr.gov` | `` | staff |
| `admin@nvr.gov` | `` | admin |
| `superadmin@nvr.gov` | `` | superadmin |

**4. Open the app**

Navigate to [http://localhost:8080](http://localhost:8080)

### End-to-End Test Flow

```bash
# 1. Login as staff and register a vehicle
# 2. Login as admin and approve the vehicle
# 3. Note the generated plate number (e.g. ABC-1234)
# 4. Visit http://localhost:8080/verify
# 5. Enter the plate number — should return "Plate Registered"
```

---

## CI/CD Pipeline

### CI (`ci.yml`) — Triggered on PRs and non-main pushes

```
PR opened / push to feature branch
         │
         ▼
┌─────────────────────┐
│   SonarCloud Scan   │  ← Quality Gate must pass
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Trivy FS Scan      │  ← HIGH/CRITICAL vulnerabilities flagged
└─────────┬───────────┘
          │
┌─────────▼──────────────────────────────────┐
│  Build Matrix (5 services, parallel)        │
│  auth · vehicle · plate · gateway · frontend│
└─────────┬──────────────────────────────────┘
          │
┌─────────▼───────────┐
│  Trivy Image Scan   │  ← Per service image scan
└─────────────────────┘
```

### CD (`cd.yml`) — Triggered on push to `main`

```
Merge to main
      │
      ▼
┌─────────────────────────┐
│  Authenticate to GCP    │  ← Keyless via Workload Identity Federation
└─────────┬───────────────┘
          │
┌─────────▼───────────────┐
│  Build & Push Images    │  ← Tagged with short Git SHA
│  (all 5 services)       │
└─────────┬───────────────┘
          │
┌─────────▼───────────────┐
│  Deploy to Cloud Run    │  ← All 5 services updated
└─────────┬───────────────┘
          │
┌─────────▼───────────────┐
│  Output deployed URLs   │  ← Posted to workflow summary
└─────────────────────────┘
```

### GitHub Actions Secrets & Variables

| Name | Type | Description |
|------|------|-------------|
| `SONAR_TOKEN` | Secret | SonarCloud authentication token |
| `GCP_PROJECT_ID` | Variable | GCP project ID |
| `GCP_WORKLOAD_PROVIDER` | Variable | Workload Identity Federation provider resource name |
| `GCP_SERVICE_ACCOUNT` | Variable | GCP service account email for deployments |

---

## Infrastructure

Provisioned with Terraform in `devops/terraform/gcp-cloudrun/`.

### GCP Resources

| Resource | Details |
|----------|---------|
| Artifact Registry | `nvr-repo` — stores Docker images |
| Cloud Run Services | 5 services, min=0, max=2, 256Mi each |
| Secret Manager | `mongodb-uri`, `jwt-secret` |
| Workload Identity Pool | `github-actions-pool` — keyless GitHub Actions auth |
| Domain Mapping | `nationalvehicleregistry.com.ng` → frontend Cloud Run service |
| SSL Certificate | Google-managed, auto-provisioned |

### Terraform Commands

```bash
cd devops/terraform/gcp-cloudrun

# Initialise (first time)
terraform init

# Preview changes
terraform plan

# Apply
terraform apply
```

---

## Monitoring & Observability

### GCP Cloud Monitoring Dashboard — `NVR — National Vehicle Registry`

Five panels tracking the health of all services in real time:

| Panel | Metric | What it shows |
|-------|--------|---------------|
| Request Count | `run.googleapis.com/request_count` | Traffic per service |
| Request Latency | `run.googleapis.com/request_latencies` | Response time trends |
| Instance Count | `run.googleapis.com/container/instance_count` | Scale-to-zero behaviour |
| Error Rate | `request_count` filtered by `4xx`/`5xx` | Error trends |
| Memory Utilisation | `run.googleapis.com/container/memory/utilizations` | Memory pressure |

### Cloud Logging

All 5 services emit structured logs to GCP Cloud Logging, queryable via:

```
resource.type = "cloud_run_revision"
```

### Scale-to-Zero

All Cloud Run services are configured with `min-instances=0`. The Instance Count panel in Cloud Monitoring visually demonstrates containers scaling down to 0 during idle periods and spinning back up on demand.

---

## Security

| Control | Implementation |
|---------|---------------|
| Keyless GCP auth | Workload Identity Federation — no long-lived JSON keys |
| Secrets management | GCP Secret Manager — never in environment variables or code |
| JWT isolation | `JWT_SECRET` known only to auth-service and api-gateway |
| Rate limiting | 1000 requests / 15 min on api-gateway (health endpoint excluded) |
| Security headers | Helmet.js on all Node.js services |
| CORS | Restricted to `FRONTEND_URL` environment variable |
| Vulnerability scanning | Trivy scans filesystem and every Docker image on every PR |
| Static analysis | SonarCloud Quality Gate blocks merges on security rating < A |
| Service account key creation | Disabled at organisation policy level (`constraints/iam.disableServiceAccountKeyCreation`) |
| Branch protection | `main` requires passing CI checks and PR review before merge |
| Image pinning | All GitHub Actions pinned to full immutable commit SHAs |

---

## API Reference

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <JWT>
```

### Example: Login

```bash
curl -X POST https://nationalvehicleregistry.com.ng/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@nvr.gov","password":"REDACTED"}'
```

### Example: Submit Vehicle Registration

```bash
curl -X POST https://nationalvehicleregistry.com.ng/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "owner_name": "John Doe",
    "national_id": "12345678901",
    "phone": "08012345678",
    "address": "123 Main Street, Lagos",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Black",
    "engine_number": "ENG-001",
    "chassis_number": "CHS-001"
  }'
```

### Example: Verify a Plate (Public)

```bash
curl https://nationalvehicleregistry.com.ng/api/plates/verify/ABC-1234
```

---

## Environment Variables

### api-gateway

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Shared secret for JWT verification |
| `AUTH_SERVICE_URL` | Internal URL of auth-service |
| `VEHICLE_SERVICE_URL` | Internal URL of vehicle-service |
| `PLATE_SERVICE_URL` | Internal URL of plate-service |
| `FRONTEND_URL` | Allowed CORS origin |
| `PORT` | Listening port (injected by Cloud Run) |

### auth-service / vehicle-service

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (from Secret Manager in production) |
| `JWT_SECRET` | Shared secret for JWT signing (from Secret Manager in production) |
| `PORT` | Listening port (injected by Cloud Run) |

### plate-service

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Listening port |

### frontend (build-time)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full URL of api-gateway (baked into JS bundle at build time) |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Push: `git push -u origin feature/your-feature-name`
5. Open a Pull Request against `main`

CI checks (SonarCloud Quality Gate + Trivy scans) must pass before merging.

---

## Author

**Ivuaku Annastassia Ugwuonu**
DevOps & Cloud Engineering Portfolio Project
[GitHub](https://github.com/UvereAnn) · [LinkedIn](https://linkedin.com/in/uvereann)

---

*Built with ❤️ and a lot of `gcloud` commands.*