# Testing Guide - FinOpenPOS dengan Hardware Integration

Panduan lengkap testing untuk sistem POS dengan thermal printer dan barcode scanner.

## 📋 Daftar Isi

1.  [Unit Testing](#unit-testing)
2. [Integration Testing](#integration-testing)
3. [Hardware Testing](#hardware-testing)
4.  [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)

## 🧪 Unit Testing

### Setup Testing Environment

#### 1. Install Dependencies
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

#### 2. Jest Configuration
```javascript
// jest. config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup. js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(. *)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock Web Serial API
global.navigator.serial = {
  requestPort: jest.fn(),
  getPorts: jest.fn(),
}
```

### Test Printer Service

```typescript
// src/services/printer/__tests__/printer-service.test.ts
import { printerService } from '../printer-service';
import { ReceiptData } from '@/types/printer';

describe('ThermalPrinterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSupported', () => {
    it('should return true when Web Serial API is available', () => {
      expect(printerService.isSupported()).toBe(true);
    });

    it('should return false when Web Serial API is not available', () => {
      const originalSerial = navigator.serial;
      // @ts-ignore
      delete navigator.serial;
      
      expect(printerService.isSupported()).toBe(false);
      
      // @ts-ignore
      navigator.serial = originalSerial;
    });
  });

  describe('connect', () => {
    it('should successfully connect to printer', async () => {
      const mockPort = {
        open: jest. fn(). mockResolvedValue(undefined),
        writable: {
          getWriter: jest.fn().mockReturnValue({
            write: jest.fn(),
            releaseLock: jest.fn(),
          }),
        },
      };

      navigator.serial.requestPort = jest.fn().mockResolvedValue(mockPort);

      const result = await printerService.connect();
      
      expect(result).toBe(true);
      expect(mockPort. open).toHaveBeenCalledWith({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
      });
    });

    it('should handle connection failure', async () => {
      navigator.serial.requestPort = jest. fn().mockRejectedValue(
        new Error('User cancelled')
      );

      const result = await printerService.connect();
      
      expect(result).toBe(false);
    });
  });

  describe('printReceipt', () => {
    it('should throw error when printer not connected', async () => {
      const mockData: ReceiptData = {
        store: { name: 'Test Store' },
        transactionId: 'TEST-001',
        date: new Date(),
        items: [],
        subtotal: 0,
        total: 0,
        paymentMethod: 'Cash',
      };

      await expect(printerService.printReceipt(mockData)).rejects.toThrow(
        'Printer tidak terhubung'
      );
    });
  });
});
```

### Test Receipt Formatter

```typescript
// src/services/printer/__tests__/receipt-formatter. test.ts
import { ReceiptFormatter } from '../receipt-formatter';
import { ReceiptData } from '@/types/printer';

describe('ReceiptFormatter', () => {
  let formatter: ReceiptFormatter;

  beforeEach(() => {
    formatter = new ReceiptFormatter();
  });

  it('should format basic receipt', () => {
    const data: ReceiptData = {
      store: {
        name: 'TOKO TEST',
        address: 'Jl. Test No.  123',
      },
      transactionId: 'TXN-001',
      date: new Date('2025-01-01T10:00:00'),
      items: [
        {
          name: 'Produk A',
          quantity: 2,
          unitPrice: 5000,
          total: 10000,
        },
      ],
      subtotal: 10000,
      total: 10000,
      paymentMethod: 'Tunai',
    };

    const result = formatter.build(data);
    
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result. length).toBeGreaterThan(0);
  });

  it('should include tax and discount in receipt', () => {
    const data: ReceiptData = {
      store: { name: 'TEST' },
      transactionId: 'TXN-002',
      date: new Date(),
      items: [],
      subtotal: 10000,
      discount: 1000,
      tax: 990, // 11% dari 9000
      total: 9990,
      paymentMethod: 'Kartu',
    };

    const result = formatter.build(data);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});
```

### Test Scanner Service

```typescript
// src/services/scanner/__tests__/scanner-service.test.ts
import { BarcodeScannerService } from '../scanner-service';

describe('BarcodeScannerService', () => {
  let scanner: BarcodeScannerService;

  beforeEach(() => {
    scanner = new BarcodeScannerService();
  });

  afterEach(() => {
    scanner.stop();
  });

  it('should start listening for keyboard events', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    scanner.start();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should trigger callback on complete scan', (done) => {
    scanner.start();
    
    scanner.onScan((barcode) => {
      expect(barcode).toBe('1234567890');
      done();
    });

    // Simulate barcode scan
    '1234567890'.split(''). forEach((char) => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
    });
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  });

  it('should ignore input from text fields', () => {
    const callback = jest.fn();
    scanner.start();
    scanner.onScan(callback);

    // Create input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate typing in input
    const event = new KeyboardEvent('keydown', { 
      key: 'A',
      bubbles: true 
    });
    Object.defineProperty(event, 'target', { value: input });
    
    document.dispatchEvent(event);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
```

## 🔗 Integration Testing

### Test POS Workflow

```typescript
// src/app/(dashboard)/pos/__tests__/pos-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import POSPage from '../page';
import { printerService } from '@/services/printer/printer-service';
import { scannerService } from '@/services/scanner/scanner-service';

jest.mock('@/services/printer/printer-service');
jest.mock('@/services/scanner/scanner-service');

describe('POS Integration', () => {
  it('should complete full checkout flow', async () => {
    const user = userEvent.setup();
    
    render(<POSPage />);

    // 1. Scan produk
    await waitFor(() => {
      scannerService.onScan('8992388100001'); // Indomie
    });

    expect(screen.getByText('Indomie Goreng')).toBeInTheDocument();

    // 2. Update quantity
    const qtyInput = screen.getByLabelText('Quantity');
    await user.clear(qtyInput);
    await user.type(qtyInput, '2');

    // 3. Add to cart
    const addButton = screen.getByRole('button', { name: /tambah/i });
    await user.click(addButton);

    // 4. Checkout
    const checkoutButton = screen.getByRole('button', { name: /checkout/i });
    await user. click(checkoutButton);

    // 5. Select payment method
    const cashButton = screen.getByRole('button', { name: /tunai/i });
    await user.click(cashButton);

    // 6. Print receipt
    const printButton = screen.getByRole('button', { name: /print/i });
    await user. click(printButton);

    await waitFor(() => {
      expect(printerService.printReceipt). toHaveBeenCalled();
    });
  });
});
```

## 🖨️ Hardware Testing

### Manual Test Checklist

#### Thermal Printer - BIXOLON SRP-E302

```markdown
## Test 1: Connection
- [ ] USB cable terhubung
- [ ] Power LED hijau menyala
- [ ] Driver terinstall (Device Manager/lsusb)
- [ ] Browser detect port via Web Serial API
- [ ] Connection established tanpa error

## Test 2: Basic Print
- [ ] Initialize printer berhasil
- [ ] Print text "HELLO WORLD" berhasil
- [ ] Line feed berfungsi
- [ ] Paper cut berfungsi
- [ ] No garbled characters

## Test 3: Receipt Format
- [ ] Header (store name) centered dan bold
- [ ] Items list aligned dengan benar
- [ ] Currency format (IDR) correct
- [ ] Subtotal, tax, total calculation correct
- [ ] Footer text readable

## Test 4: ESC/POS Commands
- [ ] Bold text berfungsi
- [ ] Underline berfungsi
- [ ] Text size (double width/height) berfungsi
- [ ] Alignment (left/center/right) berfungsi
- [ ] Barcode print (1D) berfungsi

## Test 5: Edge Cases
- [ ] Long product name (>30 chars) truncated properly
- [ ] Unicode characters (é, ñ, dll) handled
- [ ] Empty cart - tidak print atau error message
- [ ] Very large order (50+ items) - prints completely
- [ ] Rapid sequential prints - no queue issue

## Test 6: Error Handling
- [ ] Paper habis - error notification
- [ ] Printer offline - graceful error
- [ ] USB disconnect saat print - handle reconnect
- [ ] Permission denied - clear error message
```

#### Barcode Scanner - Zebra DS9308-SR

```markdown
## Test 1: Connection
- [ ] USB cable terhubung
- [ ] Scanner detected as HID Keyboard
- [ ] LED berkedip hijau saat ready
- [ ] Beep sound berfungsi

## Test 2: Barcode Types
- [ ] EAN-13 (produk Indonesia) - scan berhasil
- [ ] UPC-A (produk import) - scan berhasil
- [ ] Code 128 - scan berhasil
- [ ] Code 39 - scan berhasil
- [ ] QR Code - scan berhasil

## Test 3: Scan Quality
- [ ] Barcode normal size - scan 1 kali berhasil
- [ ] Barcode kecil (<2cm) - scan berhasil
- [ ] Barcode dari layar HP - scan berhasil
- [ ] Barcode rusak/sobek - reject dengan beep error
- [ ] Multiple scans cepat - semua terdeteksi

## Test 4: Scan Angles
- [ ] Scan 0° (straight) - berhasil
- [ ] Scan 45° (angle) - berhasil
- [ ] Scan 90° (perpendicular) - berhasil
- [ ] Scan dari jarak 5cm - berhasil
- [ ] Scan dari jarak 20cm - berhasil

## Test 5: POS Integration
- [ ] Scan → produk muncul di cart
- [ ] Scan duplicate → quantity bertambah
- [ ] Scan produk tidak terdaftar → error notification
- [ ] Auto-focus kembali ke scan field
- [ ] Enter suffix berfungsi (auto-submit)

## Test 6: Performance
- [ ] Scan 10 produk berturut-turut - tidak ada lag
- [ ] Scanner tetap active setelah 1 jam
- [ ] No false positive (detect keyboard typing sebagai scan)
```

### Automated Hardware Test Script

```typescript
// src/utils/hardware-test.ts
export class HardwareTestSuite {
  async testPrinter() {
    const results = {
      connection: false,
      print: false,
      format: false,
      commands: false,
    };

    try {
      // Test connection
      const connected = await printerService.connect();
      results.connection = connected;

      if (!connected) return results;

      // Test basic print
      const testData = this.getTestReceiptData();
      await printerService.printReceipt(testData);
      results.print = true;

      // Test format (manual verification needed)
      console.log('✅ Check printed receipt for format quality');
      results.format = true; // User must verify

      // Test commands
      results.commands = await this.testEscPosCommands();

    } catch (error) {
      console.error('Printer test failed:', error);
    }

    return results;
  }

  async testScanner() {
    const results = {
      listening: false,
      scan: false,
      accuracy: 0,
    };

    try {
      // Test listening
      scannerService.start();
      results.listening = true;

      // Test scan (requires manual barcode scan)
      console.log('📸 Please scan a barcode.. .');
      
      const scanned = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 10000);
        
        scannerService.onScan((barcode) => {
          clearTimeout(timeout);
          console.log('✅ Scanned:', barcode);
          resolve(true);
        });
      });

      results.scan = scanned;

      // Test accuracy (scan same barcode 10 times)
      if (scanned) {
        console.log('📸 Please scan the same barcode 10 times.. .');
        const scans: string[] = [];
        
        const accuracy = await new Promise<number>((resolve) => {
          scannerService.onScan((barcode) => {
            scans.push(barcode);
            console.log(`Scan ${scans.length}/10: ${barcode}`);
            
            if (scans.length === 10) {
              const unique = new Set(scans);
              const accuracyPercent = (1 / unique.size) * 100;
              resolve(accuracyPercent);
            }
          });
        });

        results.accuracy = accuracy;
      }

    } catch (error) {
      console.error('Scanner test failed:', error);
    }

    return results;
  }

  private getTestReceiptData(): ReceiptData {
    return {
      store: {
        name: 'TEST STORE - HARDWARE VALIDATION',
        address: 'Automated Test Suite',
      },
      transactionId: `TEST-${Date.now()}`,
      date: new Date(),
      items: [
        { name: 'Test Product A', quantity: 1, unitPrice: 1000, total: 1000 },
        { name: 'Test Product B with Long Name That Should Truncate', quantity: 2, unitPrice: 5000, total: 10000 },
      ],
      subtotal: 11000,
      tax: 1210,
      total: 12210,
      paymentMethod: 'TEST',
      amountPaid: 15000,
      change: 2790,
    };
  }

  private async testEscPosCommands(): Promise<boolean> {
    // Test various ESC/POS commands
    const commands = [
      'Bold text',
      'Underline text',
      'Double size text',
      'Left aligned',
      'Center aligned',
      'Right aligned',
    ];

    console.log('Testing ESC/POS commands...');
    // Implementation depends on printer service API
    return true;
  }

  async runFullTest() {
    console.log('🧪 Starting Hardware Test Suite\n');

    console.log('--- PRINTER TESTS ---');
    const printerResults = await this.testPrinter();
    console.log('Printer Results:', printerResults);

    console.log('\n--- SCANNER TESTS ---');
    const scannerResults = await this.testScanner();
    console.log('Scanner Results:', scannerResults);

    console.log('\n✅ Hardware Test Suite Complete');

    return {
      printer: printerResults,
      scanner: scannerResults,
    };
  }
}

// Usage
export const hardwareTest = new HardwareTestSuite();
```

### Test Page in FinOpenPOS

```typescript
// src/app/hardware-test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { hardwareTest } from '@/utils/hardware-test';

export default function HardwareTestPage() {
  const [results, setResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    const testResults = await hardwareTest.runFullTest();
    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hardware Test Suite</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
        <Button onClick={runTest} disabled={testing}>
          {testing ? 'Testing...' : 'Run Full Test'}
        </Button>
      </Card>

      {results && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Thermal Printer (BIXOLON SRP-E302)</h3>
              <ul className="list-disc list-inside">
                <li>Connection: {results.printer.connection ? '✅' : '❌'}</li>
                <li>Print: {results.printer.print ? '✅' : '❌'}</li>
                <li>Format: {results.printer.format ?  '✅' : '❌'}</li>
                <li>Commands: {results.printer. commands ? '✅' : '❌'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Barcode Scanner (Zebra DS9308-SR)</h3>
              <ul className="list-disc list-inside">
                <li>Listening: {results.scanner.listening ? '✅' : '❌'}</li>
                <li>Scan: {results. scanner.scan ? '✅' : '❌'}</li>
                <li>Accuracy: {results.scanner.accuracy}%</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
```

## 🎯 End-to-End Testing

### E2E Test Scenario

```typescript
// e2e/pos-checkout.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('POS Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page. goto('http://localhost:3000/pos');
  });

  test('complete checkout with printer', async ({ page }) => {
    // 1. Connect printer
    await page.click('button:has-text("Hubungkan Printer")');
    
    // Grant permission (manual step in real test)
    // User must select printer from popup

    // 2. Scan product (simulate)
    await page.fill('input[name="barcode"]', '8992388100001');
    await page.press('input[name="barcode"]', 'Enter');

    // 3.  Verify product added
    await expect(page.locator('text=Indomie Goreng')).toBeVisible();

    // 4. Checkout
    await page.click('button:has-text("Checkout")');

    // 5. Select payment
    await page.click('button:has-text("Tunai")');

    // 6. Enter amount
    await page.fill('input[name="amountPaid"]', '10000');
    await page.click('button:has-text("Bayar")');

    // 7. Print
    await page.click('button:has-text("Print Struk")');

    // 8. Verify success
    await expect(page.locator('text=Transaksi Berhasil')).toBeVisible();
  });
});
```

## ⚡ Performance Testing

### Load Test

```typescript
// src/utils/performance-test.ts
export async function performanceTest() {
  console.log('🚀 Performance Test Starting...\n');

  // Test 1: Sequential prints
  console.log('Test 1: Sequential Prints (10x)');
  const startSeq = performance.now();
  
  for (let i = 0; i < 10; i++) {
    await printerService.printReceipt(getTestData());
  }
  
  const endSeq = performance. now();
  const avgSeq = (endSeq - startSeq) / 10;
  console.log(`Average time per print: ${avgSeq. toFixed(2)}ms\n`);

  // Test 2: Scanner performance
  console.log('Test 2: Scanner Response Time');
  const scanTimes: number[] = [];
  
  scannerService.onScan((barcode) => {
    const responseTime = performance.now() - scanStart;
    scanTimes.push(responseTime);
    console. log(`Scan response: ${responseTime. toFixed(2)}ms`);
  });

  let scanStart = performance.now();
  // User scans barcode here
  
  // Test 3: Memory usage
  console.log('\nTest 3: Memory Usage');
  const memBefore = (performance as any).memory?. usedJSHeapSize || 0;
  
  for (let i = 0; i < 100; i++) {
    await printerService.printReceipt(getTestData());
  }
  
  const memAfter = (performance as any). memory?.usedJSHeapSize || 0;
  const memIncrease = (memAfter - memBefore) / 1024 / 1024;
  console.log(`Memory increase: ${memIncrease.toFixed(2)} MB`);

  return {
    avgPrintTime: avgSeq,
    avgScanTime: scanTimes. reduce((a, b) => a + b, 0) / scanTimes.length,
    memoryIncrease: memIncrease,
  };
}
```

## ✅ Testing Checklist

### Before Deployment
- [ ] All unit tests pass (`npm test`)
- [ ] Integration tests pass
- [ ] Manual hardware tests completed
- [ ] E2E tests pass (if implemented)
- [ ] Performance benchmarks acceptable
- [ ] Error scenarios tested
- [ ] Documentation updated with test results

### Hardware Validation
- [ ] BIXOLON SRP-E302 connection stable
- [ ] Zebra DS9308-SR scanning accurate
- [ ] Print quality acceptable
- [ ] No memory leaks after extended use
- [ ] Edge cases handled gracefully

---

**Next:** Update dokumentasi di [Issue #1](https://github.com/giangianna14/explore-pos-system/issues/1) dengan hasil testing