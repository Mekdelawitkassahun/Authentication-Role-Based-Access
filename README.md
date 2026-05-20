# Scalable REST API + Frontend (Internshala Assignment)

This project includes:
- A **versioned Node.js/Express REST API** with JWT auth, role-based access, and notes CRUD
- A **basic React frontend** to test registration, login, protected dashboard access, and CRUD

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Joi, Swagger
- Frontend: React (Vite), Fetch API, localStorage token handling

## Folder Structure

- `backend/` - API server
- `frontend/` - test UI client

## Backend Features

- Auth APIs:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me` (protected)
- Role-based access:
  - user/admin roles
  - admin can view all notes
- Notes CRUD APIs:
  - `POST /api/v1/notes`
  - `GET /api/v1/notes`
  - `GET /api/v1/notes/:id`
  - `PUT /api/v1/notes/:id`
  - `DELETE /api/v1/notes/:id`
- API versioning:
  - all endpoints under `/api/v1`
- Validation and security:
  - Joi request validation
  - Password hashing with bcrypt
  - JWT authentication
  - Helmet, CORS, rate limiting, input sanitization
- API docs:
  - Swagger UI at `http://localhost:5000/api-docs`

## Setup Instructions

### 1) Backend

```bash
cd backend
cp .env.example .env
# update MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Database Schema

### User
- `name` (string, required)
- `email` (string, unique, required)
- `password` (string, hashed, required)
- `role` (enum: `user` | `admin`)

### Note
- `title` (string, required)
- `content` (string, required)
- `owner` (ObjectId ref to User)

## Scalability Note

To scale this system in production:
- Split into services (`auth-service`, `notes-service`, `gateway`) when traffic grows
- Add Redis for caching hot reads and token/session metadata where needed
- Add structured logging + centralized monitoring (ELK/Datadog)
- Run containers behind a load balancer with horizontal autoscaling
- Use background workers (queue) for async tasks (email, analytics, heavy processing)

## Optional Next Improvements

- Refresh-token flow with secure httpOnly cookies
- Automated tests (Jest + Supertest)
- Docker compose for API + MongoDB + frontend
- CI/CD pipeline for lint/build/test/deploy
