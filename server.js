const express = require('express');
const os = require('os');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const startedAt = Date.now();

const LOGO = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="Zeus logo">
  <rect width="32" height="32" rx="7" fill="#000000" stroke="#27272a"/>
  <path d="M18.5 5 9 17.5h5.5L13 27l10-13h-5.8z" fill="#7dd3fc"/>
</svg>`;

function readNamespace() {
  try {
    return fs
      .readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/namespace', 'utf8')
      .trim();
  } catch {
    return null;
  }
}

function uptime() {
  let s = Math.floor((Date.now() - startedAt) / 1000);
  const parts = [];
  const days = Math.floor(s / 86400);
  if (days) parts.push(`${days}d`);
  s %= 86400;
  const hours = Math.floor(s / 3600);
  if (hours || parts.length) parts.push(`${hours}h`);
  s %= 3600;
  const mins = Math.floor(s / 60);
  if (mins || parts.length) parts.push(`${mins}m`);
  parts.push(`${s % 60}s`);
  return parts.join(' ');
}

function info() {
  const inKubernetes = Boolean(process.env.KUBERNETES_SERVICE_HOST);
  return {
    pod: os.hostname(),
    namespace: readNamespace(),
    environment: inKubernetes ? 'Kubernetes' : 'Local',
    node: process.version,
    platform: `${os.type()} ${os.arch()}`,
    uptime: uptime(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: uptime() });
});

app.get('/', (req, res) => {
  const i = info();
  const tiles = [
    ['Pod', i.pod],
    ['Namespace', i.namespace || '—'],
    ['Environment', i.environment],
    ['Node.js', i.node],
    ['Platform', i.platform],
    ['Uptime', i.uptime],
  ]
    .map(
      ([label, value]) => `
      <div class="tile">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </div>`
    )
    .join('');

  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Zeus</title>
  <style>
    :root { color-scheme: dark; }
    * { margin: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: radial-gradient(1100px 700px at 75% -10%, rgba(12, 74, 110, 0.35), transparent 60%),
                  radial-gradient(900px 600px at -10% 110%, rgba(12, 74, 110, 0.18), transparent 60%),
                  #09090b;
      color: #e4e4e7;
    }
    .card {
      width: 100%;
      max-width: 660px;
      background: rgba(24, 24, 27, 0.85);
      border: 1px solid #27272a;
      border-radius: 18px;
      padding: 44px 40px;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(8px);
    }
    .brand { display: flex; align-items: center; gap: 18px; }
    .brand svg { width: 60px; height: 60px; flex: none; border-radius: 13px; }
    h1 { font-size: clamp(26px, 5vw, 34px); font-weight: 700; letter-spacing: -0.02em; }
    h1 span {
      background: linear-gradient(90deg, #7dd3fc, #38bdf8);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .sub { margin-top: 6px; color: #a1a1aa; font-size: 15px; }
    .grid {
      margin-top: 32px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
    }
    .tile {
      background: rgba(9, 9, 11, 0.6);
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 14px 16px;
      min-width: 0;
    }
    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #71717a;
      margin-bottom: 4px;
    }
    .value {
      font-size: 15px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
    .footer {
      margin-top: 30px;
      padding-top: 18px;
      border-top: 1px solid #27272a;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 13px;
      color: #71717a;
    }
    .footer a { color: #7dd3fc; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    .ok { color: #4ade80; }
    @media (max-width: 480px) { .card { padding: 32px 24px; } }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand">
      ${LOGO}
      <div>
        <h1>Welcome to <span>Zeus</span></h1>
        <p class="sub">Your service was built, deployed, and served by your cluster. <span class="ok">&#9679; Live</span></p>
      </div>
    </div>
    <div class="grid">${tiles}</div>
    <div class="footer">
      <span>zeus-hello-world · the Zeus starter app</span>
      <a href="/health">/health</a>
    </div>
  </main>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`zeus-hello-world listening on port ${PORT}`);
});
