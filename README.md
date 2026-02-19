# 🏛️ National Vehicle Registry (NVR)

![NVR Banner](https://img.shields.io/badge/National%20Vehicle%20Registry-Official%20Portal-166534?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0OCIgZmlsbD0iIzE2NjUzNCIvPjwvc3ZnPg==)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## 📖 Overview

The **National Vehicle Registry (NVR)** is a full-stack, microservices-based web application for managing national vehicle registrations, plate number generation, and public vehicle verification. Built with a government-grade design and role-based access control, NVR provides a complete digital solution for vehicle registration authorities.

### ✨ Key Features

- 🔐 **JWT Authentication** with role-based access control (3 roles)
- 🚗 **Vehicle Registration** submission and approval workflow
- 🪪 **Automatic Plate Generation** via Python microservice (format: `NVR-XX-NNNN`)
- 🔍 **Public Plate Verification** — no login required
- 📊 **Admin Dashboard** with real-time statistics
- 👥 **Staff Management** — create, activate/deactivate accounts
- 📋 **Audit Trail** — tracks who approved/rejected and when
- 📱 **Responsive Design** — works on mobile and desktop

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                      localhost:5173                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP /api/*
┌─────────────────────▼───────────────────────────────────────┐
│                  API Gateway (Node.js)                       │
│                    localhost:3000                            │
│           JWT Verification + Request Routing                 │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│Auth Service │ │  Vehicle   │ │  Plate Service  │
│ Node.js     │ │  Service   │ │  Python/Flask   │
│ :3001       │ │  Node.js   │ │  :3003          │
│             │ │  :3002     │ │                 │
└──────┬──────┘ └─────┬──────┘ └────────┬────────┘
       │              │                  │
┌──────▼──────────────▼──────────────────▼────────┐
│                  MySQL Database                  │
│                   nvr_db                         │
└──────────────────────────────────────────────────┘
```

### Microservices Breakdown

| Service | Technology | Port | Responsibility |
|---|---|---|---|
| **API Gateway** | Node.js, Express | 3000 | Request routing, JWT verification, rate limiting |
| **Auth Service** | Node.js, Express, bcryptjs | 3001 | Login, registration, user management, stats |
| **Vehicle Service** | Node.js, Express, Axios | 3002 | Vehicle CRUD, approve/reject workflow |
| **Plate Service** | Python, Flask | 3003 | Unique plate number generation |
| **Frontend** | React 18, TailwindCSS, Vite | 5173 | User interface |

---

## 🔐 User Roles

| Role | Description | Permissions |
|---|---|---|
| `super_admin` | Full system access | All permissions + create admin officers + delete users |
| `admin_officer` | Operations manager | Approve/reject registrations, manage staff, view all vehicles |
| `registration_staff` | Field officer | Submit registrations, view own submissions, edit pending |

---

## 🖥️ UI Pages

| Page | URL | Access |
|---|---|---|
| Landing Page | `/` | Public |
| Login | `/login` | Public |
| Plate Verification | `/verify` | Public |
| Admin Dashboard | `/admin` | Admin+ |
| Pending Approvals | `/admin/pending` | Admin+ |
| All Vehicles | `/admin/vehicles` | Admin+ |
| Staff Management | `/admin/staff` | Admin+ |
| Staff Dashboard | `/staff` | Staff |
| My Registrations | `/staff/registrations` | Staff |
| New Registration | `/vehicles/new` | Staff |
| Edit Registration | `/vehicles/:id/edit` | Staff (pending only) |
| API Documentation | `/api/docs` (port 3000) | Dev |

---

## 🗄️ Database Schema

```sql
-- Users
users (id, name, email, password, role, is_active, created_at, updated_at)

-- Vehicles
vehicles (
  id, owner_name, national_id, phone, address,
  make, model, year, color, engine_number, chassis_number,
  plate_number, status, submitted_by, reviewed_by,
  approved_by, approved_at, rejected_by, rejected_at,
  rejection_reason, created_at, updated_at
)

-- Plate Numbers
plate_numbers (id, plate_number, vehicle_id, generated_at)

-- Audit Logs
audit_logs (id, user_id, action, entity_type, entity_id, details, created_at)
```

---

## 🚀 Getting Started

### Prerequisites

| Software | Version | Download |
|---|---|---|
| Node.js | v18+ | https://nodejs.org |
| Python | v3.9+ | https://python.org |
| MySQL | v8.0+ | https://dev.mysql.com/downloads |
| npm | v8+ | Comes with Node.js |
| pip | v22+ | Comes with Python |

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/national_vehicle_registry.git
cd national_vehicle_registry
```

#### 2. Set up MySQL database

```bash
# Start MySQL
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS

# Create database and load schema
mysql -u root -p < database/schema.sql
mysql -u root -p nvr_db < database/migrate.sql
```

#### 3. Configure environment variables

Copy and edit the `.env.example` files for each service:

```bash
# Auth Service
cp auth-service/.env.example auth-service/.env
nano auth-service/.env

# Vehicle Service
cp vehicle-service/.env.example vehicle-service/.env
nano vehicle-service/.env

# API Gateway
cp api-gateway/.env.example api-gateway/.env
nano api-gateway/.env

# Plate Service
cp plate-service/.env.example plate-service/.env
nano plate-service/.env
```

Update `DB_PASSWORD` in each file to match your MySQL root password.

#### 4. Install dependencies

```bash
# API Gateway
cd api-gateway && npm install && cd ..

# Auth Service
cd auth-service && npm install && cd ..

# Vehicle Service
cd vehicle-service && npm install && cd ..

# Plate Service (Python virtual environment)
cd plate-service
python3 -m venv venv
source venv/bin/activate       # Linux/macOS
# venv\Scripts\activate        # Windows
pip install -r requirements.txt
cd ..

# Frontend
cd frontend && npm install && cd ..
```

---

## ▶️ Running the Application

Open **5 separate terminal windows** and run one command in each:

```bash
# Terminal 1 — Auth Service
cd auth-service && npm run dev

# Terminal 2 — Vehicle Service
cd vehicle-service && npm run dev

# Terminal 3 — API Gateway
cd api-gateway && npm run dev

# Terminal 4 — Plate Service
cd plate-service && source venv/bin/activate && python3 app.py

# Terminal 5 — Frontend
cd frontend && npm run dev
```

Then open your browser at **http://localhost:5173**

### Verify all services are running

| URL | Expected Response |
|---|---|
| http://localhost:3000/health | `{"status":"ok","service":"api-gateway"}` |
| http://localhost:3001/health | `{"status":"ok","service":"auth-service"}` |
| http://localhost:3002/health | `{"status":"ok","service":"vehicle-service"}` |
| http://localhost:3003/health | `{"status":"ok","service":"plate-service"}` |

---

## 🔑 Default Credentials

> ⚠️ **Change these immediately in production!**

| Email | Password | Role |
|---|---|---|
| `superadmin@nvr.gov` | `Admin@1234` | Super Admin |
| `admin@nvr.gov` | `Admin@1234` | Admin Officer |
| `staff@nvr.gov` | `Admin@1234` | Registration Staff |

---

## 🔄 Vehicle Registration Workflow

```
Staff submits registration
         │
         ▼
   Status: PENDING
         │
         ▼
  Admin reviews application
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 APPROVE    REJECT
    │         │
    ▼         ▼
Plate auto- Rejection
generated   reason saved
(NVR-XX-NNNN)
    │
    ▼
Public verification
available at /verify
```

---

## 📡 API Reference

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "staff@nvr.gov", "password": "Admin@1234" }
```

```http
GET /api/auth/me
Authorization: Bearer <token>
```

```http
POST /api/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{ "name": "John Doe", "email": "john@nvr.gov", "password": "Pass@1234", "role": "registration_staff" }
```

### Vehicles

```http
GET    /api/vehicles              # List vehicles (role-filtered)
POST   /api/vehicles              # Submit new registration
GET    /api/vehicles/:id          # Get single vehicle
PUT    /api/vehicles/:id          # Edit pending vehicle
PUT    /api/vehicles/:id/approve  # Approve + generate plate (admin+)
PUT    /api/vehicles/:id/reject   # Reject with reason (admin+)
```

### Admin

```http
GET /api/admin/stats              # Dashboard statistics
GET /api/admin/users              # List all users
PUT /api/admin/users/:id/toggle   # Activate/deactivate user
```

### Public

```http
GET /api/public/verify/:plate     # Verify plate (no auth required)
```

> 📄 Full interactive API documentation available at **http://localhost:3000/api/docs**

---

## 🌱 Sample Test Data

The schema comes with pre-loaded test data:

**Vehicles:**
| Plate | Owner | Vehicle | Status |
|---|---|---|---|
| `NVR-AB-1001` | Alice Johnson | Toyota Camry 2020 | Approved |
| `NVR-CD-2045` | Bob Smith | Honda Civic 2019 | Approved |
| _(none)_ | Carol White | Nissan X-Trail 2021 | Pending |

Test public verification at `/verify` with `NVR-AB-1001` or `NVR-CD-2045`.

---

## 📁 Project Structure

```
national_vehicle_registry/
├── api-gateway/                  # Node.js API Gateway
│   ├── src/
│   │   ├── index.js              # Main entry, proxy routing
│   │   └── middleware/
│   │       └── auth.js           # JWT middleware
│   ├── swagger.yaml              # OpenAPI documentation
│   ├── .env.example
│   └── package.json
│
├── auth-service/                 # Node.js Auth Service
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── auth.js           # Login, register, /me
│   │   │   └── admin.js          # User management, stats
│   │   └── models/db.js          # MySQL connection pool
│   ├── .env.example
│   └── package.json
│
├── vehicle-service/              # Node.js Vehicle Service
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── vehicles.js       # CRUD, approve, reject
│   │   │   └── public.js         # Public plate verification
│   │   └── models/db.js
│   ├── .env.example
│   └── package.json
│
├── plate-service/                # Python Flask Plate Service
│   ├── app.py                    # Plate generation logic
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/                     # (gitignored)
│
├── frontend/                     # React + Vite Frontend
│   ├── public/
│   │   └── favicon.svg           # NVR logo favicon
│   ├── src/
│   │   ├── App.jsx               # Routes and auth guards
│   │   ├── main.jsx              # Entry point
│   │   ├── index.css             # Tailwind + custom styles
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── services/
│   │   │   └── api.js            # Axios instance
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Sidebar.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       └── ConfirmModal.jsx
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── LoginPage.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── StaffDashboard.jsx
│   │       ├── VehicleForm.jsx
│   │       ├── PlateVerification.jsx
│   │       └── NotFoundPage.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   ├── schema.sql                # Initial DB schema + seed data
│   └── migrate.sql               # Audit columns migration
│
├── .gitignore
├── START.md                      # Quick start cheatsheet
└── README.md
```

---

## 🔒 Security Features

- **Password Hashing** — bcrypt with salt rounds
- **JWT Authentication** — 8-hour token expiration
- **Role-Based Authorization** — enforced at gateway and service level
- **Input Validation** — express-validator on all endpoints
- **Rate Limiting** — 200 requests per 15 minutes per IP
- **CORS Protection** — restricted to frontend origin
- **Helmet.js** — HTTP security headers
- **Deactivated Account Blocking** — inactive users cannot login
- **Duplicate Prevention** — unique engine/chassis/plate numbers enforced

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| Login keeps redirecting | Clear browser localStorage, log out and back in |
| "Admin access required" error | Restart all backend services, re-login to get fresh token |
| Stats show dashes | Check api-gateway is running, verify JWT_SECRET matches in all .env files |
| Plate service unavailable | Activate venv: `source venv/bin/activate` then `python3 app.py` |
| DB connection refused | Check MySQL is running: `sudo systemctl status mysql` |
| Port already in use | `sudo lsof -i :PORT` then `kill -9 <PID>` |
| npm install fails | Delete `node_modules/` and `package-lock.json`, retry |
| Empty reply from server | Remove `app.use(express.json())` from api-gateway |

---

## 🚢 Production Deployment

Before going to production:

- [ ] Change `JWT_SECRET` to a cryptographically random 32+ character string in all `.env` files
- [ ] Set strong MySQL passwords and restrict user permissions
- [ ] Enable HTTPS with SSL certificates (Let's Encrypt)
- [ ] Set `NODE_ENV=production` in Node.js services
- [ ] Set `DEBUG=false` in plate-service
- [ ] Build frontend: `npm run build` in `/frontend`
- [ ] Use PM2 for Node.js process management: `pm2 start src/index.js`
- [ ] Use Gunicorn for Python: `gunicorn app:app --bind 0.0.0.0:3003`
- [ ] Set up Nginx as reverse proxy
- [ ] Configure automated database backups
- [ ] Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**National Vehicle Registry Development Team**

---

<div align="center">
  <p>Built with ❤️ for efficient government vehicle management</p>
  <p>
    <a href="http://localhost:5173">🌐 Live App</a> •
    <a href="http://localhost:3000/api/docs">📚 API Docs</a> •
    <a href="database/schema.sql">🗄️ Database Schema</a>
  </p>
</div>
