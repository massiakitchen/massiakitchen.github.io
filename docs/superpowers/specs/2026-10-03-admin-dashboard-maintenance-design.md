> **ملغى (2026-10-03):** صاحب المشروع اختار Vercel بدلاً من Firebase. المرجع الحالي: `2026-10-03-admin-vercel-design.md`.

# تصميم: لوحة إدارة الماسية — نظام الصيانة وإدارة المحتوى

- التاريخ: 2026-10-03
- الحالة: معتمد شفهياً من صاحب المشروع، بانتظار مراجعة هذا الملف
- المستودع: `massiakitchen/massiakitchen.github.io` (GitHub Pages، يُخدَم من جذر المستودع بدون خطوة build)

## 1. الهدف

1. **نظام صيانة للمصنع**: موظفو المصنع يسجلون العملاء وطلبات الصيانة، يعرفون كل صيانة تتبع أي عميل، حالتها، هل هي داخل الضمان، ومتى موعد الصيانة الدورية القادمة لكل عميل.
2. **لوحة إدارة محتوى**: تعديل كل نصوص وصور وأسعار الموقع، وإظهار/إخفاء الأقسام وإعادة ترتيبها، بدون لمس الكود.

### معايير النجاح
- موظف يسجل الدخول ويضيف عميلاً وصيانة في أقل من دقيقة، ويرى قائمة "متأخرة / مستحقة هذا الأسبوع" فور فتح اللوحة.
- تعديل أي نص أو سعر في اللوحة + "نشر" ← يظهر على الموقع خلال ~15 دقيقة، والموقع يبقى قابلاً للفهرسة في جوجل (المحتوى داخل HTML).
- لا يمكن لأي شخص غير مسجل في قائمة الموظفين قراءة أو كتابة أي بيانات.
- أول نشر من المحتوى المُستخرج ينتج صفحة مطابقة للموقع الحالي.

### قرارات صاحب المشروع
| السؤال | القرار |
|---|---|
| من يستخدم نظام الصيانة | موظفو المصنع فقط (لا دخول للعملاء) |
| التذكير بالصيانة الدورية | داخل اللوحة فقط + زر واتساب برسالة جاهزة |
| مدة الصيانة الدورية | افتراضياً 6 شهور، قابلة للتعديل لكل عميل (افتراض — لم يُحدد صراحة) |
| نطاق تعديل المحتوى | كل النصوص + إظهار/إخفاء/ترتيب الأقسام |
| مكان البيانات | Firebase (Auth + Firestore + Storage) على الباقة المجانية Spark |
| الصلاحيات | صلاحية واحدة لكل الموظفين |

### خارج النطاق (الآن)
- دخول العملاء / تتبع حالة الصيانة من العميل.
- رسائل تلقائية (SMS / WhatsApp API / إيميل).
- إنشاء أنواع أقسام جديدة بتصميم جديد من اللوحة (محرر تصميم).
- أدوار وصلاحيات متعددة.
- النشر الفوري (يحتاج باقة Blaze + Cloud Functions).

## 2. المعمارية

```
الموقع العام (GitHub Pages)            لوحة الإدارة /admin/ (نفس المستودع، محمية بتسجيل الدخول)
        ▲                              ├─ الصيانة
        │ commit index.html + صور      └─ المحتوى
        │                                       │ Firebase JS SDK (ESM من gstatic)
  GitHub Action (cron كل 15 دقيقة) ◄── يقرأ ── Firebase: Auth / Firestore / Storage
```

- الموقع العام **لا يقرأ من Firebase وقت التشغيل**. يبقى ملفات ثابتة كما هو الآن.
- لوحة الإدارة: `admin/index.html` + `admin/*.js` بـ JavaScript عادي (ES modules)، عربية RTL، بنفس هوية الموقع، تحمّل Firebase SDK من `https://www.gstatic.com/firebasejs/<version>/…` بإصدار مثبت. لا خطوة build.
- `admin/` مستثناة من الفهرسة: `<meta name="robots" content="noindex">` + سطر `Disallow: /admin/` في `robots.txt`.
- إعدادات Firebase الخاصة بالويب (apiKey وغيره) عامة بطبيعتها وتوضع في `admin/firebase-config.js`؛ الحماية الفعلية في قواعد الأمان.

## 3. المرحلة 1 — التأسيس

- مشروع Firebase جديد (اسم مقترح `massia-admin`) على حساب جوجل الخاص بصاحب المشروع.
- Auth: إيميل وكلمة سر. لا تسجيل ذاتي من اللوحة؛ الحسابات تُنشأ من Firebase Console أو بسكربت.
- مجموعة `staff/{email}`: `{ name, active: true, addedAt }`. الدخول للبيانات مشروط بوجود الإيميل و`active == true`.
- قواعد Firestore (ملخص):
  - `isStaff()` = مسجل دخول + `exists(/staff/$(request.auth.token.email))` + `active == true`.
  - كل المجموعات: قراءة/كتابة لـ `isStaff()` فقط. `staff` نفسها: قراءة فقط من اللوحة (التعديل من Console).
  - التحقق من الأنواع والحقول الإلزامية في القواعد للمجموعات الأساسية.
- قواعد Storage: قراءة/كتابة لـ `isStaff()` فقط، حد حجم 5 ميجا للملف، صور فقط. **مؤجلة للمرحلة 2**: منذ فبراير 2026 يتطلب Firebase Storage باقة Blaze (بطاقة دفع، مع حصة مجانية). القرار (Blaze أو حفظ الصور مضغوطة داخل Firestore) يُتخذ مع صاحب المشروع قبل المرحلة 2.
- غلاف اللوحة: شاشة دخول، شريط تنقل (الرئيسية / العملاء / الصيانات / المحتوى / النشر)، تسجيل خروج، رسالة واضحة إذا كان الحساب غير موجود في `staff`.
- تفعيل Firestore offline persistence.

## 4. المرحلة 2 — نظام الصيانة

### البيانات
`customers/{id}`
| الحقل | النوع | ملاحظات |
|---|---|---|
| name | string | إلزامي |
| phone | string | إلزامي، يُخزن بصيغة `+201XXXXXXXXX` (نفس `normalizeEgyptPhone` في الموقع) |
| area, address | string | |
| orderRef | string | رقم الطلب/المطبخ الأصلي |
| installDate | timestamp | إلزامي، لا يكون في المستقبل |
| intervalMonths | number | افتراضي 6 |
| nextDueDate | timestamp | محسوب: (تاريخ آخر صيانة دورية مكتملة أو installDate) + intervalMonths |
| archived | bool | بدلاً من الحذف |
| notes | string | |
| createdAt, updatedAt, createdBy | | |

`maintenances/{id}`
| الحقل | النوع | ملاحظات |
|---|---|---|
| customerId | string | إلزامي |
| customerName, customerPhone | string | نسخة للعرض في القوائم بدون قراءة إضافية |
| type | enum | `periodic`, `hinges`, `drawers`, `leak`, `breakage`, `other` |
| description | string | |
| photos | array of {path, url} | تُصغّر في المتصفح (≤1600px، JPEG 0.8) قبل الرفع؛ حد 6 صور |
| requestedAt | timestamp | إلزامي |
| scheduledAt | timestamp | |
| technician | string | نص حر + اقتراحات من القيم السابقة |
| status | enum | `new` → `scheduled` → `in_progress` → `done` |
| underWarranty | bool | محسوب: requestedAt < installDate + 10 سنوات؛ قابل للتعديل اليدوي |
| warrantyOverridden | bool | true إذا عُدل يدوياً |
| cost | number | يظهر فقط إذا خارج الضمان |
| notes | string | |
| completedAt | timestamp | يُضبط عند `done` |

- عند تحويل صيانة `periodic` إلى `done`: يُحدَّث `customers.nextDueDate` = completedAt + intervalMonths (في transaction واحدة).
- لا يُحذف عميل له صيانات؛ يُؤرشف.

### المنطق (وحدات pure قابلة للاختبار في `admin/lib/`)
- `warranty.js`: `isUnderWarranty(installDate, requestedAt, years = 10)`.
- `schedule.js`: `nextDueDate(baseDate, intervalMonths)`, `dueBuckets(customers, today)` ← `{ overdue, thisWeek }`.
- `phone.js`: نفس منطق `normalizeEgyptPhone` / `isValidEgyptPhone` في الموقع (يُنسخ ويُختبر).
- `whatsapp.js`: بناء رابط `wa.me` برسالة التذكير.

### الشاشات
1. **الرئيسية**: عداد لكل حالة؛ قائمة "متأخرة" ثم "مستحقة هذا الأسبوع" لكل منها زر واتساب ("أهلاً أستاذ ___، ميعاد الصيانة الدورية لمطبخك مع الماسية …") وزر "إنشاء صيانة دورية".
2. **العملاء**: بحث بالاسم/الهاتف، إضافة/تعديل/أرشفة، صفحة عميل بسجل صياناته.
3. **الصيانات**: قائمة بفلاتر (الحالة، الفني، التاريخ) + نموذج إضافة/تعديل مع رفع صور.

## 5. المرحلة 3 — إدارة المحتوى

### نموذج المحتوى في Firestore
- `site/draft` و`site/published`: كل منهما مستند واحد:
  ```
  { settings: { companyName, seo: { title, description, ogImage }, contact: { phone, whatsapp, email, facebook } },
    sections: [ { id, type, visible, fields: {...} } ],   // الترتيب = ترتيب المصفوفة
    updatedAt, updatedBy }
  ```
- أنواع الأقسام = أقسام الموقع الحالية: `scrollytelling` (الواجهة)، `materials`، `calculator` (يشمل `prices` بنفس بنية `PRICE_CONFIG`)، `why-us`، `works` (المشاريع: title, description, category, images[], video)، `facebook-slider` (روابط المنشورات)، `branches`، `reviews`، `faq` (questions[])، `contact`. وأيضاً الهيدر والفوتر كأجزاء ثابتة الموضع قابلة للتعديل.
- `publishes/{id}`: `{ requestedAt, requestedBy, status: pending|published|failed|superseded, error, commitSha, snapshot }` — سجل النشرات، ويُستخدم للرجوع لنسخة سابقة (نسخ `snapshot` إلى `draft` ثم نشر).
- إذا تجاوز المستند حد Firestore (1 ميجا): تُقسّم الأقسام إلى `site/draft/sections/{id}` — يُقرر وقت التنفيذ حسب الحجم الفعلي.

### المولّد (renderer)
- `site-src/templates/` قالب لكل نوع قسم + قالب الصفحة (head، هيدر، فوتر، سكربتات).
- `site-src/render.js`: دالة pure `render(content) → html` بلا اعتماديات، تعمل في المتصفح (معاينة في اللوحة) وفي Node (GitHub Action). كل النصوص تُهرَّب (escape) — لا HTML خام من المحتوى.
- البيانات المنظمة (LocalBusiness، Service، FAQPage) تُبنى من المحتوى نفسه.
- أسعار الحاسبة تُكتب في الصفحة كـ `<script type="application/json" id="price-config">` ويقرأها `js/calculator.js` بدلاً من الثابت المكتوب.
- **الاستخراج الأولي**: `site-src/extract.js` يقرأ `index.html` الحالي وينتج محتوى أولياً يُرفع إلى `site/draft` و`site/published`.
- **اختبار التطابق**: `render(extract(index.html))` يجب أن يطابق الصفحة الحالية (مقارنة DOM بعد توحيد المسافات + لقطة شاشة في Chromium) قبل اعتماد المولّد.

### النشر
1. زر "نشر" في اللوحة: ينسخ `site/draft` إلى مستند `publishes/{id}` بحالة `pending`.
2. `.github/workflows/publish.yml`: cron كل 15 دقيقة + تشغيل يدوي. يقرأ **أحدث** طلب `pending` عبر service account (Secret `FIREBASE_SERVICE_ACCOUNT`)، والطلبات `pending` الأقدم منه تُعلَّم `superseded`.
3. الخطوات: تنزيل الصور الجديدة من Storage → تصغيرها بـ ImageMagick (متوفر على ubuntu runners) إلى `images/content/` → `render()` → فحوصات (الأقسام الإلزامية موجودة، JSON-LD يُحلل، لا روابط صور مكسورة) → commit + push إلى `main` → تحديث الطلب إلى `published` مع `commitSha` و`site/published`.
4. عند فشل أي فحص: لا commit، الطلب يصبح `failed` مع رسالة الخطأ، ويظهر في اللوحة.
5. اللوحة تعرض حالة آخر نشر وسجل النشرات وزر "رجوع لهذه النسخة".

### واجهة التحرير
- قائمة الأقسام مع: إظهار/إخفاء، أسهم أعلى/أسفل للترتيب، "تعديل".
- نموذج لكل نوع قسم بحقوله (نصوص، قوائم عناصر قابلة للإضافة/الحذف/الترتيب، رفع صور).
- زر "معاينة" يعرض `render(draft)` في iframe.
- تنبيه عند وجود تعديلات غير منشورة.

## 6. الاختبار
- `node --test` لوحدات `admin/lib/` و`site-src/` (ضمان، مواعيد، هاتف، واتساب، render، extract).
- اختبارات قواعد الأمان على Firebase Emulator (`@firebase/rules-unit-testing`) — تشغّل محلياً وفي CI: غير المسجل ممنوع، موظف `active:false` ممنوع، موظف نشط مسموح، تحقق الحقول الإلزامية.
- فحص متصفح (Chromium headless) للموقع واللوحة: لا أخطاء JS، لقطات شاشة.
- اختبار التطابق للمولّد (القسم 5).
- `package.json` للأدوات وللاختبارات فقط (devDependencies)؛ الموقع المنشور لا يعتمد على أي build.

## 7. التنفيذ بالوكلاء
- muse (`#xhigh`) عبر `tools/muse-run.sh`، بحد أقصى 3 وكلاء متوازيين، كل وكيل في worktree مستقل متفرع من `origin/main`.
- كل مرحلة لها خطة تنفيذ مستقلة بمهام صغيرة ذات ملفات واختبارات محددة.
- Claude يراجع ويختبر كل مهمة قبل الدمج؛ لا push بدون موافقة صاحب المشروع.

## 8. المطلوب من صاحب المشروع
1. تسجيل الدخول لـ Firebase بحساب جوجل عند بدء المرحلة 1.
2. قائمة إيميلات الموظفين.
3. عند المرحلة 3: إضافة Secret `FIREBASE_SERVICE_ACCOUNT` في إعدادات المستودع على GitHub (سأوضح الخطوات وقتها).

## 9. مخاطر
| الخطر | التخفيف |
|---|---|
| تجاوز حدود Firebase المجانية | تصغير الصور قبل الرفع، لا قراءة من الموقع العام، قراءات اللوحة محدودة بفلاتر |
| GitHub cron يتأخر أحياناً عن 15 دقيقة | زر "تشغيل يدوي" موثق + عرض وقت آخر فحص في اللوحة |
| المولّد يغيّر شكل الموقع | اختبار التطابق إلزامي قبل أول نشر |
| نشر محتوى خاطئ | فحوصات قبل الـ commit + سجل نشرات ورجوع |
