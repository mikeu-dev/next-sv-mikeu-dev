---
trigger: always_on
---

# TS-Pro AI Agent Skill (Antigravity)

TS-Pro AI Agent Skill adalah workflow terstruktur untuk menghasilkan code TypeScript tingkat senior: strict, type-safe, scalable, dan maintainable.

---

## 1. Context Awareness (WAJIB SEBELUM NGODING)

AI HARUS:

- Mendeteksi:
  - Environment (Node.js / Browser / Fullstack)
  - Framework (React, Express, dll)

- Memastikan:
  - TypeScript aktif
  - `strict: true` di tsconfig

Jika TypeScript belum strict:

- WAJIB merekomendasikan untuk mengaktifkan strict mode

---

## 2. Core Principles

WAJIB:

- Type safety > fleksibilitas
- Explicit type > implicit jika ambigu
- Compile-time safety > runtime fix
- Hindari “type illusion”

---

## 3. tsconfig Rules (WAJIB)

Minimal konfigurasi:

```json id="q1x8de"
{
	"compilerOptions": {
		"strict": true,
		"noImplicitAny": true,
		"strictNullChecks": true,
		"noUncheckedIndexedAccess": true,
		"exactOptionalPropertyTypes": true
	}
}
```

---

## 4. Type System Rules (KRITIS)

WAJIB:

- Gunakan:
  - `interface` untuk object shape
  - `type` untuk union / utility

- Gunakan:
  - union type
  - literal type
  - discriminated union

Contoh:

```ts id="p4s7vk"
type Status = 'idle' | 'loading' | 'success' | 'error';
```

---

## 5. DILARANG KERAS

- `any`
- `as unknown as`
- Type assertion berlebihan
- Mengabaikan error TypeScript

Jika terpaksa:

- Gunakan `unknown` lalu refine

---

## 6. Interface Design

WAJIB:

- Interface harus:
  - reusable
  - terpisah dari implementation

- Gunakan:
  - optional field dengan jelas
  - readonly jika immutable

Contoh:

```ts id="j9w2mr"
interface User {
	readonly id: string;
	name: string;
	email?: string;
}
```

---

## 7. Function Typing

WAJIB:

- Semua function memiliki:
  - parameter type
  - return type (eksplisit jika kompleks)

Contoh:

```ts id="h3d9xu"
function getUser(id: string): Promise<User | null> {
	// ...
}
```

---

## 8. Generics (WAJIB DIGUNAKAN DENGAN BENAR)

Gunakan generics untuk:

- reusable function
- reusable hook/service

Contoh:

```ts id="f8k1zp"
function identity<T>(value: T): T {
	return value;
}
```

---

## 9. Runtime Validation (WAJIB UNTUK DATA EKSTERNAL)

TypeScript tidak cukup untuk runtime.

WAJIB:

- Gunakan:
  - Zod / Valibot / Yup

- Sinkronkan:
  - schema ↔ type

Contoh:

```ts id="t6q2ls"
const UserSchema = z.object({
	id: z.string(),
	name: z.string()
});

type User = z.infer<typeof UserSchema>;
```

---

## 10. Error Handling

WAJIB:

- Gunakan:
  - custom error type

- Jangan melempar error tanpa type

---

## 11. Module & Structure

Pisahkan:

```id="n2k8vx"
types/
 ├── global.d.ts
 ├── api.types.ts
 ├── domain.types.ts
```

PRINSIP:

- Type adalah first-class citizen
- Jangan campur type dengan logic berlebihan

---

## 12. Advanced Type (LEVEL SENIOR)

Gunakan jika diperlukan:

- Utility types:
  - Partial<T>
  - Pick<T, K>
  - Omit<T, K>

- Conditional types
- Mapped types

Contoh:

```ts id="u7v5ec"
type Optional<T> = {
	[K in keyof T]?: T[K];
};
```

---

## 13. API Contract (WAJIB)

Semua API:

- HARUS memiliki:
  - Request type
  - Response type

Contoh:

```ts id="b4z6rm"
interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}
```

---

## 14. Scalability Rules

WAJIB:

- Hindari type duplikasi
- Gunakan shared types
- Gunakan domain-driven typing

---

## 15. Output Rules untuk AI

AI HARUS:

- Selalu:
  - memberikan type/interface
  - menjaga strict typing

- Tidak menghasilkan code dengan warning TS
- Menyesuaikan dengan context project

---

## 16. Anti-Pattern (DILARANG)

- `any`
- Type tidak digunakan
- Over-typing (terlalu kompleks tanpa alasan)
- Type tidak konsisten antar layer

---

## 17. Prinsip Utama

- Type adalah kontrak, bukan opsional
- Error TS adalah bug, bukan gangguan
- Type safety adalah investasi jangka panjang
- Konsistensi lebih penting dari gaya pribadi

---

## 18. STRICT ENFORCEMENT: TYPE SAFETY ABSOLUTE (ADDITIONAL RULE)

### PELANGGARAN KRITIS: PENGGUNAAN `any`

- Penggunaan `any` dalam bentuk apapun **DIHARAMKAN TOTAL**
- Termasuk:
  - implicit any
  - explicit any
  - fallback dari library

- Jika ditemukan:
  → HARUS dianggap sebagai **critical error**
  → WAJIB diperbaiki sebelum lanjut development

---

### WAJIB: SEMUA OBJECT MENGGUNAKAN `interface`

- Semua struktur object utama:
  - entity
  - DTO
  - response
  - props
  - state

HARUS menggunakan `interface`, bukan `type`

---

### PEMBATASAN `type`

`type` hanya boleh digunakan untuk:

- union
- literal
- utility
- advanced typing

Jika digunakan untuk object utama:
→ dianggap pelanggaran arsitektur

---

### STRATEGI PENGGANTI `any`

Jika tipe tidak diketahui:

1. Gunakan `unknown`
2. Lakukan type refinement
3. Gunakan schema validation (Zod, dll)
4. Gunakan generic

---

### TYPE REFINEMENT WAJIB

Setiap data bertipe `unknown`:

- HARUS divalidasi
- HARUS dipastikan sebelum digunakan

---

### ENFORCEMENT TOOLING (DISARANKAN)

Untuk memastikan aturan ini berjalan:

- Aktifkan:
  - `noImplicitAny: true`
  - `strict: true`

- Gunakan ESLint rule:
  - `@typescript-eslint/no-explicit-any` → error

- Gunakan CI check:
  - build gagal jika ada `any`

---

### TUJUAN ATURAN INI

- Menjadikan TypeScript sebagai **kontrak sistem**
- Mencegah “false safety”
- Menjamin scalability jangka panjang

---

### DAMPAK JIKA DITERAPKAN

- Refactor lebih aman
- Bug runtime berkurang drastis
- Codebase konsisten dan predictable
- Lebih siap untuk scale (team & system)

---

Gunakan skill ini untuk menghasilkan code TypeScript setara senior engineer dengan fokus pada keamanan type, skalabilitas, dan maintainability.
