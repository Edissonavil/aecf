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

# Crear servidor HTTP simple
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
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  let pathname = url.parse(req.url).pathname;
  
  // Para SPA, servir index.html para rutas que no existen
  let filePath = path.join(BUILD_PATH, pathname);
  
  // Si es un directorio o no existe, servir index.html
  try {
    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      filePath = path.join(BUILD_PATH, 'index.html');
    }
  } catch (error) {
    filePath = path.join(BUILD_PATH, 'index.html');
  }
  
  const ext = path.parse(filePath).ext;
  const mimeType = mimeTypes[ext] || 'text/html';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(\`Error reading file \${filePath}:\`, error);
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', (error) => {
  if (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
  console.log(\`Server running on 0.0.0.0:\${PORT}\`);
  console.log(\`Build path: \${BUILD_PATH}\`);
  
  // Verificar que el directorio build existe
  if (fs.existsSync(BUILD_PATH)) {
    console.log('Build directory found');
    const files = fs.readdirSync(BUILD_PATH);
    console.log('Files in build:', files);
  } else {
    console.error('Build directory not found!');
  }
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
EOF

# Copiar archivos build desde la etapa anterior
COPY --from=build /app/build ./build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]