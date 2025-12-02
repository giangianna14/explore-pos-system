# Eksplorasi Secondary Monitor untuk POS System

Dokumentasi setup dan konfigurasi secondary monitor (dual display) untuk FinOpenPOS, menampilkan interface kasir di monitor utama dan customer-facing display di monitor kedua.

## 📋 Daftar Isi

1. [Pengenalan Dual Monitor Setup](#pengenalan)
2. [Hardware Requirements](#hardware-requirements)
3. [OS Configuration](#os-configuration)
4.  [Browser Dual Display](#browser-dual-display)
5. [Implementation Guide](#implementation-guide)

## 🖥️ Pengenalan

### Apa itu Secondary Monitor Setup?

Setup dual monitor untuk POS dengan fungsi berbeda:
- **Monitor 1 (Primary)**: Interface kasir lengkap (scan, cart, checkout, admin)
- **Monitor 2 (Secondary)**: Customer-facing display (produk, harga, total, promo)

### Keunggulan Dual Monitor
- ✅ **Professional**: Setup seperti POS komersial (McDonald's, Indomaret, dll)
- ✅ **Transparency**: Customer lihat semua item & harga
- ✅ **Productivity**: Kasir punya workspace lebih luas
- ✅ **Marketing**: Display promo/ads di monitor customer
- ✅ **Flexibility**: Lebih murah & fleksibel dibanding dedicated VFD

### Use Cases
1. **Retail Store**: Toko retail dengan counter kasir
2. **Restaurant**: Menu & order display untuk customer
3. **Pharmacy**: Informasi obat & harga
4. **Supermarket**: Self-service kiosk dengan assisted checkout

## 🔧 Hardware Requirements

### Monitor Options

#### 1. Standard LCD Monitor (Recommended)

**Spesifikasi Minimum:**
- Size: 15"-24"
- Resolution: 1366x768 (HD) atau lebih tinggi
- Interface: HDMI, VGA, atau DisplayPort
- Mounting: VESA compatible untuk pole mount
- Harga: Rp 1-3 juta

**Recommended Models:**
- Dell E2016HV 20" (± Rp 1. 5 juta)
- LG 22MK430H 22" (± Rp 1.8 juta)
- BenQ GW2280 22" (± Rp 2 juta)

#### 2.  Touchscreen Monitor (Advanced)

**Untuk self-service atau interactive display:**
- Size: 15"-21"
- Touch: Capacitive 10-point touch
- Interface: USB touch + HDMI video
- Harga: Rp 2-5 juta

**Use Cases:**
- Customer dapat pilih produk sendiri
- Digital signature untuk payment
- Survey/feedback form

#### 3. Portable Monitor (Budget)

**Untuk setup mobile/temporary:**
- Size: 13"-15. 6"
- Power: USB-C powered
- Portability: Ringan, travel-friendly
- Harga: Rp 1.5-2. 5 juta

### Video Output dari PC

**Check video ports yang tersedia:**

```bash
# Windows - Check graphics adapters
Win + X → Device Manager → Display adapters

# Linux
lspci | grep VGA
xrandr --listmonitors

# macOS
System Preferences → Displays
```

**Common scenarios:**

| PC Type | Video Ports | Support Dual Monitor |
|---------|-------------|---------------------|
| Desktop PC | HDMI + VGA | ✅ Yes |
| Laptop | HDMI + USB-C | ✅ Yes |
| Mini PC | HDMI + HDMI | ✅ Yes |
| Laptop old | VGA only | ❌ Perlu USB adapter |

**Jika hanya 1 port video:**
```
Solusi: USB to HDMI adapter
- Harga: Rp 200-500 ribu
- Brands: j5create, Plugable, StarTech
- Support resolution up to 1080p
```

### Mounting Solutions

#### Counter/Desktop Mount
```
- Simple stand (included dengan monitor)
- Articulating arm (± Rp 300 ribu)
- Dual monitor stand (± Rp 500 ribu)
```

#### Pole Mount (Professional)
```
- VESA pole mount (± Rp 500 ribu - 1 juta)
- Height: 30-50cm pole
- Rotation: Landscape/Portrait
- Brands: Ergotron, StarTech
```

#### Wall Mount
```
- VESA wall mount (± Rp 150-300 ribu)
- Tilt/swivel options available
- Good untuk fixed location
```

## ⚙️ OS Configuration

### Windows 10/11

#### 1. Connect Second Monitor

```
1. Hubungkan monitor ke video port (HDMI/VGA/DisplayPort)
2. Windows akan auto-detect
3. Right-click Desktop → Display settings
```

#### 2. Configure Display Mode

```
Display settings → Multiple displays:

[Extend these displays] ← Pilih ini untuk POS
- Monitor 1: Kasir workspace
- Monitor 2: Customer display (independent)

Alternatives:
- Duplicate: Same content di kedua monitor (not useful untuk POS)
- Show only on 1/2: Single monitor mode
```

#### 3. Set Display Orientation

```
Display settings → Monitor 2:
- Orientation: Landscape (horizontal)
  atau Portrait (vertical - untuk pole mount)
  
- Scale: 100% atau 125% (agar text readable dari jauh)
```

#### 4.  Identify Monitors

```
Display settings → Identify
- Angka "1" dan "2" muncul di monitor
- Drag monitor icon untuk arrange position
- Biasanya: [1] [2] (kiri-kanan)
```

#### 5. Set Primary Monitor

```
Display settings → Monitor 1:
☑ Make this my main display

- Primary = tempat taskbar & start menu
- Secondary = extended workspace
```

### Linux (Ubuntu/Debian)

#### 1.  Detect Monitors

```bash
# List connected displays
xrandr

# Output:
# HDMI-1 connected 1920x1080+0+0 (primary)
# VGA-1 connected 1366x768+1920+0
```

#### 2. Configure via GUI

```
Settings → Displays
- Arrange monitor positions
- Set resolution untuk each monitor
- Apply changes
```

#### 3. Configure via Command Line

```bash
# Set monitor 2 to right of monitor 1
xrandr --output HDMI-1 --primary --mode 1920x1080
xrandr --output VGA-1 --mode 1366x768 --right-of HDMI-1

# Save to startup
nano ~/.xprofile
# Add xrandr commands above
```

### macOS

#### 1. System Preferences

```
System Preferences → Displays
- Arrangement tab
- Drag monitors untuk arrange
- Uncheck "Mirror Displays"
```

#### 2. Set Primary Display

```
Arrangement tab:
- Drag white bar (menu bar) ke monitor yang jadi primary
```

## 🌐 Browser Dual Display

### Window Placement API (Modern)

Chrome/Edge support **Window Placement API** untuk kontrol multi-monitor dari web app. 

#### 1. Check Support

```typescript
// Check browser support
if ('getScreenDetails' in window) {
  console.log('✅ Window Placement API supported');
} else {
  console.log('❌ Not supported - fallback to manual window placement');
}
```

#### 2. Get Screen Details

```typescript
// src/lib/multi-screen.ts

export async function getScreens() {
  if (! ('getScreenDetails' in window)) {
    throw new Error('Window Placement API not supported');
  }

  // Request permission
  const screensData = await (window as any).getScreenDetails();

  console.log('Available screens:', screensData. screens);
  console.log('Current screen:', screensData.currentScreen);

  return screensData;
}
```

#### 3. Open Window on Specific Screen

```typescript
export async function openCustomerDisplay() {
  const screensData = await getScreens();
  
  // Find secondary screen
  const secondaryScreen = screensData.screens.find(
    (screen: any) => screen !== screensData.currentScreen
  );

  if (! secondaryScreen) {
    throw new Error('No secondary screen detected');
  }

  // Open window on secondary screen
  const displayWindow = window.open(
    '/customer-display',
    'CustomerDisplay',
    `left=${secondaryScreen.availLeft},` +
    `top=${secondaryScreen.availTop},` +
    `width=${secondaryScreen.availWidth},` +
    `height=${secondaryScreen.availHeight},` +
    `popup=yes`
  );

  // Fullscreen (user gesture required)
  displayWindow?. document.documentElement.requestFullscreen();

  return displayWindow;
}
```

### Fallback: Manual Placement

Jika browser tidak support Window Placement API:

```typescript
export function openCustomerDisplayManual() {
  // Open popup
  const displayWindow = window.open(
    '/customer-display',
    'CustomerDisplay',
    'width=1366,height=768,popup=yes'
  );

  // User harus manual drag ke monitor 2 dan F11 untuk fullscreen
  alert('Drag window ke monitor customer, lalu tekan F11 untuk fullscreen');

  return displayWindow;
}
```

## 💻 Implementation Guide

### 1. Create Customer Display Page

```typescript
// src/app/customer-display/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface DisplayData {
  type: 'idle' | 'scanning' | 'checkout' | 'complete';
  storeName?: string;
  storeLogo?: string;
  productName?: string;
  productImage?: string;
  price?: number;
  quantity?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  total?: number;
  promoMessage?: string;
}

export default function CustomerDisplayPage() {
  const [data, setData] = useState<DisplayData>({
    type: 'idle',
    storeName: 'TOKO SERBAGUNA',
    promoMessage: 'Diskon 20% untuk pembelian minimal Rp 100.000',
  });

  useEffect(() => {
    // Listen to messages from POS
    const channel = new BroadcastChannel('pos-display');

    channel.onmessage = (event) => {
      setData(event.data);
    };

    return () => channel.close();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            {data.storeLogo && (
              <Image 
                src={data.storeLogo} 
                alt="Logo" 
                width={120} 
                height={120}
                className="rounded-lg"
              />
            )}
            <h1 className="text-5xl font-bold text-gray-800">
              {data.storeName}
            </h1>
            <div className="text-right">
              <p className="text-2xl text-gray-600">
                {new Date(). toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {new Date().toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-3xl p-12 shadow-2xl min-h-[600px]">
          {data.type === 'idle' && (
            <div className="text-center space-y-8">
              <div className="text-8xl mb-8">🛒</div>
              <h2 className="text-6xl font-bold text-gray-800 mb-4">
                SELAMAT DATANG
              </h2>
              <p className="text-3xl text-gray-600">
                Silakan berbelanja dengan nyaman
              </p>
              
              {data.promoMessage && (
                <div className="mt-12 bg-gradient-to-r from-orange-400 to-red-500 text-white p-8 rounded-2xl animate-pulse">
                  <p className="text-4xl font-bold">🎉 PROMO HARI INI 🎉</p>
                  <p className="text-3xl mt-4">{data.promoMessage}</p>
                </div>
              )}
            </div>
          )}

          {data.type === 'scanning' && (
            <div className="space-y-8">
              <div className="flex items-center gap-8">
                {data.productImage && (
                  <Image 
                    src={data. productImage} 
                    alt={data.productName || ''} 
                    width={200} 
                    height={200}
                    className="rounded-xl shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="text-3xl text-gray-600 mb-2">PRODUK</p>
                  <h3 className="text-6xl font-bold text-gray-800 mb-4">
                    {data.productName}
                  </h3>
                  <div className="flex items-baseline gap-4">
                    <p className="text-5xl font-bold text-green-600">
                      Rp {data.price?.toLocaleString('id-ID')}
                    </p>
                    {data.quantity && data.quantity > 1 && (
                      <p className="text-3xl text-gray-600">
                        x {data.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.type === 'checkout' && (
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b-4 border-blue-500 pb-4">
                RINCIAN BELANJA
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {data.items?. map((item, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-6 rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="text-2xl font-semibold text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xl text-gray-600">
                        {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">
                      Rp {item.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t-4 border-gray-300 pt-6 space-y-4">
                <div className="flex justify-between text-2xl">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    Rp {data. subtotal?.toLocaleString('id-ID')}
                  </span>
                </div>
                {data.tax && data.tax > 0 && (
                  <div className="flex justify-between text-2xl">
                    <span className="text-gray-600">PPN 11%:</span>
                    <span className="font-semibold">
                      Rp {data.tax?.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-5xl font-bold text-blue-600 bg-blue-50 p-6 rounded-xl">
                  <span>TOTAL:</span>
                  <span>Rp {data.total?.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          )}

          {data.type === 'complete' && (
            <div className="text-center space-y-8 animate-bounce-in">
              <div className="text-9xl mb-8">✅</div>
              <h2 className="text-7xl font-bold text-green-600 mb-6">
                TERIMA KASIH!
              </h2>
              <p className="text-4xl text-gray-700">
                Transaksi Berhasil
              </p>
              <p className="text-3xl text-gray-600">
                Sampai jumpa lagi! 
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2.  Multi-Screen Manager Component

```typescript
// src/components/pos/MultiScreenManager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, MonitorX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function MultiScreenManager() {
  const [displayWindow, setDisplayWindow] = useState<Window | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const openDisplay = async () => {
    try {
      // Try Window Placement API first
      if ('getScreenDetails' in window) {
        const screensData = await (window as any).getScreenDetails();
        const secondaryScreen = screensData. screens.find(
          (screen: any) => screen !== screensData.currentScreen
        );

        if (secondaryScreen) {
          const win = window.open(
            '/customer-display',
            'CustomerDisplay',
            `left=${secondaryScreen.availLeft},` +
            `top=${secondaryScreen.availTop},` +
            `width=${secondaryScreen.availWidth},` +
            `height=${secondaryScreen.availHeight},` +
            `popup=yes,toolbar=no,menubar=no`
          );

          if (win) {
            setDisplayWindow(win);
            setIsOpen(true);
            
            // Request fullscreen
            setTimeout(() => {
              win. document.documentElement.requestFullscreen();
            }, 500);

            toast({
              title: '✅ Display Terbuka',
              description: 'Customer display aktif di monitor 2',
            });
          }
        } else {
          throw new Error('Monitor kedua tidak terdeteksi');
        }
      } else {
        // Fallback: manual placement
        const win = window.open(
          '/customer-display',
          'CustomerDisplay',
          'width=1366,height=768,popup=yes,toolbar=no,menubar=no'
        );

        if (win) {
          setDisplayWindow(win);
          setIsOpen(true);
          
          toast({
            title: 'ℹ️ Display Terbuka',
            description: 'Drag window ke monitor 2, lalu tekan F11 untuk fullscreen',
          });
        }
      }
    } catch (error) {
      toast({
        title: '❌ Gagal',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const closeDisplay = () => {
    if (displayWindow) {
      displayWindow.close();
      setDisplayWindow(null);
      setIsOpen(false);

      toast({
        title: 'Display Ditutup',
        description: 'Customer display dinonaktifkan',
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5" />
          <div>
            <p className="font-semibold">Secondary Monitor</p>
            <p className="text-sm text-muted-foreground">
              Customer Display
            </p>
          </div>
        </div>

        {isOpen ?  (
          <Button size="sm" variant="destructive" onClick={closeDisplay}>
            <MonitorX className="mr-2 h-4 w-4" />
            Tutup Display
          </Button>
        ) : (
          <Button size="sm" onClick={openDisplay}>
            <Monitor className="mr-2 h-4 w-4" />
            Buka Display
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### 3.  Update Display dari POS

```typescript
// src/app/(dashboard)/pos/page.tsx

const displayChannel = new BroadcastChannel('pos-display');

// Idle state
useEffect(() => {
  if (cart.length === 0) {
    displayChannel.postMessage({
      type: 'idle',
      storeName: 'TOKO SERBAGUNA',
      storeLogo: '/logo. png',
      promoMessage: 'Diskon 20% untuk pembelian minimal Rp 100.000',
    });
  }
}, [cart]);

// Saat scan produk
const handleProductScan = (product) => {
  addToCart(product);

  displayChannel.postMessage({
    type: 'scanning',
    productName: product.name,
    productImage: product.image,
    price: product.price,
    quantity: 1,
  });
};

// Saat checkout
const handleCheckout = () => {
  const totals = calculateTotals();

  displayChannel.postMessage({
    type: 'checkout',
    items: cart,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
  });
};

// Setelah payment
const handlePaymentComplete = () => {
  displayChannel.postMessage({
    type: 'complete',
  });

  // Kembali ke idle setelah 5 detik
  setTimeout(() => {
    displayChannel.postMessage({
      type: 'idle',
      storeName: 'TOKO SERBAGUNA',
    });
  }, 5000);
};
```

## ✅ Setup Checklist

**Hardware:**
- [ ] Monitor kedua tersedia
- [ ] Video cable terhubung (HDMI/VGA/DisplayPort)
- [ ] PC/laptop support dual display
- [ ] Monitor orientation configured (landscape/portrait)

**OS Configuration:**
- [ ] Extended display mode enabled (bukan duplicate)
- [ ] Monitor arrangement correct
- [ ] Primary monitor set properly
- [ ] Resolution optimal untuk each monitor

**Browser Setup:**
- [ ] Chrome/Edge browser (untuk Window Placement API)
- [ ] Popup allowed untuk localhost
- [ ] Fullscreen permission granted

**Application:**
- [ ] Customer display page created
- [ ] BroadcastChannel communication works
- [ ] Multi-screen manager component added
- [ ] POS updates display correctly
- [ ] Auto-switch between idle/scanning/checkout states

## 🎨 Design Tips

### For Customer Display

**Do's:**
- ✅ Large fonts (minimum 24px, ideal 48px+)
- ✅ High contrast colors
- ✅ Simple, clean layout
- ✅ Animations untuk attention (tapi tidak berlebihan)
- ✅ Real-time update (no lag)

**Don'ts:**
- ❌ Small text (sulit dibaca dari jauh)
- ❌ Complex UI dengan banyak element
- ❌ Low contrast (grey on grey)
- ❌ Terlalu banyak animasi (bikin pusing)

### Color Schemes

```css
/* Professional Blue */
--primary: #2563eb;
--secondary: #3b82f6;
--accent: #60a5fa;

/* Friendly Green */
--primary: #16a34a;
--secondary: #22c55e;
--accent: #86efac;

/* Premium Purple */
--primary: #7c3aed;
--secondary: #a78bfa;
--accent: #c4b5fd;
```

## 📚 Resources

- [Window Placement API](https://developer. chrome.com/docs/capabilities/window-placement)
- [Multi-Screen Window Placement](https://web.dev/multi-screen-window-placement/)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)

---

**Back:** [VFD Display Guide](../vfd-display/README.md)  
**Next:** [Complete Setup Guide](../complete-setup-guide. md)