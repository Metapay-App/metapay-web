# Frontend Rules & Architectural Guardrails — Nusantara Card

Dokumen ini adalah aturan frontend resmi dan wajib dipatuhi untuk proyek **Nusantara Card** per **2026-10-26**.

Tujuan utama:
- Menegakkan arsitektur berlapis yang konsisten (**Clean Architecture & Domain-Driven Design**).
- Memisahkan boundary **Client**, **Server**, dan **Core** secara jelas.
- Menjamin kepatuhan penuh terhadap prinsip **Zero `any`** (Strict Type Safety).
- Standarisasi Dependency Injection client dengan **`@needle-di/core`**.
- Mencegah duplikasi utilitas dengan prinsip **Core-First (`src/core`)**.
- Memastikan semua route halaman dan API endpoint terpusat di **Constants (`src/core/constants`)**.
- Mewajibkan implementasi **Locale Translator (`src/core/translator`)** dengan default bahasa **`id`** (mendukung `id`, `en`, `zh`) di setiap view.
- Menetapkan panduan **Do's and Don'ts** serta **Security Guardrails** di sisi Client/Frontend.

---

## 1. Target Struktur Arsitektur

```text
src/
├── app/                         # Next.js App Router, page dan API route adapter
│   ├── [lang]/**                # Localized page routes (id, en, zh)
│   └── api/v1/**                # API boundary ke server modules
├── client/                      # Seluruh kode frontend/client-side application
│   ├── data/                    # API model (*_model.ts), data source, repository implementation
│   ├── domain/                  # Entity, repository interface, use case, battle engine
│   └── presentation/            # Views (hooks/, constants/, components/, *View.tsx) & shared components
├── core/                        # Shared client-safe utilities
│   ├── constants/               # Page routes, API routes, shared constants
│   ├── di/                      # Client dependency injection container (@needle-di/core)
│   ├── http-client/             # Client/proxy HTTP client (api-client.ts)
│   ├── translator/              # Locale dictionaries and translator helpers (id, en, zh)
│   └── utils/                   # Shared pure utilities (audio synthesizer, formatters)
└── server/                      # Server-only modules, infrastructure, db, auth, validation
    ├── modules/
    └── shared/
```

---

## 2. Alur Data Resmi (FE to BE Clean Architecture Flow)

1. `View (<Module>View.tsx)` -> memanggil `use<Module>()`
2. `ViewModel / Hook (hooks/use<Module>.ts)` -> me-resolve `UseCase` via `getService()` dari `src/core/di`
3. `UseCase (src/client/domain/<module>/usecase/*_usecase.ts)` -> menggunakan `Entity`
4. `Repository Interface (src/client/domain/<module>/repository/*_repository.ts)`
5. `Repository Implementation (src/client/data/<module>/repository/*_repository_impl.ts)` -> konversi `Model <-> Entity`
6. `Data Source (src/client/data/<module>/data_source/*_data_source.ts)` -> memakai `apiClient` dan `api-routes.ts`
7. `Next.js API Route Adapter (src/app/api/v1/**/route.ts)` -> Server UseCase -> Server Repository -> Prisma DB

---

## 3. Strict Type Safety: Zero `any` Policy

🚫 **DILARANG MENGGUNAKAN `any` DALAM KONDISI APAPUN** (baik di kode produksi maupun unit test).

---

## 4. Struktur Directory Tree Modul Presentation

Setiap modul UI wajib mengikuti struktur berikut:

```text
src/client/presentation/views/<module>/
├── hooks/
│   └── use<Module>.ts
├── constants/
│   ├── SemanticIdConstant.ts
│   └── TextConstant.ts
├── components/
│   ├── <SubComponent>.tsx
│   └── index.ts
├── <Module>View.tsx
└── index.ts
```
