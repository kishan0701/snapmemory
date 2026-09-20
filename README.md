# 📸 SnapMemory (EventSnap)

> **Every Event. Every Memory. One Place.**  
> Shadi, birthday party ya college fest ke saare photos aur videos ek hi jagah bina quality loss ke collect aur share karne ka modern platform.

---

## 📖 Project Overview (Ye Project Kya Hai?)

WhatsApp groups me jab sab log photos bhejte hain to **quality compress** ho jaati hai, aur USB/Google Drive links manage karna boring aur messy hota hai.  
**SnapMemory** is problem ko solve karta hai:

1. **Host (Event Organizer)** ek event create karta hai (e.g. *"Aman & Priya Wedding"*).
2. Host ko ek **QR Code** aur **Shareable Link** milta hai jise guests scan kar sakte hain.
3. **Guests bina kisi complex signup ke** photos aur videos drag-and-drop karke direct upload kar sakte hain.
4. **AI Face Recognition ("Find My Photos")**: Guest apna ek selfie upload karta hai, aur browser ke andar hi local AI saari event photos scan karke us guest ki specific photos dhoond kar nikaal deta hai!
5. **Full Quality Downloads**: Single photo ya poora zip bundle full resolution me download kiya ja sakta hai.

---

## ⚡ Quick Start (Project Kaise Run Karein?)

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- [npm](https://www.npmjs.com/) (bundled with Node)

### Installation & Run Steps

```bash
# 1. Clone or open the repository
cd snapmemory

# 2. Dependencies install karein
npm install

# 3. Development server start karein
npm run dev

# 4. Browser me open karein
# Open: http://localhost:5173
```

### Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| **Dev Server** | `npm run dev` | Hot-reload ke saath local Vite dev server start karta hai |
| **Typecheck & Build** | `npm run build` | TypeScript compile karta hai (`tsc -b`) aur production bundle generate karta hai |
| **Lint Check** | `npm run lint` | Oxlint fast linter run karke code quality check karta hai |
| **Preview Build** | `npm run preview` | Dist folder ke production build ko locally preview karta hai |

---

## 📁 Clean Folder Structure (Kaunsi File Kahan Hai Aur Kyun?)

Project ko **industry standard modular architecture** ke hisab se organize kiya gaya hai taaki naye teammates bina kisi confusion ke kaam kar sakein:

```text
snapmemory/
├── 📁 public/                     # Static assets jo direct URL se serve hoti hain
│   ├── logo.png                   # Official SnapMemory logo
│   ├── favicon.svg                # Browser tab icon
│   ├── icons.svg                  # SVG sprite sheet
│   └── eventsnap_report.html      # Phase-1 design & work report
│
├── 📁 src/                        # Saara application source code
│   │
│   ├── 📁 assets/                 # Local images aur graphic assets (e.g. hero.png)
│   │
│   ├── 📁 components/             # Reusable UI building blocks (Lego blocks)
│   │   ├── 📁 events/             # Event-specific components
│   │   │   ├── ContributorRequestModal.tsx  # Guest contributor access request popup
│   │   │   ├── CoverImageSelector.tsx       # Presets + custom cover upload selector
│   │   │   ├── QRSharePanel.tsx             # Event QR code generator & copy link
│   │   │   └── index.ts                     # Events components barrel export
│   │   │
│   │   ├── 📁 gallery/            # Gallery display & media viewer components
│   │   │   ├── Lightbox.tsx                 # Fullscreen photo zoom/navigation modal
│   │   │   ├── MediaCard.tsx                # Single photo/video card with hover actions
│   │   │   ├── MediaGrid.tsx                # Responsive Masonry & square photo grid
│   │   │   ├── VideoPlayer.tsx              # Custom video player with controls
│   │   │   └── index.ts                     # Gallery components barrel export
│   │   │
│   │   ├── 📁 layout/             # Global layout components
│   │   │   ├── Navbar.tsx                   # Top navigation bar & notifications
│   │   │   ├── Footer.tsx                   # Bottom footer & helpful links
│   │   │   └── index.ts                     # Layout barrel export
│   │   │
│   │   ├── 📁 ui/                 # Design system primitive widgets
│   │   │   ├── SmartDatePicker.tsx          # Custom keyboard/touch friendly date picker
│   │   │   └── index.ts                     # UI barrel export
│   │   │
│   │   ├── 📁 upload/             # Media upload components
│   │   │   ├── UploadZone.tsx               # Drag & Drop upload container
│   │   │   ├── UploadQueue.tsx              # Live upload progress bar & status tracker
│   │   │   └── index.ts                     # Upload barrel export
│   │   │
│   │   └── index.ts               # Master barrel export for all components
│   │
│   ├── 📁 features/               # Domain-specific business logic slices
│   │   └── 📁 auth/               # Authentication system
│   │       ├── AuthContext.tsx              # Global auth state & mock login/signup
│   │       ├── ProtectedRoute.tsx           # Route guard for logged-in and guest users
│   │       └── index.ts                     # Auth feature barrel export
│   │
│   ├── 📁 pages/                  # Application screens (Pages rendered by React Router)
│   │   ├── LandingPage.tsx                  # Home page with hero, features, & CTA
│   │   ├── AuthPage.tsx                     # Sliding Login & Signup card page
│   │   ├── ForgotPasswordPage.tsx           # Password recovery screen
│   │   ├── DashboardPage.tsx                # User dashboard showing created events & stats
│   │   ├── CreateEventPage.tsx              # Step-by-step event creation wizard
│   │   ├── EventPage.tsx                    # Main event gallery screen with filters
│   │   ├── EventSettingsPage.tsx            # Event management, privacy & access control
│   │   ├── DownloadCenterPage.tsx           # Bulk download photos by albums/formats
│   │   ├── FindMyPhotosPage.tsx             # AI selfie-based face recognition search
│   │   ├── NotFoundPage.tsx                 # 404 page with redirect options
│   │   └── index.ts                         # Central pages barrel export
│   │
│   ├── 📁 services/               # External APIs, integrations & heavy logic
│   │   ├── faceMatcher.ts                   # Face-api.js client-side facial recognition pipeline
│   │   ├── supabase.ts                      # Supabase client initialization
│   │   └── index.ts                         # Services barrel export
│   │
│   ├── 📁 store/                  # Centralized client state management
│   │   ├── eventStore.ts                    # Zustand store for user-created events
│   │   └── index.ts                         # Store barrel export
│   │
│   ├── 📁 data/                   # Mock database fixtures & initial data
│   │   ├── mockData.ts                      # Mock events, mock users, photo arrays & query helpers
│   │   └── index.ts                         # Data barrel export
│   │
│   ├── 📁 utils/                  # Pure utility helper functions
│   │   ├── utils.ts                         # cn (class merge), formatDate, formatFileSize, etc.
│   │   └── index.ts                         # Utils barrel export
│   │
│   ├── 📁 lib/                    # Backward-compatibility facade layer
│   │   │                                    # (Existing imports from @/lib continue working without breaking)
│   │   ├── eventStore.ts                    # Re-exports from @/store
│   │   ├── face-matcher.ts                  # Re-exports from @/services
│   │   ├── mock-data.ts                     # Re-exports from @/data
│   │   ├── supabase.ts                      # Re-exports from @/services
│   │   ├── utils.ts                         # Re-exports from @/utils
│   │   └── index.ts                         # Central lib re-export
│   │
│   ├── 📁 types/                  # Global TypeScript types & interfaces
│   │   └── index.ts                         # User, Event, Media, Album, Role definitions
│   │
│   ├── App.tsx                    # Main App router, routes setup & toast styling
│   ├── index.css                  # Tailwind CSS v4 styling & theme tokens
│   └── main.tsx                   # React 19 entry point
│
├── .env.example                   # Environment variables template
├── index.html                     # HTML root template with SEO meta tags
├── package.json                   # Project dependencies & scripts
├── tsconfig.json                  # Root TypeScript configuration (with @/* path alias)
├── tsconfig.app.json              # App TypeScript compiler settings
└── vite.config.ts                 # Vite build & Tailwind plugin config
```

---

## 🧭 Routes & Navigation Map

| Path | Component | Auth Required? | Purpose |
| :--- | :--- | :---: | :--- |
| `/` | `LandingPage` | No | Marketing home page with feature highlights |
| `/login` | `AuthPage` | Guest only | Unified animated Login & Signup card |
| `/signup` | `AuthPage` | Guest only | Unified animated Login & Signup card |
| `/forgot-password` | `ForgotPasswordPage` | No | Password recovery flow |
| `/dashboard` | `DashboardPage` | **Yes** | Host overview: my events, storage, quick upload |
| `/create-event` | `CreateEventPage` | **Yes** | New event wizard with date picker & cover selector |
| `/event/:id` | `EventPage` | No | Public/shared event gallery, upload button & filters |
| `/event/:id/find-my-photos` | `FindMyPhotosPage` | No | AI selfie face recognition photo finder |
| `/event/:id/settings` | `EventSettingsPage` | **Yes** | Event admin panel: privacy, members, delete event |
| `/event/:id/downloads` | `DownloadCenterPage` | No | Bulk download media by album or full event zip |
| `*` | `NotFoundPage` | No | 404 page |

---

## 🛠️ Tech Stack & Key Libraries

| Technology | Purpose | Why We Use It |
| :--- | :--- | :--- |
| **React 19** | UI Library | Latest React with high-performance concurrent rendering |
| **Vite 8** | Build Tool | Lightning fast HMR (Hot Module Replacement) and optimized bundling |
| **TypeScript** | Type Safety | Catches bugs early and provides autocompletion for teammates |
| **Tailwind CSS v4** | Styling | Modern CSS-first atomic styling with custom glassmorphism theme |
| **Zustand** | State Store | Lightweight, boilerplate-free state management for user events |
| **Framer Motion** | Animations | Smooth modal popups, sliding tabs, and interactive transitions |
| **@vladmandic/face-api** | AI Face Recognition | Browser-based neural network for face detection (100% client-side) |
| **qrcode.react** | QR Code Generator | Generates instant SVG/PNG QR codes for on-venue guest sharing |
| **Lucide React** | Icons | Crisp, modern icons for all buttons and status badges |
| **React Hot Toast** | Notifications | Toast alerts for uploads, link copies, and actions |

---

## 🔑 Environment Variables & Supabase (Phase 2)

Project ke root me `.env.example` file di gayi hai:

```env
# Supabase Configuration (Phase 2)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- **Current State (Phase 1)**: App bina Supabase credentials ke bhi **100% functional demo mode** me chalti hai (`src/data/mockData.ts` aur `src/store/eventStore.ts` ke saath).
- **Phase 2 Setup**: Jab backend team Supabase project create kare, tab root me `.env` file banakar upar diye gaye keys daal dene hain. `src/services/supabase.ts` automatically client configure kar lega.

---

## 🤝 Rules for Teammates (Kaam Karte Waqt Dhyaan Rakhein)

1. **Path Aliases Use Karein**: Hamesha `@/...` alias use karein (e.g. `import { useEventStore } from '@/store';`). Relative paths (`../../`) avoid karein.
2. **Barrel Exports**: Component import karte waqt clean barrel exports use karein:
   ```tsx
   // Recommended:
   import { Navbar, Footer } from '@/components/layout';
   import { SmartDatePicker } from '@/components/ui';
   ```
3. **No Unused Code**: Naye pages banate waqt puraane dead files ko project me bina wajah na chhodein.
4. **Before Committing**:
   ```bash
   npm run lint   # ensure no errors
   npm run build  # ensure TypeScript passes cleanly
   ```

---

*Made with ❤️ by Kishan Yadav & Team.*
