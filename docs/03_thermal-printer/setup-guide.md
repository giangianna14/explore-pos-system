# Setup Guide - Thermal Printer BIXOLON SRP-E302

Panduan lengkap instalasi dan konfigurasi thermal printer BIXOLON SRP-E302 untuk integrasi dengan FinOpenPOS.

## 📋 Spesifikasi BIXOLON SRP-E302

### Hardware Specifications
- **Model:** BIXOLON SRP-E302
- **Print Method:** Direct Thermal
- **Print Width:** 80mm (3 inch)
- **Print Speed:** 220 mm/sec
- **Resolution:** 203 DPI (8 dots/mm)
- **Paper Width:** 79. 5 ± 0.5 mm
- **Interface:** 
  - USB 2.0 (Type B)
  - Serial (RS-232C) - Optional
  - Ethernet (LAN) - Optional
- **Auto-cutter:** Built-in (Full cut / Partial cut)
- **Character Set:** Support ESC/POS commands
- **Barcode:** 1D Barcode support
- **Paper Roll Diameter:** Max 83mm

### Keunggulan SRP-E302
- ✅ **Cepat:** 220mm/sec printing speed
- ✅ **Reliable:** Auto-cutter dengan 1. 5 juta kali potong
- ✅ **Easy Drop-in:** Paper loading tanpa ribet
- ✅ **ESC/POS Compatible:** Support standard commands
- ✅ **Compact Design:** Hemat space di kasir
- ✅ **Energy Efficient:** Low power consumption

## 🔧 Instalasi Driver

### Windows 10/11

#### 1. Download Driver BIXOLON
```
Link: https://www.bixolon.com/html/en/download/down_driver.xhtml
- Pilih Model: SRP-E302
- Pilih OS: Windows 10/11
- Download: BIXOLON Unified POS Driver
```

#### 2. Ekstrak dan Install
```bash
# Ekstrak file zip
# Jalankan setup.exe sebagai Administrator
# Ikuti wizard instalasi
# Restart komputer setelah selesai
```

#### 3. Sambungkan Printer
```
1. Hubungkan USB cable ke printer dan komputer
2. Nyalakan printer
3. Windows akan auto-detect sebagai "BIXOLON SRP-E302"
4. Cek di Device Manager > Ports (COM & LPT)
5. Catat COM Port number (misal: COM3)
```

#### 4. Test Print via Windows
```
1. Buka "Devices and Printers" (Control Panel)
2. Klik kanan "BIXOLON SRP-E302"
3. Pilih "Printer properties"
4.  Klik "Print Test Page"
5. Struk test harus keluar
```

### Linux (Ubuntu/Debian)

#### 1. Install CUPS
```bash
sudo apt-get update
sudo apt-get install cups cups-client
```

#### 2. Download BIXOLON Linux Driver
```bash
# Download dari website BIXOLON
cd ~/Downloads
wget https://www.bixolon.com/upload/download/.. .[link driver]
tar -xvf bixolon-driver-linux.tar. gz
cd bixolon-driver-linux
```

#### 3. Install Driver
```bash
sudo ./install.sh
# Ikuti instruksi di terminal
```

#### 4.  Tambahkan Printer di CUPS
```bash
# Akses CUPS web interface
http://localhost:631

# Atau via command line:
sudo lpadmin -p BIXOLON-SRP-E302 \
  -E \
  -v usb://BIXOLON/SRP-E302 \
  -m bixolon-srp-e302. ppd

# Test print
echo "Test Print BIXOLON" | lp -d BIXOLON-SRP-E302
```

#### 5. Set Permissions
```bash
# Tambahkan user ke group lp dan dialout
sudo usermod -a -G lp $USER
sudo usermod -a -G dialout $USER

# Logout dan login kembali
```

### macOS

#### 1.  Download Driver
```
Link: https://www.bixolon.com/html/en/download/down_driver.xhtml
- Pilih Model: SRP-E302
- Pilih OS: macOS
- Download: BIXOLON macOS Driver
```

#### 2. Install DMG File
```bash
# Double click file . dmg
# Drag BIXOLON Driver ke Applications
# Jalankan installer
# Allow di Security & Privacy settings jika perlu
```

#### 3. Tambahkan Printer
```
System Preferences > Printers & Scanners
Klik "+" untuk add printer
Pilih "BIXOLON SRP-E302"
Driver akan auto-selected
Klik "Add"
```

## 🌐 Setup Browser untuk Web Serial API

### Chrome / Edge

#### 1. Enable Web Serial API
```
1. Buka chrome://flags
2. Cari "Web Serial API"
3.  Set ke "Enabled"
4. Restart browser
```

#### 2. Grant Permission
```javascript
// Saat pertama kali connect, browser akan minta permission
// User harus klik "Allow" untuk akses serial port
```

#### 3.  HTTPS Requirement
```
⚠️ Web Serial API hanya berfungsi di:
- https:// (production)
- http://localhost (development)
- http://127.0.0.1 (development)
```

### Troubleshooting Browser

#### Chrome tidak detect printer
```
✅ Solusi:
1. Pastikan driver sudah terinstall
2. Restart browser setelah install driver
3. Coba disconnect/reconnect USB cable
4. Cek di chrome://device-log/ untuk error log
```

## 📦 Setup FinOpenPOS Development

### 1. Clone Repository
```bash
git clone https://github.com/JoaoHenriqueBarbosa/FinOpenPOS
cd FinOpenPOS
```

### 2. Install Dependencies
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

### 3. Setup Environment Variables
```bash
# Copy .env.example
cp .env.example .env. local

# Edit .env.local
# Tambahkan konfigurasi printer jika perlu
NEXT_PUBLIC_PRINTER_ENABLED=true
NEXT_PUBLIC_PRINTER_MODEL=BIXOLON_SRP_E302
```

### 4. Install Printer Libraries
```bash
# Install library untuk ESC/POS
npm install --save escpos-buffer
# atau gunakan custom printer service (sudah disediakan)
```

### 5. Run Development Server
```bash
npm run dev
```

### 6.  Akses Aplikasi
```
Browser: http://localhost:3000
Pastikan menggunakan Chrome/Edge untuk Web Serial API
```

## 🧪 Testing Koneksi Printer

### Test 1: Direct Hardware Test

#### Windows
```cmd
# Buka Command Prompt
echo Test Print > \\.\COM3
# Ganti COM3 dengan port printer Anda
```

#### Linux
```bash
# Test via device file
echo "Test Print BIXOLON" > /dev/usb/lp0

# Atau via CUPS
echo "Test Print" | lp -d BIXOLON-SRP-E302
```

### Test 2: Web Serial API Test

Buat file `test-printer.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test BIXOLON SRP-E302</title>
</head>
<body>
    <h1>Test Thermal Printer</h1>
    <button onclick="connectPrinter()">Connect Printer</button>
    <button onclick="testPrint()">Test Print</button>
    <div id="status"></div>

    <script>
        let port = null;
        let writer = null;

        async function connectPrinter() {
            try {
                // Request port
                port = await navigator. serial.requestPort();
                await port.open({ baudRate: 9600 });
                
                const textEncoder = new TextEncoderStream();
                const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
                writer = textEncoder.writable.getWriter();
                
                document.getElementById('status').textContent = 'Printer Connected! ';
            } catch (error) {
                document.getElementById('status').textContent = 'Error: ' + error.message;
            }
        }

        async function testPrint() {
            if (!writer) {
                alert('Please connect printer first');
                return;
            }

            try {
                // ESC @ - Initialize
                await writer.write(new Uint8Array([0x1B, 0x40]));
                
                // Print text
                await writer.write('Test Print BIXOLON SRP-E302\n');
                await writer.write('Tanggal: ' + new Date(). toLocaleString('id-ID') + '\n');
                
                // Feed and cut
                await writer.write(new Uint8Array([0x1B, 0x64, 0x03])); // Feed 3 lines
                await writer.write(new Uint8Array([0x1D, 0x56, 0x00])); // Full cut
                
                document.getElementById('status').textContent = 'Print Success!';
            } catch (error) {
                document.getElementById('status').textContent = 'Print Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

Buka file di Chrome dan test koneksi. 

## 📊 Konfigurasi Optimal untuk POS

### BIXOLON SRP-E302 Settings

```javascript
const printerConfig = {
  model: 'BIXOLON SRP-E302',
  baudRate: 9600,        // Standard baud rate
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  paperWidth: 80,        // 80mm paper
  charactersPerLine: 48, // Standard 48 chars for 80mm
  encoding: 'UTF-8',
  autoCutter: true,
  buzzer: true,          // Enable beep on print
};
```

### Paper Settings
```
- Kertas thermal 80mm x 80mm (diameter roll)
- Kualitas paper: minimum 55 gsm
- Recommended: BIXOLON original thermal paper
- Hindari paper generik yang mudah pudar
```

## ✅ Checklist Setup

- [ ] Driver BIXOLON SRP-E302 terinstall
- [ ] Printer terdeteksi di Device Manager / System
- [ ] Test print via Windows/CUPS berhasil
- [ ] Chrome/Edge Web Serial API enabled
- [ ] FinOpenPOS development server running
- [ ] Test koneksi via Web Serial berhasil
- [ ] Printer service code sudah ditambahkan ke project

## 🔗 Resources

### Official BIXOLON
- [BIXOLON Website](https://www.bixolon.com)
- [Driver Download](https://www.bixolon.com/html/en/download/down_driver.xhtml)
- [User Manual SRP-E302](https://www.bixolon.com/upload/download/spr-e302_user_manual. pdf)
- [ESC/POS Command Manual](https://www.bixolon.com/upload/download/spr-e302_escpos_programming. pdf)

### Web Serial API
- [MDN Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Chrome Web Serial Guide](https://developer.chrome.com/docs/capabilities/serial)

## 🆘 Troubleshooting

Lihat [Troubleshooting Guide](./troubleshooting.md) untuk solusi masalah umum.

---

**Next:** [Integration Guide](./integration-guide.md) - Cara integrasi printer dengan FinOpenPOS