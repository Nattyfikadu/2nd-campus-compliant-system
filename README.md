
## Campus Complaint System – Project Structure

This project is split into **frontend (React)** and **backend (Node + MongoDB)** so that the responsibilities are clearly separated.

### Frontend (web client)

- **Location**: `frontend/` (code is in `frontend/` + `src/`)
- Built with **React + Vite**
- Main entry HTML: `frontend/index.html`
- App entry file: `src/main.tsx`
- Dashboards, pages and UI live in `src/app/...`

**Commands (run inside `frontend/`):**

- Install deps: `cd frontend && npm install`
- Start dev server: `cd frontend && npm run dev`

### Backend (API server)

- **Location**: `server/` (backend)
- Built with **Node.js, Express, Mongoose, MongoDB**
- Entry file: `server/index.js`
- Environment config: `server/.env` (use `server/.env.example` as a template)

**Commands (run inside `server/`):**

- Install deps: `cd server && npm install`
- Start API server: `cd server && npm start`

The frontend will later call the backend’s REST APIs (e.g. `http://localhost:4000/api/...`) to store and read complaints from MongoDB.
  