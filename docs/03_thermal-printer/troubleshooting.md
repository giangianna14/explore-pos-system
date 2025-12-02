# Troubleshooting Guide - BIXOLON SRP-E302 & FinOpenPOS

Panduan solusi untuk masalah umum yang mungkin terjadi saat integrasi thermal printer dengan FinOpenPOS.

## 📋 Daftar Isi

1. [Masalah Koneksi](#masalah-koneksi)
2. [Masalah Printing](#masalah-printing)
3. [Masalah Browser/Web Serial API](#masalah-browser)
4. [Masalah Format Struk](#masalah-format-struk)
5. [Masalah Performance](#masalah-performance)

## 🔌 Masalah Koneksi

### ❌ Browser tidak detect printer

**Gejala:**
```
Error: Web Serial API not supported
atau
No device found
```

**Solusi:**

1. **Check Browser Support**
```javascript
// Test di Console
if ('serial' in navigator) {
  console.log('✅ Web Serial supported');
} else {
  console.log('❌ Not supported');
}
```

2. **Enable Web Serial API**
```
Chrome/Edge:
1.  Buka chrome://flags
2. Cari "Experimental Web Platform features"
3. Set ke "Enabled"
4. Restart browser

Atau khusus Serial:
1. chrome://flags/#enable-experimental-web-platform-features
2. Enable
3. Restart
```

3. **Gunakan HTTPS atau localhost**
```
✅ https://your-domain.com
✅ http://localhost:3000
✅ http://127.0. 0.1:3000
❌ http://192.168. 1.100:3000  (tidak akan work!)
```

**Workaround untuk IP lokal:**
```bash
# Setup ngrok untuk HTTPS tunnel
npx ngrok http 3000

# Atau gunakan local SSL
npm install -g local-ssl-proxy
local-ssl-proxy --source 3001 --target 3000
# Access via https://localhost:3001
```

### ❌ Permission Denied

**Gejala:**
```
DOMException: Failed to execute 'requestPort' on 'Serial'
```

**Solusi:**

1. **Windows - Check Device Manager**
```
1. Win + X → Device Manager
2.  Ports (COM & LPT)
3. Cari "BIXOLON SRP-E302"
4. Jika ada warning icon:
   - Right click → Update Driver
   - Browse my computer → Let me pick
   - Pilih "USB Serial Device"
```

2. **Linux - Set Permissions**
```bash
# Check current user groups
groups

# Add user to dialout group
sudo usermod -a -G dialout $USER
sudo usermod -a -G uucp $USER

# Reboot atau logout/login
```

3. **Create udev rule (Linux)**
```bash
# Buat rule file
sudo nano /etc/udev/rules.d/99-bixolon-printer.rules

# Tambahkan (cari Vendor ID & Product ID dulu):
lsusb | grep BIXOLON
# Output: Bus 001 Device 005: ID 1504:0011 BIXOLON

# Rule:
SUBSYSTEM=="usb", ATTRS{idVendor}=="1504", ATTRS{idProduct}=="0011", MODE="0666"

# Reload
sudo udevadm control --reload-rules
sudo udevadm trigger

# Reconnect USB
```

### ❌ Port already in use

**Gejala:**
```
Failed to open serial port: The port is already open
```

**Solusi:**

1. **Close semua apps yang pakai printer**
```bash
# Windows - Check running processes
tasklist | findstr "bixolon"

# Kill if needed
taskkill /IM bixolon.exe /F

# Linux
ps aux | grep bixolon
kill -9 [PID]
```

2.  **Disconnect & Reconnect di code**
```typescript
// Pastikan disconnect sebelum connect lagi
await printerService.disconnect();
await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
await printerService.connect();
```

3. **Restart Browser completely**
```
Ctrl + Shift + Q (close all tabs)
Atau restart komputer
```

## 🖨️ Masalah Printing

### ❌ Print tidak keluar / Blank paper

**Gejala:**
- Printer beep tapi tidak print
- Paper keluar tapi kosong
- LED berkedip error

**Solusi:**

1. **Check Paper**
```
✅ Thermal paper sisi yang benar menghadap ke atas
✅ Paper roll tidak habis
✅ Paper tidak macet

Test: Gores paper pakai kuku
- Jika ada tanda hitam = thermal paper correct side
```

2. **Check Printer Status**
```typescript
// Test print langsung
async function testDirectPrint() {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
  
  const writer = port.writable.getWriter();
  
  // Initialize
  await writer.write(new Uint8Array([0x1B, 0x40]));
  
  // Print simple text
  const text = "TEST PRINT\n\n\n";
  await writer. write(new TextEncoder().encode(text));
  
  // Cut
  await writer.write(new Uint8Array([0x1D, 0x56, 0x00]));
  
  await writer.releaseLock();
  await port.close();
}
```

3. **Check Voltage/Power**
```
- Power adapter terhubung dengan benar
- LED power hijau menyala
- Jika pakai USB only, current mungkin tidak cukup
  → Gunakan powered USB hub
```

4. **Test via Windows/CUPS**
```powershell
# Windows - Print test page
echo "Test from CMD" > \\.\COM3

# Linux
echo "Test from terminal" > /dev/usb/lp0
```

### ❌ Karakter aneh / Garbled text

**Gejala:**
```
Print keluar tapi karakter tidak terbaca:
�������� atau ▓▓▓▓▓▓
```

**Solusi:**

1. **Set Character Encoding**
```typescript
// Tambahkan di awal print
const Commands = {
  // Set code page untuk Indonesia
  SET_CODE_PAGE: [0x1B, 0x74, 0x10], // CP1252 (Windows Latin)
  
  // Atau
  SET_CODE_PAGE_UTF8: [0x1B, 0x74, 0xFF], // UTF-8 if supported
};

// Gunakan sebelum print text
await this.sendCommand(Commands.SET_CODE_PAGE);
```

2. **Hindari special characters**
```typescript
function sanitizeText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, '') // Only ASCII printable
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ñ]/g, 'n');
}
```

3. **Check baud rate**
```typescript
// Coba baud rate berbeda
const configs = [9600, 19200, 38400, 115200];

for (const baud of configs) {
  try {
    await port.open({ baudRate: baud });
    console.log(`Testing ${baud}... `);
    // Test print
  } catch (e) {
    console.log(`${baud} failed`);
  }
}
```

### ❌ Paper tidak dipotong / Cut tidak berfungsi

**Gejala:**
- Print selesai tapi paper tidak dipotong otomatis
- Harus manual tarik paper

**Solusi:**

1. **Check Auto-cutter enabled**
```typescript
// Full cut command
const CUT_FULL = new Uint8Array([0x1D, 0x56, 0x00]);

// Partial cut (recommended untuk receipt)
const CUT_PARTIAL = new Uint8Array([0x1D, 0x56, 0x01]);

// Feed before cut (penting!)
await writer.write(new Uint8Array([0x1B, 0x64, 0x03])); // Feed 3 lines
await writer.write(CUT_FULL);
```

2. **Alternative cut command**
```typescript
// ESC i (alternative untuk SRP-E302)
const CUT_ALT = new Uint8Array([0x1B, 0x69]);
```

3. **Manual cutter check**
```
1. Matikan printer
2. Buka cover
3. Check blade cutter tidak macet/rusak
4. Clean debris di area cutter
```

### ❌ Print terlalu terang / Tidak jelas

**Gejala:**
- Text terlihat pudar
- Sulit dibaca

**Solusi:**

1. **Adjust Print Density**
```typescript
// Set print density (0-15, default 8)
const SET_DENSITY = (level: number) => {
  return new Uint8Array([0x1D, 0x7C, level]);
};

// Gunakan density lebih tinggi
await writer.write(SET_DENSITY(12)); // Max 15
```

2. **Check thermal paper quality**
```
❌ Generic paper (cepat pudar)
✅ BIXOLON original paper
✅ High-quality thermal paper (55-60 gsm)
```

3. **Check printer head**
```
Bersihkan thermal print head:
1. Matikan printer
2. Buka cover
3. Gunakan isopropyl alcohol + cotton bud
4. Lap lembut print head bar
5. Tunggu kering
6. Test print
```

## 🌐 Masalah Browser/Web Serial API

### ❌ Popup permission tidak muncul

**Gejala:**
```
Klik "Connect Printer" tapi tidak ada popup
```

**Solusi:**

1. **Check HTTPS requirement**
```javascript
if (window.location.protocol !== 'https:' && 
    window.location.hostname !== 'localhost') {
  alert('Web Serial API requires HTTPS or localhost');
}
```

2. **Must be user gesture**
```typescript
// ❌ SALAH - Auto-connect saat load
useEffect(() => {
  printerService.connect(); // Tidak akan show popup! 
}, []);

// ✅ BENAR - Connect saat user click
<button onClick={() => printerService.connect()}>
  Connect Printer
</button>
```

3. **Check popup blocker**
```
1. Check browser popup settings
2. Allow popups untuk localhost
3. Disable browser extensions yang block popups
```

### ❌ Firefox/Safari tidak support

**Gejala:**
```
Web Serial API undefined di Firefox/Safari
```

**Solusi:**

**Gunakan Chrome/Edge** - Web Serial API hanya support di Chromium browsers. 

**Alternative untuk Firefox/Safari:**
```typescript
// Fallback: window.print() untuk browser print dialog
function fallbackPrint(receiptHTML: string) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.print();
}
```

**Atau gunakan Electron/Tauri wrapper:**
```bash
# Build sebagai desktop app dengan full hardware access
npm install -g electron
```

## 📄 Masalah Format Struk

### ❌ Text tidak rata / Alignment salah

**Gejala:**
```
Nama produk       Harga
  tidak rata
```

**Solusi:**

1. **Gunakan monospace formatting**
```typescript
function formatLine(left: string, right: string, width: number): string {
  const spaces = width - left.length - right.length;
  return left + ' '.repeat(Math.max(spaces, 1)) + right;
}

// Usage
const line = formatLine('Indomie Goreng', 'Rp 3.000', 48);
// Output: "Indomie Goreng                        Rp 3.000"
```

2. **Calculate characters per line**
```typescript
// Test actual width
async function testWidth() {
  const testChars = '0123456789'. repeat(10); // 100 chars
  await printText(testChars);
  // Check berapa karakter yang fit per line
  // BIXOLON SRP-E302: 48 chars untuk font normal
}
```

### ❌ Barcode tidak print

**Gejala:**
```
Command barcode terkirim tapi tidak print
```

**Solusi:**

1. **Check BIXOLON barcode support**
```typescript
// SRP-E302 support 1D barcode only, TIDAK support QR Code

// ✅ Support: EAN13, Code128, Code39, dll
const printBarcode = async (data: string) => {
  // Set barcode height
  await writer.write(new Uint8Array([0x1D, 0x68, 100])); // 100 dots
  
  // Set barcode width (2-6)
  await writer.write(new Uint8Array([0x1D, 0x77, 3])); // Width 3
  
  // Print EAN13
  const barcodeData = new Uint8Array([
    0x1D, 0x6B, 0x02, // GS k type
    data.length,
    ...data. split('').map(c => c. charCodeAt(0))
  ]);
  await writer.write(barcodeData);
};

// ❌ TIDAK support: QR Code, 2D barcodes
```

2. **Alternative: Print barcode sebagai text**
```typescript
// Jika barcode tidak print, print sebagai text number
await printText(`Barcode: ${barcodeNumber}\n`);
```

## ⚡ Masalah Performance

### ❌ Print lambat

**Gejala:**
- Print queue stuck
- Delay 5-10 detik sebelum print

**Solusi:**

1. **Batch commands**
```typescript
// ❌ Lambat - Kirim satu-satu
await writer.write(cmd1);
await writer.write(cmd2);
await writer.write(cmd3);

// ✅ Cepat - Batch semua
const allCommands = new Uint8Array([
  ... cmd1,
  ...cmd2,
  ...cmd3
]);
await writer.write(allCommands);
```

2. **Reduce unnecessary commands**
```typescript
// Cache alignment state
let currentAlign = 'left';

function setAlign(align: string) {
  if (align === currentAlign) return; // Skip jika sama
  currentAlign = align;
  sendAlignCommand(align);
}
```

### ❌ Memory leak / Browser crash

**Gejala:**
- Setelah print berkali-kali, browser lambat
- Tab crash

**Solusi:**

1.  **Always cleanup**
```typescript
async function printReceipt(data: ReceiptData) {
  let writer = null;
  try {
    writer = port.writable.getWriter();
    // ...  print logic
  } finally {
    if (writer) {
      await writer.releaseLock(); // PENTING! 
    }
  }
}
```

2. **Disconnect saat tidak dipakai**
```typescript
// Auto-disconnect setelah 5 menit idle
let idleTimer;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    await printerService.disconnect();
    console.log('Printer auto-disconnected due to inactivity');
  }, 5 * 60 * 1000); // 5 minutes
}
```

## 🛠️ Diagnostic Tools

### Script Diagnostic Lengkap

```typescript
// src/utils/printer-diagnostic.ts
export async function runPrinterDiagnostic() {
  const results = {
    browserSupport: false,
    portAvailable: false,
    connectionSuccess: false,
    printSuccess: false,
    errors: [] as string[],
  };

  // 1. Check browser support
  if ('serial' in navigator) {
    results.browserSupport = true;
  } else {
    results.errors. push('Web Serial API not supported');
    return results;
  }

  // 2. Request port
  try {
    const port = await navigator.serial.requestPort();
    results.portAvailable = true;

    // 3. Try connect
    await port.open({ baudRate: 9600 });
    results.connectionSuccess = true;

    // 4. Try print
    const writer = port. writable.getWriter();
    await writer.write(new Uint8Array([0x1B, 0x40])); // Init
    await writer.write(new TextEncoder().encode('DIAGNOSTIC TEST\n\n\n'));
    await writer.write(new Uint8Array([0x1D, 0x56, 0x00])); // Cut
    
    results.printSuccess = true;

    await writer.releaseLock();
    await port.close();
  } catch (error) {
    results.errors. push(error. message);
  }

  return results;
}

// Usage
const diagnostic = await runPrinterDiagnostic();
console.log('Diagnostic Results:', diagnostic);
```

## 📞 Dukungan Teknis

### BIXOLON Support
- Website: https://www.bixolon.com
- Email: sales@bixolon.com
- Phone: Check website untuk regional support

### Community Support
- GitHub Issue: [explore-pos-system#1](https://github.com/giangianna14/explore-pos-system/issues/1)
- Web Serial API: https://github.com/WICG/serial

## ✅ Diagnostic Checklist

Sebelum report issue, check:

- [ ] Browser: Chrome/Edge latest version
- [ ] HTTPS atau localhost
- [ ] Driver BIXOLON terinstall
- [ ] Printer terdeteksi di Device Manager/System
- [ ] Test print via Windows/CUPS berhasil
- [ ] USB cable terhubung dengan baik
- [ ] Power adapter terpasang
- [ ] Thermal paper loaded dengan benar
- [ ] Permission granted di browser
- [ ] No other app using printer port
- [ ] Console log di browser untuk error details

---

**Masih ada masalah?** Buat issue baru di [GitHub](https://github.com/giangianna14/explore-pos-system/issues) dengan informasi:
1. OS dan versi
2. Browser dan versi
3. Printer model
4. Error message lengkap
5. Screenshot jika ada