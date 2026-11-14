# To-Do List App (MERN)

A mobile-first to-do list where tasks are scheduled by date & time and organised into Monday–Sunday weeks, with open / completed counts for every week.

- **Live app:** _coming soon_
- **API:** _coming soon_

## Features

- **Create, edit and delete tasks** – title (required), description, date, start/end time and priority (Low / Medium / High).
- **Mark tasks as Completed or In Progress** with the checkbox – the week's counts and progress bar update straight away.
- **Home screen** – week day picker (with previous / next week), Task Complete / Task Pending cards, weekly progress bar and the tasks of the selected day.
- **All Weeks** (`View All`) – one card per week showing open and completed tasks; tap a card to expand it and see its tasks.
- **Swipe left** on a task to reveal **Delete** (or use the trash icon, which asks for confirmation).
- **Search** tasks by keywords in the title or description, and view / edit / delete them from the results.
- Tap a task to see its details (description, time, status).

## Tech stack

| Part     | Tech                                             |
| -------- | ------------------------------------------------ |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router    |
| Backend  | Node.js, Express 5, Mongoose                     |
| Database | MongoDB (Atlas)                                  |
| Tests    | Jest + Supertest                                 |

## Project structure

```
client/                 React app
  src/api/              API client
  src/components/       TaskItem, TaskSheet, WeekStrip, SummaryCards …
  src/context/          App-wide state (sheet, confirm dialog, toasts)
  src/pages/            Onboarding, Home, Search, Weeks
  src/utils/            Date helpers
server/                 Express API
  src/models/Task.js    Mongoose schema
  src/controllers/      Route handlers
  src/utils/validate.js Request validation
  tests/                API tests
```

## Running locally

Requirements: Node.js 18+ and a MongoDB connection string (local MongoDB or a free Atlas cluster).

**1. API**

```bash
cd server
cp .env.example .env    # then set MONGODB_URI
npm install
npm run dev             # http://localhost:5000
```

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev             # http://localhost:5173
```

In development the Vite dev server forwards `/api` requests to `localhost:5000`, so no extra config is needed.

**Tests**

```bash
cd server
npm test
```

## API

Base URL: `/api`

| Method | Endpoint                 | Description                                                      |
| ------ | ------------------------ | ---------------------------------------------------------------- |
| GET    | `/tasks`                 | List tasks. Query: `search`, `from`, `to` (ISO dates), `status`  |
| GET    | `/tasks/weeks`           | Open / completed counts per Monday–Sunday week. Query: `tz`      |
| GET    | `/tasks/:id`             | Get one task                                                     |
| POST   | `/tasks`                 | Create a task                                                    |
| PUT    | `/tasks/:id`             | Update title, description, dueDate, endDate or priority          |
| PATCH  | `/tasks/:id/status`      | Set status to `In Progress` or `Completed`                       |
| DELETE | `/tasks/:id`             | Delete a task                                                    |

Example task:

```json
{
  "id": "6736a1f0c2a4b1e5d8f0a123",
  "title": "Doing Homework",
  "description": "Maths chapter 4",
  "dueDate": "2026-11-14T11:00:00.000Z",
  "endDate": "2026-11-14T11:45:00.000Z",
  "priority": "High",
  "status": "In Progress",
  "createdAt": "2026-11-14T08:12:00.000Z",
  "updatedAt": "2026-11-14T08:12:00.000Z"
}
```

Validation errors return `400` with the problem fields:

```json
{ "message": "Validation failed", "errors": { "title": "Title is required" } }
```

### Weeks and time zones

Weeks start on Monday. Because "which week is this task in" depends on where the user is, the client sends its time zone (`tz`, e.g. `Asia/Kolkata`) and MongoDB groups tasks with `$dateTrunc` in that time zone.

## Deployment

- **API → Render** (web service, root directory `server`, build `npm install`, start `npm start`). Environment variables: `MONGODB_URI`, `CLIENT_URL` (the Netlify URL, used for CORS).
- **Frontend → Netlify** (base directory `client`, build `npm run build`, publish `client/dist`). Environment variable: `VITE_API_URL` = `https://<render-app>.onrender.com/api`. `public/_redirects` makes page refreshes work on client-side routes.
