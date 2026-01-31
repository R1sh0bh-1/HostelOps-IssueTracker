# 🏠 HostelOps Issue Tracker

A full-stack web application for managing hostel operations, issue tracking, and student feedback with real-time communication.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [User Roles & Default Credentials](#-user-roles--default-credentials)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)

---

## ✨ Features

### **Issue Management**
- Report issues with images and categorization (Maintenance, Hygiene, Food, Security)
- Priority levels: Low, Medium, High, Emergency
- **Proof-Based Resolution** - Wardens must upload 1-5 proof files to mark issues resolved
- Students can reopen resolved issues if unsatisfied
- Real-time status tracking: Open → In Progress → Resolved

### **Discussion Threads**
- Real-time commenting on issues via Socket.IO
- Thread moderation (block/unblock)
- Mark threads as resolved

### **Feedback System**
- Students rate 6 categories: Food, Hygiene, Maintenance, Security, Facilities, Staff
- Monthly restrictions (one feedback per category per month)
- Admin analytics dashboard with visual reports
- Automatic alerts for categories rated below 3.0

### **Lost & Found**
- Report lost/found items with auto-categorization
- Fuzzy search with string similarity matching
- Location tracking and claim management

### **Additional Features**
- Role-based access (Student, Warden, Management)
- JWT authentication with bcrypt password hashing
- Hostel-specific announcements
- Profile management with avatar upload
- Real-time notifications

---

## 🛠️ Tech Stack

### **Frontend**
React 18 • TypeScript • Vite • Tailwind CSS • Radix UI • React Router • TanStack Query • React Hook Form • Zod • Socket.IO Client • Framer Motion • Recharts

### **Backend**
Node.js • Express • TypeScript • MongoDB • Mongoose • JWT • bcryptjs • Socket.IO • Multer • Cloudinary • Zod

### **Development**
ESLint • Vitest • ts-node-dev • PostCSS • Autoprefixer

---

## 🚀 Installation

### Prerequisites
- Node.js v16+ and npm v7+
- MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))
- Cloudinary account (optional, [Sign up](https://cloudinary.com/))

### Setup

```bash
# Clone repository
git clone https://github.com/KartikManuja/remix-of-remix-of-remix-of-remix-of-hostel-helper-hub.git
cd HostelOps-IssueTracker

# Install backend dependencies
cd Back-end
npm install

# Install frontend dependencies
cd ../Front-end
npm install
```

---

## ⚙️ Configuration

### Backend `.env`

```bash
cd Back-end
cp env.example .env
```

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hostelops_issue_tracker?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

CORS_ORIGIN=http://localhost:8080
```

**MongoDB Atlas Setup:**
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user and whitelist IP (`0.0.0.0/0` for dev)
3. Copy connection string to `MONGODB_URI`

### Frontend `.env`

```bash
cd Front-end
cp env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd Back-end
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd Front-end
npm run dev
# Runs on http://localhost:8080
```

### Production Build

```bash
# Backend
cd Back-end
npm run build
npm start

# Frontend
cd Front-end
npm run build
npm run preview
```

---

## 👥 User Roles & Default Credentials

### Roles

| Role | Permissions |
|------|-------------|
| **Student** | Report issues, submit feedback, comment on threads, use lost & found, reopen issues |
| **Warden** | All student permissions + manage issues, upload proofs, create announcements, moderate threads, view analytics |
| **Management** | All warden permissions + system-wide analytics and oversight |

### Default Admin Account

Auto-seeded on first backend run:

```
Email: admin@hostel.edu
Password: warden123
Role: Management
```

⚠️ **Change in production!**

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (auth required)

### Issues
- `GET /issues` - Get all issues
- `POST /issues` - Create issue
- `PATCH /issues/:id/status` - Update status (Warden)
- `PATCH /issues/:id/resolution-proof` - Add proof (Warden)
- `POST /issues/:id/reopen` - Reopen issue

### Threads
- `GET /threads/issue/:issueId` - Get threads for issue
- `POST /threads` - Create thread
- `POST /threads/:threadId/comments` - Add comment
- `PATCH /threads/:threadId/resolve` - Resolve (Warden)
- `PATCH /threads/:threadId/block` - Block (Warden)

### Feedback
- `POST /feedback` - Submit feedback (Student)
- `GET /feedback/my` - Get my feedback
- `GET /feedback/analytics` - Get analytics (Warden)

### Lost & Found
- `GET /lost-found` - Get all items
- `POST /lost-found` - Report item
- `PATCH /lost-found/:id/claim` - Claim item

### Upload
- `POST /upload/image` - Upload single image
- `POST /upload/proofs` - Upload multiple proofs (Warden)

---

## 🧪 Testing

### Manual Testing
See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Unit Tests

```bash
# Frontend
cd Front-end
npm test              # Run once
npm run test:watch    # Watch mode

# Backend
cd Back-end
npm test
```

---

## 🎨 Key Features Walkthrough

### Proof-Based Resolution
1. Login as warden → Management Dashboard
2. Select issue → "Mark Resolved"
3. Upload 1-5 proof files (images/PDFs)
4. Add remarks → Submit 🎉

### Student Feedback
1. Login as student → `/feedback`
2. Select category → Rate 1-5 stars
3. Add comment → Submit (once per category/month)

### Lost & Found
1. Report item → Auto-categorization
2. Search with fuzzy matching
3. Claim found items

---

## 🔒 Security

- JWT authentication with bcrypt password hashing
- Role-based access control middleware
- Zod schema validation
- CORS protection
- File upload validation
- Input sanitization

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| `MongooseServerSelectionError` | Check MongoDB URI and IP whitelist |
| `EADDRINUSE: address already in use` | Kill process or change port in `.env` |
| `Cannot find module` | Run `npm install` in both directories |
| `CORS policy blocked` | Verify `CORS_ORIGIN` matches frontend URL |

---

## 📝 License

ISC License

---


**Made with ❤️ for better hostel management**
