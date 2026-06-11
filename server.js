const express = require('express');
const http = require('http');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const TOOLS = {
  jupyter: { container: 'omnibioai-jupyter', port: 8888 },
  rstudio: { container: 'omnibioai-rstudio', port: 8787 },
  vscode:  { container: 'omnibioai-vscode',  port: 8083 },
};

function dockerRequest(method, path) {
  return new Promise((resolve, reject) => {
    const opts = {
      socketPath: '/var/run/docker.sock',
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

app.get('/api/launcher/status/:tool', async (req, res) => {
  const tool = TOOLS[req.params.tool];
  if (!tool) return res.status(400).json({ error: 'unknown tool' });
  try {
    const r = await dockerRequest('GET', `/containers/${tool.container}/json`);
    if (r.status === 404) return res.json({ status: 'stopped' });
    const state = r.body?.State?.Status || 'stopped';
    res.json({ status: state });
  } catch {
    res.json({ status: 'stopped' });
  }
});

app.post('/api/launcher/start/:tool', async (req, res) => {
  const tool = TOOLS[req.params.tool];
  if (!tool) return res.status(400).json({ error: 'unknown tool' });
  try {
    await dockerRequest('POST', `/containers/${tool.container}/start`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/launcher/stop/:tool', async (req, res) => {
  const tool = TOOLS[req.params.tool];
  if (!tool) return res.status(400).json({ error: 'unknown tool' });
  try {
    await dockerRequest('POST', `/containers/${tool.container}/stop`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, '0.0.0.0', () => console.log('launcher api listening on 0.0.0.0:3001'));
