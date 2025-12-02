# Panduan Instalasi FinOpenPOS

Panduan lengkap instalasi dan konfigurasi FinOpenPOS untuk eksplorasi integrasi hardware POS. 

## 📋 Daftar Isi

1.  [System Requirements](#system-requirements)
2. [Instalasi Node.js dan Tools](#instalasi-nodejs-dan-tools)
3. [Clone dan Setup FinOpenPOS](#clone-dan-setup-finopenpos)
4. [Konfigurasi Database (Supabase)](#konfigurasi-database)
5. [Modifikasi untuk Frontend-Only](#modifikasi-untuk-frontend-only)
6. [Running Development Server](#running-development-server)
7. [Build untuk Production](#build-untuk-production)

## 💻 System Requirements

### Minimum Requirements
```
OS: Windows 10/11, Ubuntu 20.04+, macOS 11+
RAM: 4 GB
Storage: 2 GB free space
Processor: Dual-core 2.0 GHz
Browser: Chrome 89+, Edge 89+ (untuk Web Serial API)
```

### Recommended Requirements
```
OS: Windows 11, Ubuntu 22.04, macOS 12+
RAM: 8 GB atau lebih
Storage: 5 GB free space (untuk development)
Processor: Quad-core 2.5 GHz atau lebih
Browser: Chrome/Edge latest version
```

### Hardware POS (untuk eksplorasi)
- ✅ Thermal Printer: BIXOLON SRP-E302
- ✅ Barcode Scanner: Zebra DS9308-SR
- 📋 Cash Drawer (optional)
- 📋 Customer Display (optional)

## 🔧 Instalasi Node.js dan Tools

### Windows

#### 1. Install Node.js
```powershell
# Download Node.js LTS dari website resmi
# https://nodejs.org/en/download/

# Atau gunakan Chocolatey
choco install nodejs-lts

# Verify instalasi
node --version  # Should show v18.x.x or v20.x.x
npm --version   # Should show 9.x.x or 10. x.x
```

#### 2. Install Git
```powershell
# Download dari https://git-scm.com/download/win
# Atau via Chocolatey
choco install git

# Verify
git --version
```

#### 3. Install Code Editor (VS Code)
```powershell
# Download dari https://code. visualstudio.com/
# Atau via Chocolatey
choco install vscode

# Recommended Extensions:
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - TypeScript and JavaScript Language Features
```

### Linux (Ubuntu/Debian)

#### 1. Install Node.js via NVM (recommended)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version
```

#### 2. Install Git
```bash
sudo apt update
sudo apt install git

# Verify
git --version
```

#### 3. Install VS Code
```bash
# Via Snap
sudo snap install --classic code

# Atau download . deb dari website
wget -O code.deb https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64
sudo dpkg -i code.deb
```

### macOS

#### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent. com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js
```bash
brew install node@20

# Verify
node --version
npm --version
```

#### 3. Install Git
```bash
brew install git

# Verify
git --version
```

#### 4. Install VS Code
```bash
brew install --cask visual-studio-code
```

## 📦 Clone dan Setup FinOpenPOS

### 1. Fork Repository (Recommended)

```bash
# Fork dulu di GitHub: https://github.com/JoaoHenriqueBarbosa/FinOpenPOS
# Klik tombol "Fork" di kanan atas

# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/FinOpenPOS. git
cd FinOpenPOS
```

### 2.  Atau Clone Original Repository

```bash
git clone https://github.com/JoaoHenriqueBarbosa/FinOpenPOS. git
cd FinOpenPOS
```

### 3. Install Dependencies

```bash
# Gunakan npm
npm install

# Atau yarn
yarn install

# Atau pnpm (faster)
pnpm install
```

**Troubleshooting Install:**
```bash
# Jika ada error, coba clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Atau update npm
npm install -g npm@latest
```

### 4. Check Project Structure

```bash
FinOpenPOS/
├── src/
│   ├── app/              # Next.js 13+ App Router
│   │   ├── page.tsx      # Homepage
│   │   ├── layout.tsx    # Root layout
│   │   └── ... 
│   ├── components/       # React components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── ...
│   ├── lib/             # Utilities
│   │   ├── supabase/    # Supabase client
│   │   └── ... 
│   └── types/           # TypeScript types
├── public/              # Static files
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## 🗄️ Konfigurasi Database

FinOpenPOS menggunakan **Supabase** sebagai backend.  Ada 2 opsi:

### Opsi 1: Gunakan Supabase (Online)

#### 1. Buat Akun Supabase
```
1. Kunjungi https://supabase.com
2. Sign up dengan GitHub/Google
3. Buat project baru:
   - Project name: finopenpos-dev
   - Database password: [generate strong password]
   - Region: Southeast Asia (Singapore) - untuk Indonesia
```

#### 2. Setup Database Schema
```sql
-- Jalankan di Supabase SQL Editor

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  barcode VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes untuk performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

#### 3. Get API Keys
```
1. Go to Project Settings > API
2. Copy:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)
```

#### 4. Setup Environment Variables
```bash
# Copy template
cp .env.example .env. local

# Edit .env.local
nano .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Opsi 2: Frontend-Only dengan LocalStorage (Offline)

Untuk eksplorasi hardware tanpa dependency online:

#### 1.  Buat Local Storage Service

```typescript
// src/lib/storage/local-storage.ts
export class LocalStorageDB {
  private readonly PRODUCTS_KEY = 'finopenpos_products';
  private readonly ORDERS_KEY = 'finopenpos_orders';
  private readonly CUSTOMERS_KEY = 'finopenpos_customers';

  // Products
  getProducts() {
    const data = localStorage.getItem(this. PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveProducts(products: any[]) {
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  addProduct(product: any) {
    const products = this.getProducts();
    products.push({ ...product, id: crypto.randomUUID() });
    this.saveProducts(products);
  }

  // Orders
  getOrders() {
    const data = localStorage.getItem(this.ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveOrder(order: any) {
    const orders = this.getOrders();
    orders.push({ ... order, id: crypto.randomUUID(), created_at: new Date() });
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  // Customers
  getCustomers() {
    const data = localStorage. getItem(this.CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  }
}

export const localDB = new LocalStorageDB();
```

#### 2. Populate Sample Data

```typescript
// src/lib/storage/seed-data.ts
import { localDB } from './local-storage';

export function seedSampleData() {
  const sampleProducts = [
    {
      name: 'Indomie Goreng',
      price: 3000,
      stock: 100,
      barcode: '8992388100001',
      category: 'Makanan',
    },
    {
      name: 'Aqua 600ml',
      price: 3500,
      stock: 50,
      barcode: '8993199103682',
      category: 'Minuman',
    },
    {
      name: 'Teh Botol Sosro',
      price: 4500,
      stock: 30,
      barcode: '8992770010016',
      category: 'Minuman',
    },
    {
      name: 'Mie Sedaap Goreng',
      price: 3200,
      stock: 80,
      barcode: '8991002100015',
      category: 'Makanan',
    },
  ];

  sampleProducts.forEach(product => localDB.addProduct(product));
  console.log('✅ Sample data loaded');
}
```

#### 3. Environment untuk Local Mode

```env
# .env.local
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

## 🚀 Running Development Server

### 1. Start Dev Server

```bash
# Development mode
npm run dev

# Atau dengan turbo (faster)
npm run dev -- --turbo
```

### 2. Access Application

```
Browser: http://localhost:3000
```

### 3. Initial Setup

```
1. Buka http://localhost:3000
2.  Jika pakai LocalStorage, load sample data
3. Explore fitur POS:
   - Product Management
   - Create Order
   - Invoice
```

## 🏗️ Build untuk Production

### 1. Build Application

```bash
# Build untuk production
npm run build

# Check build output
ls -la . next/
```

### 2. Run Production Server

```bash
# Start production server
npm run start

# Access di http://localhost:3000
```

### 3. Export Static Site (Optional)

Untuk deploy tanpa Node.js server:

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

```bash
# Build static
npm run build

# Output ada di folder 'out/'
# Deploy folder 'out/' ke static hosting
```

## 🧪 Testing Installation

### 1. Run Tests
```bash
# Jika ada test suite
npm run test
```

### 2.  Lint Check
```bash
npm run lint
```

### 3. Type Check
```bash
npx tsc --noEmit
```

## 🔍 Verify Hardware Access

### Test Web Serial API (Thermal Printer)

```html
<!-- test-serial.html -->
<! DOCTYPE html>
<html>
<body>
  <button onclick="testSerial()">Test Serial Access</button>
  <script>
    async function testSerial() {
      if ('serial' in navigator) {
        alert('✅ Web Serial API supported! ');
        try {
          const port = await navigator.serial.requestPort();
          alert('✅ Port selected! ');
        } catch (e) {
          alert('❌ ' + e.message);
        }
      } else {
        alert('❌ Web Serial API not supported');
      }
    }
  </script>
</body>
</html>
```

Buka di Chrome: http://localhost:3000/test-serial. html

### Test HID (Barcode Scanner)

```
1. Hubungkan Zebra DS9308-SR via USB
2. Buka Notepad
3. Scan barcode apapun
4. Data muncul = ✅ Scanner ready
```

## ✅ Installation Checklist

- [ ] Node.js v18+ terinstall
- [ ] Git terinstall
- [ ] FinOpenPOS repository di-clone
- [ ] Dependencies terinstall (`npm install`)
- [ ] Database setup (Supabase atau LocalStorage)
- [ ] Environment variables configured (`. env.local`)
- [ ] Dev server running (`npm run dev`)
- [ ] Aplikasi accessible di http://localhost:3000
- [ ] Chrome/Edge browser ready (untuk Web Serial API)
- [ ] Hardware POS terhubung (printer & scanner)

## 🆘 Troubleshooting

### Port 3000 Already in Use
```bash
# Windows - kill process
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Atau gunakan port lain
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Supabase Connection Error
```bash
# Check . env.local
cat .env.local

# Verify URL dan keys benar
# Pastikan tidak ada trailing slash di URL
```

### TypeScript Errors
```bash
# Regenerate types
npm run build

# Check tsconfig.json
cat tsconfig. json
```

## 📚 Next Steps

Setelah instalasi berhasil:

1. **[Integrasi Thermal Printer](../thermal-printer/integration-guide.md)** - Setup BIXOLON SRP-E302
2. **[Integrasi Barcode Scanner](../barcode-scanner/integration-guide.md)** - Setup Zebra DS9308-SR
3. **[Customize POS](./customization-guide.md)** - Sesuaikan dengan kebutuhan toko

## 🔗 Resources

- [FinOpenPOS GitHub](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

---

**Status:** ✅ Ready untuk eksplorasi hardware POS
**Next:** [Integration Guide](../thermal-printer/integration-guide.md)