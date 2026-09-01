# SIPKEL — Sistem Perizinan Keluar Masuk Siswa

Refactor dari aplikasi HTML vanilla ke **Next.js 14** dengan App Router, TypeScript, Tailwind CSS, dan Firebase.

## Fitur

- **Autentikasi Firebase** (Auth + Firestore)
- **Role-based access**: Guru Piket & Satpam
- **Real-time updates** via Firestore `onSnapshot`
- **Kamera** untuk foto siswa (Web API)
- **Form perizinan** dengan validasi
- **Dashboard** dengan statistik
- **Pemantauan** status siswa (pending → approved → out → returned)
- **Riwayat** lengkap

## Struktur Folder

```
sipesis-next/
├── app/
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── page.tsx                # Login page
│   ├── globals.css             # Tailwind + custom vars
│   └── dashboard/
│       ├── layout.tsx          # Sidebar layout
│       ├── page.tsx            # Dashboard
│       ├── permission/
│       │   └── page.tsx        # Form perizinan
│       ├── monitor/
│       │   └── page.tsx        # Pemantauan
│       └── history/
│           └── page.tsx        # Riwayat
├── components/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── StatsCards.tsx
│   ├── DataTable.tsx
│   ├── PermissionForm.tsx
│   ├── CameraModal.tsx
│   └── Toast.tsx
├── hooks/
│   ├── useAuth.tsx
│   └── usePermissions.ts
├── lib/
│   ├── firebase.ts
│   ├── auth.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── .env.local.example
└── next.config.ts
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000)

## Akun Demo

| Username | Role       | Email                                      |
|----------|------------|--------------------------------------------|
| faraday  | Guru Piket | adityaarfiansyah.2023@student.uny.ac.id    |
| satpam   | Satpam     | adityaarfiansyah22@gmail.com               |

> Password sesuai dengan konfigurasi Firebase project Anda.

## Perubahan dari Versi HTML

- **Routing**: Dari tab switching JavaScript ke Next.js App Router
- **State Management**: Dari global variables ke React Context + Hooks
- **Firebase**: Dari inline script module ke proper SDK initialization
- **Styling**: Dari CSS vanilla ke Tailwind CSS dengan design system
- **Type Safety**: TypeScript untuk seluruh aplikasi
- **Camera**: Dari inline script ke reusable React component
- **Real-time**: Dari `window.updatePermissionsFromFirebase` ke proper `onSnapshot` hook
