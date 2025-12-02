# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada proyek **Eksplorasi Sistem POS dan Perangkat Pendukung**! 🎉

## 📋 Daftar Isi

- [Code of Conduct](#code-of-conduct)
- [Cara Berkontribusi](#cara-berkontribusi)
- [Jenis Kontribusi](#jenis-kontribusi)
- [Setup Development](#setup-development)
- [Panduan Pull Request](#panduan-pull-request)
- [Style Guidelines](#style-guidelines)

---

## 📜 Code of Conduct

Dengan berpartisipasi dalam proyek ini, Anda setuju untuk:

- Bersikap ramah dan inklusif
- Menghormati pendapat dan pengalaman yang berbeda
- Memberikan dan menerima kritik konstruktif dengan baik
- Fokus pada apa yang terbaik untuk komunitas

---

## 🚀 Cara Berkontribusi

### 1. Fork Repository

```bash
# Fork via GitHub UI, lalu clone
git clone https://github.com/YOUR_USERNAME/explore-pos-system.git
cd explore-pos-system
```

### 2. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur
# atau
git checkout -b fix/nama-bug
# atau
git checkout -b docs/nama-dokumentasi
```

### 3. Lakukan Perubahan

Buat perubahan yang diperlukan sesuai dengan guidelines di bawah.

### 4. Commit dengan Pesan yang Jelas

```bash
git add .
git commit -m "feat: menambahkan dokumentasi untuk printer ABC"
# atau
git commit -m "fix: memperbaiki typo di README"
# atau
git commit -m "docs: update troubleshooting guide"
```

### 5. Push ke Fork Anda

```bash
git push origin feature/nama-fitur
```

### 6. Buat Pull Request

- Buka halaman Pull Request di GitHub
- Jelaskan perubahan yang Anda buat
- Link ke issue terkait jika ada

---

## 📝 Jenis Kontribusi

### Dokumentasi

- ✏️ Perbaikan typo atau tata bahasa
- 📖 Penambahan contoh kode
- 🔧 Update panduan troubleshooting
- 🌐 Terjemahan ke bahasa lain

### Contoh Kode

- 💻 Contoh integrasi untuk hardware lain
- 🧪 Test cases
- 🔌 Utility functions

### Bug Reports

- 🐛 Laporkan bug dengan template issue
- 📸 Sertakan screenshot jika relevan
- 📝 Jelaskan langkah reproduksi

### Feature Requests

- 💡 Ajukan ide fitur baru via Discussions
- 📋 Jelaskan use case dan manfaatnya

---

## 🛠️ Setup Development

### Prerequisites

- Git
- Node.js 18+ (untuk testing contoh kode)
- Text editor (VS Code recommended)

### Clone dan Setup

```bash
git clone https://github.com/giangianna14/explore-pos-system.git
cd explore-pos-system
```

### Testing Contoh Kode

```bash
cd examples/thermal-printer
# Copy ke project FinOpenPOS untuk testing
```

---

## 🔄 Panduan Pull Request

### Checklist Sebelum Submit

- [ ] Code mengikuti style guidelines
- [ ] Dokumentasi ditulis dalam Bahasa Indonesia
- [ ] Links internal sudah divalidasi
- [ ] Tidak ada typo
- [ ] Commit message jelas dan deskriptif

### Template PR

```markdown
## Deskripsi

[Jelaskan perubahan yang dilakukan]

## Jenis Perubahan

- [ ] Dokumentasi baru
- [ ] Update dokumentasi
- [ ] Contoh kode baru
- [ ] Bug fix
- [ ] Lainnya

## Issue Terkait

Fixes #[nomor issue]

## Checklist

- [ ] Saya sudah membaca CONTRIBUTING.md
- [ ] Links sudah divalidasi
- [ ] Markdown formatting benar
```

---

## 📏 Style Guidelines

### Dokumentasi

| Aspek | Guideline |
|-------|-----------|
| **Bahasa** | Bahasa Indonesia untuk konten |
| **Code Comments** | English |
| **Tone** | Professional tapi friendly |
| **Heading** | H1 untuk title, H2 untuk sections, H3 untuk sub-sections |
| **Code Blocks** | Selalu gunakan syntax highlighting |
| **Tables** | Format rapi dengan alignment |

### Markdown

```markdown
# Title (H1 - hanya 1 per file)

## Section (H2)

### Sub-section (H3)

**Bold** untuk emphasis
`code` untuk inline code

```typescript
// Code block dengan syntax highlighting
```

- Bullet points untuk list
1. Numbered untuk steps

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Commit Messages

Format: `type: description`

| Type | Penggunaan |
|------|------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `docs` | Dokumentasi |
| `style` | Formatting |
| `refactor` | Refactoring |
| `test` | Testing |
| `chore` | Maintenance |

Contoh:
- `feat: menambahkan dokumentasi printer Epson TM-T20`
- `fix: memperbaiki broken link di README`
- `docs: update installation guide`

---

## ❓ Pertanyaan?

Jika Anda memiliki pertanyaan:

1. Cek [FAQ di README](README.md#-faq)
2. Buka [Discussion](https://github.com/giangianna14/explore-pos-system/discussions)
3. Buat [Issue](https://github.com/giangianna14/explore-pos-system/issues) dengan label `question`

---

## 🙏 Terima Kasih

Setiap kontribusi, sekecil apapun, sangat berarti bagi komunitas!

**Happy Contributing!** 🎉
