import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Vite plugin to handle local persistence to sent_status.json on disk
function statusPersistencePlugin() {
  const statusFile = path.resolve(__dirname, 'sent_status.json');

  return {
    name: 'status-persistence-plugin',
    configureServer(server) {
      // GET /api/status
      server.middlewares.use((req, res, next) => {
        if (req.method === 'GET' && req.url === '/api/status') {
          res.setHeader('Content-Type', 'application/json');
          if (fs.existsSync(statusFile)) {
            const content = fs.readFileSync(statusFile, 'utf-8');
            res.end(content || JSON.stringify({ sentIds: [], customHonorifics: {}, lastUpdated: null }));
          } else {
            res.end(JSON.stringify({ sentIds: [], customHonorifics: {}, lastUpdated: null }));
          }
          return;
        }

        // POST /api/status
        if (req.method === 'POST' && req.url === '/api/status') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(statusFile, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: parsed.sentIds?.length || 0 }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), statusPersistencePlugin()],
  server: {
    port: 5173,
    open: false
  }
});
