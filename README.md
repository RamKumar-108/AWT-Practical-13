# AWT Practical 13 — Live Task Board

A full-stack task board with a Next.js frontend, Express/Socket.IO backend, and MongoDB Atlas database. It includes five static sample tasks so you can preview the dashboard before the backend or database is ready.

## Folder structure

- `frontend/` — Next.js user interface and productivity donut chart
- `backend/` — Express API, Socket.IO events, and MongoDB models
- `.gitignore` — excludes environment files and generated dependencies

## Requirements

- Node.js 20 or later recommended
- MongoDB Atlas account, or another MongoDB connection string

## 1. Configure the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and set your real `MONGODB_URI`.
Keep your real `.env` out of GitHub. Set `FRONTEND_URL=http://localhost:3000` for local development.

Start the API:

```bash
npm run dev
```

It runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 2. Configure the frontend

In another terminal:

```bash
cd frontend
npm install
```

Copy `.env.local.example` to `.env.local`. For local development, it should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 3. Production build

From the frontend folder:

```bash
npm run build
npm start
```

## 4. Deploy

### MongoDB Atlas
Create a database/user and allow access from your deployment environment. Copy the connection string to Render as `MONGODB_URI`.

### Render backend
Create a Web Service from this repository:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `MONGODB_URI` = your Atlas connection string
  - `FRONTEND_URL` = your exact Vercel frontend origin (no trailing slash)

### Vercel frontend
Import the repository:
- Root directory: `frontend`
- Framework: Next.js
- Environment variable:
  - `NEXT_PUBLIC_API_URL` = your deployed Render service URL (for example, `https://your-service.onrender.com`, with no trailing slash)

Redeploy after changing environment variables. Update `FRONTEND_URL` in Render to the actual Vercel origin.

## API endpoints

- `GET /api/health` — service/database status
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create task, JSON body `{ "title": "Example task" }`
- `PATCH /api/tasks/:id` — toggle completion
- `DELETE /api/tasks/:id` — delete a task

## Notes

- `NEXT_PUBLIC_API_URL` is exposed in the browser; never put secrets in a `NEXT_PUBLIC_` variable.
- This educational starter has no login or per-user task separation. Do not use it for private data without adding authentication and authorization.
