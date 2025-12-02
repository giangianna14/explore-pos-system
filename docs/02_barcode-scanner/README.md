# Eksplorasi Barcode Scanner - Zebra DS9308-SR

Dokumentasi integrasi barcode scanner Zebra DS9308-SR dengan FinOpenPOS untuk scan produk di kasir.

## 📋 Daftar Isi

1. [Pengenalan Zebra DS9308-SR](#pengenalan)
2. [Setup Guide](#setup-guide)
3.  [Integration Guide](#integration-guide)
4. [Troubleshooting](#troubleshooting)

## 🔍 Pengenalan

### Zebra DS9308-SR Specifications

**Hardware Specifications:**
- **Model:** Zebra DS9308-SR (Standard Range)
- **Scan Engine:** Digital Imager (CMOS sensor)
- **Scan Pattern:** Omnidirectional (1D & 2D barcodes)
- **Interface:** USB (HID Keyboard Wedge & USB Serial)
- **Cable:** USB Type-A, 2.9m (9. 5 ft)
- **Decode Capability:**
  - 1D Barcodes: UPC, EAN, Code 39, Code 128, dll
  - 2D Barcodes: QR Code, Data Matrix, PDF417
- **Scan Rate:** 60 scans/second
- **Operating Mode:** Handheld / Presentation (auto-trigger)

### Keunggulan DS9308-SR
- ✅ **Omnidirectional Scanning:** Scan dari angle mana saja
- ✅ **2D Capable:** QR Code, barcodes dari layar smartphone
- ✅ **Fast:** 60 scans per second
- ✅ **Plug & Play:** USB HID, langsung kerja tanpa driver
- ✅ **Durable:** Tahan jatuh 1. 5m ke concrete
- ✅ **Auto-Trigger:** Presentation mode untuk hands-free scanning

## 🔌 Mode Operasi

### 1. HID Keyboard Wedge Mode (Default)
Scanner mengirim data seperti keyboard input:
- Plug scanner ke USB → Auto-detected sebagai keyboard
- Scan barcode → Data muncul di input field yang aktif
- **Cocok untuk:** POS system, data entry cepat
- **No driver needed:** Langsung kerja di Windows/Linux/macOS

### 2. USB Serial (CDC) Mode
Scanner mengirim data via serial communication:
- Perlu switch mode via configuration barcode
- Data dikirim via virtual COM port
- **Cocok untuk:** Custom applications, advanced integration

### 3. Presentation Mode (Auto-Trigger)
Scanner standby di holder, auto-scan saat barcode didekatkan:
- Continuous scanning
- Hands-free operation
- **Cocok untuk:** Self-checkout, high-volume scanning

## 📦 Package Contents

```
Box Contents:
├── Zebra DS9308-SR Scanner
├── USB Cable (2.9m Type-A)
├── Scanner Stand/Holder
├── Quick Start Guide
└── Configuration Barcode Sheet
```

## 🔧 Setup Guide

### Windows Setup

#### 1. Physical Connection
```
1.  Unpack scanner dari box
2. Pasang scanner di stand (optional)
3. Hubungkan USB cable ke scanner
4.  Hubungkan USB cable ke komputer
5. Scanner akan bunyi "beep" dan LED hijau
6. Windows auto-install as "HID Keyboard Device"
```

#### 2.  Verify Installation
```
1. Buka Notepad atau text editor
2. Scan barcode apapun
3. Data barcode muncul di text editor
4. ✅ Scanner ready to use! 
```

#### 3. Configure Scanner (Optional)
```
Gunakan configuration barcode sheet:
- Scan "Enter Programming Mode"
- Scan barcode konfigurasi yang diinginkan
- Scan "Exit Programming Mode"

Contoh konfigurasi:
- Add suffix: Enter/Tab setelah scan
- Prefix: Add custom prefix
- Data formatting
```

### Linux Setup

#### Auto-Detection (HID Mode)
```bash
# Scanner auto-detected sebagai keyboard
# Check dengan:
lsusb | grep Zebra

# Output:
# Bus 001 Device 005: ID 05e0:1900 Zebra Technologies Corp. DS9308

# Cek input devices
ls /dev/input/by-id/ | grep Zebra

# Scanner siap digunakan! 
```

#### Permission Setup (jika perlu)
```bash
# Buat udev rule untuk scanner
sudo nano /etc/udev/rules.d/99-zebra-scanner.rules

# Tambahkan:
SUBSYSTEM=="usb", ATTRS{idVendor}=="05e0", ATTRS{idProduct}=="1900", MODE="0666"

# Reload udev
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### macOS Setup

```
1. Hubungkan scanner via USB
2. macOS auto-detect sebagai keyboard
3. Test di TextEdit atau Notes
4. Scanner langsung kerja tanpa driver
```

## 🌐 Integration dengan FinOpenPOS

### HID Keyboard Wedge Mode (Recommended)

Scanner bekerja seperti keyboard, jadi sangat mudah diintegrasikan:

```typescript
// Di komponen kasir/POS
import { useState, useEffect } from 'react';

function POSCashier() {
  const [barcode, setBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);

  // Auto-focus ke input field saat component mount
  useEffect(() => {
    const barcodeInput = document.getElementById('barcode-input');
    barcodeInput?.focus();
  }, []);

  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode) return;

    // Cari produk berdasarkan barcode
    const product = await searchProductByBarcode(barcode);
    
    if (product) {
      // Tambahkan ke cart
      addToCart(product);
      setScannedProduct(product);
    } else {
      alert(`Produk dengan barcode ${barcode} tidak ditemukan`);
    }

    // Clear input untuk scan berikutnya
    setBarcode('');
  };

  return (
    <div className="pos-cashier">
      <form onSubmit={handleBarcodeSubmit}>
        <input
          id="barcode-input"
          type="text"
          value={barcode}
          onChange={handleBarcodeInput}
          placeholder="Scan barcode atau ketik manual"
          autoFocus
          autoComplete="off"
        />
      </form>
      
      {/* Display scanned product */}
      {scannedProduct && (
        <div className="scanned-product">
          <h3>{scannedProduct.name}</h3>
          <p>Harga: {scannedProduct. price}</p>
        </div>
      )}
    </div>
  );
}
```

### Auto-Submit on Enter

Configure scanner untuk menambahkan ENTER setelah scan:

```
1. Scan "Enter Programming Mode" barcode
2. Scan "Add Suffix - Enter/CR" barcode
3. Scan "Exit Programming Mode"

Sekarang setiap scan akan auto-submit form!
```

### Continuous Scanning

```typescript
// Service untuk handle continuous scanning
class BarcodeScannerService {
  private buffer = '';
  private timeout: NodeJS.Timeout | null = null;
  private onScanCallback: ((barcode: string) => void) | null = null;

  constructor() {
    // Listen to keyboard events globally
    document.addEventListener('keydown', this.handleKeyPress. bind(this));
  }

  private handleKeyPress(event: KeyboardEvent) {
    // Ignore if user is typing in other inputs
    const activeElement = document.activeElement;
    if (activeElement?. tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
      return;
    }

    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Enter key = scan complete
    if (event.key === 'Enter') {
      if (this.buffer.length > 0 && this.onScanCallback) {
        this.onScanCallback(this.buffer);
        this.buffer = '';
      }
      return;
    }

    // Append character to buffer
    if (event.key. length === 1) {
      this.buffer += event.key;
    }

    // Auto-clear buffer after 100ms of inactivity
    this.timeout = setTimeout(() => {
      this.buffer = '';
    }, 100);
  }

  onScan(callback: (barcode: string) => void) {
    this.onScanCallback = callback;
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyPress. bind(this));
  }
}

// Usage
const scannerService = new BarcodeScannerService();

scannerService.onScan((barcode) => {
  console. log('Scanned:', barcode);
  // Handle scanned barcode
  addProductToCart(barcode);
});
```

## 📊 Barcode Types Support

### 1D Barcodes
- ✅ UPC-A, UPC-E
- ✅ EAN-8, EAN-13 (paling umum di Indonesia)
- ✅ Code 39, Code 128
- ✅ Interleaved 2 of 5 (ITF)
- ✅ Codabar

### 2D Barcodes
- ✅ QR Code
- ✅ Data Matrix
- ✅ PDF417
- ✅ Aztec Code

### Screen Barcodes
- ✅ Scan dari smartphone screen
- ✅ Digital vouchers / e-tickets
- ✅ Mobile payment QR codes

## 🧪 Testing Scanner

### Test 1: Basic Scan Test

```
1. Buka Notepad / text editor
2. Scan barcode ini (di packaging produk):
   - Scan produk makanan/minuman (EAN-13)
   - Scan buku (ISBN barcode)
3. Verify data muncul di text editor
```

### Test 2: Speed Test

```
Scan multiple barcodes dengan cepat:
- Scanner harus bisa scan 60 items/minute
- Tidak boleh ada lag atau missing data
- LED harus berkedip hijau setiap scan sukses
```

### Test 3: Angle Test

```
Scan barcode dari berbagai sudut:
- 0° (straight)
- 45° (angle)
- 90° (perpendicular)
- Omnidirectional = semua angle harus berhasil
```

## 🎯 Best Practices

### 1. Barcode Label Quality
```
✅ Do:
- Gunakan barcode berkualitas tinggi
- Print dengan printer yang jelas
- Ukuran minimum: 25mm width untuk EAN-13
- Kontras tinggi (hitam pada putih)

❌ Don't:
- Barcode terlalu kecil
- Warna barcode selain hitam
- Background bukan putih
- Barcode rusak/sobek
```

### 2.  Scanning Distance
```
Optimal: 5-15 cm dari scanner
Minimum: 2 cm
Maximum: 25 cm (tergantung barcode size)
```

### 3.  Database Product Setup
```sql
-- Tambah kolom barcode di product table
ALTER TABLE products ADD COLUMN barcode VARCHAR(50) UNIQUE;

-- Index untuk search cepat
CREATE INDEX idx_products_barcode ON products(barcode);

-- Sample data
INSERT INTO products (name, price, barcode) VALUES
('Indomie Goreng', 3000, '8992388100001'),
('Aqua 600ml', 3500, '8993199103682');
```

## 🔊 Audio Feedback Configuration

Scanner bisa dikonfigurasi untuk beep sound:

```
Scan configuration barcodes:
- "Good Read Beep - High Volume"
- "Good Read Beep - Medium Volume"
- "Good Read Beep - Low Volume"
- "Good Read Beep - Off"
```

## ✅ Checklist Setup

- [ ] Scanner terhubung via USB
- [ ] Windows/Linux mendeteksi sebagai HID device
- [ ] Test scan di Notepad berhasil
- [ ] Scanner dikonfigurasi dengan Enter suffix
- [ ] Barcode input field di POS siap
- [ ] Database produk memiliki kolom barcode
- [ ] Test scan produk di POS berhasil
- [ ] Audio feedback dikonfigurasi sesuai kebutuhan

## 📚 Resources

### Official Zebra
- [DS9308 Product Page](https://www.zebra.com/us/en/products/scanners/general-purpose-scanners/handheld/ds9308. html)
- [DS9308 User Guide](https://www.zebra. com/content/dam/zebra/manuals/en-us/scanner/ds9308-product-reference-guide-en. pdf)
- [Configuration Guide](https://www.zebra.com/content/dam/zebra/manuals/en-us/scanner/ds9308-product-reference-guide-en.pdf)

### Barcode Standards
- [GS1 Barcode Guide](https://www.gs1. org/standards/barcodes)
- [EAN-13 Standard](https://www.gs1.org/standards/barcodes/ean-upc)

## 🆘 Troubleshooting

### Scanner tidak terdeteksi
```
✅ Solusi:
1. Cek USB cable terpasang dengan benar
2. Coba port USB lain
3. Restart komputer
4. Scan "USB HID Keyboard Emulation" config barcode
```

### Data scan tidak muncul
```
✅ Solusi:
1. Pastikan input field aktif (focused)
2. Test di Notepad dulu
3. Cek keyboard layout (US vs Indonesia)
4. Scan "Restore Factory Defaults" config barcode
```

### Scan lambat/lag
```
✅ Solusi:
1. Clean scanner window dengan kain lembut
2. Pastikan barcode tidak rusak
3. Adjust jarak scanning
4. Periksa CPU usage (jika tinggi = lag)
```

---

**Next:** Lihat contoh kode lengkap di [examples/barcode-scanner/](../../examples/barcode-scanner/)