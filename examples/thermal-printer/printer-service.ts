/**
 * Thermal Printer Service
 * Service untuk koneksi dan kontrol thermal printer via Web Serial API
 * 
 * Compatible dengan ESC/POS thermal printers
 * Browser support: Chrome 89+, Edge 89+
 */

interface PrinterConfig {
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'none' | 'even' | 'odd';
}

interface ReceiptData {
  storeName: string;
  storeAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  transactionId: string;
  date: Date;
}

class ThermalPrinterService {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private config: PrinterConfig = {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
  };

  /**
   * Check if browser supports Web Serial API
   */
  isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Request user to select printer port
   */
  async connect(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API not supported in this browser');
      }

      // Request port from user
      this.port = await navigator.serial.requestPort();
      
      // Open connection
      await this.port.open(this.config);
      
      // Get writer for sending data
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable. pipeTo(this.port.writable);
      this.writer = textEncoder.writable.getWriter();

      console.log('Printer connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect printer:', error);
      return false;
    }
  }

  /**
   * Disconnect from printer
   */
  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      
      console.log('Printer disconnected');
    } catch (error) {
      console.error('Error disconnecting printer:', error);
    }
  }

  /**
   * Send raw bytes to printer
   */
  private async sendBytes(bytes: Uint8Array): Promise<void> {
    if (!this.port || !this.writer) {
      throw new Error('Printer not connected');
    }

    const buffer = new Uint8Array(bytes);
    await this.writer.write(buffer);
  }

  /**
   * Send text to printer
   */
  private async sendText(text: string): Promise<void> {
    const encoder = new TextEncoder();
    await this.sendBytes(encoder.encode(text));
  }

  /**
   * ESC/POS Commands
   */
  private ESC = 0x1b;
  private GS = 0x1d;

  async initialize(): Promise<void> {
    await this.sendBytes(new Uint8Array([this.ESC, 0x40])); // Initialize
  }

  async setBold(enable: boolean): Promise<void> {
    await this.sendBytes(new Uint8Array([this.ESC, 0x45, enable ? 1 : 0]));
  }

  async setUnderline(enable: boolean): Promise<void> {
    await this.sendBytes(new Uint8Array([this.ESC, 0x2d, enable ? 1 : 0]));
  }

  async setAlign(alignment: 'left' | 'center' | 'right'): Promise<void> {
    const alignCode = alignment === 'left' ? 0 : alignment === 'center' ? 1 : 2;
    await this.sendBytes(new Uint8Array([this.ESC, 0x61, alignCode]));
  }

  async setTextSize(width: number, height: number): Promise<void> {
    const size = ((width - 1) << 4) | (height - 1);
    await this.sendBytes(new Uint8Array([this. GS, 0x21, size]));
  }

  async feed(lines: number = 1): Promise<void> {
    await this.sendBytes(new Uint8Array([this.ESC, 0x64, lines]));
  }

  async cut(): Promise<void> {
    await this.sendBytes(new Uint8Array([this. GS, 0x56, 0x00])); // Full cut
  }

  async openCashDrawer(): Promise<void> {
    await this.sendBytes(new Uint8Array([this.ESC, 0x70, 0x00, 0x19, 0xfa]));
  }

  /**
   * Print receipt/invoice
   */
  async printReceipt(data: ReceiptData): Promise<void> {
    try {
      if (!this.port) {
        throw new Error('Printer not connected.  Call connect() first.');
      }

      await this.initialize();

      // Header - Store Name
      await this.setAlign('center');
      await this.setBold(true);
      await this.setTextSize(2, 2);
      await this.sendText(data.storeName + '\n');
      await this.setTextSize(1, 1);
      await this.setBold(false);

      // Store Address
      if (data.storeAddress) {
        await this.sendText(data.storeAddress + '\n');
      }

      await this.feed(1);
      await this.sendText('================================\n');
      await this. feed(1);

      // Date and Transaction ID
      await this.setAlign('left');
      await this.sendText(`Tanggal: ${data.date.toLocaleString('id-ID')}\n`);
      await this.sendText(`ID Transaksi: ${data. transactionId}\n`);
      await this.feed(1);
      await this.sendText('--------------------------------\n');

      // Items
      for (const item of data.items) {
        const itemLine = this.formatItemLine(
          item.name,
          item.quantity,
          item.price,
          item.total
        );
        await this.sendText(itemLine);
      }

      await this.sendText('--------------------------------\n');

      // Totals
      await this.sendText(this.formatTotalLine('Subtotal', data.subtotal));
      
      if (data.discount && data.discount > 0) {
        await this.sendText(this.formatTotalLine('Diskon', -data.discount));
      }
      
      if (data.tax && data.tax > 0) {
        await this.sendText(this.formatTotalLine('Pajak', data.tax));
      }

      await this.setBold(true);
      await this.sendText(this.formatTotalLine('TOTAL', data.total));
      await this.setBold(false);

      await this.sendText('--------------------------------\n');

      // Payment method
      await this.sendText(`Metode Pembayaran: ${data.paymentMethod}\n`);

      await this.feed(2);

      // Footer
      await this.setAlign('center');
      await this.sendText('Terima Kasih\n');
      await this.sendText('Silakan datang kembali!\n');

      await this.feed(3);
      await this.cut();

      console.log('Receipt printed successfully');
    } catch (error) {
      console.error('Failed to print receipt:', error);
      throw error;
    }
  }

  /**
   * Format item line (name, qty, price, total)
   */
  private formatItemLine(
    name: string,
    qty: number,
    price: number,
    total: number
  ): string {
    const maxNameLength = 20;
    const truncatedName = name.length > maxNameLength
      ? name.substring(0, maxNameLength - 3) + '...'
      : name. padEnd(maxNameLength);

    const qtyStr = `${qty}x`;
    const priceStr = this.formatCurrency(price);
    const totalStr = this.formatCurrency(total);

    return `${truncatedName}\n  ${qtyStr} @ ${priceStr}      ${totalStr}\n`;
  }

  /**
   * Format total line (label and amount)
   */
  private formatTotalLine(label: string, amount: number): string {
    const lineWidth = 32;
    const amountStr = this.formatCurrency(amount);
    const spaces = lineWidth - label.length - amountStr.length;
    return `${label}${' '.repeat(Math.max(spaces, 1))}${amountStr}\n`;
  }

  /**
   * Format currency (IDR)
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

// Export singleton instance
export const printerService = new ThermalPrinterService();

// Export types
export type { ReceiptData, PrinterConfig };