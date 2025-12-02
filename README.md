# Eksplorasi Sistem POS dan Perangkat Pendukung

Dokumentasi hasil Research and Development (R&D) untuk eksplorasi penggunaan perangkat POS beserta perangkat pendukungnya.

## 🎯 Tujuan Proyek

Mengeksplorasi dan mendokumentasikan integrasi perangkat POS hardware dengan sistem POS open source berbasis Next.js untuk keperluan pembelajaran dan development.

## 🖥️ Sistem POS yang Digunakan

**[FinOpenPOS](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS)**
- ✅ Dibuat menggunakan Next.js + React + TypeScript
- ✅ Arsitektur frontend-only (dapat dijalankan offline)
- ✅ Modul mandatory: kasir, input barang, print invoice
- ✅ Clean code, mudah dimodifikasi
- ✅ Lisensi opensource
- ✅ Tidak tergantung pada API vendor/pihak ke-3
- ✅ Kompatibel dengan eksperimen perangkat

## 🔌 Perangkat yang Dieksplorasi

### ✅ Sudah Dieksplorasi
1. **[Thermal Printer](./docs/thermal-printer/README. md)** - Printer untuk cetak struk/invoice
   - Status: 🔄 Dalam Progress
   - Issue: [#1](https://github.com/giangianna14/explore-pos-system/issues/1)

### 📋 Akan Dieksplorasi
2. **Barcode Scanner** - Scan produk untuk input kasir
3. **Cash Drawer** - Laci uang otomatis
4. **VFD Display / Pole Display** - Display untuk customer
5. **Secondary Monitor** - Monitor tambahan untuk tampilan customer

## 📚 Struktur Dokumentasi

```
/
├── README.md                          # Overview proyek (file ini)
├── docs/
│   ├── thermal-printer/              # Dokumentasi thermal printer
│   │   ├── README. md                 # Panduan lengkap
│   │   ├── setup-guide.md            # Setup dan instalasi
│   │   ├── integration-guide.md      # Cara integrasi
│   │   └── troubleshooting.md        # Troubleshooting
│   └── templates/
│       └── device-template.md        # Template untuk device baru
└── examples/
    └── thermal-printer/              # Contoh kode integrasi
        ├── printer-service.ts        # Service koneksi printer
        ├── receipt-template.ts       # Template format struk
        └── escpos-commands.ts        # ESC/POS commands
```

## 🚀 Cara Memulai

### 1. Clone FinOpenPOS
```bash
git clone https://github.com/JoaoHenriqueBarbosa/FinOpenPOS
cd FinOpenPOS
npm install
```

### 2.  Pilih Device untuk Dieksplorasi
Lihat dokumentasi di folder `docs/` untuk device yang ingin Anda eksplorasi.

### 3. Ikuti Setup Guide
Setiap device memiliki setup guide lengkap dengan contoh kode. 

### 4. Dokumentasikan Hasil
Gunakan template di `docs/templates/` untuk mendokumentasikan hasil eksplorasi Anda.

## 📖 Format Dokumentasi

Setiap hasil R&D didokumentasikan dengan format:
1. **Device yang Digunakan** - Spesifikasi hardware
2. **Port ke POS** - Mapping koneksi
3. **Narasi Teknis** - Cara akses dan kontrol
4. **Hasil Uji Coba** - Kesimpulan dan rekomendasi
5. **Referensi** - Link dan sumber

## 🤝 Kontribusi

Jika Anda ingin menambahkan eksplorasi device baru:
1. Buat issue baru menggunakan template
2. Gunakan template dokumentasi di `docs/templates/`
3. Submit hasil eksplorasi Anda

## 📄 Lisensi

Dokumentasi ini dibuat untuk tujuan pembelajaran dan R&D. 

## 🔗 Referensi

- [FinOpenPOS](https://github.com/JoaoHenriqueBarbosa/FinOpenPOS) - Sistem POS yang digunakan
- [Web Serial API](https://developer.mozilla. org/en-US/docs/Web/API/Web_Serial_API) - API untuk akses serial port
- [ESC/POS Commands](https://reference.epson-biz.com/modules/ref_escpos/) - Referensi ESC/POS

---

**Dibuat oleh:** @giangianna14  
**Terakhir Update:** Desember 2025