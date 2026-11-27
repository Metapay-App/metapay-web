# Backend Rules & Guardrails — Nusantara Card

Dokumen ini adalah aturan backend yang **wajib** diikuti untuk proyek **Nusantara Card** per **2026-10-26**.

Tujuan utama:
- menjadikan `src/app/api` sebagai **BFF / backend proxy resmi**
- menghentikan akses database dari flow FE
- mempertegas boundary Next.js App Router, domain, dan infrastruktur
- meningkatkan security, maintainability, dan testability

---

## 1. Prinsip Inti

1. **Frontend tidak boleh mengakses database secara langsung**
   - Semua akses database wajib terjadi di server melalui backend proxy pada `src/app/api/**`.
   - FE data source hanya boleh memanggil HTTP API internal, bukan Prisma, SQL, atau driver database.

2. **Prisma adalah server-only**
   - `PrismaClient` hanya boleh diimport dari module server-only.
   - Tidak boleh ada import `@prisma/client` atau `src/server/shared/db/prisma` dari `src/client/**`, hook client, atau file `'use client'`.

3. **`src/app/api/**` adalah entry point backend, bukan tempat business logic utama**
   - Route handler hanya menerima request, validasi input, memanggil service/use case, lalu mengembalikan response.
   - Query DB, mapping record, dan business rule tidak boleh menumpuk di `route.ts`.

4. **Setiap module backend harus terpisah**
   - Modul wajib: `auth`, `card`, `deck`, `battle`, `shop`, `admin`.
   - Jangan mencampur banyak concern di satu endpoint atau satu service.

5. **Fail closed, bukan fail open**
   - Jika DB gagal, auth gagal, atau validation gagal, request harus gagal dengan response error yang jelas.
   - Dilarang membuat fallback “success palsu”, mock persistence, atau auth bypass di production path.

---

## 2. Struktur Folder Backend Wajib

Struktur target yang harus diikuti:

```text
src/
  app/
    api/
      v1/
        auth/
          login/route.ts
          logout/route.ts
          me/route.ts
        cards/
          route.ts
          [slug]/route.ts
          [slug]/reports/route.ts
        decks/
          route.ts
          [id]/route.ts
        matches/
          route.ts
        shop/
          decks/route.ts
          checkout-sandbox/route.ts
        admin/
          cards/route.ts
          reports/route.ts
  server/
    shared/
      db/
        prisma.ts
      auth/
      validation/
      http/
      errors/
    modules/
      auth/
        domain/
        application/
        infrastructure/
      card/
        domain/
        application/
        infrastructure/
      deck/
        domain/
        application/
        infrastructure/
      battle/
        domain/
        application/
        infrastructure/
      shop/
        domain/
        application/
        infrastructure/
      admin/
        domain/
        application/
        infrastructure/
```

---

## 3. Boundary Wajib Antar Layer

### A. Client / Presentation (`src/client/**`)
- **Boleh**: memanggil `apiClient` (`/api/v1/...`), memakai `RemoteDataSource`, memakai DTO/Model dan Entity client.
- **Dilarang**: import Prisma client, import repository Prisma, import server service, import file di `src/server/**`.

### B. `src/app/api/**`
- **Boleh**: parsing request, validasi request schema (`zod`), membaca session/cookie auth context, memanggil application service/use case, mapping response ke HTTP JSON.
- **Dilarang**: query Prisma langsung di `route.ts`, menulis business rule panjang di `route.ts`, memanggil module `'use client'`, return raw Prisma record tanpa sanitasi.

### C. `src/server/modules/**/application`
- **Boleh**: orkestrasi business flow, transaksi lintas repository, authorization policy check, memanggil domain service / repository interface.
- **Dilarang**: mengandung detail HTTP, mengandung JSX / React, mengetahui detail request Next.js secara langsung.

### D. `src/server/modules/**/infrastructure`
- **Boleh**: implementasi repository dengan Prisma, mapping Prisma record ke DTO/domain model internal.
- **Dilarang**: dipanggil langsung dari client, mengandung fallback success saat infra gagal.

---

## 4. Aturan API Design, Auth, Validation & Error Handling

1. Semua endpoint wajib berada di namespace `/api/v1`.
2. Semua request body, params, dan query wajib divalidasi dengan `zod`.
3. Semua response error konsisten (`message`, `code`, `details` opsional) dengan status HTTP yang tepat (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
4. Password wajib di-hash dengan `bcryptjs`, dan session disimpan dalam cookie `httpOnly`, `sameSite: lax`.
5. Zero `any` di seluruh kode server maupun test.
