# ---------- Build Stage ----------
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime Stage ----------
FROM node:18-alpine
WORKDIR /app

# Crear servidor HTTP simple sin dependencias externas
COPY <<EOF /app/server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const BUILD_PATH = path.join(__dirname, 'build');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  console.log(\`\${req.method} \${req.url}\`);
  
  let pathname = url.parse(req.url).pathname;
  
  // Para SPA, servir index.html para rutas que no existen
  let filePath = path.join(BUILD_PATH, pathname);
  
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
    filePath = path.join(BUILD_PATH, 'index.html');
  }
  
  const ext = path.parse(filePath).ext;
  const mimeType = mimeTypes[ext] || 'text/html';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on 0.0.0.0:\${PORT}\`);
});
EOF

# Copiar archivos build
COPY --from=build /app/build ./build

EXPOSE $PORT

CMD ["node", "server.js"]