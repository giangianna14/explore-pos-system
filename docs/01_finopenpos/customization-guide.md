# Panduan Kustomisasi FinOpenPOS

Panduan untuk memodifikasi dan menyesuaikan FinOpenPOS dengan kebutuhan eksplorasi hardware. 

## 📋 Daftar Isi

1. [Struktur Project](#struktur-project)
2. [Menambah Printer Service](#menambah-printer-service)
3. [Menambah Scanner Integration](#menambah-scanner-integration)
4. [Modifikasi UI untuk Hardware Control](#modifikasi-ui)
5. [Custom Barcode Database](#custom-barcode-database)

## 📁 Struktur Project

```
FinOpenPOS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Dashboard pages
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   └── pos/          # ⭐ POS Cashier page
│   │   ├── api/              # API routes
│   │   ├── layout.tsx
│   │   └── page. tsx
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── products/
│   │   ├── orders/
│   │   └── pos/             # ⭐ POS components
│   ├── lib/                 # Utilities
│   │   ├── supabase/
│   │   └── utils. ts
│   ├── services/            # ⭐ Tambah services baru
│   │   ├── printer/        # Printer service
│   │   └── scanner/        # Scanner service
│   └── types/              # TypeScript types
└── public/
```

## 🖨️ Menambah Printer Service

### 1. Buat Folder Services

```bash
mkdir -p src/services/printer
```

### 2. Copy Printer Files

Copy file dari eksplorasi kita:
- `src/services/printer/printer-service.ts`
- `src/services/printer/receipt-formatter.ts`
- `src/services/printer/escpos-commands.ts`
- `src/services/printer/bixolon-config.ts`
- `src/types/printer. ts`

### 3. Install Dependencies (jika diperlukan)

```bash
# Tidak perlu library tambahan untuk Web Serial API
# Sudah built-in di browser modern
```

### 4. Update POS Component

Modifikasi komponen kasir untuk menambah tombol print:

```typescript
// src/app/(dashboard)/pos/page.tsx
'use client';

import { useState } from 'react';
import { printerService } from '@/services/printer/printer-service';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function POSPage() {
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleConnectPrinter = async () => {
    const connected = await printerService.connect();
    setIsPrinterConnected(connected);
    
    if (connected) {
      alert('✅ Printer terhubung! ');
    } else {
      alert('❌ Gagal menghubungkan printer');
    }
  };

  const handlePrintReceipt = async () => {
    if (!currentOrder) {
      alert('Tidak ada order untuk dicetak');
      return;
    }

    try {
      const receiptData = {
        store: {
          name: 'TOKO SERBAGUNA',
          address: 'Jl. Raya No. 123',
          phone: '021-12345678',
        },
        transactionId: currentOrder.id,
        date: new Date(),
        items: currentOrder.items,
        subtotal: currentOrder.subtotal,
        tax: currentOrder.tax,
        total: currentOrder.total,
        paymentMethod: currentOrder.paymentMethod,
        amountPaid: currentOrder.amountPaid,
        change: currentOrder.change,
      };

      await printerService.printReceipt(receiptData);
      alert('✅ Struk berhasil dicetak! ');
    } catch (error) {
      alert('❌ Gagal mencetak: ' + error. message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS Kasir</h1>
        
        <div className="flex gap-2">
          {! isPrinterConnected ? (
            <Button onClick={handleConnectPrinter}>
              <Printer className="mr-2 h-4 w-4" />
              Hubungkan Printer
            </Button>
          ) : (
            <Button onClick={handlePrintReceipt} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Struk
            </Button>
          )}
        </div>
      </div>

      {/* Rest of POS UI */}
    </div>
  );
}
```

## 🔍 Menambah Scanner Integration

### 1. Buat Scanner Service

```typescript
// src/services/scanner/scanner-service.ts
export class BarcodeScannerService {
  private buffer = '';
  private timeout: NodeJS.Timeout | null = null;
  private onScanCallback: ((barcode: string) => void) | null = null;
  private isListening = false;

  start() {
    if (this.isListening) return;
    
    document.addEventListener('keydown', this.handleKeyPress);
    this.isListening = true;
    console.log('✅ Scanner service started');
  }

  stop() {
    if (!this. isListening) return;
    
    document.removeEventListener('keydown', this.handleKeyPress);
    this.isListening = false;
    console.log('Scanner service stopped');
  }

  private handleKeyPress = (event: KeyboardEvent) => {
    // Ignore jika user sedang mengetik di input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Clear timeout
    if (this.timeout) {
      clearTimeout(this. timeout);
    }

    // Enter = scan complete
    if (event.key === 'Enter') {
      if (this.buffer.length > 0 && this.onScanCallback) {
        this.onScanCallback(this.buffer);
        this.buffer = '';
      }
      return;
    }

    // Append karakter
    if (event.key. length === 1) {
      this.buffer += event.key;
    }

    // Auto-clear setelah 100ms tidak ada input
    this.timeout = setTimeout(() => {
      this.buffer = '';
    }, 100);
  };

  onScan(callback: (barcode: string) => void) {
    this. onScanCallback = callback;
  }
}

export const scannerService = new BarcodeScannerService();
```

### 2.  Integrasi di POS Component

```typescript
// src/app/(dashboard)/pos/page.tsx
import { useEffect } from 'react';
import { scannerService } from '@/services/scanner/scanner-service';

export default function POSPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Start scanner service
    scannerService. start();

    // Handle scan
    scannerService.onScan(async (barcode) => {
      console.log('Scanned:', barcode);
      
      // Cari produk by barcode
      const product = await findProductByBarcode(barcode);
      
      if (product) {
        addToCart(product);
        // Optional: beep sound
        playBeep();
      } else {
        alert(`Produk dengan barcode ${barcode} tidak ditemukan`);
      }
    });

    // Cleanup
    return () => {
      scannerService. stop();
    };
  }, []);

  const findProductByBarcode = async (barcode: string) => {
    // Query dari database/localStorage
    const products = await getProducts();
    return products.find(p => p.barcode === barcode);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const playBeep = () => {
    const audio = new Audio('/sounds/beep.mp3');
    audio.play();
  };

  // ...  rest of component
}
```

## 🎨 Modifikasi UI untuk Hardware Control

### 1.  Hardware Status Widget

```typescript
// src/components/pos/HardwareStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Printer, Scan } from 'lucide-react';
import { printerService } from '@/services/printer/printer-service';

export function HardwareStatus() {
  const [printerStatus, setPrinterStatus] = useState(false);
  const [scannerStatus, setScannerStatus] = useState(true); // Scanner always ready in HID mode

  useEffect(() => {
    const status = printerService.getStatus();
    setPrinterStatus(status.connected);
  }, []);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Hardware Status</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span className="text-sm">Thermal Printer</span>
          </div>
          <Badge variant={printerStatus ? "success" : "secondary"}>
            {printerStatus ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            <span className="text-sm">Barcode Scanner</span>
          </div>
          <Badge variant={scannerStatus ? "success" : "secondary"}>
            {scannerStatus ?  "Ready" : "Not Detected"}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
```

### 2. Quick Action Buttons

```typescript
// src/components/pos/QuickActions.tsx
import { Button } from '@/components/ui/button';
import { Printer, DollarSign, TestTube } from 'lucide-react';
import { printerService } from '@/services/printer/printer-service';

export function QuickActions() {
  const handleTestPrint = async () => {
    try {
      await printerService.testPrint();
      alert('✅ Test print berhasil');
    } catch (error) {
      alert('❌ Test print gagal');
    }
  };

  const handleOpenDrawer = async () => {
    try {
      await printerService. openDrawer();
    } catch (error) {
      alert('❌ Gagal membuka cash drawer');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleTestPrint}>
        <TestTube className="mr-2 h-4 w-4" />
        Test Print
      </Button>
      
      <Button variant="outline" size="sm" onClick={handleOpenDrawer}>
        <DollarSign className="mr-2 h-4 w-4" />
        Buka Laci
      </Button>
    </div>
  );
}
```

## 📊 Custom Barcode Database

### 1. Tambah Kolom Barcode di Schema

Jika pakai Supabase:

```sql
-- Tambah kolom barcode
ALTER TABLE products ADD COLUMN barcode VARCHAR(100) UNIQUE;

-- Index untuk search cepat
CREATE INDEX idx_products_barcode ON products(barcode);

-- Tambah beberapa produk dengan barcode
INSERT INTO products (name, price, stock, barcode, category) VALUES
('Indomie Goreng', 3000, 100, '8992388100001', 'Makanan'),
('Aqua 600ml', 3500, 50, '8993199103682', 'Minuman'),
('Teh Botol Sosro', 4500, 30, '8992770010016', 'Minuman'),
('Mie Sedaap', 3200, 80, '8991002100015', 'Makanan');
```

Jika pakai LocalStorage:

```typescript
// src/lib/storage/products. ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  category?: string;
}

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Indomie Goreng',
    price: 3000,
    stock: 100,
    barcode: '8992388100001',
    category: 'Makanan',
  },
  // ... more products
];
```

### 2. Barcode Search Function

```typescript
// src/lib/products.ts
import { supabase } from '@/lib/supabase/client';

export async function searchProductByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('products')
    . select('*')
    .eq('barcode', barcode)
    .single();

  if (error) {
    console.error('Product not found:', error);
    return null;
  }

  return data;
}

// LocalStorage version
export function searchProductByBarcodeLocal(barcode: string) {
  const products = localDB.getProducts();
  return products.find(p => p.barcode === barcode);
}
```

## ✅ Customization Checklist

- [ ] Printer service ditambahkan ke project
- [ ] Scanner service diintegrasikan
- [ ] POS component dimodifikasi dengan print button
- [ ] Hardware status widget ditambahkan
- [ ] Barcode column ditambahkan ke database
- [ ] Test print berfungsi
- [ ] Scan barcode berfungsi
- [ ] UI/UX sesuai kebutuhan

## 📚 Next Steps

1. **Test End-to-End**: Scan produk → Tambah ke cart → Print invoice
2. **Dokumentasi**: Update dokumentasi di issue #1
3. **Eksplorasi Device Lain**: Cash drawer, customer display

---

**Back:** [Installation Guide](./installation-guide.md)
**Next:** [Thermal Printer Integration](../thermal-printer/integration-guide. md)