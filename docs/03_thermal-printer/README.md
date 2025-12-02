# Eksplorasi Thermal Printer untuk POS System

Dokumentasi lengkap integrasi thermal printer dengan FinOpenPOS menggunakan Web Serial API dan ESC/POS protocol.

## 📋 Daftar Isi

1. [Pengenalan Thermal Printer](#pengenalan)
2. [Setup Guide](./setup-guide.md)
3. [Integration Guide](./integration-guide.md)
4. [Troubleshooting](./troubleshooting.md)
5. [Contoh Kode](../../examples/thermal-printer/)

## 🖨️ Pengenalan

### Apa itu Thermal Printer? 
Thermal printer adalah printer yang menggunakan panas untuk mencetak pada kertas khusus (thermal paper). Sering digunakan untuk:
- Cetak struk/receipt di kasir
- Cetak invoice
- Cetak label produk
- Print antrian

### Keunggulan Thermal Printer untuk POS
- ✅ **Cepat** - Kecepatan print hingga 250mm/detik
- ✅ **Silent** - Tidak berisik (tanpa head impact)
- ✅ **Hemat** - Tidak perlu tinta/ribbon
- ✅ **Compact** - Ukuran kecil, cocok untuk kasir
- ✅ **Reliable** - Minim maintenance

### ESC/POS Protocol
ESC/POS (Epson Standard Code for Point of Sale) adalah standar komunikasi yang digunakan oleh sebagian besar thermal printer. Command set mencakup:
- Text formatting (bold, underline, size)
- Alignment (left, center, right)
- Barcode printing
- QR code printing
- Paper cutting
- Cash drawer trigger

## 🔌 Jenis Interface Thermal Printer

### 1. USB
- Paling umum digunakan
- Koneksi langsung ke PC/laptop
- Menggunakan Web Serial API di browser

### 2. Serial (RS-232)
- Legacy interface
- Perlu USB to Serial adapter
- Stabil untuk jarak jauh

### 3.  Ethernet/LAN
- Koneksi via network
- Cocok untuk multi-terminal
- Perlu konfigurasi IP address

### 4. Bluetooth
- Wireless connection
- Cocok untuk mobile POS
- Battery-powered option tersedia

## 📱 Integrasi dengan Web Browser

### Web Serial API
Modern browser (Chrome, Edge) mendukung Web Serial API untuk akses serial port:

```typescript
// Check browser support
if ("serial" in navigator) {
  // Web Serial API supported
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });
}
```

### Browser Compatibility
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (belum support)
- ❌ Safari (belum support)

## 🛠️ Printer yang Compatible

### Recommended Printers (Budget Friendly)
1. **Epson TM-T82** (~Rp 2.5 juta)
   - USB/Serial/Ethernet
   - 80mm paper width
   - 200mm/sec speed

2. **Star TSP143** (~Rp 3 juta)
   - USB/Ethernet/Bluetooth
   - 80mm paper
   - Auto-cutter

3. **Zjiang ZJ-5890** (~Rp 800 ribu)
   - USB only
   - 58mm paper
   - Budget option

4. **RPP02N** (~Rp 500 ribu)
   - USB/Bluetooth
   - 58mm paper
   - Portable

### ESC/POS Compatible Brands
- Epson
- Star Micronics
- Citizen
- Bixolon
- Zjiang
- XPrinter
- GoJek (OEM dari Zjiang)

## 📊 Diagram Alur Printing

```
┌─────────────┐
│  FinOpenPOS │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. User click "Print"
       ▼
┌─────────────────┐
│ Printer Service │
│  (TypeScript)   │
└──────┬──────────┘
       │
       │ 2. Format invoice data
       │    to ESC/POS commands
       ▼
┌──────────────────┐
│ Web Serial API   │
│ (Browser Native) │
└──────┬───────────┘
       │
       │ 3. Send bytes via USB
       ▼
┌──────────────┐
│    Thermal   │
│    Printer   │
│   🖨️ Print!   │
└──────────────┘
```

## 🎯 Langkah Selanjutnya

1. **[Setup Guide](./setup-guide.md)** - Install driver dan setup environment
2. **[Integration Guide](./integration-guide.md)** - Integrasikan dengan FinOpenPOS
3. **[Troubleshooting](./troubleshooting.md)** - Solusi masalah umum

## 📚 Referensi

- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)
- [Web Serial API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [FinOpenPOS Repository](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)

---

**Related Issue:** [#1](https://github.com/giangianna14/explore-pos-system/issues/1)