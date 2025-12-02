# Eksplorasi Cash Drawer untuk POS System

Dokumentasi integrasi cash drawer (laci uang otomatis) dengan FinOpenPOS menggunakan thermal printer sebagai trigger.

## 📋 Daftar Isi

1. [Pengenalan Cash Drawer](#pengenalan)
2. [Cara Kerja Cash Drawer](#cara-kerja)
3. [Koneksi dengan Thermal Printer](#koneksi-printer)
4. [Integration Guide](#integration-guide)
5.  [Troubleshooting](#troubleshooting)

## 💰 Pengenalan

### Apa itu Cash Drawer? 

Cash drawer adalah laci uang otomatis yang digunakan di kasir untuk menyimpan uang tunai, coins, dan struk.  Dibuka secara elektronik melalui:
- **Thermal printer** (paling umum - via RJ-11/RJ-12 cable)
- **Cash drawer driver** (USB/Serial connection)
- **Manual key**

### Keunggulan Cash Drawer untuk POS
- ✅ **Keamanan**: Otomatis terkunci, tidak bisa dibuka sembarangan
- ✅ **Audit Trail**: Log setiap pembukaan untuk tracking
- ✅ **Efisiensi**: Buka otomatis saat transaksi selesai
- ✅ **Organisasi**: Kompartemen terpisah untuk bills & coins
- ✅ **Durability**: Tahan buka-tutup ribuan kali per hari

## 🔌 Cara Kerja Cash Drawer

### Koneksi via Thermal Printer (Recommended)

```
┌──────────────┐
│   Computer   │
│  (FinOpenPOS)│
└──────┬───────┘
       │ USB
       ▼
┌──────────────────┐
│ Thermal Printer  │
│ BIXOLON SRP-E302 │
└──────┬───────────┘
       │ RJ-11/RJ-12 Cable
       ▼
┌──────────────────┐
│  Cash Drawer     │
│  (Auto-Lock)     │
└──────────────────┘
```

**Flow:**
1. POS kirim ESC/POS command "Open Drawer" ke printer
2. Printer kirim electrical pulse via RJ-11 port
3. Cash drawer solenoid activated
4. Drawer terbuka (±0.5 detik)
5. User ambil/simpan uang
6. User tutup drawer manual (kunci otomatis)

### Spesifikasi Hardware

#### Compatible Cash Drawers
**Recommended Models:**

1. **Star Micronics CD3-1616 (37x16)**
   - Dimensi: 370mm (W) x 160mm (D)
   - Interface: RJ-11 (6P6C)
   - Voltage: 24V DC
   - Kompartemen: 5 bills, 5 coins
   - Harga: ~Rp 2.5 juta

2. **APG Vasario 1616**
   - Dimensi: 16" x 16"
   - Interface: RJ-12 (6P6C) atau Micro-USB
   - Voltage: 24V DC / 12V DC
   - Kompartemen: 4 bills, 5 coins
   - Harga: ~Rp 3 juta

3. **Generic Cash Drawer 350/360**
   - Dimensi: 350mm atau 360mm width
   - Interface: RJ-11
   - Voltage: 12V DC
   - Kompartemen: 3-5 bills, 4-5 coins
   - Harga: ~Rp 800 ribu - 1.5 juta

#### Cable & Connector

```
RJ-11/RJ-12 Pinout:
┌─────────────┐
│ 1 2 3 4 5 6 │  (6P6C)
└─────────────┘

Pin 1: +24V (or +12V)
Pin 2: Signal
Pin 3: Ground
Pin 4-6: NC (Not Connected)

⚠️ PENTING: 
- Cek voltage drawer vs printer output! 
- BIXOLON SRP-E302 output: 24V DC, 1A
```

## 🖨️ Koneksi dengan Thermal Printer

### Hardware Setup

#### 1. Physical Connection

```bash
# Step-by-step
1. Matikan printer dan cash drawer
2. Hubungkan RJ-11 cable dari drawer ke printer port
   - Printer BIXOLON SRP-E302 memiliki port "DK" (Drawer Kick)
   - Colokkan RJ-11 cable ke port DK
3. Pastikan cable terpasang kencang
4. Nyalakan printer
5. Test drawer dengan tombol manual (jika ada)
```

#### 2. Verify Connection

**Test 1: Manual Test Button**
```
Banyak drawer memiliki tombol test di bawah/samping
- Tekan tombol test
- Drawer harus terbuka
- ✅ = Hardware OK
```

**Test 2: Printer Self-Test**
```
BIXOLON SRP-E302:
1. Matikan printer
2. Tahan tombol FEED sambil nyalakan
3. Lepas tombol saat print mulai
4. Self-test akan print dan buka drawer
5. ✅ = Connection OK
```

### Software Integration

#### ESC/POS Command untuk Open Drawer

```typescript
// src/services/cash-drawer/drawer-commands.ts

/**
 * ESC/POS Command untuk kick cash drawer
 * BIXOLON SRP-E302 compatible
 */

export const DrawerCommands = {
  /**
   * Standard drawer kick command
   * ESC p m t1 t2
   * 
   * m: Drawer number (0 = Drawer 1, 1 = Drawer 2)
   * t1: ON time (pulse width) - 0-255 (units of 2ms)
   * t2: OFF time (pulse interval) - 0-255 (units of 2ms)
   */
  
  // Drawer 1, standard timing (100ms ON, 500ms OFF)
  OPEN_DRAWER_1: new Uint8Array([
    0x1B, // ESC
    0x70, // p
    0x00, // m = 0 (Drawer 1)
    0x32, // t1 = 50 (50 * 2ms = 100ms ON)
    0xFA, // t2 = 250 (250 * 2ms = 500ms OFF)
  ]),

  // Drawer 2 (jika ada dual drawer)
  OPEN_DRAWER_2: new Uint8Array([
    0x1B, // ESC
    0x70, // p
    0x01, // m = 1 (Drawer 2)
    0x32, // t1 = 50
    0xFA, // t2 = 250
  ]),

  /**
   * Alternative command (some printers)
   * BEL (0x07) character
   */
  OPEN_DRAWER_BEL: new Uint8Array([0x07]),

  /**
   * Star Micronics specific command
   */
  OPEN_DRAWER_STAR: new Uint8Array([
    0x1B, // ESC
    0x07, // BEL
  ]),
};

/**
 * Timing presets untuk berbagai drawer types
 */
export const DrawerTimings = {
  FAST: { t1: 0x19, t2: 0x32 },    // 50ms ON, 100ms OFF - fast solenoid
  NORMAL: { t1: 0x32, t2: 0xFA },  // 100ms ON, 500ms OFF - standard
  SLOW: { t1: 0x64, t2: 0xFF },    // 200ms ON, 510ms OFF - heavy drawer
};
```

#### Cash Drawer Service

```typescript
// src/services/cash-drawer/drawer-service.ts

import { printerService } from '../printer/printer-service';
import { DrawerCommands } from './drawer-commands';

export enum DrawerOpenReason {
  TRANSACTION = 'transaction',
  CASH_IN = 'cash_in',
  CASH_OUT = 'cash_out',
  MANUAL = 'manual',
  SHIFT_START = 'shift_start',
  SHIFT_END = 'shift_end',
}

interface DrawerLog {
  id: string;
  timestamp: Date;
  reason: DrawerOpenReason;
  userId?: string;
  amount?: number;
  note?: string;
}

class CashDrawerService {
  private logs: DrawerLog[] = [];
  private isOpen = false;

  /**
   * Open cash drawer
   */
  async open(reason: DrawerOpenReason, amount?: number, note?: string): Promise<boolean> {
    try {
      // Check printer connected
      const printerStatus = printerService.getStatus();
      if (!printerStatus.connected) {
        throw new Error('Printer tidak terhubung.  Hubungkan printer terlebih dahulu.');
      }

      // Send command to printer
      await this.sendDrawerCommand();

      // Log the event
      this.logDrawerOpen(reason, amount, note);

      this.isOpen = true;

      console.log(`✅ Cash drawer opened: ${reason}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to open cash drawer:', error);
      throw error;
    }
  }

  /**
   * Send ESC/POS command via printer
   */
  private async sendDrawerCommand(): Promise<void> {
    // Gunakan printer service untuk kirim command
    const port = (printerService as any).port;
    const writer = port?. writable?. getWriter();

    if (!writer) {
      throw new Error('Printer writer not available');
    }

    try {
      await writer.write(DrawerCommands.OPEN_DRAWER_1);
    } finally {
      writer.releaseLock();
    }
  }

  /**
   * Log drawer opening untuk audit trail
   */
  private logDrawerOpen(reason: DrawerOpenReason, amount?: number, note?: string): void {
    const log: DrawerLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      reason,
      amount,
      note,
    };

    this.logs.push(log);

    // Simpan ke localStorage untuk persistence
    this.saveLogs();

    // Optional: Kirim ke server untuk central audit
    // await this.syncToServer(log);
  }

  /**
   * Get drawer logs (audit trail)
   */
  getLogs(startDate?: Date, endDate?: Date): DrawerLog[] {
    let filtered = this.logs;

    if (startDate) {
      filtered = filtered.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(log => log.timestamp <= endDate);
    }

    return filtered.sort((a, b) => b.timestamp. getTime() - a.timestamp. getTime());
  }

  /**
   * Get today's drawer activity summary
   */
  getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = this.getLogs(today);

    return {
      totalOpens: todayLogs.length,
      transactions: todayLogs.filter(l => l.reason === DrawerOpenReason.TRANSACTION).length,
      cashIn: todayLogs.filter(l => l. reason === DrawerOpenReason. CASH_IN)
        .reduce((sum, l) => sum + (l.amount || 0), 0),
      cashOut: todayLogs.filter(l => l.reason === DrawerOpenReason.CASH_OUT)
        .reduce((sum, l) => sum + (l.amount || 0), 0),
      manual: todayLogs.filter(l => l.reason === DrawerOpenReason.MANUAL). length,
    };
  }

  /**
   * Save logs to localStorage
   */
  private saveLogs(): void {
    try {
      localStorage.setItem('cash_drawer_logs', JSON.stringify(this.logs));
    } catch (error) {
      console. error('Failed to save drawer logs:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  loadLogs(): void {
    try {
      const saved = localStorage.getItem('cash_drawer_logs');
      if (saved) {
        this.logs = JSON.parse(saved). map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load drawer logs:', error);
    }
  }

  /**
   * Export logs untuk audit/report
   */
  exportLogs(startDate?: Date, endDate?: Date): string {
    const logs = this. getLogs(startDate, endDate);
    
    // Convert to CSV
    const headers = ['Timestamp', 'Reason', 'Amount', 'Note'];
    const rows = logs.map(log => [
      log.timestamp.toLocaleString('id-ID'),
      log.reason,
      log.amount?. toString() || '',
      log.note || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  }
}

export const drawerService = new CashDrawerService();

// Load logs saat init
drawerService.loadLogs();
```

## 🔧 Integration dengan FinOpenPOS

### 1. Buka Drawer Otomatis Setelah Checkout

```typescript
// src/app/(dashboard)/pos/page.tsx
import { drawerService, DrawerOpenReason } from '@/services/cash-drawer/drawer-service';

async function handleCheckout(orderData: OrderData) {
  try {
    // 1. Process payment
    const order = await processOrder(orderData);

    // 2. Print receipt
    await printerService.printReceipt(receiptData);

    // 3. Open drawer (jika payment = Cash)
    if (orderData.paymentMethod === 'CASH') {
      await drawerService.open(
        DrawerOpenReason. TRANSACTION,
        orderData.total,
        `Order #${order.id}`
      );
    }

    // 4. Show success
    toast.success('Transaksi berhasil! ');
  } catch (error) {
    toast.error('Gagal: ' + error.message);
  }
}
```

### 2. Manual Drawer Open

```typescript
// src/components/pos/DrawerControls.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { drawerService, DrawerOpenReason } from '@/services/cash-drawer/drawer-service';
import { useToast } from '@/components/ui/use-toast';

export function DrawerControls() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DrawerOpenReason>(DrawerOpenReason.MANUAL);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const handleOpen = async () => {
    try {
      await drawerService.open(
        reason,
        amount ? parseFloat(amount) : undefined,
        note || undefined
      );

      toast({
        title: '✅ Laci Terbuka',
        description: 'Cash drawer berhasil dibuka',
      });

      setOpen(false);
      setAmount('');
      setNote('');
    } catch (error) {
      toast({
        title: '❌ Gagal',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="mr-2 h-4 w-4" />
          Buka Laci
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buka Cash Drawer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Alasan</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as DrawerOpenReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DrawerOpenReason.MANUAL}>Manual</SelectItem>
                <SelectItem value={DrawerOpenReason.CASH_IN}>Tambah Uang (Cash In)</SelectItem>
                <SelectItem value={DrawerOpenReason.CASH_OUT}>Ambil Uang (Cash Out)</SelectItem>
                <SelectItem value={DrawerOpenReason. SHIFT_START}>Mulai Shift</SelectItem>
                <SelectItem value={DrawerOpenReason.SHIFT_END}>Akhir Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(reason === DrawerOpenReason. CASH_IN || reason === DrawerOpenReason.CASH_OUT) && (
            <div>
              <Label>Jumlah (Rp)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          <div>
            <Label>Catatan (Optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Modal awal hari ini"
            />
          </div>

          <Button onClick={handleOpen} className="w-full">
            Buka Laci
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3.  Drawer Activity Log

```typescript
// src/components/pos/DrawerActivityLog.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { drawerService } from '@/services/cash-drawer/drawer-service';
import { Download } from 'lucide-react';

export function DrawerActivityLog() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = () => {
    const data = drawerService.getTodaySummary();
    setSummary(data);
  };

  const handleExport = () => {
    const csv = drawerService.exportLogs();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL. createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawer-log-${new Date().toISOString(). split('T')[0]}.csv`;
    a.click();
  };

  if (!summary) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aktivitas Laci Hari Ini</CardTitle>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Pembukaan</p>
            <p className="text-2xl font-bold">{summary.totalOpens}x</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transaksi</p>
            <p className="text-2xl font-bold">{summary.transactions}x</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kas Masuk</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {summary.cashIn. toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kas Keluar</p>
            <p className="text-2xl font-bold text-red-600">
              Rp {summary.cashOut. toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🛠️ Troubleshooting

### ❌ Drawer tidak terbuka

**Gejala:** Command terkirim tapi drawer tidak terbuka

**Solusi:**

1. **Check Physical Connection**
```
✅ RJ-11 cable terpasang kencang
✅ Cable tidak rusak/putus
✅ Port printer "DK" digunakan (bukan port lain)
```

2. **Check Voltage**
```
Drawer: 24V DC → Printer output: 24V DC ✅
Drawer: 12V DC → Printer output: 24V DC ❌ (butuh adapter/converter)

BIXOLON SRP-E302 output: 24V DC, 1A
```

3. **Test Manual Button**
```
Tekan tombol test di drawer
- Terbuka = Hardware OK, problem di software/connection
- Tidak terbuka = Hardware issue (solenoid rusak/power)
```

4. **Adjust Timing**
```typescript
// Coba timing lebih lama
const OPEN_DRAWER_CUSTOM = new Uint8Array([
  0x1B, 0x70, 0x00,
  0x64, // t1 = 100 (200ms ON) - lebih lama
  0xFF, // t2 = 255 (510ms OFF)
]);
```

### ❌ Drawer terbuka tapi tidak konsisten

**Solusi:**

1. **Check Power Supply**
```
- Pastikan printer power adapter terpasang (bukan USB only)
- USB power tidak cukup untuk kick drawer
- Gunakan dedicated power adapter 24V
```

2. **Check Solenoid**
```
- Solenoid lemah (aus/rusak)
- Test: bunyi "click" saat command dikirim? 
  - Ada bunyi tapi tidak buka = solenoid lemah
  - Tidak ada bunyi = no power/connection
```

3. **Reduce Load**
```
- Drawer terlalu penuh/berat
- Laci macet/friction tinggi
- Bersihkan rail drawer, beri lubricant
```

## ✅ Setup Checklist

- [ ] Cash drawer compatible dengan printer voltage (24V)
- [ ] RJ-11 cable terhubung ke printer port "DK"
- [ ] Test manual button berhasil
- [ ] Printer self-test buka drawer berhasil
- [ ] ESC/POS command diimplementasi di code
- [ ] Drawer service terintegrasi dengan checkout flow
- [ ] Audit log berfungsi
- [ ] Manual open drawer UI tersedia
- [ ] Export log untuk audit

## 📚 Resources

- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/)
- [Star Micronics Drawer Kick Guide](https://www.starmicronics.com/support/drawer-kick/)
- [APG Cash Drawer Documentation](https://www.apgcashdrawer.com/support/)

---

**Next:** [VFD Display / Pole Display](../vfd-display/README.md)