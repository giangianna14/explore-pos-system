# Eksplorasi VFD Display / Pole Display untuk POS System

Dokumentasi integrasi customer display (VFD/LCD pole display) dengan FinOpenPOS untuk menampilkan informasi transaksi ke customer.

## 📋 Daftar Isi

1.  [Pengenalan VFD Display](#pengenalan)
2. [Jenis Customer Display](#jenis-customer-display)
3. [Koneksi dan Setup](#koneksi-dan-setup)
4. [Integration Guide](#integration-guide)
5.  [Display Protocols](#display-protocols)

## 📺 Pengenalan

### Apa itu VFD Display / Pole Display?

**VFD (Vacuum Fluorescent Display)** atau **Pole Display** adalah layar kedua yang menghadap ke customer di kasir POS. Menampilkan:
- Nama produk yang di-scan
- Harga per item
- Total belanja
- Kembalian
- Pesan marketing/promosi

### Keunggulan Customer Display
- ✅ **Transparansi**: Customer bisa verifikasi harga real-time
- ✅ **Trust**: Mengurangi kesalahan/dispute harga
- ✅ **Professional**: Tampilan kasir lebih modern
- ✅ **Marketing**: Tampilkan promo saat idle
- ✅ **Compliance**: Required di beberapa negara untuk retail

## 🖥️ Jenis Customer Display

### 1. VFD (Vacuum Fluorescent Display)

**Karakteristik:**
- Display type: Fluorescent (cahaya hijau/biru terang)
- Resolution: Character-based (2 baris x 20 karakter)
- Brightness: Sangat terang, readable dari jauh
- Lifespan: 50,000+ hours
- Harga: Rp 1. 5 - 3 juta

**Contoh Model:**
- Epson DM-D110
- Bixolon BCD-1100
- Star Micronics SCD222U

**Pros:**
- Sangat terang (visible di outdoor/toko terang)
- Awet (tidak ada backlight burnout)
- Low latency

**Cons:**
- Character-only (tidak bisa gambar/grafik)
- Monochrome (satu warna saja)
- Lebih mahal dari LCD

### 2. LCD Pole Display

**Karakteristik:**
- Display type: LCD (seperti monitor kecil)
- Resolution: 800x480 atau 1024x600 pixels
- Brightness: Normal LCD brightness
- Lifespan: 30,000 hours
- Harga: Rp 800 ribu - 2 juta

**Contoh Model:**
- Elo 0702L 7" LCD
- POS-X XP8200
- Generic 7"/10" LCD displays

**Pros:**
- Bisa tampilkan grafik/gambar/video
- Colorful (support marketing content)
- Lebih murah

**Cons:**
- Kurang terang dari VFD
- Backlight bisa rusak overtime
- Butuh power lebih

### 3. Tablet/Monitor sebagai Display (Budget Option)

**Setup:**
- Tablet Android murah (7"-10")
- Mount di pole/stand
- Connect via WiFi/Bluetooth
- Web app untuk display content

**Pros:**
- Sangat murah (tablet bekas ~Rp 500 ribu)
- Full graphics support
- Easy to replace
- Touchscreen (untuk signature/feedback)

**Cons:**
- Tidak professional look
- Butuh charging/power management
- Latency lebih tinggi

## 🔌 Koneksi dan Setup

### Interface Types

#### 1. USB (Paling Umum)

```
Computer USB → Customer Display
```

**Setup:**
- Plug & play (biasanya sebagai USB Serial/HID)
- Driver minimal atau tidak perlu
- Compatible dengan Web Serial API

**Compatible Displays:**
- Epson DM-D110 USB
- Bixolon BCD-1100 USB
- Most modern displays

#### 2. Serial (RS-232)

```
Computer Serial Port → Customer Display
```

**Setup:**
- Perlu USB-to-Serial adapter (jika PC tidak punya serial port)
- Driver COM port
- Baud rate config (biasanya 9600 atau 115200)

**Legacy displays** masih pakai ini. 

#### 3. Via Printer (Pass-through)

```
Computer USB → Thermal Printer → Customer Display
```

**Setup:**
- Display connect ke printer via dedicated port
- Printer forward commands ke display
- Single cable dari computer

**Example:**
- BIXOLON SRP-E302 memiliki port untuk customer display
- Epson TM-series dengan display port

## 💻 Display Protocols

### ESC/POS for Customer Display

Banyak customer display support **ESC/POS subset** untuk text display. 

#### Basic Commands

```typescript
// src/services/vfd-display/vfd-commands.ts

export const VFDCommands = {
  // Initialize display
  INIT: new Uint8Array([0x1B, 0x40]), // ESC @

  // Clear display
  CLEAR: new Uint8Array([0x0C]), // FF (Form Feed)

  // Cursor control
  HOME: new Uint8Array([0x0B]), // VT (Vertical Tab)
  CURSOR_TOP_LEFT: new Uint8Array([0x1B, 0x48, 0x01]), // ESC H position
  CURSOR_BOTTOM_LEFT: new Uint8Array([0x1B, 0x48, 0x02]),

  // Brightness
  BRIGHTNESS_25: new Uint8Array([0x1F, 0x58, 0x01]),
  BRIGHTNESS_50: new Uint8Array([0x1F, 0x58, 0x02]),
  BRIGHTNESS_75: new Uint8Array([0x1F, 0x58, 0x03]),
  BRIGHTNESS_100: new Uint8Array([0x1F, 0x58, 0x04]),

  // Display On/Off
  DISPLAY_ON: new Uint8Array([0x1F, 0x43, 0x01]),
  DISPLAY_OFF: new Uint8Array([0x1F, 0x43, 0x00]),

  // Line feed
  LINE_FEED: new Uint8Array([0x0A]), // LF

  // Carriage return
  CARRIAGE_RETURN: new Uint8Array([0x0D]), // CR
};

/**
 * Text positioning for 2x20 VFD
 */
export class VFDFormatter {
  private readonly CHARS_PER_LINE = 20;
  private readonly LINES = 2;

  /**
   * Format 2-line display
   * Line 1: Product name
   * Line 2: Price
   */
  formatProductDisplay(productName: string, price: number): Uint8Array {
    const commands: number[] = [];

    // Clear display
    commands.push(... VFDCommands.CLEAR);

    // Line 1: Product name (truncate if too long)
    const line1 = this.padLine(productName. substring(0, this.CHARS_PER_LINE));
    commands.push(... this.textToBytes(line1));

    // Line 2: Price (right-aligned)
    const priceStr = this.formatPrice(price);
    const line2 = this.padLine(priceStr, 'right');
    commands.push(... VFDCommands.LINE_FEED);
    commands.push(... this.textToBytes(line2));

    return new Uint8Array(commands);
  }

  /**
   * Format total display
   */
  formatTotal(subtotal: number, total: number): Uint8Array {
    const commands: number[] = [];

    commands.push(...VFDCommands.CLEAR);

    // Line 1: "TOTAL"
    const line1 = this.padLine('TOTAL', 'center');
    commands.push(...this.textToBytes(line1));

    // Line 2: Total amount
    const line2 = this.padLine(this.formatPrice(total), 'right');
    commands.push(...VFDCommands.LINE_FEED);
    commands.push(...this. textToBytes(line2));

    return new Uint8Array(commands);
  }

  /**
   * Format welcome message (idle)
   */
  formatWelcome(storeName: string): Uint8Array {
    const commands: number[] = [];

    commands.push(... VFDCommands.CLEAR);

    // Line 1: Store name
    const line1 = this.padLine(storeName, 'center');
    commands. push(...this.textToBytes(line1));

    // Line 2: Welcome message
    const line2 = this.padLine('SELAMAT DATANG', 'center');
    commands.push(... VFDCommands.LINE_FEED);
    commands.push(... this.textToBytes(line2));

    return new Uint8Array(commands);
  }

  /**
   * Pad line to fixed width
   */
  private padLine(text: string, align: 'left' | 'center' | 'right' = 'left'): string {
    const trimmed = text.substring(0, this.CHARS_PER_LINE);
    const padding = this.CHARS_PER_LINE - trimmed.length;

    switch (align) {
      case 'left':
        return trimmed + ' '.repeat(padding);
      case 'right':
        return ' '.repeat(padding) + trimmed;
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + trimmed + ' '.repeat(rightPad);
    }
  }

  /**
   * Format price as IDR
   */
  private formatPrice(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  /**
   * Convert text to bytes
   */
  private textToBytes(text: string): number[] {
    return Array.from(text).map(c => c.charCodeAt(0));
  }
}
```

### VFD Service

```typescript
// src/services/vfd-display/vfd-service.ts

import { VFDCommands, VFDFormatter } from './vfd-commands';

class VFDDisplayService {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private formatter = new VFDFormatter();
  private isConnected = false;

  /**
   * Check browser support
   */
  isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Connect to VFD display
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API not supported');
      }

      // Request port
      this.port = await navigator.serial.requestPort();

      // Open with standard VFD settings
      await this.port.open({
        baudRate: 9600, // Most VFD use 9600
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });

      // Get writer
      this.writer = this. port.writable.getWriter();

      this.isConnected = true;

      // Initialize display
      await this.sendCommand(VFDCommands. INIT);
      await this.sendCommand(VFDCommands.CLEAR);
      await this.sendCommand(VFDCommands. BRIGHTNESS_100);

      console.log('✅ VFD Display connected');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect VFD:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from display
   */
  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.releaseLock();
        this.writer = null;
      }

      if (this.port) {
        await this.port.close();
        this.port = null;
      }

      this.isConnected = false;
      console.log('VFD Display disconnected');
    } catch (error) {
      console.error('Error disconnecting VFD:', error);
    }
  }

  /**
   * Send command to display
   */
  private async sendCommand(command: Uint8Array): Promise<void> {
    if (!this.writer) {
      throw new Error('VFD not connected');
    }

    await this.writer.write(command);
  }

  /**
   * Display product (when scanned)
   */
  async showProduct(productName: string, price: number): Promise<void> {
    const display = this.formatter.formatProductDisplay(productName, price);
    await this.sendCommand(display);
  }

  /**
   * Display total
   */
  async showTotal(subtotal: number, total: number): Promise<void> {
    const display = this.formatter.formatTotal(subtotal, total);
    await this. sendCommand(display);
  }

  /**
   * Display welcome message (idle state)
   */
  async showWelcome(storeName: string = 'SELAMAT DATANG'): Promise<void> {
    const display = this.formatter.formatWelcome(storeName);
    await this.sendCommand(display);
  }

  /**
   * Display thank you message (after checkout)
   */
  async showThankYou(): Promise<void> {
    const commands: number[] = [];
    commands.push(...VFDCommands.CLEAR);
    
    // Line 1
    const line1 = '   TERIMA KASIH   ';
    commands.push(... Array.from(line1). map(c => c.charCodeAt(0)));
    
    // Line 2
    commands.push(...VFDCommands.LINE_FEED);
    const line2 = ' SAMPAI JUMPA LAGI ';
    commands.push(...Array.from(line2).map(c => c.charCodeAt(0)));

    await this.sendCommand(new Uint8Array(commands));

    // Auto-clear after 3 seconds
    setTimeout(() => {
      this.showWelcome();
    }, 3000);
  }

  /**
   * Clear display
   */
  async clear(): Promise<void> {
    await this.sendCommand(VFDCommands.CLEAR);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      type: 'VFD 2x20',
    };
  }
}

export const vfdService = new VFDDisplayService();
```

## 🔧 Integration dengan FinOpenPOS

### 1. Hook ke Product Scan

```typescript
// src/app/(dashboard)/pos/page.tsx

import { vfdService } from '@/services/vfd-display/vfd-service';

function POSPage() {
  // Saat produk di-scan
  const handleProductScan = async (barcode: string) => {
    const product = await findProductByBarcode(barcode);
    
    if (product) {
      // Add to cart
      addToCart(product);

      // Update VFD display
      await vfdService.showProduct(product.name, product.price);
    }
  };

  // Saat checkout
  const handleCheckout = async () => {
    const total = calculateTotal();
    
    // Show total di VFD
    await vfdService.showTotal(total.subtotal, total.grandTotal);
  };

  // Setelah transaksi selesai
  const handleTransactionComplete = async () => {
    // Thank you message
    await vfdService.showThankYou();
    
    // Auto-kembali ke welcome setelah 3 detik
    // (sudah di-handle di vfdService. showThankYou())
  };

  // Idle state (tidak ada transaksi)
  useEffect(() => {
    if (cart.length === 0) {
      vfdService.showWelcome('TOKO SERBAGUNA');
    }
  }, [cart]);

  return (
    // ... POS UI
  );
}
```

### 2. VFD Control Component

```typescript
// src/components/pos/VFDControls.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Power } from 'lucide-react';
import { vfdService } from '@/services/vfd-display/vfd-service';

export function VFDControls() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const status = vfdService.getStatus();
    setConnected(status. connected);
  }, []);

  const handleConnect = async () => {
    const result = await vfdService.connect();
    setConnected(result);
  };

  const handleDisconnect = async () => {
    await vfdService.disconnect();
    setConnected(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5" />
          <div>
            <p className="font-semibold">Customer Display</p>
            <p className="text-sm text-muted-foreground">VFD 2x20</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={connected ? "success" : "secondary"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>

          {connected ?  (
            <Button size="sm" variant="outline" onClick={handleDisconnect}>
              <Power className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>
              Connect
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

## 🎨 Alternative: Web-Based Display (Tablet)

### Setup untuk Budget Option

#### 1. Create Display Page

```typescript
// src/app/customer-display/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface DisplayData {
  type: 'product' | 'total' | 'welcome' | 'thankyou';
  productName?: string;
  price?: number;
  total?: number;
  storeName?: string;
}

export default function CustomerDisplayPage() {
  const [data, setData] = useState<DisplayData>({
    type: 'welcome',
    storeName: 'TOKO SERBAGUNA',
  });

  useEffect(() => {
    // Listen to WebSocket/BroadcastChannel dari POS
    const channel = new BroadcastChannel('pos-customer-display');

    channel.onmessage = (event) => {
      setData(event.data);
    };

    return () => channel.close();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl p-12 text-center">
        {data.type === 'welcome' && (
          <div>
            <h1 className="text-6xl font-bold mb-4">{data.storeName}</h1>
            <p className="text-3xl text-muted-foreground">SELAMAT DATANG</p>
          </div>
        )}

        {data.type === 'product' && (
          <div>
            <p className="text-2xl text-muted-foreground mb-2">PRODUK</p>
            <h2 className="text-5xl font-bold mb-6">{data.productName}</h2>
            <p className="text-4xl font-semibold text-green-600">
              Rp {data. price?.toLocaleString('id-ID')}
            </p>
          </div>
        )}

        {data.type === 'total' && (
          <div>
            <p className="text-3xl text-muted-foreground mb-4">TOTAL BELANJA</p>
            <h2 className="text-7xl font-bold text-blue-600">
              Rp {data.total?.toLocaleString('id-ID')}
            </h2>
          </div>
        )}

        {data.type === 'thankyou' && (
          <div>
            <h1 className="text-6xl font-bold mb-4">TERIMA KASIH</h1>
            <p className="text-3xl text-muted-foreground">Sampai Jumpa Lagi! </p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

#### 2.  Update dari POS

```typescript
// src/app/(dashboard)/pos/page.tsx

const displayChannel = new BroadcastChannel('pos-customer-display');

const updateCustomerDisplay = (data: DisplayData) => {
  displayChannel. postMessage(data);
};

// Saat scan produk
const handleScan = (product) => {
  updateCustomerDisplay({
    type: 'product',
    productName: product.name,
    price: product.price,
  });
};

// Saat checkout
const handleCheckout = (total) => {
  updateCustomerDisplay({
    type: 'total',
    total: total,
  });
};
```

#### 3. Setup Tablet

```
1.  Beli tablet Android murah (7"-10")
2. Install Chrome browser
3.  Buka http://[IP-POS]:3000/customer-display
4. Fullscreen mode (F11 atau browser settings)
5. Mount tablet di pole/stand menghadap customer
6. Keep screen always-on (developer options)
```

## ✅ Setup Checklist

**Hardware VFD:**
- [ ] VFD display compatible (2x20 character)
- [ ] USB cable terhubung
- [ ] Driver terinstall (jika perlu)
- [ ] Test via terminal/serial app
- [ ] VFD service implemented
- [ ] Integration dengan POS flow

**Web Display (Tablet):**
- [ ] Tablet/monitor tersedia
- [ ] Network connection ke POS
- [ ] Display page accessible
- [ ] BroadcastChannel communication works
- [ ] Fullscreen mode configured
- [ ] Auto-reconnect on disconnect

## 📚 Resources

- [Epson VFD Programming Manual](https://download.epson-biz.com/modules/pos/index.php?page=single_soft&cid=6774)
- [Bixolon Customer Display SDK](https://www.bixolon.com/html/en/download/down_sdk.xhtml)
- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)

---

**Next:** [Secondary Monitor Setup](../secondary-monitor/README.md)