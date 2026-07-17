# Zeus Hello World

A tiny Node.js (Express) app for testing your Zeus pipeline end to end: **build an image
from a Git repo → deploy it to a cluster → put DNS in front of it**.

It serves a single welcome page showing non-sensitive runtime info (pod name, namespace,
Node.js version, uptime) plus a `/health` endpoint.

## Deploy it with Zeus

1. **Create a service** in Zeus and set the build settings:
   - **GitHub Repo URL**: this repository's URL
   - **Default Branch**: `main`
   - **Image Name**: `zeus-hello-world` (or anything you like)
2. **Build the image.** Zeus clones the repo, builds the root `Dockerfile`, and pushes
   the image to your registry.
3. **Deploy to a cluster.** The container listens on port **3000** — set
   `containerPort: 3000` on the service, and point the health check at
   `GET /health` on the same port.
4. **Set up DNS / ingress** for the service and open it in your browser. If everything
   worked you'll see the welcome page — served by your own cluster.

## Run it locally

```bash
npm install
npm start
# → http://localhost:3000
```

## Endpoints

| Path      | What it returns                          |
|-----------|------------------------------------------|
| `/`       | Welcome page with runtime/cluster info   |
| `/health` | `{ "status": "ok", "uptime": "..." }`    |

The app listens on port `3000` by default (override with the `PORT` env var).
