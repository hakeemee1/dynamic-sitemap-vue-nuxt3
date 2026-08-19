# คู่มือการใช้งาน Repo นี้

Repo นี้คือ proof-of-concept (POC) สาธิตวิธีทำให้ `@nuxtjs/sitemap` สร้าง URL สินค้าที่ route ผ่าน
query string (`/products/detail?product_id=123`) ได้ถูกต้อง — pattern ที่โมดูล sitemap มาตรฐาน
มองไม่เห็นเอง — พร้อมทำ canonical URL (ตัด query param ที่ไม่จำเป็นทิ้ง) ส่วนภาษา (ไทย/อังกฤษ) ใช้
วิธีสลับผ่าน cookie `i18n_redirected` บน URL เดียว ตรงกับที่ frontend จริงของเราใช้อยู่ — ซึ่งหมายความ
ว่า POC นี้**ไม่ได้ทำ** `hreflang` (ดูเหตุผลในหัวข้อ "โค้ดส่วนที่ทำ dynamic sitemap" ด้านล่าง)

รายละเอียดปัญหา/สเปกเต็มอยู่ที่ `docs/dynamic-sitemap-seo-poc-spec.md` และมีบทความสรุปสำหรับแชร์
ความรู้อยู่ที่ `docs/dynamic-sitemap-seo-article.md` (อังกฤษ) / `docs/dynamic-sitemap-seo-article.th.md`
(ไทย)

## โครงสร้าง repo

```
.
├── docs/                 # สเปก, ทิกเก็ต, บทความ knowledge-share
└── app/                  # ตัวแอป Nuxt 3 (โค้ดทั้งหมดอยู่ในนี้)
    ├── server/
    │   ├── api/products.ts        # mock product API (ข้อมูลสินค้าจำลอง)
    │   ├── utils/sitemapEntries.ts  # << หัวใจของ dynamic sitemap (pure function)
    │   └── plugins/sitemap-urls.ts  # << hook ที่เชื่อม pure function เข้ากับ @nuxtjs/sitemap
    ├── pages/
    │   ├── index.vue                # หน้ารายการสินค้า
    │   └── products/detail.vue      # หน้ารายละเอียดสินค้า (route ผ่าน query string)
    ├── nuxt.config.ts               # ตั้งค่าโมดูล sitemap / i18n
    └── README.md                    # คู่มือรัน + demo before/after แบบละเอียด (อังกฤษ)
```

## วิธีรัน

ทุกคำสั่งรันจากใน `app/` ไม่ใช่จาก root ของ repo:

```bash
cd app
npm install
npm run dev
```

จากนั้นเปิด:

- `http://localhost:3000/` — หน้ารายการสินค้า (ภาษาไทย ค่า default)
- `http://localhost:3000/products/detail?product_id=sku-001` — หน้ารายละเอียดสินค้า
- `http://localhost:3000/sitemap.xml` — sitemap ที่สร้างขึ้น

กดปุ่มเปลี่ยนภาษา (English) ที่ header จะ set cookie `i18n_redirected` แล้วเรนเดอร์หน้าเดิมใหม่เป็น
ภาษานั้น โดย URL ไม่เปลี่ยน

คำสั่งอื่นที่มีประโยชน์:

```bash
npm test         # รัน unit test ของ sitemapEntries.ts
npm run typecheck  # typecheck ทั้งโปรเจกต์
npm run build      # build แบบ production (SSR)
```

## ดูสถานะ "ก่อน/หลัง" แก้ปัญหา

ปกติ hook ที่แก้ปัญหาจะ**เปิดอยู่** อยู่แล้ว (สถานะ "หลังแก้") ถ้าอยากดูสถานะ "ก่อนแก้" (sitemap แบบ
default ที่ไม่มี URL สินค้าเลย) ให้สั่งรันแบบนี้แทน:

```bash
NUXT_PUBLIC_ENABLE_PRODUCT_SITEMAP=false npm run dev
```

แล้วเปิด `/sitemap.xml` ดู — จะเห็นแค่ route หลักๆ (`/`, `/products/detail` เปล่าๆ) ไม่มี
`product_id` เลยสักตัว

## โค้ดส่วนที่ทำ dynamic sitemap อยู่ตรงไหน

ไล่ตามลำดับการทำงานจริง:

### 1. `app/server/utils/sitemapEntries.ts` — ตัวหลักของทั้งหมด

Pure function `buildProductSitemapEntries(products)` แปลงรายการสินค้าให้กลายเป็น sitemap entries
โดยสร้าง `loc` ที่มีแค่ `product_id` เท่านั้น (ตัดฟิลด์อื่นในข้อมูลสินค้าทิ้ง เช่น `category`,
`bundleId` แม้จะมีอยู่ในข้อมูลจริงก็ตาม — นี่คือส่วนที่ทำให้ URL เป็น canonical)

ฟังก์ชันนี้**ไม่สร้าง `hreflang`** เพราะภาษาในแอปนี้กำหนดจาก cookie ไม่ใช่ URL (ดูข้อ 4) — สินค้า
แต่ละชิ้นเลยมี URL ที่ crawl ได้แค่ URL เดียว ไม่มี URL ที่สองให้ `hreflang` ชี้ไปหา นี่คือช่องโหว่
SEO จริงที่แยกออกมาต่างหาก อธิบายละเอียดไว้ในหัวข้อ "เว็บไซต์หลายภาษา" ของบทความ knowledge-share

เป็นไฟล์ TypeScript ธรรมดา ไม่ผูกกับ Nuxt/Nitro เลย จึงมี unit test คู่กันอยู่ที่
`app/server/utils/sitemapEntries.test.ts` ทดสอบได้โดยไม่ต้องรัน server (`npm test`)

### 2. `app/server/plugins/sitemap-urls.ts` — จุดเชื่อมเข้ากับ `@nuxtjs/sitemap`

ไฟล์นี้ hook เข้ากับ event `sitemap:input` ของ `@nuxtjs/sitemap` (Nitro plugin) โดย:

1. เช็ค runtime config `enableProductSitemap` — ถ้าปิด (toggle ก่อน/หลังด้านบน) จะไม่ทำอะไรเลย
2. ดึงข้อมูลสินค้าจาก `/api/products`
3. ส่งเข้า `buildProductSitemapEntries(...)` แล้ว push ผลลัพธ์เข้า `ctx.urls`
4. มี `try/catch` ครอบไว้ — ถ้าดึงข้อมูลสินค้าไม่สำเร็จ จะ log error แล้ว sitemap ยัง generate
   route หลักได้ตามปกติ ไม่ทำให้ `/sitemap.xml` พังทั้งหน้า

### 3. `app/server/api/products.ts` — ข้อมูลสินค้าจำลอง

Mock API (`server/api/products.ts`) คืนสินค้าตัวอย่าง ~25 ชิ้น แต่ละชิ้นมีชื่อ 2 ภาษา (`name.th`,
`name.en`) และบางชิ้นมีฟิลด์ noise อย่าง `category`/`bundleId`/`statusFlag` ไว้พิสูจน์ว่าตัดออกจาก
URL ได้จริง (ในของจริงไฟล์นี้จะถูกแทนที่ด้วยการเรียก backend จริง)

### 4. `app/nuxt.config.ts` — ตั้งค่าที่เกี่ยวข้อง

- `sitemap: { autoI18n: false }` — ปิดพฤติกรรม default ของโมดูลที่จะแยก sitemap เป็นไฟล์ต่อภาษา
  อัตโนมัติเมื่อเจอ `@nuxtjs/i18n` (ถ้าไม่ปิดตรงนี้ `/sitemap.xml` จะ redirect ไป `sitemap_index.xml`
  แยกเป็นไฟล์ย่อยแทน) เนื่องจากภาษาในแอปนี้ไม่ได้แยกด้วย URL อยู่แล้ว การแยก sitemap ต่อภาษาจึงไม่มี
  ประโยชน์
- `runtimeConfig.public.enableProductSitemap` — ค่า default ของ toggle ก่อน/หลังด้านบน
- `i18n.strategy: 'no_prefix'` + `i18n.detectBrowserLanguage: { useCookie: true, cookieKey:
  'i18n_redirected', ... }` — ทุก locale ใช้ URL เดียวกัน ภาษาที่แสดงมาจากค่าที่เก็บใน cookie
  `i18n_redirected` เท่านั้น ตรงกับที่ frontend จริงของเราใช้อยู่

### 5. `app/pages/products/detail.vue` — หน้าที่ sitemap ชี้ไป

หน้านี้อ่าน `product_id` จาก query string เอง (ไม่ใช่ dynamic route แบบ `[id].vue`) ซึ่งเป็นสาเหตุ
ตั้งต้นที่ทำให้โมดูล sitemap มาตรฐานมองไม่เห็นหน้านี้ — ถ้า `product_id` ไม่ตรงกับสินค้าไหนเลย หน้า
จะโชว์ "ไม่พบสินค้า" แทนที่จะ crash

## ถ้าจะต่อยอด/แก้ไข

- อยากเพิ่มฟิลด์ใน sitemap entry (เช่น `lastmod`, `priority`) → แก้ที่
  `app/server/utils/sitemapEntries.ts` แล้วเพิ่ม test ให้ครอบคลุมพฤติกรรมใหม่
- อยากเปลี่ยน/เพิ่มแหล่งข้อมูลสินค้า → แก้ที่ `app/server/api/products.ts`
- อยากเข้าใจว่าทำไม sitemap.xml อัปเดตทันทีตอน dev (ไม่ต้อง restart) → อ่านหัวข้อ "SSR vs SSG"
  ใน `app/README.md`
