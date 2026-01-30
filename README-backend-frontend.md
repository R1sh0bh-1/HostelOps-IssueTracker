## HostelOps Issue Tracker – Running Backend & Frontend

### 1. Backend (Express + MongoDB + JWT)

**Path:** `Back-end`

1. Copy env template and configure:

```bash
cd Back-end
cp env.example .env
```

2. Open `.env` and set:

- **MongoDB Atlas (recommended)**  
  Replace with your Atlas string:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority&appName=<appName>
```

Example (pre-filled in `env.example`):

```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/hostelops_issue_tracker?retryWrites=true&w=majority&appName=HostelOps
```

3. Install dependencies and run dev server:

```bash
cd Back-end
npm install
npm run dev
```

Backend will listen on `http://localhost:5000` by default.

An initial **management admin** user is seeded automatically:

- Email: `admin@hostel.edu`
- Password: `warden123`

You can log in with these credentials or use the “Quick Login as Warden (Dev Only)” button in the UI.

---

### 2. Frontend (Vite React)

**Path:** `Front-end`

1. Copy env template:

```bash
cd Front-end
cp env.example .env
```

2. Make sure `VITE_API_BASE_URL` matches your backend URL, e.g.:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

3. Install dependencies and start Vite dev server:

```bash
cd Front-end
npm install
npm run dev
```

Frontend runs on `http://localhost:8080` (see `vite.config.ts`).

---

### 3. Auth & API Integration Notes

- Login/signup talk to:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `GET /api/auth/me`
- A JWT is stored in `localStorage` under `authToken`, and automatically attached as a `Bearer` token by the frontend API client.
- Issue and thread services call:
  - Issues:
    - `GET /api/issues`
    - `GET /api/issues/:id`
    - `POST /api/issues`
    - `PATCH /api/issues/:id/status`
  - Threads:
    - `GET /api/threads`
    - `GET /api/threads/issue/:issueId`
    - `POST /api/threads`
    - `POST /api/threads/:threadId/comments`
    - `PATCH /api/threads/:threadId/resolve`
    - `PATCH /api/threads/:threadId/block`
    - `PATCH /api/threads/:threadId/unblock`
    - `PATCH /api/threads/:threadId/comments/:commentId/block`
    - `PATCH /api/threads/:threadId/comments/:commentId/unblock`

