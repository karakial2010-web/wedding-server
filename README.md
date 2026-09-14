# Invite Studio — Wedding-Occasion Studio

منصة "استوديو الدعوات" لتصميم ومشاركة دعوات رقمية أنيقة للزفاف والمناسبات، ثنائية اللغة (عربي / English)، مع معاينة حية، عد تنازلي، خريطة جوجل، تأكيد حضور، وموسيقى لكل مناسبة — وتعمل بنشر واحد عبر الخادم.

## المزايا
- منشئ مرئي مع معاينة هاتف حية أثناء الكتابة.
- 3 طوابق (كلاسيكي / رومانسي / عصري) تُطبَّق تلقائياً على الدعوة.
- ثنائي اللغة بالكامل (AR / EN) مع حفظ اختيار اللغة.
- وضع ليلي/نهاري تلقائي + زر تبديل.
- أقسام الدعوة: القصة، برنامج الحفل، معرض الصور (حتى 9 صور)، تأكيد الحضور، واتساب.
- **المناسبة والموسيقى**: اختر نوع المناسبة + فئة موسيقية تُشغَّل للضيوف، أو ارفع مقطعاً صوتياً مخصّصاً يعمل تلقائياً.
- إشعارات تيليجرام لكل دعوة منشورة ولكل تأكيد حضور.
- مشاركة عبر رابط مباشر `/v/:id`.

## البنية
```
index.html                 ← صفحة الاستوديو الرئيسية
studio/
  builder.html             ← المنشئ
  preview.html             ← صفحة دعوة الضيف
  assets/ (i18n.js, theme.js, style.css, builder.js, preview.js)
server/
  server.js                ← الخادم (Node.js)
  db.js                    ← طبقة التخزين: PostgreSQL أو ملفات JSON
  config.local.example.json← قالب إعدادات تيليجرام
invitations/               ← دعوات تجريبية ثابتة
```

## التشغيل محلياً
يشترط Node.js 18+ ([nodеjs.org](https://nodejs.org)).

```
cd server
npm install          # يثبّت pg (يلزم فقط لوضع PostgreSQL)
npm start            # → http://localhost:3000
```

بدون `DATABASE_URL` يعمل الخادم بالتخزين المحلي (مجلد `server/data/`)، عبر متصفحك افتح `http://localhost:3000`.

## إشعارات تيليجرام (اختياري)
طريقتان:
1. **متغيرات بيئة**: `TELEGRAM_TOKEN` و `TELEGRAM_CHAT_ID` (موصى بها على Render).
2. **ملف محلي**: انسخ `server/config.local.example.json` ← `server/config.local.json` واملأ `telegramToken` / `telegramChatId`. (الملف مستثنى من Git).

## رفع المشروع إلى GitHub
1. أنشئ مستودعاً جديداً في [github.com/new](https://github.com/new) (اسم مثلاً `wedding-studio`) — لا تنشئ ملف README تلقائياً.
2. اضغط "uploading an existing file" وارفع كل الملفات (المجلدات تُرفع كاملة). لا ترفع: `config.local.json`، مجلد `node_modules`، `server/data` — .gitignore كفيل بذلك عند استخدام Git، وأثناء الرفع اليدوي تجاهلها.
3. احتفظ بحسابك إعدادات سرية لا تُشاهَر عملياً: `config.local.json` يُنشأ على جهازك فقط ولا يُرفع.

## النشر على Render (مع قاعدة بيانات PostgreSQL)
1. ادفع المشروع إلى GitHub.
2. في [Render](https://render.com) أنشئ **PostgreSQL** جديداً وانسخ "Internal Database URL".
3. أنشئ **Web Service** جديداً واربط المستودع، ثم:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment** أضف:
   - `DATABASE_URL` = الرابط المنسوخ
   - `TELEGRAM_TOKEN` و `TELEGRAM_CHAT_ID` (اختياري)
5. Deploy. عند أول تشغيل تُنشأ الجداول تلقائياً (`invites`, `rsvps`).

ملاحظات:
- في وضع PostgreSQL تُخزَّن الصور والموسيقى داخل قاعدة البيانات (data URLs)، لأن قرص Render مؤقت؛ فلا تحتاج تخزين أقراص.
- عند التنقل بين نموذج `DATABASE_URL` والعكس يُقرَّر الوضع تلقائياً عند كل إقلاع.

## API مختصر
| المسار | الوظيفة |
|---|---|
| `POST /api/invite` | نشر دعوة `{ groom, ..., photos:[dataURL], music:{...} }` |
| `GET /api/invite/:id` | جلب دعوة |
| `POST /api/rsvp/:id` | تسجيل حضور `{ name, attending }` |
| `GET /api/rsvps/:id` | قائمة الحضور |
| `POST /api/upload` | (توافقي) رفع صورة → `/uploads/..` |
| `GET /api/health` | فحص صحة، يعيد وضع التخزين الحالي |

## الأسرار
`.gitignore` يستثني: `server/config.local.json`، `.env`، `node_modules/`، `server/uploads/*`، `server/data/*`، `*.log`.