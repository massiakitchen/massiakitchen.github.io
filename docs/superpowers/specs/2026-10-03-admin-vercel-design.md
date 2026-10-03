# تصميم: موقع الماسية على Next.js + لوحة الإدارة (الصيانة وإدارة المحتوى) — Vercel

- التاريخ: 2026-10-03
- الحالة: الاتجاه معتمد شفهياً من صاحب المشروع، بانتظار مراجعة هذا الملف
- يحل محل: `2026-10-03-admin-dashboard-maintenance-design.md` (نسخة Firebase — ملغاة)
- الاستضافة: مشروع Vercel `massiakitchen` (حساب `shafiksalah`، خطة Hobby)، مربوط بفرع `main` في GitHub وينشر تلقائياً. العنوان الرسمي: `https://massiakitchen.vercel.app`.
- المستودع سيصبح **خاصاً** (قرار صاحب المشروع)؛ نسخة GitHub Pages ستتوقف.

## 1. الهدف

1. **نقل الموقع إلى Next.js بدون أي تغيير مرئي** — نفس الشكل والحركات بالضبط.
2. **نظام صيانة للمصنع**: موظفو المصنع يسجلون العملاء والصيانات، ويعرفون كل صيانة تتبع أي عميل، حالتها، الضمان، وموعد الصيانة الدورية القادمة.
3. **لوحة إدارة محتوى**: تعديل كل نصوص وصور وأسعار الموقع، وإظهار/إخفاء/ترتيب الأقسام، مع **نشر فوري**.

### معايير النجاح
- لقطات الشاشة (كمبيوتر + موبايل، عند عدة مواضع تمرير) للموقع الجديد مطابقة للحالي، ولا أخطاء JavaScript، وصاحب المشروع يوافق على رابط المعاينة قبل استبدال الموقع.
- موظف يسجل الدخول ويضيف عميلاً وصيانة في أقل من دقيقة، ويرى "متأخرة / مستحقة هذا الأسبوع" فور فتح اللوحة.
- تعديل نص أو سعر + "نشر" ← يظهر على الموقع خلال ثوانٍ، والصفحة كاملة في HTML (مفهرسة في جوجل).
- لا يدخل اللوحة ولا يقرأ أي بيانات إلا موظف مدعو وغير موقوف.

### قرارات صاحب المشروع
| السؤال | القرار |
|---|---|
| من يستخدم نظام الصيانة | موظفو المصنع فقط |
| التذكير بالصيانة الدورية | داخل اللوحة فقط + زر واتساب برسالة جاهزة |
| مدة الصيانة الدورية | افتراضياً 6 شهور، قابلة للتعديل لكل عميل (افتراض — لم يُحدد صراحة) |
| نطاق تعديل المحتوى | كل النصوص + إظهار/إخفاء/ترتيب الأقسام |
| المنصة | Vercel + Next.js (بدلاً من Firebase) |
| الصلاحيات | صلاحية واحدة لكل الموظفين |
| الشكل والحركات | يجب ألا يتغيرا؛ لا استبدال للموقع قبل موافقة صاحب المشروع على المعاينة |

### خارج النطاق (الآن)
- دخول العملاء، الرسائل التلقائية (SMS/WhatsApp API/إيميل).
- إنشاء أنواع أقسام جديدة بتصميم جديد من اللوحة.
- أدوار متعددة.
- تحسين الصور عبر `next/image` (لاحقاً، بعد ثبات المطابقة).

## 2. المعمارية

```
Vercel project "massiakitchen" (Next.js 16 App Router, Node runtime, Fluid Compute)
├─ /                الموقع العام — Server Components تقرأ المحتوى المنشور (مُخزَّن بـ cache tag "site")
├─ /privacy, /terms صفحات ثابتة منقولة كما هي
├─ /admin/...       لوحة الإدارة — محمية بـ Clerk (دعوات فقط)
│   ├─ الصيانة: العملاء، الصيانات، التذكيرات
│   └─ المحتوى: الأقسام، الإعدادات، المعاينة، النشر، سجل النشرات
├─ Server Actions / Route Handlers ── Drizzle ORM ──► Neon Postgres (Marketplace)
└─ الصور ──► Vercel Blob (عام لصور الموقع، خاص لصور الصيانة)
```

| الجزء | التقنية | السبب |
|---|---|---|
| إطار العمل | Next.js 16 App Router + TypeScript | مكونات، Server Components، نشر فوري بـ revalidateTag |
| قاعدة البيانات | Neon Postgres عبر Vercel Marketplace + Drizzle ORM | علاقات (عميل ← صيانات)، الباقة المجانية لا توقف المشروع نهائياً (تنام وتصحو تلقائياً) |
| الدخول | Clerk عبر Vercel Marketplace (`@clerk/nextjs` v7) | دعوات فقط (Restricted sign-up)، إيقاف موظف = Ban في Clerk |
| الصور | Vercel Blob | بدون بطاقة دفع؛ تخزين خاص لصور العملاء |
| الاختبار | Vitest (منطق)، Playwright (متصفح + مقارنة لقطات) | |

- كل الأسرار في Environment Variables على Vercel (تُضبط تلقائياً من Marketplace)؛ لا شيء في الكود.
- `/admin` مستثناة من الفهرسة: `robots` في metadata + `Disallow: /admin/` في `robots.txt`.
- الروابط الرسمية (canonical، og:url، sitemap، JSON-LD url) تتحول إلى `https://massiakitchen.vercel.app`.

## 3. المرحلة 0 — نقل الموقع إلى Next.js (بدون تغيير مرئي)

### المبدأ
لا إعادة تصميم ولا إعادة كتابة للمنطق. نفس الـ HTML بنفس الـ classes، نفس ملفات CSS، نفس ملفات JS.

- **CSS**: ملفات `css/*.css` السبعة تُستورد كما هي (بنفس الترتيب) من `app/layout.tsx`. ممنوع تعديل محتواها في هذه المرحلة.
- **HTML**: كل قسم في `index.html` يصبح مكوّن React (`components/sections/<Section>.tsx`) يُخرج **نفس العناصر ونفس الـ classes والـ ids والـ data-attributes**. الأحداث المكتوبة inline (`onclick="..."`) تُنقل إلى ربط في ملف JS المرافق، لا إلى منطق React.
- **JS**: ملفات `js/main.js`, `js/calculator.js`, `js/form-handler.js`, `js/scrollytelling.js` تُنقل إلى `public/js/` وتُحمَّل بعد اكتمال الصفحة عبر ملف دخول واحد `public/js/entry.js` (يستورد الملفات الأربعة بنفس ترتيب `src/main.js` الحالي) بـ `<Script type="module" src="/js/entry.js" strategy="afterInteractive" />`. المكتبات الخارجية (GSAP 3.12.2، ScrollTrigger، Lenis 1.0.33، Lucide 0.468.0، Google Analytics، Contentsquare) بنفس الإصدارات.
- **الصور**: `<img>` عادية بنفس المسارات (تُنقل إلى `public/images/`)؛ لا `next/image` في هذه المرحلة.
- **الخط**: Cairo من Google Fonts بنفس رابط الـ `<link>` الحالي (لا `next/font` في هذه المرحلة).
- **Service Worker** (`sw.js`) و`manifest.json`: يُنقلان إلى `public/` بنفس السلوك، مع تحديث قائمة الملفات المسبقة لتطابق مسارات Next.js، ورفع رقم الكاش.
- **المحتوى**: النصوص والقوائم في المكونات تُقرأ من كائن محتوى واحد (`content/site.json`) مستخرج من `index.html` الحالي، بنفس **نموذج المحتوى** في القسم 6. هذا يجعل المرحلة 3 مجرد تغيير مصدر القراءة من ملف إلى قاعدة البيانات.
- **البيانات المنظمة** (LocalBusiness، Service، FAQPage) تُبنى من كائن المحتوى.

### التحقق (شرط قبل الاستبدال)
1. Playwright يلتقط الموقع الحالي (من `origin/main` الحالي) والجديد: عرض 1440 و390، عند مواضع تمرير 0%، 15%، 30%، 50%، 75%، 100% (بعد انتهاء الحركات)، مع تعطيل العناصر المتغيرة (الوقت، iframes فيسبوك). الفرق المسموح ≤ 0.5% من البكسلات لكل لقطة.
2. تسجيل فيديو للتمرير من أعلى لأسفل للنسختين.
3. صفر أخطاء JavaScript في الكونسول، وصفر طلبات 404.
4. Lighthouse للأداء لا يقل عن الحالي.
5. رابط معاينة Vercel (Preview Deployment) يراجعه صاحب المشروع على موبايله. **لا دمج إلى `main` قبل موافقته الصريحة.**

### الاستبدال
- تغيير Framework Preset للمشروع على Vercel إلى Next.js (أو الاعتماد على الاكتشاف التلقائي) قبل الدمج.
- الدمج إلى `main` ← نشر تلقائي. عند أي مشكلة: Instant Rollback من Vercel للنسخة السابقة.

## 4. المرحلة 1 — التأسيس (قاعدة البيانات + الدخول + غلاف اللوحة)

- تركيب Neon وClerk وBlob عبر `vercel integration add` (يتطلب موافقة صاحب المشروع على أي شروط/حساب أثناء التركيب)، ثم `vercel env pull`.
- Clerk: وضع التسجيل **Restricted** (لا تسجيل ذاتي؛ دعوات فقط من لوحة Clerk). الموظف الموقوف = Banned.
- `proxy.ts`: حماية `/admin(.*)` و`/api/admin(.*)` بـ `auth.protect()`.
- كل Server Action / Route Handler في اللوحة يتحقق من الجلسة مرة أخرى على السيرفر (لا اعتماد على الـ proxy وحده).
- Drizzle: `db/schema.ts` + migrations في المستودع، `drizzle-kit migrate` ضمن خطوات النشر.
- غلاف اللوحة: عربي RTL بهوية الموقع، تنقل (الرئيسية / العملاء / الصيانات / المحتوى / النشر)، اسم الموظف، خروج، صفحة 404 داخلية.

## 5. المرحلة 2 — نظام الصيانة

### الجداول (Postgres)
`customers`
| العمود | النوع | ملاحظات |
|---|---|---|
| id | uuid PK | |
| name | text not null | |
| phone | text not null | بصيغة `+201XXXXXXXXX` (نفس `normalizeEgyptPhone` في الموقع)، فهرس |
| area, address, order_ref, notes | text | |
| install_date | date not null | لا يكون في المستقبل |
| interval_months | int not null default 6 | |
| next_due_date | date not null | (تاريخ آخر صيانة دورية مكتملة أو install_date) + interval_months |
| archived | boolean default false | بدلاً من الحذف |
| created_at, updated_at | timestamptz | |
| created_by | text | Clerk user id |

`maintenances`
| العمود | النوع | ملاحظات |
|---|---|---|
| id | uuid PK | |
| customer_id | uuid FK → customers (on delete restrict) | |
| type | enum `periodic, hinges, drawers, leak, breakage, other` | |
| description, technician, notes | text | |
| requested_at | date not null | |
| scheduled_at | timestamptz | |
| status | enum `new, scheduled, in_progress, done` default `new` | |
| under_warranty | boolean not null | محسوب: requested_at < install_date + 10 سنوات |
| warranty_overridden | boolean default false | |
| cost | numeric(10,2) | يظهر فقط إذا خارج الضمان |
| completed_at | timestamptz | يُضبط عند `done` |
| created_at, updated_at, created_by | | |

`maintenance_photos`: `id, maintenance_id FK (on delete cascade), blob_pathname, created_at` — صور في Blob **خاص**، تُعرض عبر Route Handler يتحقق من الجلسة. تُصغّر في المتصفح (≤1600px، JPEG 0.8) قبل الرفع؛ حد 6 صور للصيانة و5 ميجا للصورة.

- إغلاق صيانة `periodic` كـ `done` يحدّث `customers.next_due_date` في **transaction** واحدة.
- لا حذف لعميل له صيانات (FK restrict)؛ أرشفة.

### المنطق (وحدات pure مختبرة بـ Vitest في `lib/maintenance/`)
- `isUnderWarranty(installDate, requestedAt, years = 10)`
- `nextDueDate(baseDate, intervalMonths)` — مع معالجة نهاية الشهر (31 يناير + شهر = 28/29 فبراير)
- `dueBuckets(customers, today)` → `{ overdue, thisWeek }`
- `normalizeEgyptPhone` / `isValidEgyptPhone` — منقولة من الموقع بنفس السلوك
- `whatsappReminderUrl(customer)` — رابط `wa.me` برسالة: "أهلاً أستاذ ___، ميعاد الصيانة الدورية لمطبخك مع الماسية …"

### الشاشات
1. **الرئيسية**: عداد لكل حالة؛ "متأخرة" ثم "مستحقة هذا الأسبوع"، لكل عميل زر واتساب وزر "إنشاء صيانة دورية".
2. **العملاء**: بحث بالاسم/الهاتف، إضافة/تعديل/أرشفة، صفحة عميل بسجل صياناته.
3. **الصيانات**: قائمة بفلاتر (الحالة، الفني، التاريخ) + نموذج إضافة/تعديل مع رفع صور. الفني: نص حر مع اقتراحات من القيم السابقة.
- التحقق من المدخلات على السيرفر (Zod) بنفس قواعد الواجهة؛ رسائل خطأ عربية.

## 6. المرحلة 3 — إدارة المحتوى

### نموذج المحتوى
```
SiteContent = {
  settings: { companyName, seo: { title, description, ogImage }, contact: { phone, whatsapp, email, facebook } },
  sections: Array<{ id: string, type: SectionType, visible: boolean, fields: <حسب النوع> }>   // الترتيب = ترتيب المصفوفة
}
SectionType = 'scrollytelling' | 'materials' | 'calculator' | 'why-us' | 'works' | 'facebook-slider'
            | 'branches' | 'reviews' | 'faq' | 'contact'
```
- الهيدر والفوتر أجزاء ثابتة الموضع قابلة للتعديل ضمن `settings`.
- `calculator.fields.prices` بنفس بنية `PRICE_CONFIG` الحالية؛ تُكتب في الصفحة كـ `<script type="application/json" id="price-config">` ويقرأها `calculator.js`.
- `works.fields.items[]`: `{ title, description, category, images[], video }`.
- يُعرَّف النموذج مرة واحدة بـ Zod (`lib/content/schema.ts`) ويُستخدم في الموقع واللوحة والتحقق.

### التخزين
- جدول `site_content`: صفان `draft` و`published` (`key text PK, content jsonb, updated_at, updated_by`).
- جدول `publishes`: `id, content jsonb, published_at, published_by, note` — سجل النشرات والرجوع.
- البذرة الأولى = `content/site.json` من المرحلة 0.

### النشر الفوري
- الموقع العام يقرأ `published` عبر دالة مخزنة بـ `cacheTag('site')`.
- زر "نشر": Server Action يتحقق من `draft` بـ Zod ← ينسخه إلى `published` ويضيف صفاً في `publishes` (transaction) ← `revalidateTag('site')`. يظهر على الموقع خلال ثوانٍ.
- فشل التحقق ← لا نشر، ورسالة توضح الحقل الخاطئ.
- "رجوع لهذه النسخة": ينسخ `publishes.content` إلى `draft` (ثم نشر عادي).
- الصور الجديدة للموقع تُرفع إلى Blob **عام** وتُخزن روابطها في المحتوى.

### واجهة التحرير
- قائمة الأقسام: إظهار/إخفاء، أسهم أعلى/أسفل، "تعديل".
- نموذج لكل نوع قسم (نصوص، قوائم عناصر قابلة للإضافة/الحذف/الترتيب، رفع صور).
- "معاينة": يعرض `draft` بنفس مكونات الموقع على `/admin/preview` (محمية).
- تنبيه عند وجود تعديلات غير منشورة.
- كل النصوص تُعرض كنص (React يهرّبها تلقائياً)؛ لا HTML خام من المحتوى.

## 7. الاختبار
- Vitest: منطق الصيانة، توحيد الهاتف، نموذج المحتوى، دوال النشر.
- اختبارات تكامل للـ Server Actions على فرع Neon مخصص للاختبار (Neon branch باسم `test`).
- Playwright: مطابقة اللقطات (المرحلة 0)، دخول/منع الدخول للوحة، إنشاء عميل وصيانة، نشر محتوى وظهوره على الصفحة.
- كل Preview Deployment على Vercel يُفحص بالمتصفح قبل الدمج.

## 8. التنفيذ بالوكلاء
- muse (`#xhigh`) عبر `tools/muse-run.sh`، بحد أقصى 3 وكلاء متوازيين، كل وكيل في worktree مستقل متفرع من `origin/main`.
- لكل مرحلة خطة تنفيذ مستقلة بمهام صغيرة ذات ملفات واختبارات محددة.
- Claude يراجع ويختبر كل مهمة قبل الدمج؛ لا push إلى `main` بدون موافقة صاحب المشروع.
- ترتيب المراحل: 0 ← 1 ← 2 ← 3. يمكن بدء المرحلة 1 بالتوازي مع نهاية المرحلة 0 لأنها لا تلمس الموقع العام.

## 9. المطلوب من صاحب المشروع
1. الموافقة على تركيب Neon وClerk وBlob من Vercel Marketplace (وإتمام أي خطوة حساب/شروط في المتصفح).
2. مراجعة رابط معاينة المرحلة 0 على الموبايل والموافقة قبل الاستبدال.
3. قائمة إيميلات الموظفين لإرسال الدعوات من Clerk.
4. جعل المستودع خاصاً (في الوقت الذي يناسبه؛ لا يؤثر على Vercel).

## 10. مخاطر
| الخطر | التخفيف |
|---|---|
| اختلاف توقيت الحركات (GSAP/Lenis) بعد Next.js | تحميل نفس الملفات بعد اكتمال الصفحة، مقارنة لقطات عند مواضع تمرير متعددة + فيديو، وموافقة صاحب المشروع على المعاينة |
| خطة Hobby مخصصة للاستخدام الشخصي غير التجاري | قرار صاحب المشروع؛ الترقية إلى Pro (~20$/شهر) متاحة عند الحاجة دون تغيير في الكود |
| تجاوز حدود Neon/Blob/Clerk المجانية | تصغير الصور قبل الرفع، قراءات محدودة بفلاتر، الموقع العام مخزن مؤقتاً (cache) |
| نشر محتوى خاطئ | تحقق Zod قبل النشر + سجل نشرات ورجوع |
| فشل build بعد الدمج | Vercel يُبقي النسخة السابقة؛ Instant Rollback |
