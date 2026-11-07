# EcoSphere

EcoSphere is a free air quality dashboard for Delhi NCR. It shows particulate readings from local stations and explains what the AQI bands mean. You can explore the dashboard without an account.

- **Dashboard** pulls station readings from OpenAQ and uses Open-Meteo weather forecasts to estimate a better time to go outside. If station data is unavailable, the dashboard labels the example readings as synthetic.
- **Planetary Spheres** is an interactive gallery of environmental exhibits with example data.
- **Your account** saves locations and alert preferences. Alert delivery is still pending. Check the dashboard on seven different days while signed in to earn the Baseline Observer badge.

## Run locally

From the repository root, run these commands and open [localhost:3000](http://localhost:3000).

```sh
cd frontend
npm ci
npm run dev
```

The public pages work in guest mode. To enable live AQI and account features, add the relevant values to `frontend/.env.local`.

| Variable | What it enables |
| --- | --- |
| `OPENAQ_API_KEY` | Live station readings |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` | Sign-in with Clerk |
| `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Saved locations, preferences and badge progress |

For account features, connect Clerk to Supabase and apply the SQL files in `supabase/migrations` in order.

## Deploy

Import the repository into Vercel, set the root directory to `frontend`, and add the environment variables there. Next.js serves both the website and its AQI API routes. See [the deployment guide](GIT_AND_DEPLOY.md) for the full setup.
