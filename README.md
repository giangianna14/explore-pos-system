# 🛒 Eksplorasi Sistem POS dan Perangkat Pendukung

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Dokumentasi lengkap hasil Research and Development (R&D) untuk integrasi sistem POS open source dengan berbagai perangkat hardware pendukung. Panduan praktis untuk developers, UMKM, dan integrators.

---

## 📋 Daftar Isi

- [Overview](#-overview)
- [Sistem POS yang Digunakan](#-sistem-pos-yang-digunakan)
- [Perangkat Hardware](#-perangkat-hardware-yang-dieksplorasi)
- [Struktur Dokumentasi](#-struktur-dokumentasi-lengkap)
- [Quick Start](#-quick-start-guide)
- [Instalasi FinOpenPOS](#-instalasi-finopenpos)
- [Integrasi Hardware](#-integrasi-hardware)
- [Tech Stack](#-tech-stack)
- [Roadmap](#-roadmap)
- [Troubleshooting](#-troubleshooting)
- [Kontribusi](#-kontribusi)
- [Resources](#-resources)
- [FAQ](#-faq)
- [Lisensi](#-lisensi)
- [Credits](#-credits--acknowledgments)
- [Support](#-support--contact)

---

## 🎯 Overview

### Tujuan Proyek

1. **Eksplorasi Integrasi Hardware** - Mendokumentasikan cara menghubungkan berbagai perangkat POS dengan sistem kasir berbasis web
2. **Referensi Praktis** - Menyediakan panduan step-by-step yang dapat langsung dipraktikkan
3. **Open Source Solution** - Menggunakan teknologi open source yang dapat dimodifikasi sesuai kebutuhan
4. **Pembelajaran Komunitas** - Berbagi pengetahuan untuk developer Indonesia yang ingin membuat sistem POS
5. **Production Ready** - Dokumentasi yang cukup lengkap untuk implementasi di lingkungan produksi

### Latar Belakang

Banyak UMKM dan developer Indonesia yang kesulitan menemukan dokumentasi lengkap tentang cara mengintegrasikan hardware POS (printer struk, scanner barcode, laci uang, dll) dengan sistem kasir modern berbasis web. Proyek ini hadir untuk menjembatani gap tersebut dengan menyediakan:

- ✅ Dokumentasi dalam Bahasa Indonesia
- ✅ Contoh kode yang dapat langsung digunakan
- ✅ Panduan troubleshooting untuk masalah umum
- ✅ Rekomendasi hardware dengan berbagai budget

### Target Pengguna

| Pengguna | Kebutuhan |
|----------|-----------|
| **Developers** | Referensi teknis untuk integrasi hardware POS |
| **UMKM** | Panduan setup sistem kasir dengan budget terjangkau |
| **Mahasiswa** | Materi pembelajaran untuk proyek/skripsi |
| **System Integrators** | Blueprint untuk deployment di klien |

---

## 🖥️ Sistem POS yang Digunakan

### FinOpenPOS sebagai Pilihan Utama

**[FinOpenPOS](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)** dipilih sebagai sistem POS utama karena memenuhi semua kriteria yang dibutuhkan untuk eksplorasi hardware.

#### Kriteria Pemilihan

| Kriteria | Requirement | FinOpenPOS |
|----------|-------------|------------|
| **Technology** | Modern JS Framework | ✅ Next.js 15 + React 19 |
| **Language** | TypeScript preferred | ✅ Full TypeScript |
| **Architecture** | Frontend-only capable | ✅ Dapat offline |
| **Core Modules** | Kasir, Products, Invoice | ✅ Lengkap |
| **Code Quality** | Clean, maintainable | ✅ Well-structured |
| **License** | Open Source | ✅ MIT License |
| **Dependencies** | Minimal vendor lock-in | ✅ Bebas vendor |
| **Hardware Compatible** | Web APIs support | ✅ Serial, USB HID |

#### Fitur Utama FinOpenPOS

- 🛒 **Point of Sale** - Interface kasir yang intuitif
- 📦 **Product Management** - CRUD produk dengan barcode support
- 🧾 **Invoice Generation** - Pembuatan invoice otomatis
- 👥 **Customer Management** - Database pelanggan
- 📊 **Reports** - Laporan penjualan
- 🌐 **Offline Capable** - Dapat berjalan tanpa internet
- 🎨 **Modern UI** - shadcn/ui + Tailwind CSS

#### Perbandingan dengan Alternatif Lain

| Fitur | FinOpenPOS | Point-of-sales-Nextjs | open-pos | point_of_sale |
|-------|------------|----------------------|----------|---------------|
| Framework | Next.js 15 | Next.js 12 | PHP Laravel | Vanilla JS |
| TypeScript | ✅ Full | ⚠️ Partial | ❌ No | ❌ No |
| Offline Mode | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| Hardware APIs | ✅ Web Serial | ❌ Limited | ⚠️ Server-side | ⚠️ Limited |
| UI Modern | ✅ shadcn/ui | ✅ Tailwind | ⚠️ Bootstrap | ❌ Basic |
| Active Development | ✅ Yes | ⚠️ Slow | ✅ Yes | ❌ Archived |

---

## 🔌 Perangkat Hardware yang Dieksplorasi

### 3.1 Thermal Printer - BIXOLON SRP-E302

<table>
<tr>
<td width="60%">

**Spesifikasi Hardware**

| Spesifikasi | Detail |
|-------------|--------|
| **Model** | BIXOLON SRP-E302 |
| **Print Width** | 80mm (3 inch) |
| **Print Speed** | 250 mm/sec |
| **Resolution** | 180 dpi |
| **Interface** | USB + Serial + Ethernet |
| **Auto-cutter** | Full & Partial cut |
| **Protocol** | ESC/POS compatible |
| **Cash Drawer Port** | RJ-11 (24V) |
| **Harga** | ± Rp 2.5 - 3 juta |

**Status: ✅ Fully Integrated**

</td>
<td width="40%">

**📚 Dokumentasi**

- [📖 README](./docs/03_thermal-printer/README.md)
- [⚙️ Setup Guide](./docs/03_thermal-printer/setup-guide.md)
- [🔗 Integration Guide](./docs/03_thermal-printer/integration-guide.md)
- [🔧 Troubleshooting](./docs/03_thermal-printer/troubleshooting.md)
- [💻 Code Examples](./examples/thermal-printer/)

**Issue:** [#1](https://github.com/giangianna14/explore-pos-system/issues/1)

</td>
</tr>
</table>

**Key Features:**
- ✅ Web Serial API connection
- ✅ ESC/POS command support
- ✅ Receipt formatting dengan bahasa Indonesia
- ✅ Barcode & QR Code printing
- ✅ Auto paper cut
- ✅ Cash drawer trigger via printer

---

### 3.2 Barcode Scanner - Zebra DS9308-SR

<table>
<tr>
<td width="60%">

**Spesifikasi Hardware**

| Spesifikasi | Detail |
|-------------|--------|
| **Model** | Zebra DS9308-SR (Standard Range) |
| **Type** | Digital Imager (CMOS) |
| **Scan Engine** | Omnidirectional |
| **Capability** | 1D & 2D Barcodes |
| **Scan Rate** | 60 scans/second |
| **Interface** | USB HID Keyboard Wedge |
| **Cable Length** | 2.9m (9.5 ft) |
| **Durability** | 1.5m drop to concrete |
| **Harga** | ± Rp 2 - 2.5 juta |

**Status: ✅ Fully Integrated**

</td>
<td width="40%">

**📚 Dokumentasi**

- [📖 README](./docs/02_barcode-scanner/README.md)
- [💻 Integration Guide](./docs/02_barcode-scanner/README.md#integration-guide)
- [🔧 Troubleshooting](./docs/02_barcode-scanner/README.md#troubleshooting)

</td>
</tr>
</table>

**Key Features:**
- ✅ Plug & Play (USB HID mode)
- ✅ No driver installation required
- ✅ Support EAN-13, UPC, Code 128, QR Code
- ✅ Screen barcode scanning (smartphone)
- ✅ Auto-trigger presentation mode
- ✅ Configurable suffix (Enter/Tab)

---

### 3.3 Cash Drawer

<table>
<tr>
<td width="60%">

**Spesifikasi Hardware**

| Spesifikasi | Detail |
|-------------|--------|
| **Connection** | RJ-11/RJ-12 via Thermal Printer |
| **Voltage** | 24V DC (via printer) |
| **Control** | ESC/POS drawer kick command |
| **Lock** | Key lock untuk manual override |
| **Compartments** | 4-5 bills, 4-5 coins |
| **Compatible Brands** | Star, APG, Generic |
| **Harga** | Rp 800 ribu - 3 juta |

**Status: ✅ Fully Integrated**

</td>
<td width="40%">

**📚 Dokumentasi**

- [📖 README](./docs/04_cash_drawer/README.md)
- [💻 Integration Guide](./docs/04_cash_drawer/README.md#integration-guide)
- [🔧 Troubleshooting](./docs/04_cash_drawer/README.md#troubleshooting)

</td>
</tr>
</table>

**Key Features:**
- ✅ Auto-open on transaction complete
- ✅ Manual open via button/API
- ✅ Audit trail logging
- ✅ Cash in/out tracking
- ✅ Shift management support
- ✅ Export logs untuk audit

---

### 3.4 VFD Display / Pole Display

<table>
<tr>
<td width="60%">

**Opsi 1: VFD Character Display**

| Spesifikasi | Detail |
|-------------|--------|
| **Type** | Vacuum Fluorescent Display |
| **Resolution** | 2 lines x 20 characters |
| **Interface** | USB Serial / RS-232 |
| **Brightness** | High visibility |
| **Harga** | Rp 1.5 - 3 juta |

**Opsi 2: Tablet sebagai Display**

| Spesifikasi | Detail |
|-------------|--------|
| **Type** | Android Tablet |
| **Size** | 7" - 10" |
| **Connection** | WiFi / Bluetooth |
| **Harga** | Rp 500 ribu - 1.5 juta |

**Status: ✅ Fully Documented**

</td>
<td width="40%">

**📚 Dokumentasi**

- [📖 README](./docs/05_vfd_display/README.md)
- [💻 VFD Commands](./docs/05_vfd_display/README.md#display-protocols)
- [🌐 Web Display](./docs/05_vfd_display/README.md#alternative-web-based-display-tablet)

</td>
</tr>
</table>

**Key Features:**
- ✅ Real-time product display
- ✅ Total calculation display
- ✅ Welcome/Thank you messages
- ✅ Promo message rotation
- ✅ BroadcastChannel API support
- ✅ Web-based alternative (tablet)

---

### 3.5 Secondary Monitor (Dual Display)

<table>
<tr>
<td width="60%">

**Setup Dual Monitor**

| Component | Options |
|-----------|---------|
| **Monitor Type** | LCD 15"-24" |
| **Resolution** | 1366x768 minimum |
| **Interface** | HDMI / VGA / DisplayPort |
| **Mounting** | VESA pole mount / desk stand |

**Hardware Options**

| Option | Description | Harga |
|--------|-------------|-------|
| Standard LCD | Basic monitor | Rp 1-3 juta |
| Touchscreen | Interactive display | Rp 2-5 juta |
| Portable | USB-C powered | Rp 1.5-2.5 juta |

**Status: ✅ Fully Documented**

</td>
<td width="40%">

**📚 Dokumentasi**

- [📖 README](./docs/06_secondary_monitor/README.md)
- [⚙️ OS Configuration](./docs/06_secondary_monitor/README.md#os-configuration)
- [🌐 Window Placement API](./docs/06_secondary_monitor/README.md#browser-dual-display)
- [💻 Implementation](./docs/06_secondary_monitor/README.md#implementation-guide)

</td>
</tr>
</table>

**Key Features:**
- ✅ Extended display mode
- ✅ Window Placement API support
- ✅ Customer-facing display page
- ✅ Real-time cart updates
- ✅ Idle/Scanning/Checkout states
- ✅ Promotional content display

---

## 📁 Struktur Dokumentasi Lengkap

```
explore-pos-system/
├── README.md                           # File ini - overview proyek
├── LICENSE                             # MIT License
├── CONTRIBUTING.md                     # Panduan kontribusi
│
├── docs/
│   ├── 01_finopenpos/
│   │   ├── installation-guide.md       # Instalasi FinOpenPOS
│   │   └── customization-guide.md      # Kustomisasi untuk hardware
│   │
│   ├── 02_barcode-scanner/
│   │   └── README.md                   # Zebra DS9308-SR integration
│   │
│   ├── 03_thermal-printer/
│   │   ├── README.md                   # Overview thermal printer
│   │   ├── setup-guide.md              # Setup BIXOLON SRP-E302
│   │   ├── integration-guide.md        # Integrasi dengan FinOpenPOS
│   │   └── troubleshooting.md          # Solusi masalah umum
│   │
│   ├── 04_cash_drawer/
│   │   └── README.md                   # Cash drawer integration
│   │
│   ├── 05_vfd_display/
│   │   └── README.md                   # VFD/Pole display setup
│   │
│   ├── 06_secondary_monitor/
│   │   └── README.md                   # Dual monitor configuration
│   │
│   ├── deployment-guide.md             # Deploy ke production
│   └── testing-guide.md                # Testing hardware & software
│
├── examples/
│   └── thermal-printer/
│       └── printer-service.ts          # Service untuk thermal printer
│
└── .github/
    ├── ISSUE_TEMPLATE/                 # Template untuk issue baru
    └── PULL_REQUEST_TEMPLATE.md        # Template untuk PR
```

---

## 🚀 Quick Start Guide

### Step 1: Clone FinOpenPOS

```bash
git clone https://github.com/JoaoHenriqueBarbosa/FinOpenPOS
cd FinOpenPOS
```

### Step 2: Setup Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local dengan konfigurasi Anda
```

### Step 3: Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Chrome/Edge.

### Step 4: Hubungkan Hardware

1. **Thermal Printer**: Hubungkan via USB, klik "Connect Printer" di POS
2. **Barcode Scanner**: Plug & Play - langsung scan ke input field
3. **Cash Drawer**: Hubungkan ke printer via RJ-11 cable

### Step 5: Test Hardware

```bash
# Test print
Klik tombol "Test Print" di settings

# Test scan
Scan barcode produk apapun

# Test drawer
Klik tombol "Open Drawer"
```

---

## 💻 Instalasi FinOpenPOS

### Option 1: Supabase (Online Database)

**1. Setup Supabase Project**

```bash
# Buat akun di https://supabase.com
# Buat project baru
# Copy URL dan anon key
```

**2. Setup Database Schema**

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  barcode VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for barcode search
CREATE INDEX idx_products_barcode ON products(barcode);
```

**3. Configure Environment**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: LocalStorage (Offline Mode)

**1. Enable Local Storage Mode**

```env
# .env.local
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

**2. Seed Sample Data**

```typescript
// Jalankan di browser console atau buat seed script
const sampleProducts = [
  { name: 'Indomie Goreng', price: 3000, barcode: '8992388100001' },
  { name: 'Aqua 600ml', price: 3500, barcode: '8993199103682' },
  { name: 'Teh Botol Sosro', price: 4500, barcode: '8992770010016' },
];

localStorage.setItem('products', JSON.stringify(sampleProducts));
```

📖 **Dokumentasi lengkap:** [Installation Guide](./docs/01_finopenpos/installation-guide.md)

---

## 🔗 Integrasi Hardware

### Thermal Printer Integration

**Step 1: Import Printer Service**

```typescript
import { printerService } from '@/services/printer/printer-service';
```

**Step 2: Connect to Printer**

```typescript
const handleConnect = async () => {
  const connected = await printerService.connect();
  if (connected) {
    console.log('✅ Printer connected!');
  }
};
```

**Step 3: Print Receipt**

```typescript
const receiptData = {
  storeName: 'TOKO SERBAGUNA',
  items: cart,
  total: calculateTotal(),
  paymentMethod: 'Tunai',
};

await printerService.printReceipt(receiptData);
```

**Step 4: Open Cash Drawer**

```typescript
await printerService.openCashDrawer();
```

📖 **Dokumentasi lengkap:** [Thermal Printer Integration](./docs/03_thermal-printer/integration-guide.md)

---

### Barcode Scanner Integration

**Step 1: Scanner sudah Plug & Play**

Scanner Zebra DS9308 bekerja sebagai keyboard - tidak perlu code khusus.

**Step 2: Setup Input Field dengan Auto-Submit**

```typescript
const [barcode, setBarcode] = useState('');

const handleBarcodeSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const product = await findProductByBarcode(barcode);
  if (product) addToCart(product);
  setBarcode(''); // Clear untuk scan berikutnya
};
```

**Step 3: Configure Scanner Suffix (Enter)**

Scan configuration barcode untuk menambahkan Enter setelah setiap scan.

📖 **Dokumentasi lengkap:** [Barcode Scanner Integration](./docs/02_barcode-scanner/README.md)

---

### Cash Drawer Integration

**Step 1: Physical Connection**

```
Computer USB → Thermal Printer → Cash Drawer (RJ-11)
```

**Step 2: Open Drawer via ESC/POS**

```typescript
// ESC p m t1 t2
const OPEN_DRAWER = new Uint8Array([0x1B, 0x70, 0x00, 0x32, 0xFA]);
await writer.write(OPEN_DRAWER);
```

📖 **Dokumentasi lengkap:** [Cash Drawer Integration](./docs/04_cash_drawer/README.md)

---

### VFD Display Integration

**Opsi 1: Hardware VFD**

```typescript
import { vfdService } from '@/services/vfd-display/vfd-service';

await vfdService.connect();
await vfdService.showProduct('Indomie Goreng', 3000);
```

**Opsi 2: Web Display (Tablet)**

```typescript
const displayChannel = new BroadcastChannel('pos-customer-display');

displayChannel.postMessage({
  type: 'product',
  productName: 'Indomie Goreng',
  price: 3000,
});
```

📖 **Dokumentasi lengkap:** [VFD Display Integration](./docs/05_vfd_display/README.md)

---

### Secondary Monitor Integration

**Step 1: Configure OS untuk Extended Display**

```bash
# Windows: Display Settings → Extend these displays
# Linux: xrandr --output HDMI-1 --right-of VGA-1
```

**Step 2: Open Customer Display Window**

```typescript
const displayWindow = window.open(
  '/customer-display',
  'CustomerDisplay',
  'popup=yes,toolbar=no'
);
```

**Step 3: Update Display Content**

```typescript
const channel = new BroadcastChannel('pos-display');
channel.postMessage({ type: 'checkout', items: cart, total: 50000 });
```

📖 **Dokumentasi lengkap:** [Secondary Monitor Integration](./docs/06_secondary_monitor/README.md)

---

## 🛠️ Tech Stack

### Frontend (FinOpenPOS)

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | React framework |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | UI components |
| Lucide React | latest | Icons |

### Database Options

| Option | Type | Best For |
|--------|------|----------|
| Supabase | PostgreSQL (cloud) | Production, multi-device |
| LocalStorage | Browser storage | Development, offline |

### Hardware Integration APIs

| API | Browser Support | Purpose |
|-----|-----------------|---------|
| Web Serial API | Chrome 89+, Edge 89+ | Thermal printer, VFD display |
| USB HID | Native OS | Barcode scanner |
| Window Placement API | Chrome 100+ | Multi-monitor |
| BroadcastChannel API | All modern | Inter-window communication |

### Development Tools

| Tool | Purpose |
|------|---------|
| Node.js 18+ | Runtime |
| npm/yarn/pnpm | Package manager |
| Git | Version control |
| VS Code | Recommended IDE |

---

## 📈 Roadmap

### ✅ Phase 1: Core Hardware (Completed)

- [x] Thermal Printer - BIXOLON SRP-E302
- [x] Barcode Scanner - Zebra DS9308-SR
- [x] Cash Drawer integration
- [x] VFD Display documentation
- [x] Secondary Monitor setup

### 🔄 Phase 2: Advanced Features (In Progress)

- [ ] Bluetooth thermal printer support
- [ ] Network printer support
- [ ] Multiple printer queue
- [ ] Advanced receipt templates
- [ ] Barcode label printing

### 📋 Phase 3: Production Ready (Planned)

- [ ] Error recovery & retry logic
- [ ] Offline queue for printing
- [ ] Hardware health monitoring
- [ ] Automated testing suite
- [ ] Docker deployment guide

### 🚀 Phase 4: Cloud & Scaling (Future)

- [ ] Cloud print service
- [ ] Multi-store management
- [ ] Real-time sync across devices
- [ ] Mobile POS companion app
- [ ] Analytics dashboard

---

## 🔧 Troubleshooting

### Printer tidak terdeteksi

| Problem | Solution |
|---------|----------|
| USB tidak connect | Coba port USB lain |
| Driver missing | Install driver dari [BIXOLON website](https://bixolon.com) |
| Browser tidak support | Gunakan Chrome 89+ atau Edge 89+ |
| Permission denied | Allow serial port access di browser |

📖 [Troubleshooting lengkap](./docs/03_thermal-printer/troubleshooting.md)

---

### Scanner tidak input

| Problem | Solution |
|---------|----------|
| Scanner tidak beep | Cek USB connection |
| Data tidak muncul | Pastikan cursor di input field |
| Karakter aneh | Set keyboard layout ke US |
| Tidak auto-submit | Configure scanner suffix ke Enter |

📖 [Scanner Troubleshooting](./docs/02_barcode-scanner/README.md#troubleshooting)

---

### Cash drawer tidak terbuka

| Problem | Solution |
|---------|----------|
| RJ-11 tidak terpasang | Cek kabel ke port "DK" di printer |
| Voltage mismatch | Pastikan drawer 24V match dengan printer |
| Solenoid lemah | Adjust timing parameter (t1/t2) |
| Command tidak dikirim | Cek printer connection dulu |

📖 [Cash Drawer Troubleshooting](./docs/04_cash_drawer/README.md#troubleshooting)

---

### Display tidak muncul

| Problem | Solution |
|---------|----------|
| Monitor tidak detect | Cek kabel video dan power |
| Window di monitor salah | Drag manual atau gunakan Window Placement API |
| Content tidak update | Cek BroadcastChannel connection |
| Popup blocked | Allow popups untuk localhost |

📖 [Display Troubleshooting](./docs/06_secondary_monitor/README.md)

---

## 🤝 Kontribusi

### Cara Berkontribusi

1. **Fork** repository ini
2. **Clone** fork Anda ke lokal
3. **Create branch** untuk fitur/fix Anda
4. **Commit** perubahan dengan message yang jelas
5. **Push** ke fork Anda
6. **Create Pull Request** ke repository ini

### Kontribusi yang Dibutuhkan

- 📝 **Dokumentasi** - Perbaikan typo, penambahan contoh
- 💻 **Code Examples** - Contoh integrasi untuk device lain
- 🔧 **Bug Fixes** - Perbaikan error di contoh kode
- 🌐 **Translations** - Terjemahan ke bahasa lain
- 🧪 **Testing** - Test di hardware berbeda dan laporkan hasil

### Guidelines

- Gunakan Bahasa Indonesia untuk dokumentasi
- Code comments dalam English
- Follow existing code style
- Test perubahan Anda sebelum submit PR

📖 **Panduan lengkap:** [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📚 Resources

### Official Documentation

- [FinOpenPOS Repository](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Web APIs

- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Window Placement API](https://developer.chrome.com/docs/capabilities/window-placement)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
- [WebHID API](https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API) *(Note: Barcode scanners in Keyboard Wedge mode use standard HID, not WebHID)*

### Protocols & Standards

- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)
- [GS1 Barcode Standards](https://www.gs1.org/standards/barcodes)
- [EAN-13 Standard](https://www.gs1.org/standards/barcodes/ean-upc)

### Community

- [GitHub Discussions](https://github.com/giangianna14/explore-pos-system/discussions)
- [GitHub Issues](https://github.com/giangianna14/explore-pos-system/issues)

---

## ❓ FAQ

<details>
<summary><strong>Apakah bisa pakai thermal printer merk lain selain BIXOLON?</strong></summary>

Ya, bisa! Semua thermal printer yang support ESC/POS protocol akan kompatibel. Merk yang umum compatible:
- Epson TM series
- Star Micronics
- Citizen
- Zjiang
- XPrinter

Yang perlu diperhatikan adalah interface (USB/Serial/Ethernet) dan baudrate settings.

</details>

<details>
<summary><strong>Barcode scanner harus merk Zebra?</strong></summary>

Tidak harus. Dokumentasi menggunakan Zebra DS9308 sebagai referensi, tapi scanner merk lain yang support USB HID Keyboard mode akan bekerja dengan cara yang sama:
- Honeywell
- Datalogic
- Symbol (Motorola)
- Generic USB scanners

Kunci utamanya adalah scanner harus bisa output sebagai keyboard input.

</details>

<details>
<summary><strong>Bisa jalan di browser Firefox atau Safari?</strong></summary>

Sayangnya, **Web Serial API** yang digunakan untuk koneksi printer saat ini hanya didukung oleh:
- ✅ Google Chrome 89+
- ✅ Microsoft Edge 89+
- ✅ Opera 75+
- ❌ Firefox (belum support)
- ❌ Safari (belum support)

Untuk barcode scanner (USB HID), semua browser mendukung karena scanner bekerja sebagai keyboard.

</details>

<details>
<summary><strong>Apakah perlu koneksi internet?</strong></summary>

Tergantung mode yang dipilih:
- **LocalStorage mode**: ❌ Tidak perlu internet
- **Supabase mode**: ✅ Perlu internet untuk database

Hardware (printer, scanner, drawer) tidak memerlukan internet karena terhubung langsung via USB.

</details>

<details>
<summary><strong>Berapa biaya total untuk setup lengkap?</strong></summary>

Estimasi budget untuk setup minimal:

| Hardware | Budget Range |
|----------|-------------|
| Thermal Printer | Rp 800rb - 3jt |
| Barcode Scanner | Rp 500rb - 2.5jt |
| Cash Drawer | Rp 800rb - 2jt |
| **Total Minimal** | **± Rp 2.1 juta** |
| **Total Recommended** | **± Rp 5-7 juta** |

Belum termasuk komputer/laptop dan monitor.

</details>

<details>
<summary><strong>Apakah support multiple kasir atau toko?</strong></summary>

Ya, dengan beberapa pendekatan:
1. **Multiple terminals** - Setiap kasir punya komputer sendiri dengan printer local
2. **Shared database** - Gunakan Supabase untuk sync data antar terminal
3. **Network printer** - Printer terhubung via LAN (perlu konfigurasi tambahan)

Untuk multi-toko, diperlukan setup Supabase dengan row-level security.

</details>

<details>
<summary><strong>Apakah support printer fiscal atau integrasi NPWP?</strong></summary>

Dokumentasi ini fokus pada hardware integration, bukan compliance perpajakan. Untuk kebutuhan fiscal:
- Konsultasikan dengan vendor printer fiscal (Epson Fiscal, dll)
- Integrasi dengan software akuntansi yang sudah tersertifikasi
- Cek regulasi DJP terbaru untuk e-Faktur

Sistem ini bisa dijadikan base, tapi perlu customization untuk compliance pajak.

</details>

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

```
MIT License

Copyright (c) 2025 giangianna14

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

📖 Lihat [LICENSE](LICENSE) untuk detail lengkap.

> **Note:** FinOpenPOS memiliki lisensi tersendiri. Pastikan untuk memeriksa [lisensi FinOpenPOS](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS/blob/main/LICENSE) sebelum penggunaan komersial.

---

## 👏 Credits & Acknowledgments

### Project Maintainer

- **@giangianna14** - Creator & Maintainer

### Special Thanks

- **[FinOpenPOS Team](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)** - Untuk sistem POS open source yang luar biasa
- **BIXOLON** - Dokumentasi ESC/POS yang lengkap
- **Zebra Technologies** - SDK dan dokumentasi scanner
- **Indonesian Developer Community** - Feedback dan kontribusi

---

## 💬 Support & Contact

### Mendapatkan Bantuan

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/giangianna14/explore-pos-system/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/giangianna14/explore-pos-system/discussions)
- 📧 **Email**: Hubungi via GitHub profile

### Berkontribusi

Kami sangat menghargai kontribusi dari komunitas! Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan.

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/giangianna14/explore-pos-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/giangianna14/explore-pos-system?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/giangianna14/explore-pos-system?style=social)

![Last commit](https://img.shields.io/github/last-commit/giangianna14/explore-pos-system)
![Issues](https://img.shields.io/github/issues/giangianna14/explore-pos-system)
![Pull Requests](https://img.shields.io/github/issues-pr/giangianna14/explore-pos-system)

---

<div align="center">

**Made with ❤️ for Indonesian Developer Community**

[⬆️ Kembali ke atas](#-eksplorasi-sistem-pos-dan-perangkat-pendukung)

</div>