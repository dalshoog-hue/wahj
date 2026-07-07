# وَهْج — مولّد صفحات الهبوط بالذكاء الاصطناعي

منصة عربية RTL لتوليد صفحات هبوط احترافية عالية التحويل خلال دقيقة: صف منتجك → AI يكتب المحتوى → صفحة كاملة بأنيميشن → نشر برابط مباشر.

---

## المكوّنات

| الجزء | التقنية |
|---|---|
| الواجهة والخادم | Next.js 14 (App Router) + TypeScript |
| قاعدة البيانات | Supabase (جدول `pages`) |
| الذكاء الاصطناعي | Gemini 2.0 Flash (مجاني) + وضع محلي احتياطي بدون مفتاح |
| الخطوط | Alexandria + IBM Plex Sans Arabic عبر `next/font` |
| الاستضافة | Vercel (مجاني) |

الأرقام تُعرض لاتينية في كل الواجهات (`lang="ar-u-nu-latn"`).

---

## 1) الإعداد المحلي (5 دقائق)

```bash
# داخل مجلد المشروع
npm install
cp .env.example .env.local
# عبّئ القيم في .env.local (انظر الخطوة 2 و 3)
npm run dev
# افتح http://localhost:3000
```

> بدون أي مفاتيح، التوليد يعمل بالوضع المحلي، لكن النشر برابط يتطلب Supabase.

---

## 2) إعداد Supabase (مرة واحدة)

1. أنشئ مشروعاً جديداً في [supabase.com](https://supabase.com) (أو استخدم مشروعاً موجوداً).
2. افتح **SQL Editor** والصق محتوى `supabase/schema.sql` ثم شغّله — ينشئ جدول `pages` مع سياسات RLS.
3. من **Project Settings → API** انسخ:
   - `Project URL` → ضعه في `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → ضعه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 3) مفتاح Gemini (اختياري لكن مُوصى به)

1. افتح [aistudio.google.com/apikey](https://aistudio.google.com/apikey) وسجّل بحساب Google.
2. اضغط **Create API key** وانسخه إلى `GEMINI_API_KEY`.
3. الطبقة المجانية تكفي مئات عمليات التوليد يومياً. بدون المفتاح يعمل الوضع المحلي تلقائياً.

---

## 4) النشر على Vercel — دليل من الصفر

Vercel هي منصة صانعي Next.js أنفسهم: نشر مجاني، HTTPS تلقائي، ونطاق فرعي جاهز.

### أ. إنشاء الحسابات

1. **GitHub**: إن لم يكن عندك حساب، أنشئه في [github.com](https://github.com).
2. **Vercel**: افتح [vercel.com/signup](https://vercel.com/signup) واختر **Continue with GitHub** — لا حاجة لكلمة مرور منفصلة، والربط بين المنصتين يتم تلقائياً.

### ب. رفع المشروع إلى GitHub

من داخل مجلد المشروع على جهازك:

```bash
git init
git add .
git commit -m "wahj v0.1"
```

ثم أنشئ مستودعاً جديداً في GitHub (زر **New repository**، سمّه `wahj`، اجعله Private) وارفع:

```bash
git remote add origin https://github.com/USERNAME/wahj.git
git branch -M main
git push -u origin main
```

> ملف `.gitignore` يمنع رفع `.env.local` — مفاتيحك لا تصل GitHub أبداً.

### ج. الاستيراد والنشر

1. في لوحة Vercel اضغط **Add New → Project**.
2. ستظهر مستودعاتك — اختر `wahj` واضغط **Import**.
3. Vercel يتعرف على Next.js تلقائياً؛ لا تغيّر أي إعداد بناء.
4. افتح قسم **Environment Variables** وأضف الثلاثة:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
5. اضغط **Deploy** وانتظر دقيقة.

ستحصل على رابط مثل `wahj-xxxx.vercel.app` — هذا موقعك الحي، وكل صفحة منشورة تكون على `wahj-xxxx.vercel.app/p/xxxxxxxx`.

### د. التحديثات لاحقاً

كل `git push` إلى `main` ينشر تلقائياً خلال دقيقة. لا حاجة لأي خطوة يدوية.

### هـ. نطاق مخصص (اختياري)

من **Project → Settings → Domains** أضف نطاقك (مثلاً `wahj.sa`) واتبع تعليمات DNS — تضيف سجل CNAME عند مزوّد النطاق وينتهي الأمر.

---

## بنية المشروع

```
wahj/
├── app/
│   ├── layout.tsx            # RTL + الخطوط العربية
│   ├── globals.css           # كل أنماط القالب والمولّد
│   ├── page.tsx              # واجهة المولّد + المعاينة + النشر
│   ├── p/[slug]/page.tsx     # عرض الصفحات المنشورة (SSR + SEO)
│   └── api/
│       ├── generate/route.ts # Gemini → JSON (مع وضع محلي احتياطي)
│       └── publish/route.ts  # حفظ الصفحة في Supabase وإرجاع slug
├── components/
│   └── FlagshipTemplate.tsx  # القالب التجاري — يقرأ كل شيء من data
├── lib/
│   ├── schema.ts             # مخطط LandingData + المولّد المحلي + مطالبة Gemini
│   └── supabase.ts
└── supabase/schema.sql       # جدول pages + سياسات RLS
```

---

## خارطة الطريق (بعد النسخة الأولى)

- [ ] مصادقة المستخدمين (Supabase Auth) وتقييد النشر: 3 صفحات مجاناً
- [ ] محرر مرئي لتعديل النصوص والألوان بعد التوليد
- [ ] تصدير الصفحة كود HTML/React قابل للتنزيل
- [ ] قوالب إضافية (فاخر، خدمات، تطبيقات) على نفس المخطط
- [ ] معرض عام Showcase لأفضل الصفحات
- [ ] إحصائيات زيارات لكل صفحة + A/B testing
- [ ] رفع صورة المنتج الحقيقية بدل الرمز + تحليلها بالرؤية
