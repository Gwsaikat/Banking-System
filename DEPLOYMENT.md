# Deployment notes

## Vercel full-stack deployment (recommended)

Deploy from the repository root so Vercel reads the root `vercel.json`. The root deployment serves:

- the React/Vite app from `frontend/dist`
- the Express API under `/api/*` through `backend/api/index.js`

Required backend environment variables should be configured in the Vercel project settings, for example:

- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`

## Vercel React/static-only deployment

If you choose the `frontend` folder as a separate React/Vite app, Vercel must use `frontend/vercel.json` so browser refreshes and deep links such as `/transactions`, `/admin/users`, and `/ai-chat` rewrite to `index.html` instead of returning `404: NOT_FOUND`.

For a separate frontend deployment, the API is not bundled with the static React app. Set this frontend environment variable to the deployed backend URL:

```bash
VITE_API_URL=https://your-backend-domain.example.com/api
```

Vite only exposes browser-side environment variables that start with `VITE_`, so importing backend variables like `MONGO_URI`, `JWT_SECRET`, or `GEMINI_API_KEY` into a React-only service will not make API calls work. Those variables belong on the backend deployment.
