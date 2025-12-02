# Deployment Guide - FinOpenPOS dengan Hardware Support

Panduan deploy FinOpenPOS untuk production environment dengan support thermal printer dan barcode scanner.

## 📋 Daftar Isi

1.  [Deployment Options](#deployment-options)
2.  [Local Server Deployment](#local-server-deployment)
3. [Vercel Deployment (Cloud)](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Considerations untuk Hardware](#considerations-hardware)

## 🚀 Deployment Options

### Comparison Table

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Local Server** | Full hardware access, No internet needed, Fast | Perlu maintain server | Toko fisik |
| **Vercel/Netlify** | Easy setup, Auto-scaling, Free tier | Perlu internet untuk hardware | Demo/Testing |
| **Docker** | Portable, Consistent env | Complex setup | Multi-store |
| **Electron App** | Desktop app, Full hardware | Large bundle size | Standalone POS |

## 💻 Local Server Deployment

### Option 1: PM2 (Recommended untuk Production)

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Build Production
```bash
cd FinOpenPOS
npm run build
```

#### 3. Create PM2 Config
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'finopenpos',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/FinOpenPOS',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
};
```

#### 4. Start dengan PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 5. Check Status
```bash
pm2 status
pm2 logs finopenpos
pm2 monit
```

#### 6. Access via Local Network
```bash
# Find local IP
ipconfig  # Windows
ip addr   # Linux

# Access dari device lain:
http://192.168.1.100:3000

# ⚠️ Web Serial API tidak akan work via IP
# Harus pakai localhost atau HTTPS
```

### Option 2: Windows Service

#### 1. Install node-windows
```bash
npm install -g node-windows
```

#### 2. Create Service Script
```javascript
// install-service.js
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'FinOpenPOS',
  description: 'Point of Sale System',
  script: 'C:\\path\\to\\FinOpenPOS\\node_modules\\next\\dist\\bin\\next',
  scriptOptions: 'start',
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});

svc.on('install', () => {
  svc.start();
});

svc.install();
```

#### 3.  Install Service
```bash
node install-service.js
```

#### 4.  Manage Service
```powershell
# Via Services. msc
Win + R → services.msc → Find "FinOpenPOS"

# Start/Stop
sc start FinOpenPOS
sc stop FinOpenPOS
```

### Option 3: Linux Systemd Service

#### 1. Create Service File
```bash
sudo nano /etc/systemd/system/finopenpos.service
```

```ini
[Unit]
Description=FinOpenPOS Service
After=network.target

[Service]
Type=simple
User=pos
WorkingDirectory=/home/pos/FinOpenPOS
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

#### 2. Enable & Start
```bash
sudo systemctl daemon-reload
sudo systemctl enable finopenpos
sudo systemctl start finopenpos
sudo systemctl status finopenpos
```

#### 3. View Logs
```bash
sudo journalctl -u finopenpos -f
```

## ☁️ Vercel Deployment

### Setup untuk Demo (Tanpa Hardware)

#### 1.  Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
cd FinOpenPOS
vercel

# Follow prompts:
# - Link to project: Yes
# - Framework: Next.js (auto-detected)
# - Build command: npm run build
```

#### 3. Set Environment Variables
```bash
# Via Vercel Dashboard
Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

#### 4. Production Domain
```bash
vercel --prod

# Your site: https://finopenpos.vercel.app
```

### ⚠️ Hardware Limitations di Vercel

```
❌ Web Serial API memerlukan HTTPS
✅ Vercel menyediakan HTTPS otomatis
❌ Tapi tidak bisa akses USB device dari cloud server

Solusi:
1. Deploy di Vercel untuk demo/UI
2. Jalankan local server untuk hardware access
3. Atau gunakan hybrid approach (UI di cloud, printer via local)
```

### Hybrid Deployment (Cloud UI + Local Hardware)

```typescript
// src/lib/printer-proxy.ts
// Local server bertindak sebagai printer proxy

// Local server (http://localhost:4000)
const express = require('express');
const app = express();

app.post('/api/print', async (req, res) => {
  const receiptData = req.body;
  await printerService.printReceipt(receiptData);
  res. json({ success: true });
});

app.listen(4000);

// Vercel app (https://finopenpos.vercel.app)
async function printReceipt(data) {
  await fetch('http://localhost:4000/api/print', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .  .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/. next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static . /.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server. js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  finopenpos:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY}
    devices:
      - /dev/bus/usb:/dev/bus/usb  # USB access untuk printer
    privileged: true  # Needed untuk hardware access
    restart: unless-stopped
```

### Build & Run

```bash
# Build
docker build -t finopenpos . 

# Run
docker run -p 3000:3000 \
  --device=/dev/bus/usb \
  --privileged \
  finopenpos

# Atau via compose
docker-compose up -d
```

### Hardware Access di Docker

```bash
# List USB devices
lsusb

# Give permissions
sudo chmod a+rw /dev/bus/usb/001/005  # Adjust path

# Add user to groups
sudo usermod -a -G dialout $USER
```

## 🔒 Considerations untuk Hardware

### 1.  HTTPS Requirement

**Problem:** Web Serial API butuh HTTPS, tapi localhost printer tidak accessible dari remote. 

**Solutions:**

#### A. Self-Signed Certificate (Development)
```bash
# Generate cert
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Next.js dengan HTTPS
npm install --save-dev https
```

```javascript
// server.js
const https = require('https');
const fs = require('fs');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

app.prepare().then(() => {
  https.createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, () => {
    console.log('> Ready on https://localhost:3000');
  });
});
```

#### B. Ngrok Tunnel (Quick Test)
```bash
npx ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

#### C. Local Certificate Authority
```bash
# Install mkcert
brew install mkcert  # Mac
choco install mkcert # Windows

# Create local CA
mkcert -install

# Generate cert
mkcert localhost 127.0.0.1 ::1

# Use dalam Next.js server
```

### 2. Multi-Terminal Setup

Untuk toko dengan beberapa kasir:

```
┌─────────────────┐
│   Server PC     │
│  (FinOpenPOS)   │
│  192.168.1.100  │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│Kasir 1│ │Kasir2│ │Kasir3│ │Kasir4│
│+Print │ │+Print│ │+Print│ │+Print│
└───────┘ └──────┘ └──────┘ └──────┘
```

**Setup:**
- Server PC menjalankan FinOpenPOS
- Setiap kasir akses via browser
- Printer terhubung USB ke masing-masing terminal
- Barcode scanner USB HID mode

**Issue:** Web Serial API hanya work di localhost, bukan remote IP.

**Solution:** 
```
Option 1: Setiap terminal install FinOpenPOS local
Option 2: Gunakan printer proxy service (API)
Option 3: Use Electron app dengan hardware access
```

### 3.  Auto-Start di Boot

#### Windows
```bash
# Create shortcut di Startup folder
Win + R → shell:startup

# Atau Task Scheduler
taskschd.msc
→ Create Basic Task
→ Start a program: npm start
→ Working directory: C:\FinOpenPOS
```

#### Linux
```bash
# Via crontab
crontab -e

# Add:
@reboot cd /home/pos/FinOpenPOS && npm start
```

## 📊 Monitoring & Maintenance

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date(). toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
```

### Log Rotation

```bash
# PM2 automatic log rotation
pm2 install pm2-logrotate

pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Backup Database

```bash
# Jika pakai Supabase: Automatic backup di dashboard

# Jika pakai LocalStorage: Backup script
#!/bin/bash
BACKUP_DIR="/backup/pos"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup localStorage data
cp ~/. config/Chromium/Default/Local\ Storage/leveldb/* \
   $BACKUP_DIR/localstorage_$DATE/
```

## ✅ Deployment Checklist

- [ ] Production build tested (`npm run build && npm start`)
- [ ] Environment variables set
- [ ] Database configured & seeded
- [ ] HTTPS setup untuk Web Serial API
- [ ] Hardware permissions configured
- [ ] Auto-start on boot enabled
- [ ] Monitoring setup (PM2/systemd)
- [ ] Backup strategy implemented
- [ ] Firewall rules configured (jika expose ke network)
- [ ] Documentation updated untuk team

## 🔗 Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

**Next:** [Testing Guide](./testing-guide.md)