# Integration Guide - BIXOLON SRP-E302 dengan FinOpenPOS

Panduan step-by-step integrasi thermal printer BIXOLON SRP-E302 dengan FinOpenPOS untuk print invoice/struk. 

## 📋 Daftar Isi

1. [Arsitektur Integrasi](#arsitektur-integrasi)
2. [Implementasi Printer Service](#implementasi-printer-service)
3. [Modifikasi Komponen Invoice](#modifikasi-komponen-invoice)
4. [Format Struk BIXOLON](#format-struk-bixolon)
5. [Testing dan Validasi](#testing-dan-validasi)

## 🏗️ Arsitektur Integrasi

### Flow Diagram

```
┌──────────────────┐
│   FinOpenPOS     │
│   (Next. js App)  │
└────────┬─────────┘
         │
         │ 1. User klik "Print Invoice"
         ▼
┌──────────────────────────┐
│  Invoice Component       │
│  (React/TypeScript)      │
└────────┬─────────────────┘
         │
         │ 2. Call printerService.printReceipt()
         ▼
┌──────────────────────────┐
│  Printer Service         │
│  (printer-service.ts)    │
└────────┬─────────────────┘
         │
         │ 3.  Format data → ESC/POS commands
         ▼
┌──────────────────────────┐
│  Receipt Formatter       │
│  (receipt-formatter.ts)  │
└────────┬─────────────────┘
         │
         │ 4.  Convert to bytes
         ▼
┌──────────────────────────┐
│  Web Serial API          │
│  (Browser Native)        │
└────────┬─────────────────┘
         │
         │ 5. Send via USB
         ▼
┌──────────────────────────┐
│  BIXOLON SRP-E302        │
│  🖨️ Print Struk          │
└──────────────────────────┘
```

### File Structure

```
FinOpenPOS/
├── src/
│   ├── services/
│   │   ├── printer/
│   │   │   ├── printer-service.ts           # Main printer service
│   │   │   ├── receipt-formatter. ts         # Format struk
│   │   │   ├── escpos-commands.ts           # ESC/POS constants
│   │   │   └── bixolon-config.ts            # BIXOLON specific config
│   │   └── ... 
│   ├── components/
│   │   ├── invoice/
│   │   │   ├── InvoiceDetail.tsx            # Komponen invoice (modify)
│   │   │   └── PrintButton.tsx              # Tombol print (new)
│   │   └── ...
│   └── types/
│       └── printer. ts                        # TypeScript interfaces
└── ... 
```

## 🔧 Implementasi Printer Service

### 1. Buat Types & Interfaces

```typescript name=src/types/printer.ts
/**
 * Type definitions untuk Printer Service
 */

export interface PrinterConfig {
  baudRate: number;
  dataBits: 8 | 7;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  characterWidth: 48 | 42 | 32; // Characters per line untuk 80mm
}

export interface StoreInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string; // NPWP untuk Indonesia
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  discount?: number;
}

export interface ReceiptData {
  // Store info
  store: StoreInfo;
  
  // Transaction info
  transactionId: string;
  date: Date;
  cashier?: string;
  
  // Items
  items: ReceiptItem[];
  
  // Totals
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  
  // Payment
  paymentMethod: string;
  amountPaid?: number;
  change?: number;
  
  // Footer
  footerText?: string;
}

export interface PrinterStatus {
  connected: boolean;
  model?: string;
  serialNumber?: string;
  paperStatus?: 'ok' | 'low' | 'out';
}
```

### 2.  BIXOLON Configuration

```typescript name=src/services/printer/bixolon-config. ts
/**
 * BIXOLON SRP-E302 Specific Configuration
 */

export const BIXOLON_SRP_E302_CONFIG = {
  model: 'BIXOLON SRP-E302',
  
  // Serial port settings
  baudRate: 9600,
  dataBits: 8 as const,
  stopBits: 1 as const,
  parity: 'none' as const,
  
  // Paper settings
  paperWidth: 80, // mm
  printableWidth: 72, // mm
  
  // Character settings
  charactersPerLine: {
    normal: 48,      // 12x24 font
    condensed: 64,   // 9x17 font
    large: 24,       // 24x48 font
  },
  
  // Print speed
  printSpeed: 220, // mm/sec
  
  // Auto-cutter
  autoCutter: {
    enabled: true,
    fullCut: true,
    partialCut: false,
  },
  
  // Features
  features: {
    logo: true,           // Support logo printing
    barcode1D: true,      // 1D barcode
    barcode2D: false,     // QR code (SRP-E302 tidak support)
    buzzer: true,         // Beep sound
    cashDrawer: true,     // Kick cash drawer
  },
};

export default BIXOLON_SRP_E302_CONFIG;
```

### 3. ESC/POS Commands

```typescript name=src/services/printer/escpos-commands.ts
/**
 * ESC/POS Command Constants
 * Reference: BIXOLON SRP-E302 ESC/POS Programming Manual
 */

export const ESC = 0x1b;  // ESC character
export const GS = 0x1d;   // GS character
export const LF = 0x0a;   // Line feed
export const CR = 0x0d;   // Carriage return

/**
 * Printer Control Commands
 */
export const Commands = {
  // Initialize printer
  INIT: [ESC, 0x40],
  
  // Text formatting
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  
  UNDERLINE_ON: [ESC, 0x2d, 0x01],
  UNDERLINE_OFF: [ESC, 0x2d, 0x00],
  
  DOUBLE_HEIGHT_ON: [ESC, 0x21, 0x10],
  DOUBLE_WIDTH_ON: [ESC, 0x21, 0x20],
  DOUBLE_SIZE_ON: [ESC, 0x21, 0x30],
  NORMAL_SIZE: [ESC, 0x21, 0x00],
  
  // Alternative text size (GS command)
  TEXT_SIZE: (width: number, height: number) => {
    const size = ((width - 1) << 4) | (height - 1);
    return [GS, 0x21, size];
  },
  
  // Alignment
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  
  // Feed paper
  FEED_LINES: (lines: number) => [ESC, 0x64, lines],
  FEED_DOTS: (dots: number) => [ESC, 0x4a, dots],
  
  // Cut paper
  CUT_FULL: [GS, 0x56, 0x00],
  CUT_PARTIAL: [GS, 0x56, 0x01],
  
  // Buzzer
  BEEP: [ESC, 0x42, 0x03, 0x02], // 3 beeps, 200ms each
  
  // Cash drawer
  OPEN_DRAWER: [ESC, 0x70, 0x00, 0x19, 0xfa], // Drawer kick
  
  // Barcode (1D)
  BARCODE_HEIGHT: (height: number) => [GS, 0x68, height],
  BARCODE_WIDTH: (width: number) => [GS, 0x77, width], // 2-6
  BARCODE_TEXT_POSITION: (position: number) => [GS, 0x48, position], // 0=none, 1=above, 2=below, 3=both
  BARCODE_PRINT: (type: number, data: string) => {
    const bytes = [GS, 0x6b, type, data.length];
    for (let i = 0; i < data.length; i++) {
      bytes.push(data.charCodeAt(i));
    }
    return bytes;
  },
  
  // Character set
  CHARSET_USA: [ESC, 0x52, 0x00],
  CHARSET_MULTILINGUAL: [ESC, 0x74, 0x00],
  CODE_PAGE_CP437: [ESC, 0x74, 0x00], // USA
  CODE_PAGE_CP850: [ESC, 0x74, 0x02], // Multilingual
  CODE_PAGE_CP1252: [ESC, 0x74, 0x10], // Windows Latin-1
};

/**
 * Barcode Types untuk BIXOLON
 */
export const BarcodeType = {
  UPC_A: 0,
  UPC_E: 1,
  EAN13: 2,
  EAN8: 3,
  CODE39: 4,
  ITF: 5,
  CODABAR: 6,
  CODE93: 7,
  CODE128: 8,
};

/**
 * Helper untuk convert string ke bytes
 */
export function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

/**
 * Helper untuk convert bytes array ke Uint8Array
 */
export function toUint8Array(bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}
```

### 4. Receipt Formatter

```typescript name=src/services/printer/receipt-formatter.ts
/**
 * Receipt Formatter untuk BIXOLON SRP-E302
 * Format struk/invoice sesuai standard POS Indonesia
 */

import { Commands, stringToBytes, toUint8Array, LF } from './escpos-commands';
import { ReceiptData, ReceiptItem } from '@/types/printer';
import BIXOLON_CONFIG from './bixolon-config';

export class ReceiptFormatter {
  private commands: number[] = [];
  private readonly charsPerLine = BIXOLON_CONFIG.charactersPerLine. normal;

  constructor() {
    this.commands = [];
  }

  /**
   * Build complete receipt
   */
  build(data: ReceiptData): Uint8Array {
    this.commands = [];
    
    // Initialize printer
    this.addCommand(Commands.INIT);
    
    // Header
    this.buildHeader(data. store);
    
    // Separator
    this.addSeparator();
    
    // Transaction info
    this.buildTransactionInfo(data);
    
    // Items
    this.buildItems(data.items);
    
    // Totals
    this. buildTotals(data);
    
    // Payment info
    this.buildPayment(data);
    
    // Footer
    this.buildFooter(data. footerText);
    
    // Feed and cut
    this.addCommand(Commands.FEED_LINES(3));
    this.addCommand(Commands.CUT_FULL);
    
    // Optional beep
    this.addCommand(Commands.BEEP);
    
    return toUint8Array(this.commands);
  }

  /**
   * Build header (store info)
   */
  private buildHeader(store: any) {
    // Store name (bold, double size, center)
    this.addCommand(Commands.ALIGN_CENTER);
    this.addCommand(Commands.BOLD_ON);
    this.addCommand(Commands. DOUBLE_SIZE_ON);
    this.addText(store.name);
    this.addLine();
    this.addCommand(Commands.NORMAL_SIZE);
    this.addCommand(Commands.BOLD_OFF);
    
    // Store address
    if (store.address) {
      this.addText(store.address);
      this.addLine();
    }
    
    // Phone
    if (store.phone) {
      this.addText('Telp: ' + store.phone);
      this.addLine();
    }
    
    // Tax ID (NPWP)
    if (store.taxId) {
      this.addText('NPWP: ' + store.taxId);
      this.addLine();
    }
    
    this.addCommand(Commands.ALIGN_LEFT);
  }

  /**
   * Build transaction info
   */
  private buildTransactionInfo(data: ReceiptData) {
    const dateStr = data.date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    this.addText('Tanggal: ' + dateStr);
    this.addLine();
    this.addText('No. Nota: ' + data.transactionId);
    this.addLine();
    
    if (data.cashier) {
      this.addText('Kasir: ' + data.cashier);
      this.addLine();
    }
  }

  /**
   * Build items list
   */
  private buildItems(items: ReceiptItem[]) {
    this.addSeparator();
    
    for (const item of items) {
      // Item name
      const itemName = this.truncateText(item.name, this.charsPerLine);
      this.addText(itemName);
      this.addLine();
      
      // Quantity x Price = Total
      const qtyPrice = `  ${item.quantity} x ${this.formatCurrency(item.unitPrice)}`;
      const total = this.formatCurrency(item.total);
      const spacing = this.charsPerLine - qtyPrice.length - total.length;
      
      this.addText(qtyPrice + ' '. repeat(Math.max(spacing, 1)) + total);
      this.addLine();
      
      // Discount if any
      if (item.discount && item.discount > 0) {
        const discountLine = `  Diskon: -${this.formatCurrency(item.discount)}`;
        this. addText(discountLine);
        this.addLine();
      }
    }
  }

  /**
   * Build totals section
   */
  private buildTotals(data: ReceiptData) {
    this.addSeparator();
    
    // Subtotal
    this.addTotalLine('Subtotal', data.subtotal);
    
    // Discount
    if (data.discount && data.discount > 0) {
      this.addTotalLine('Diskon', -data.discount);
    }
    
    // Tax (PPN 11% Indonesia)
    if (data.tax && data.tax > 0) {
      this.addTotalLine('PPN 11%', data.tax);
    }
    
    this.addSeparator('=');
    
    // Grand total (bold)
    this.addCommand(Commands.BOLD_ON);
    this.addCommand(Commands.DOUBLE_HEIGHT_ON);
    this.addTotalLine('TOTAL', data.total);
    this.addCommand(Commands.NORMAL_SIZE);
    this.addCommand(Commands.BOLD_OFF);
  }

  /**
   * Build payment info
   */
  private buildPayment(data: ReceiptData) {
    this.addSeparator();
    
    this.addText('Pembayaran: ' + data.paymentMethod);
    this.addLine();
    
    if (data.amountPaid) {
      this.addTotalLine('Bayar', data.amountPaid);
    }
    
    if (data.change) {
      this. addCommand(Commands.BOLD_ON);
      this.addTotalLine('Kembali', data.change);
      this.addCommand(Commands. BOLD_OFF);
    }
  }

  /**
   * Build footer
   */
  private buildFooter(footerText?: string) {
    this.addLine();
    this.addCommand(Commands.ALIGN_CENTER);
    
    const defaultFooter = [
      '================================',
      'TERIMA KASIH',
      'Barang yang sudah dibeli',
      'tidak dapat ditukar/dikembalikan',
      '================================',
    ];
    
    const footer = footerText ?  [footerText] : defaultFooter;
    
    for (const line of footer) {
      this.addText(line);
      this.addLine();
    }
    
    this.addCommand(Commands.ALIGN_LEFT);
  }

  /**
   * Add separator line
   */
  private addSeparator(char: string = '-') {
    const line = char.repeat(this.charsPerLine);
    this. addText(line);
    this.addLine();
  }

  /**
   * Add total line (label + amount)
   */
  private addTotalLine(label: string, amount: number) {
    const amountStr = this.formatCurrency(amount);
    const spacing = this.charsPerLine - label.length - amountStr.length;
    const line = label + ' '.repeat(Math.max(spacing, 1)) + amountStr;
    this.addText(line);
    this. addLine();
  }

  /**
   * Format currency (IDR)
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }). format(amount);
  }

  /**
   * Truncate text to fit line width
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Add command bytes
   */
  private addCommand(command: number | number[]) {
    if (Array.isArray(command)) {
      this.commands.push(...command);
    } else {
      this. commands.push(command);
    }
  }

  /**
   * Add text
   */
  private addText(text: string) {
    this.commands.push(... stringToBytes(text));
  }

  /**
   * Add line break
   */
  private addLine() {
    this.commands. push(LF);
  }
}
```

### 5. Main Printer Service

```typescript name=src/services/printer/printer-service.ts
/**
 * Thermal Printer Service untuk BIXOLON SRP-E302
 * Menggunakan Web Serial API
 */

import { ReceiptData, PrinterConfig, PrinterStatus } from '@/types/printer';
import { ReceiptFormatter } from './receipt-formatter';
import { Commands, toUint8Array } from './escpos-commands';
import BIXOLON_CONFIG from './bixolon-config';

class ThermalPrinterService {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private config: PrinterConfig = BIXOLON_CONFIG;
  private isConnected = false;

  /**
   * Check browser support
   */
  isSupported(): boolean {
    if (!('serial' in navigator)) {
      console.error('Web Serial API not supported');
      return false;
    }
    return true;
  }

  /**
   * Get connection status
   */
  getStatus(): PrinterStatus {
    return {
      connected: this.isConnected,
      model: this.isConnected ?  BIXOLON_CONFIG.model : undefined,
    };
  }

  /**
   * Connect to printer
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API tidak didukung di browser ini.  Gunakan Chrome/Edge.');
      }

      // Request port dari user
      this.port = await navigator.serial. requestPort();

      // Open serial port
      await this.port. open({
        baudRate: this.config.baudRate,
        dataBits: this.config. dataBits,
        stopBits: this. config.stopBits,
        parity: this.config.parity,
      });

      // Get writer
      this.writer = this.port.writable.getWriter();

      // Get reader (optional, untuk status monitoring)
      // this.reader = this.port. readable.getReader();

      this.isConnected = true;

      // Initialize printer
      await this.sendCommand(Commands.INIT);

      console.log('✅ Printer BIXOLON SRP-E302 connected');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect printer:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        this.writer. releaseLock();
        this.writer = null;
      }

      if (this.reader) {
        this.reader.releaseLock();
        this.reader = null;
      }

      if (this.port) {
        await this.port.close();
        this.port = null;
      }

      this.isConnected = false;
      console.log('Printer disconnected');
    } catch (error) {
      console. error('Error disconnecting:', error);
    }
  }

  /**
   * Send command to printer
   */
  private async sendCommand(command: number | number[]): Promise<void> {
    if (!this.writer) {
      throw new Error('Printer not connected');
    }

    const bytes = Array.isArray(command) ? command : [command];
    await this.writer.write(toUint8Array(bytes));
  }

  /**
   * Print receipt/invoice
   */
  async printReceipt(data: ReceiptData): Promise<boolean> {
    try {
      if (!this.isConnected || !this.writer) {
        throw new Error('Printer tidak terhubung.  Hubungkan printer terlebih dahulu.');
      }

      // Format receipt
      const formatter = new ReceiptFormatter();
      const receiptBytes = formatter.build(data);

      // Send to printer
      await this.writer.write(receiptBytes);

      console.log('✅ Struk berhasil dicetak');
      return true;
    } catch (error) {
      console.error('❌ Gagal mencetak struk:', error);
      throw error;
    }
  }

  /**
   * Test print
   */
  async testPrint(): Promise<boolean> {
    const testData: ReceiptData = {
      store: {
        name: 'TOKO SERBAGUNA',
        address: 'Jl. Raya No. 123, Jakarta',
        phone: '021-12345678',
        taxId: '01. 234.567. 8-901. 000',
      },
      transactionId: 'TEST-' + Date.now(),
      date: new Date(),
      cashier: 'Admin',
      items: [
        {
          name: 'Indomie Goreng',
          quantity: 2,
          unitPrice: 3000,
          total: 6000,
        },
        {
          name: 'Aqua 600ml',
          quantity: 1,
          unitPrice: 3500,
          total: 3500,
        },
      ],
      subtotal: 9500,
      tax: 1045, // PPN 11%
      total: 10545,
      paymentMethod: 'Tunai',
      amountPaid: 20000,
      change: 9455,
    };

    return await this.printReceipt(testData);
  }

  /**
   * Open cash drawer
   */
  async openDrawer(): Promise<void> {
    if (!this. isConnected) {
      throw new Error('Printer tidak terhubung');
    }
    await this.sendCommand(Commands.OPEN_DRAWER);
  }
}

// Export singleton
export const printerService = new ThermalPrinterService();
```

Apakah Anda ingin saya lanjutkan dengan:
1. **Modifikasi Komponen FinOpenPOS** (React components)
2. **Barcode Scanner Service** untuk Zebra DS9308-SR
3. **Troubleshooting Guide** lengkap
4. **GitHub Issue Templates**
5. **Complete testing guide**

Atau semua sekaligus? 