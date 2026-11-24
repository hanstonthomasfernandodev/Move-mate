# MoveMate 🖐️

AI-Powered Motor Coordination Training Platform for children.

## Project Structure

```
movemate/
├── frontend/          # React + Vite app (deploy to Vercel)
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── index.html     # Entry HTML
│   ├── vite.config.ts # Vite configuration
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js server (deploy to Render)
│   ├── server.js      # Static file server
│   └── package.json   # Backend dependencies
└── package.json       # Root scripts for local dev
```

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend concurrently
npm run dev
```

Or run them separately:

```bash
# Frontend only (port 5173)
cd frontend && npm run dev

# Backend only (port 3001)
cd backend && npm run dev
```

### Build

```bash
# Build the frontend
cd frontend && npm run build
```

## Deployment

### Frontend → Vercel

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. **Configure the project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy!

> **Note:** Vercel auto-detects Vite projects. Just set the root directory to `frontend`.

### Backend → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. **Configure the service:**
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Port:** 3001
4. Deploy!

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend:** Node.js HTTP server
- **Hand Tracking:** MediaPipe Tasks Vision

## License

ISC
