# Wedding Studio — Full Website Source (single file)

Complete source of the entire wedding invitation platform, one file per section.
Sections use 4-backtick fences; inner 3-backtick fences are inside the code, not delimiters.

> NOTE: `server/config.local.json` (Telegram bot token) is intentionally excluded — secret.

---

## README.md

````markdown
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
````

---

## index.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl" data-title="hub_title">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#F5DCD8">
    <title>استوديو الدعوات | منصة الدعوات الرقمية الفاخرة</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&family=El+Messiri:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
    <style>
        :root {
            --blush: #F5DCD8;
            --blush-light: #FDF6F3;
            --cream: #FAF3EC;
            --gold: #C29A5B;
            --gold-dark: #A9824A;
            --text: #5A4A46;
            --text-soft: #978784;
            --ink: #43332F;
            --shadow: 0 20px 50px rgba(168,110,96,0.14);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
            background: var(--cream);
            color: var(--text);
            -webkit-font-smoothing: antialiased;
        }

        /* ===== Nav ===== */
        .nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 999;
            display: flex; align-items: center; justify-content: space-between;
            padding: 18px 5vw;
            transition: all .4s;
        }
        .nav.scrolled {
            background: rgba(255,252,249,.92);
            backdrop-filter: blur(12px);
            box-shadow: 0 6px 24px rgba(0,0,0,.06);
            padding: 12px 5vw;
        }
        .brand { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold-dark); text-decoration: none; }
        .nav-links { display: flex; gap: 26px; align-items: center; }
        .nav-links a { color: var(--text); text-decoration: none; font-size: 14px; font-weight: 500; position: relative; }
        .nav-links a::after {
            content: ''; position: absolute; right: 0; bottom: -6px;
            width: 0; height: 2px; background: var(--gold); transition: width .3s;
        }
        .nav-links a:hover::after { width: 100%; }
        .nav-cta {
            background: var(--gold); color: #fff !important; padding: 10px 22px;
            border-radius: 30px; font-weight: 600;
        }
        .nav-cta::after { display: none; }
        .nav-cta:hover { background: var(--gold-dark); }
        .burger { display: none; background: none; border: none; font-size: 26px; color: var(--text); cursor: pointer; }

        .lang-toggle {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 40px; padding: 8px 14px; border-radius: 30px;
            border: 1.5px solid rgba(194,154,91,0.55); background: rgba(255,255,255,0.7);
            color: var(--gold-dark); font-size: 13px; font-weight: 700; font-family: inherit;
            cursor: pointer; text-decoration: none; transition: all 0.3s; line-height: 1;
        }
        .lang-toggle:hover { background: var(--gold); color: #fff; border-color: var(--gold); }

        .wa-fab {
            position: fixed; bottom: 20px; inset-inline-end: 20px; z-index: 1200;
            width: 56px; height: 56px; border-radius: 50%;
            background: #25D366; color: #fff; text-decoration: none;
            display: flex; align-items: center; justify-content: center;
            font-size: 30px; box-shadow: 0 8px 24px rgba(37,211,102,0.4);
            transition: transform 0.25s, box-shadow 0.25s;
        }
        .wa-fab:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 30px rgba(37,211,102,0.5); }
        .wa-fab svg { width: 30px; height: 30px; fill: #fff; }

        /* ===== Hero ===== */
        .hero {
            min-height: 100vh; display: flex; align-items: center;
            background: radial-gradient(1200px 600px at 85% -10%, #FCE4D8 0%, transparent 60%),
                        radial-gradient(900px 500px at 0% 100%, #F2E3E0 0%, transparent 55%),
                        linear-gradient(165deg, #F7E7E0, #FDF7F2 60%);
            position: relative; overflow: hidden;
            padding: 130px 5vw 90px;
        }
        .hero::before {
            content: '❀'; position: absolute; top: 14%; left: 4%;
            font-size: 130px; color: rgba(194,154,91,.12); transform: rotate(-20deg);
        }
        .hero::after {
            content: '✿'; position: absolute; bottom: 12%; right: 6%;
            font-size: 90px; color: rgba(194,154,91,.1);
        }
        .hero-inner { display: grid; grid-template-columns: 1.05fr .95fr; gap: 50px; max-width: 1180px; margin: 0 auto; width: 100%; align-items: center; }
        .tagline { font-family: 'Pinyon Script', cursive; font-size: 28px; color: var(--gold); }
        .type-caret::after {
            content: ''; display: inline-block; width: 2px; height: .95em;
            background: var(--gold); margin-inline-start: 4px; vertical-align: -2px;
            border-radius: 2px; animation: typeblink 1s steps(1) infinite;
        }
        @keyframes typeblink { 50% { opacity: 0; } }
        .hero h1 { font-family: 'El Messiri', serif; font-size: clamp(32px, 4.6vw, 54px); color: var(--ink); line-height: 1.35; margin: 14px 0 18px; }
        .hero h1 em { font-style: normal; color: var(--gold-dark); }
        .hero-lead { color: var(--text-soft); font-size: 16px; line-height: 2; max-width: 460px; }
        .hero-actions { display: flex; gap: 14px; margin-top: 30px; flex-wrap: wrap; }
        .btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 14px 30px; border-radius: 40px; font-weight: 600; font-size: 15px;
            text-decoration: none; border: none; cursor: pointer; font-family: inherit;
            transition: transform .25s, box-shadow .25s, background .3s;
        }
        .btn-primary { background: var(--gold); color: #fff; box-shadow: 0 10px 26px rgba(194,154,91,.4); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(194,154,91,.5); }
        .btn-ghost { background: transparent; border: 1.5px solid rgba(194,154,91,.6); color: var(--ink); }
        .btn-ghost:hover { background: rgba(194,154,91,.1); transform: translateY(-3px); }

        .phone {
            width: 270px; height: 560px; border-radius: 48px; border: 10px solid #3A2B27;
            background: #fff; box-shadow: 0 40px 80px rgba(60,40,35,.35); overflow: hidden;
            margin: 0 auto; position: relative;
        }
        .phone-notch { width: 115px; height: 22px; background: #3A2B27; border-radius: 0 0 14px 14px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 5; }
        .phone-screen { height: 100%; overflow-y: auto; background: linear-gradient(165deg,#F5DCD8,#FDF6F3); text-align: center; padding: 54px 18px 28px; font-family: 'El Messiri', serif; color: var(--text); }
        .p-e { font-family: 'Pinyon Script', cursive; color: var(--gold); font-size: 22px; }
        .p-name { font-size: 30px; margin: 8px 0 4px; color: var(--ink); }
        .p-sep { color: var(--gold); margin: 10px 0; }
        .p-line { height: 7px; border-radius: 4px; background: #E9D2C7; margin: 7px auto; width: 76%; }
        .p-cta { display: inline-block; margin-top: 16px; background: var(--gold); color: #fff; font-size: 13px; padding: 9px 20px; border-radius: 20px; }
        .float { animation: floaty 6s ease-in-out infinite; }
        @keyframes floaty { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-14px);} }

        /* ===== Stats ===== */
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1100px; margin: -40px auto 0; padding: 34px 30px; position: relative; z-index: 2; background: #fff; border-radius: 20px; box-shadow: var(--shadow); }
        .stat { text-align: center; }
        .stat b { display: block; font-family: 'Cormorant Garamond', serif; font-size: 44px; color: var(--gold-dark); }
        .stat span { color: var(--text-soft); font-size: 13px; }

        /* ===== Sections ===== */
        section.block { padding: 96px 5vw; position: relative; }
        .kicker { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold); display: block; text-align: center; }
        .title { font-family: 'El Messiri', serif; text-align: center; font-size: clamp(26px,3.6vw,38px); color: var(--ink); margin: 8px 0 14px; }
        .sub { text-align: center; color: var(--text-soft); max-width: 560px; margin: 0 auto 48px; line-height: 1.9; font-size: 15px; }

        /* Features */
        .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; max-width: 1100px; margin: 0 auto; }
        .feat { background: #fff; border: 1px solid rgba(194,154,91,.16); border-radius: 16px; padding: 26px 20px; text-align: center; transition: transform .3s, box-shadow .3s; }
        .feat:hover { transform: translateY(-6px); box-shadow: 0 14px 32px rgba(168,110,96,.16); }
        .feat .ic { font-size: 30px; }
        .feat h3 { font-family: 'El Messiri', serif; font-size: 15px; color: var(--ink); margin: 12px 0 6px; }
        .feat p { color: var(--text-soft); font-size: 13px; line-height: 1.7; }

        /* Entry cards */
        .cards { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; max-width: 1100px; margin: 0 auto; }
        .plate {
            background: #fff; border-radius: 20px; padding: 40px 32px;
            text-decoration: none; color: inherit; position: relative; overflow: hidden;
            border: 1px solid rgba(194,154,91,.18); box-shadow: var(--shadow);
            transition: transform .35s, box-shadow .35s;
        }
        .plate:hover { transform: translateY(-6px); box-shadow: 0 28px 60px rgba(168,110,96,.22); }
        .plate::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(245,220,216,.5), transparent 55%); }
        .plate .body { position: relative; z-index: 1; }
        .plate .ic { font-size: 42px; }
        .plate h3 { font-family: 'El Messiri', serif; color: var(--ink); font-size: 22px; margin: 14px 0 8px; }
        .plate p { color: var(--text-soft); font-size: 14px; line-height: 1.9; }
        .plate .go { display: inline-block; margin-top: 16px; color: var(--gold-dark); font-weight: 700; font-size: 14px; }
        .plate ul { list-style: none; margin-top: 14px; }
        .plate li { font-size: 13px; color: var(--text-soft); padding: 5px 0; }
        .plate li::before { content: '✦'; color: var(--gold); margin-left: 8px; }

        .demos { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; max-width: 1100px; margin: 24px auto 0; }
        .demo {
            border-radius: 18px; overflow: hidden; background: #fff; text-decoration: none; color: inherit;
            box-shadow: 0 10px 28px rgba(168,110,96,.12); transition: transform .35s, box-shadow .35s;
        }
        .demo:hover { transform: translateY(-7px); box-shadow: 0 22px 48px rgba(168,110,96,.22); }
        .demo .th { height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .d-lux { background: linear-gradient(160deg,#F5DCD8,#FDF3EF); }
        .d-prem { background: linear-gradient(160deg,#EAD9F0,#F7F1FA); }
        .d-perf { background: linear-gradient(160deg,#DDE9E2,#F0F7F3); }
        .demo .th i { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold-dark); }
        .demo .th h4 { font-family: 'El Messiri', serif; margin-top: 4px; font-size: 15px; }
        .demo .meta { padding: 14px 18px; }
        .demo .meta h3 { font-family: 'El Messiri', serif; font-size: 15px; color: var(--ink); }
        .demo .meta p { color: var(--text-soft); font-size: 12px; margin-top: 4px; }

        /* CTA */
        .cta { background: linear-gradient(135deg, #43332F, #5A4030); color: #F3E7DE; text-align: center; }
        .cta h2 { font-family: 'El Messiri', serif; font-size: clamp(24px,3.5vw,36px); margin-bottom: 14px; }
        .cta p { color: #C9B4A8; max-width: 520px; margin: 0 auto 30px; line-height: 1.9; }
        .cta .btn-primary { background: #fff; color: #43332F; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
        .cta .btn-primary:hover { background: var(--blush); }

        footer { background: #2E2420; color: #B8A79D; text-align: center; padding: 44px 24px 26px; font-size: 13px; }
        footer .fl { font-family: 'Pinyon Script', cursive; font-size: 28px; color: var(--gold); }
        footer p { margin-top: 8px; line-height: 1.8; }
        footer .links { margin-top: 16px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
        footer a { color: #B8A79D; text-decoration: none; }
        footer a:hover { color: var(--gold); }

        .support-band {
            display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
            gap: 14px; padding: 20px 5vw; background: var(--blush-light);
            border-top: 1px solid rgba(194,154,91,0.2);
        }
        .support-band .sb-title { font-weight: 700; color: var(--ink); font-size: 15px; }
        .support-band .sb-num { color: var(--text-soft); font-size: 14px; direction: ltr; }
        .support-band a { text-decoration: none; color: var(--gold-dark); font-weight: 600; }

        .reveal { opacity: 0; transform: translateY(34px); transition: opacity .8s, transform .8s; }
        .reveal.on { opacity: 1; transform: none; }

        .mobile-menu {
            position: fixed; top: 0; right: 0; height: 100vh; width: 260px;
            background: #fff; box-shadow: -12px 0 30px rgba(0,0,0,.16); z-index: 1000;
            display: none; flex-direction: column; gap: 20px; padding: 42px 26px;
            transform: translateX(110%); transition: transform .4s;
        }
        .mobile-menu.open { transform: translateX(0); display: flex; }
        .mobile-menu a { color: var(--text); text-decoration: none; font-size: 16px; }
        .mobile-menu .x { position: absolute; top: 16px; left: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text); }

        @media (max-width: 900px) {
            .nav-links { display: none; }
            .burger { display: block; }
            .hero-inner { grid-template-columns: 1fr; text-align: center; }
            .hero-lead { margin: 0 auto; }
            .hero-actions { justify-content: center; }
            .phone { width: 220px; height: 470px; }
            .stats { grid-template-columns: repeat(2,1fr); margin-top: 20px; padding: 26px 18px; }
            .features { grid-template-columns: repeat(2,1fr); }
            .cards { grid-template-columns: 1fr; }
            .demos { grid-template-columns: 1fr; }
        }

        /* ===== الوضع الليلي / النهاري ===== */
        .theme-fab {
            position: fixed; bottom: 20px; inset-inline-end: 84px; z-index: 1400;
            width: 44px; height: 44px; border-radius: 50%;
            background: rgba(255,255,255,.92); color: var(--gold-dark);
            border: 1.5px solid rgba(194,154,91,.5); font-size: 18px;
            cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.12);
            transition: all .3s; line-height: 1;
        }
        .theme-fab:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.22); }
        html.dark {
            --blush: #4A332E; --blush-light: #2A1E1B; --cream: #1E1613;
            --gold: #CFA66A; --gold-dark: #E0BC82; --text: #E7DAD2;
            --text-soft: #A89A92; --ink: #F6ECE4;
            --shadow: 0 20px 50px rgba(0,0,0,.4);
            color-scheme: dark;
        }
        html.dark body { background: var(--cream); color: var(--text); }
        html.dark .theme-fab { background: rgba(43,30,26,.92); }
        html.dark .nav.scrolled { background: rgba(30,22,19,.92); }
        html.dark .hero {
            background: radial-gradient(1200px 600px at 85% -10%, #3A2620 0%, transparent 60%),
                        radial-gradient(900px 500px at 0% 100%, #33201B 0%, transparent 55%),
                        linear-gradient(165deg, #261B16, #1E1613 60%);
        }
        html.dark .phone { background: #281C19; }
        html.dark .phone-screen { background: linear-gradient(165deg, #3A2620, #2A1E1B); }
        html.dark .p-line { background: rgba(232,207,198,.22); }
        html.dark .stats { background: #281C19; box-shadow: var(--shadow); }
        html.dark .feat { background: #281C19; }
        html.dark .feat:hover { box-shadow: 0 14px 32px rgba(0,0,0,.35); }
        html.dark .plate { background: #281C19; }
        html.dark .plate::before { background: linear-gradient(135deg, rgba(74,51,46,.6), transparent 55%); }
        html.dark .demo { background: #281C19; }
        html.dark #platform { background: #211814 !important; }
        html.dark .cta { background: linear-gradient(135deg, #33201B, #4A332E); }
        html.dark .mobile-menu { background: #281C19; }
        html.dark .lang-toggle { background: rgba(43,30,26,.92); }
        html.dark .demo .th h4 { color: #5A4A46; }
    </style>
    <script src="studio/assets/i18n.js"></script>
    <script src="studio/assets/theme.js"></script>
</head>
<body>

    <!-- Nav -->
    <nav class="nav" id="nav">
        <a href="#" class="brand">Wedding Studio</a>
        <div class="nav-links">
            <a href="#platform" data-i18n="h_nav_platform">المنصة</a>
            <a href="#demos" data-i18n="h_nav_demos">الدعوات الجاهزة</a>
            <a href="#features" data-i18n="h_nav_features">المميزات</a>
            <a href="studio/builder.html" class="nav-cta" data-i18n="h_nav_create">أنشئ دعوتك</a>
            <button class="lang-toggle" id="langBtn" aria-label="Language"></button>
        </div>
        <button class="burger" id="burger">☰</button>
    </nav>

    <div class="mobile-menu" id="mmenu">
        <button class="x" id="mclose">✕</button>
        <a href="#platform" data-i18n="h_nav_platform">المنصة</a>
        <a href="#demos" data-i18n="h_nav_demos">الدعوات الجاهزة</a>
        <a href="#features" data-i18n="h_nav_features">المميزات</a>
        <a href="studio/builder.html" data-i18n="h_nav_create">أنشئ دعوتك</a>
        <button class="lang-toggle" id="langBtnM" style="justify-content:center;width:100%;"></button>
    </div>

    <!-- Hero -->
    <header class="hero">
        <div class="hero-inner">
            <div>
                <span class="tagline type-caret" data-i18n="h_tagline">Craft Your Moment</span>
                <h1><span data-i18n="h_title1">منصّة </span><em data-i18n="h_title_em">دعواتٍ رقمية</em><span data-i18n="h_title2"> تصنع ذِكرى لا تُنسى</span></h1>
                <p class="hero-lead" data-i18n="h_lead">
                    صمّم دعوة زفاف أو مناسبة فاخرة خلال دقائق: اختر الطابع، أضف التفاصيل،
                    وشارك رابطاً سحرياً يفتح بموسيقى وعدّ تنازلي وتأكيد حضور — بلا أي خبرة برمجية.
                </p>
                <div class="hero-actions">
                    <a href="studio/builder.html" class="btn btn-primary" data-i18n="h_start">ابدأ التصميم مجاناً ✨</a>
                    <a href="#demos" class="btn btn-ghost" data-i18n="h_browse">استعرض الدعوات</a>
                </div>
            </div>
            <div class="phone float">
                <div class="phone-notch"></div>
                <div class="phone-screen">
                    <p class="p-e">With joy in our hearts</p>
                    <div class="p-sep">❀</div>
                    <div class="p-name">لارا &amp; آدم</div>
                    <p class="p-line"></p>
                    <p class="p-line" style="width:55%"></p>
                    <div class="p-sep">❀</div>
                    <p style="font-size:13px">24 . 09 . 2026</p>
                    <span class="p-cta" data-i18n="h_open">افتح الدعوة ▶</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Stats -->
    <div class="stats">
        <div class="stat"><b>+1,240</b><span data-i18n="h_s1">دعوة أُنشئت</span></div>
        <div class="stat"><b>+38k</b><span data-i18n="h_s2">ضيف تلقّى دعوة</span></div>
        <div class="stat"><b>12</b><span data-i18n="h_s3">طابع تصميم</span></div>
        <div class="stat"><b>4.9★</b><span data-i18n="h_s4">رضا العرسان</span></div>
    </div>

    <!-- Demo invitations -->
    <section class="block" id="demos">
        <span class="kicker" data-i18n="h_dk">Ready Invitations</span>
        <h2 class="title" data-i18n="h_dt">دعوات جاهزة للتجربة</h2>
        <p class="sub" data-i18n="h_dsub">نماذج حية مصمّمة مسبقاً — افتح أي نموذج لتشعر بتجربة الضيف قبل أن تصنع نسختك.</p>
        <div class="demos">
            <a class="demo" href="invitations/luxury/index.html">
                <div class="th d-lux"><i>L &amp; A</i><h4>لارا وآدم</h4></div>
                <div class="meta"><h3 data-i18n="h_d1">الدعوة الفاخرة 💌</h3><p data-i18n="h_d1m">ظرف بختم شمعي + عدّ تنازلي + خريطة</p></div>
            </a>
            <a class="demo" href="invitations/premium/index.html">
                <div class="th d-prem"><i>S &amp; K</i><h4>سارة وكريم</h4></div>
                <div class="meta"><h3 data-i18n="h_d2">الدعوة الراقية 👑</h3><p data-i18n="h_d2m">تمرير ثابت ومساحات أنيقة</p></div>
            </a>
            <a class="demo" href="invitations/perfect/index.html">
                <div class="th d-perf"><i>N &amp; O</i><h4>نورة وعمر</h4></div>
                <div class="meta"><h3 data-i18n="h_d3">الدعوة المثالية 🌹</h3><p data-i18n="h_d3m">هيكل متدرّج وخطّ زمني أنيق</p></div>
            </a>
        </div>
    </section>

    <!-- Platform -->
    <section class="block" id="platform" style="background:#FFFDFB;">
        <span class="kicker" data-i18n="h_pk">The Studio</span>
        <h2 class="title" data-i18n="h_pt">أين تبدأ رحلتك؟</h2>
        <p class="sub" data-i18n="h_ps">أداة متكاملة من صفحة تسويقية وصولاً إلى دعوة تصل لضيفك.</p>
        <div class="cards">
            <a class="plate" href="studio/builder.html">
                <div class="body">
                    <div class="ic">✨</div>
                    <h3 data-i18n="h_c1">المنصّة الكاملة — أنشئ دعوتك</h3>
                    <p data-i18n="h_c1p">منشئ بصري بمعاينة حية على هاتف افتراضي، يحفظ تلقائياً ويبني دعوتك النهائية التفاعلية.</p>
                    <ul>
                        <li data-i18n="h_c1l1">اختيار الطابع بالألوان (كلاسيكي / رومانسي / عصري)</li>
                        <li data-i18n="h_c1l2">قصة الزوجين + برنامج الحفل</li>
                        <li data-i18n="h_c1l3">تأكيد حضور مع زر واتساب</li>
                    </ul>
                    <span class="go" data-i18n="h_c1go">افتح المنصة ←</span>
                </div>
            </a>
            <div class="plate">
                <div class="body">
                    <div class="ic">🛠</div>
                    <h3 data-i18n="h_c2">ماذا يشمل المشروع</h3>
                    <p data-i18n="h_c2p">بنية نظيفة سهلة الصيانة والتطوير — كل ملف في مكانه.</p>
                    <ul>
                        <li data-i18n="h_c2l1">studio/ — صفحات المنصة والمنشئ والمعاينة</li>
                        <li data-i18n="h_c2l2">invitations/ — الدعوات الجاهزة كنماذج</li>
                        <li data-i18n="h_c2l3">متوافق مع الجوال + خادم مشاركة</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="block" id="features">
        <span class="kicker" data-i18n="h_fk">Features</span>
        <h2 class="title" data-i18n="h_ft">كلّ أدوات الحفل في منصة واحدة</h2>
        <p class="sub" data-i18n="h_fs">مميزات تفاعلية تجعل ضيوفك يعيشون المناسبة قبل حضورها.</p>
        <div class="features">
            <div class="feat"><div class="ic">🎵</div><h3 data-i18n="h_f1t">موسيقى</h3><p data-i18n="h_f1p">تشغيل تلقائي مع زر تحكم أنيق.</p></div>
            <div class="feat"><div class="ic">⏳</div><h3 data-i18n="h_f2t">عدّ تنازلي</h3><p data-i18n="h_f2p">أيام وساعات ودقائق تتنفّس أحياء.</p></div>
            <div class="feat"><div class="ic">📝</div><h3 data-i18n="h_f3t">تأكيد حضور</h3><p data-i18n="h_f3p">اجمع الردود وعددها لحظياً.</p></div>
            <div class="feat"><div class="ic">📍</div><h3 data-i18n="h_f4t">خريطة</h3><p data-i18n="h_f4p">زر يفتح موقع الحفل مباشرة.</p></div>
            <div class="feat"><div class="ic">💌</div><h3 data-i18n="h_f5t">ظرف 3D</h3><p data-i18n="h_f5p">ختم شمعي يفتح بتجربة بصرية.</p></div>
            <div class="feat"><div class="ic">🖼</div><h3 data-i18n="h_f6t">قصة الزوجين</h3><p data-i18n="h_f6p">خطّ زمني يلامس القلوب.</p></div>
            <div class="feat"><div class="ic">🗓</div><h3 data-i18n="h_f7t">برنامج الحفل</h3><p data-i18n="h_f7p">سير المناسبة خطوة بخطوة.</p></div>
            <div class="feat"><div class="ic">📲</div><h3 data-i18n="h_f8t">رابط فوري</h3><p data-i18n="h_f8p">مشاركة عبر أي تطبيق خلال ثوانٍ.</p></div>
        </div>
    </section>

    <!-- CTA -->
    <section class="block cta">
        <h2 data-i18n="h_ct">جاهز تصنع لحظتك الاستثنائية؟</h2>
        <p data-i18n="h_cs">لا حاجة لأوراق ورقية ولا اتصالات مضنية — دعوتك تصل للجميع برابط واحد.</p>
        <a href="studio/builder.html" class="btn btn-primary" data-i18n="h_cb">ابدأ الآن — مجاناً</a>
    </section>

    <!-- الدعم -->
    <div class="support-band">
        <span class="sb-title" data-i18n="m_support">💬 فريق الدعم جاهز لمساعدتك</span>
        <a class="sb-num" href="https://wa.me/963951742592" target="_blank" rel="noopener">+963 951 742 592</a>
        <span class="sb-num" data-i18n="m_support_hint">(واتساب — إرسال بالعربية أو الإنجليزية)</span>
    </div>

    <footer>
        <div class="fl">Wedding Studio</div>
        <p data-i18n="h_ftag">منصّة دعوات رقمية تفاعلية فاخرة.</p>
        <div class="links">
            <a href="#demos" data-i18n="h_fl1">الدعوات</a>
            <a href="#platform" data-i18n="h_fl2">المنصّة</a>
            <a href="#features" data-i18n="h_fl3">المميزات</a>
            <a href="studio/builder.html" data-i18n="h_fl4">المنشئ</a>
        </div>
        <p style="margin-top:16px;border-top:1px solid rgba(255,255,255,.08);padding-top:14px;font-size:12px;" data-i18n="h_fcopy">© 2026 Wedding Studio — جميع الحقوق محفوظة</p>
    </footer>

    <a class="wa-fab" href="https://wa.me/963951742592" target="_blank" rel="noopener" aria-label="WhatsApp support" data-i18n-title="wa_tooltip">
        <svg viewBox="0 0 32 32"><path d="M16.04 3C9.5 3 4.16 8.34 4.16 14.87c0 2.09.55 4.13 1.59 5.93L4 26l5.36-1.4a11.85 11.85 0 0 0 6.68 2.07c6.54 0 11.87-5.33 11.87-11.86C28.1 8.34 22.58 3 16.04 3zm0 21.7c-1.87 0-3.7-.5-5.27-1.44l-.38-.22-3.1.81.83-3.03-.25-.4a9.84 9.84 0 0 1-1.51-5.25c0-5.43 4.42-9.85 9.85-9.85 5.43 0 9.84 4.42 9.84 9.85 0 5.43-4.41 9.53-9.84 9.53zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
    </a>

    <script>
        const nav = document.getElementById('nav');
        window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
        document.getElementById('burger').addEventListener('click', () => document.getElementById('mmenu').classList.add('open'));
        document.getElementById('mclose').addEventListener('click', () => document.getElementById('mmenu').classList.remove('open'));

        const io = new IntersectionObserver((es) => es.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
        }), { threshold: 0.12 });
        document.querySelectorAll('.plate, .demo, .feat, .stat').forEach((el) => { el.classList.add('reveal'); io.observe(el); });

        const syncLang = () => {
            const txt = I18N.get() === 'ar' ? I18N.t('lang_btn_en') : I18N.t('lang_btn_ar');
            const b = document.getElementById('langBtn'), bm = document.getElementById('langBtnM');
            if (b) b.textContent = txt;
            if (bm) bm.textContent = txt;
        };

        // كلمة تُكتب عند دخول الموقع
        let typeTimer = null;
        const typeInto = (el, text, speed) => {
            if (!el) return;
            if (typeTimer) clearInterval(typeTimer);
            el.textContent = '';
            let i = 0;
            typeTimer = setInterval(() => {
                el.textContent = text.slice(0, ++i);
                if (i >= text.length) clearInterval(typeTimer);
            }, speed || 70);
        };
        const tagline = document.querySelector('.tagline');
        if (tagline) setTimeout(() => typeInto(tagline, tagline.textContent, 70), 350);
        document.addEventListener('langchange', () => { if (tagline) typeInto(tagline, tagline.textContent, 70); });

        document.getElementById('langBtn').addEventListener('click', () => I18N.toggle());
        if (document.getElementById('langBtnM')) document.getElementById('langBtnM').addEventListener('click', () => I18N.toggle());
        syncLang();
        document.addEventListener('langchange', syncLang);
    </script>
</body>
</html>
````

---

## studio\preview.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl" data-title="pv_title">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#F5DCD8">
    <title>دعوة زفاف</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&family=Playfair+Display:wght@500;700&family=El+Messiri:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
    <script src="assets/i18n.js"></script>
    <script src="assets/theme.js"></script>
</head>
<body class="preview-page">

    <button class="music-btn" id="musicBtn" style="opacity:1;pointer-events:auto;position:fixed;top:20px;left:20px;z-index:100;width:48px;height:48px;border-radius:50%;border:1px solid rgba(194,154,91,0.5);background:rgba(255,255,255,0.9);font-size:20px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.1);" data-i18n-title="pv_music">🎵</button>
    <button class="lang-fab" id="langBtn" data-i18n-title="lang_hint" style="top:20px;inset-inline-end:78px;">🌐</button>

    <div class="pv-container" id="pvContainer">
        <!-- الترحيب -->
        <section class="pv-slide">
            <p class="pv-script" id="pvCalligraphy">L & A</p>
            <h1 class="pv-couple"><span id="pvGroom">آدم</span> <span class="pv-amp">&</span> <span id="pvBride">لارا</span></h1>
            <p class="pv-welcome" id="pvWelcome">يسعدنا دعوتكم لمشاركتنا</p>
            <p class="pv-occasion" id="pvOccasion">دعوة زفاف</p>
            <p class="pv-h2" style="font-size:18px;letter-spacing:3px;margin-top:20px;" id="pvDate"></p>
            <div class="scroll-cue" style="position:absolute;bottom:30px;animation:floaty 2s infinite;" data-i18n="pv_scroll">⬇ ابدأ التمرير</div>
        </section>

        <!-- العد التنازلي -->
        <section class="pv-slide">
            <p class="pv-script" data-i18n="pv_count_kick">باقي على الفرحة</p>
            <h2 class="pv-h2" data-i18n="pv_count_t">باقي على فرحتنا</h2>
            <div class="pv-timer" id="pvTimer"></div>
        </section>

        <!-- القصة -->
        <section class="pv-slide">
            <p class="pv-script" data-i18n="pv_story_kick">Our Story</p>
            <h2 class="pv-h2" data-i18n="pv_story_t">قصتنا</h2>
            <div class="pv-story" id="pvStory"></div>
        </section>

        <!-- البرنامج -->
        <section class="pv-slide">
            <p class="pv-script" data-i18n="pv_prog_kick">The Celebration</p>
            <h2 class="pv-h2" data-i18n="pv_prog_t">برنامج الحفل</h2>
            <div class="pv-prog" id="pvProgram"></div>
        </section>

        <!-- معرض الصور -->
        <section class="pv-slide" id="pvGallerySec">
            <p class="pv-script" data-i18n="pv_gal_kick">Our Moments</p>
            <h2 class="pv-h2" data-i18n="pv_gal_t">لحظاتنا</h2>
            <p class="pv-gallery" id="pvGallery"></p>
        </section>

        <!-- المكان -->
        <section class="pv-slide">
            <p class="pv-script" data-i18n="pv_venue_kick">The Venue</p>
            <h2 class="pv-h2" id="pvPlaceTitle">مكان المناسبة</h2>
            <h3 class="pv-h2" style="font-size:22px;margin-bottom:8px;" id="pvVenue"></h3>
            <p style="color:var(--text-soft);font-size:15px;" id="pvAddress"></p>
            <div class="pv-map-wrap">
                <iframe id="pvMapFrame" src="https://maps.google.com/maps?q=Jeddah&z=13&output=embed&hl=ar" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-i18n-title="pv_map_title"></iframe>
            </div>
            <div class="map-actions">
                <a class="pv-map" id="pvMapBtn" href="https://maps.google.com/?q=Jeddah" target="_blank" rel="noopener" data-i18n="pv_map_open">فتح في خرائط جوجل ↗</a>
            </div>
        </section>

        <!-- تأكيد الحضور -->
        <section class="pv-slide">
            <p class="pv-script" data-i18n="pv_rsvp_kick">Will you join us?</p>
            <h2 class="pv-h2" data-i18n="pv_rsvp_t">تأكيد الحضور</h2>
            <p style="color:var(--text-soft);font-size:14px;margin-top:-16px;margin-bottom:20px;" id="pvRsvpHint"></p>
            <form class="pv-rsvp-form" id="pvForm">
                <input type="text" id="guestName" data-i18n-ph="pv_name_ph" required>
                <select id="guestAttendance" required>
                    <option value="" disabled selected data-i18n="pv_choice">هل ستشرفوننا بحضوركم؟</option>
                    <option value="yes" data-i18n="pv_yes">نعم، بكل سرور</option>
                    <option value="no" data-i18n="pv_no">أعتذر، لا أستطيع الحضور</option>
                </select>
                <button type="submit" data-i18n="pv_send">إرسال الرد</button>
            </form>
            <p class="form-message" id="formMessage" style="margin-top:14px;color:var(--gold-dark);font-weight:600;min-height:20px;"></p>
        </section>

        <!-- الخاتمة -->
        <section class="pv-slide">
            <div class="pv-script" style="font-size:40px;margin-bottom:20px;">L & A</div>
            <h2 class="pv-h2" style="font-size:24px;line-height:1.9;" id="pvCloser"></h2>
            <p style="color:var(--text-soft);margin-top:14px;font-size:14px;" id="pvFooterNames"></p>
        </section>
    </div>

    <!-- المظروف بختم الشمع -->
    <div class="env-overlay" id="envOverlay">
        <div class="env-word type-caret" id="envType"></div>
        <div class="env" id="envCard" role="button" aria-label="افتح الدعوة">
            <div class="env-back"></div>
            <div class="env-letter"><span class="env-letter-text" id="envNames">L & A</span></div>
            <div class="env-flap"></div>
            <div class="env-seal"><i id="envSeal">❤</i></div>
        </div>
        <div class="env-hint" data-i18n="env_hint">اضغط هنا لفتح الدعوة</div>
    </div>
    <button class="env-fab" id="envFab" data-i18n-title="env_reopen">💌</button>

    <!-- لافتة حان الوقت -->
    <div class="pv-now-banner" id="pvNowBanner">
        <div class="pv-now-card">
            <div class="t" id="nowMonogram">L & A</div>
            <div class="s" data-i18n="pv_now_h">حان الوقت! 🎉</div>
            <div class="s sub" id="nowFirstTitle"></div>
            <button type="button" data-i18n="pv_now_btn">نعم، نحن في الطريق</button>
        </div>
    </div>

    <a class="wa-fab" href="https://wa.me/963951742592" target="_blank" rel="noopener" aria-label="WhatsApp support" data-i18n-title="wa_tooltip">
        <svg viewBox="0 0 32 32"><path d="M16.04 3C9.5 3 4.16 8.34 4.16 14.87c0 2.09.55 4.13 1.59 5.93L4 26l5.36-1.4a11.85 11.85 0 0 0 6.68 2.07c6.54 0 11.87-5.33 11.87-11.86C28.1 8.34 22.58 3 16.04 3zm0 21.7c-1.87 0-3.7-.5-5.27-1.44l-.38-.22-3.1.81.83-3.03-.25-.4a9.84 9.84 0 0 1-1.51-5.25c0-5.43 4.42-9.85 9.85-9.85 5.43 0 9.84 4.42 9.84 9.85 0 5.43-4.41 9.53-9.84 9.53zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
    </a>

    <script src="assets/preview.js"></script>
</body>
</html>
````

---

## studio\builder.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl" data-title="b_title">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#F5DCD8">
    <title>المنشئ | اصنع دعوتك</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&family=Playfair+Display:wght@500;700&family=El+Messiri:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/style.css">
    <script src="assets/i18n.js"></script>
    <script src="assets/theme.js"></script>
</head>
<body class="builder-page">

    <nav class="site-nav scrolled">
        <a href="../index.html" class="logo" style="--role-gold:#A9824A;">Invite Studio</a>
        <div class="nav-links">
            <a href="../index.html" data-i18n="b_nav_home">الرئيسية</a>
            <a href="../index.html#demos" data-i18n="b_nav_tpl">التصاميم</a>
            <a href="#" id="openToolbar" data-i18n="b_nav_gallery">🖼️ معرض الصور</a>
            <a href="preview.html" class="nav-cta" id="previewTopBtn" data-i18n="b_nav_pv">معاينة كاملة</a>
            <button class="lang-toggle" id="langBtn" aria-label="Language"></button>
        </div>
        <button class="hamburger" id="hamburger">☰</button>
    </nav>

    <!-- معرض الصور (اختياري في الملف التحضيري) -->
    <div class="mobile-menu" id="mobileMenu">
        <button class="close-menu" id="closeMenu">✕</button>
        <a href="../index.html" data-i18n="b_nav_home">الرئيسية</a>
        <a href="../index.html#demos" data-i18n="b_nav_tpl">التصاميم</a>
        <button class="lang-toggle" id="langBtnM" style="justify-content:center;width:100%;"></button>
    </div>

    <div class="builder-shell">

        <!-- ===== يسار: النماذج ===== -->
        <div class="builder-panel">
            <div class="step-indicator">
                <div class="step-chip active" data-step="0" data-i18n="b_st0">1 · التصميم</div>
                <div class="step-chip" data-step="1" data-i18n="b_st_mu">2 · المناسبة والموسيقى</div>
                <div class="step-chip" data-step="2" data-i18n="b_st1">3 · الأساسيات</div>
                <div class="step-chip" data-step="3" data-i18n="b_st2">4 · القصة</div>
                <div class="step-chip" data-step="4" data-i18n="b_st3">5 · البرنامج</div>
                <div class="step-chip" data-step="5" data-i18n="b_st4">6 · الصور</div>
                <div class="step-chip" data-step="6" data-i18n="b_st5">7 · الخاتمة</div>
            </div>

            <!-- Step 0: التصميم -->
            <div class="builder-card active" data-card="0">
                <h2 data-i18n="b0_t">اختر الطابع</h2>
                <p data-i18n="b0_s">الطابع يتحكم في ألوان دعوتك بالكامل.</p>
                <div class="template-picker">
                    <div class="tpl-option selected" data-tpl="classic">
                        <div class="tpl-swatch" style="background:linear-gradient(160deg,#F5DCD8,#FDF3EF)"></div>
                        <span data-i18n="b0_classic">الكلاسيكي ♥</span>
                    </div>
                    <div class="tpl-option" data-tpl="rose">
                        <div class="tpl-swatch" style="background:linear-gradient(160deg,#EDD8EA,#F9F0F7)"></div>
                        <span data-i18n="b0_rose">الرومانسي</span>
                    </div>
                    <div class="tpl-option" data-tpl="modern">
                        <div class="tpl-swatch" style="background:linear-gradient(160deg,#DDE9E2,#F3F8F5)"></div>
                        <span data-i18n="b0_modern">العصري</span>
                    </div>
                </div>
            </div>

            <!-- Step 1: المناسبة والموسيقى -->
            <div class="builder-card" data-card="1">
                <h2 data-i18n="mus_title">المناسبة والموسيقى</h2>
                <p data-i18n="mus_sub">اختر نوع المناسبة وفئة موسيقية تناسب أجواءها، أو ارفع مقطعاً مخصصاً.</p>
                <div class="field"><label data-i18n="b1_occ">نوع المناسبة</label>
                    <select id="fOccasion"></select>
                </div>
                <div class="field"><label data-i18n="b1_occname">✍️ اكتب اسم المناسبة</label><input type="text" id="fOccasionName" placeholder="زفاف أحمد وسارة"></div>
                <div class="field"><label data-i18n="b1_phone">⭐ رقم هاتفك (مطلوب للتواصل معك)</label><input type="tel" id="fPhone" placeholder="05xxxxxxxx" required></div>
                <div class="field env-toggle">
                    <label class="env-toggle-label" for="fEnv">💌 <span data-i18n="env_opt">المظروف بختم الشمع عند فتح الدعوة</span></label>
                    <label class="switch"><input type="checkbox" id="fEnv" checked><span class="slider"></span></label>
                </div>
                <div class="field">
                    <label>🎵 <span data-i18n="mus_t">فئة الموسيقى (تُشغَّل تلقائياً للضيوف)</span></label>
                    <div class="music-picker" id="musicPicker"></div>
                </div>
                <div class="field">
                    <label data-i18n="mus_custom">رفع مقطع صوتي مخصص (اختياري، يحل محل الفئة)</label>
                    <input type="file" id="musicInput" accept="audio/*">
                </div>
                <div class="music-preview" id="musicPreviewBox" style="display:none;">
                    <audio id="musicPreview" controls preload="metadata"></audio>
                    <button class="rep-add" type="button" id="musicClear" data-i18n="mus_clear">✕ إزالة المقطع</button>
                </div>
                <p class="note-text" data-i18n="mus_note">تظهر فئة الموسيقى للضيوف كزر تشغيل في الدعوة. المقطع المخصص يُشغَّل تلقائياً عند فتح الدعوة من الضيف.</p>
            </div>

            <!-- Step 2: الأساسيات -->
            <div class="builder-card" data-card="2">
                <h2 data-i18n="b1_t">تفاصيل المناسبة</h2>
                <p data-i18n="b1_s">أدخل أسماء العروسين وأهم التفاصيل.</p>
                <div class="field-row">
                    <div class="field"><label data-i18n="b1_groom">اسم العريس / صاحب المناسبة</label><input type="text" id="fGroom" placeholder="آدم" value="آدم"></div>
                    <div class="field"><label data-i18n="b1_bride">اسم العروس / صاحبة المناسبة</label><input type="text" id="fBride" placeholder="لارا" value="لارا"></div>
                </div>
                <div class="field"><label data-i18n="b1_callig">سطر إنجليزي أنيق (اختياري)</label><input type="text" id="fCalligraphy" placeholder="L & A" value="L & A"></div>
                <div class="field"><label data-i18n="b1_wel">نص الترحيب</label><input type="text" id="fWelcome" placeholder="يسعدنا دعوتكم لمشاركتنا فرحة زواجنا" value="يسعدنا دعوتكم لمشاركتنا فرحة زواجنا"></div>
                <div class="field-row">
                    <div class="field"><label data-i18n="b1_date">تاريخ المناسبة</label><input type="date" id="fDate" value="2026-09-24"></div>
                    <div class="field"><label data-i18n="b1_time">الوقت</label><input type="time" id="fTime" value="19:00"></div>
                </div>
                <div class="field"><label data-i18n="b1_rsvpdl">آخر موعد لتأكيد الحضور (اختياري)</label><input type="date" id="fRsvpDeadline" value="2026-09-10"></div>
                <div class="field"><label data-i18n="b1_venue">اسم المكان / القاعة</label><input type="text" id="fVenue" placeholder="قاعة الياسمين" value="قاعة الياسمين"></div>
                <div class="field"><label data-i18n="b1_addr">العنوان التفصيلي</label><input type="text" id="fAddress" placeholder="طريق الأمير سلطان، جدة" value="طريق الأمير سلطان، جدة"></div>
                <div class="field"><label data-i18n="b1_map">📍 موقع المكان في خرائط جوجل</label><input type="text" id="fMapQuery" placeholder="مثال: قاعة الياسمين جدة شارع التحلية" value="فندق روزوود جدة"></div>
                <div class="field">
                    <label data-i18n="b1_mappv">معاينة الخريطة</label>
                    <iframe id="mapPreview" class="map-preview" src="https://maps.google.com/maps?q=Jeddah&z=13&output=embed&hl=ar" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>

            <!-- Step 3: القصة -->
            <div class="builder-card" data-card="3">
                <h2 data-i18n="b2_t">قصتكما</h2>
                <p data-i18n="b2_s">أضف ما تشاء من محطات حكايتكما (اختياري).</p>
                <div class="story-repeater" id="storyRepeater"></div>
                <button class="rep-add" type="button" id="addStory" data-i18n="b2_add">+ إضافة محطة</button>
            </div>

            <!-- Step 4: البرنامج -->
            <div class="builder-card" data-card="4">
                <h2 data-i18n="b3_t">برنامج الحفل</h2>
                <p data-i18n="b3_s">حدد سير المناسبة خطوة بخطوة.</p>
                <div class="program-repeater" id="programRepeater"></div>
                <button class="rep-add" type="button" id="addProgram" data-i18n="b3_add">+ إضافة فقرة</button>
            </div>

            <!-- Step 5: الصور -->
            <div class="builder-card" data-card="5">
                <h2 data-i18n="b4_t">صور المناسبة</h2>
                <p data-i18n="b4_s">أضف صوراً للعروسين أو لحظات مميزة لتظهر للضيوف في معرض الصور (حتى 9 صور). الرجاء اختيار صورة رئيسية مميزة.</p>
                <label class="photo-drop" for="photoInput">
                    <div class="pd-icon">📷</div>
                    <div><b data-i18n="b4_drop">اضغط أو اسحب الصور هنا</b><br><span class="note-text" data-i18n="b4_notes">يُسمح بصيغ JPG / PNG / WebP</span></div>
                </label>
                <input type="file" id="photoInput" accept="image/*" multiple hidden>
                <div class="photo-grid" id="photoGrid"></div>
                <p class="note-text mt-16" id="photoNotice"></p>
            </div>

            <!-- Step 6: الخاتمة -->
            <div class="builder-card" data-card="6">
                <h2 data-i18n="b5_t">اللمسات الأخيرة</h2>
                <p data-i18n="b5_s">أكّد التفاصيل ثم شاهد دعوتك كاملة.</p>
                <div class="field"><label data-i18n="b5_closer">رسالة ختامية</label><textarea id="fCloser" rows="3">قرأتما وشاهدتما كل شيء... انتظرونا في الموعد المحدد لنحتفل معاً ❤</textarea></div>
                <div class="field"><label data-i18n="b5_foot">الأسماء الرسمية للتذييل</label><input type="text" id="fFooterNames" placeholder="لارا & آدم" value="لارا & آدم"></div>
                <div class="field"><label data-i18n="b5_wa">رابط واتساب لتأكيد أسرع (اختياري)</label><input type="text" id="fWhatsapp" placeholder="https://wa.me/9665xxxxxxxxx"></div>
                <div class="publish-box">
                    <h3 data-i18n="pub_t">🏁 إنهاء وإرسال</h3>
                    <p class="note-text" data-i18n="pub_s">اضغط زر الإنهاء لنشر دعوتك ورفع الصور — تُرسل معلوماتك (الاسم، الهاتف، تفاصيل الدعوة) مباشرة إلى فريق المنصة عبر تيليجرام.</p>
                    <button class="btn btn-primary" type="button" id="publishBtn" style="width:100%;" data-i18n="pub_btn">🏁 إنهاء — إرسال دعوتي</button>
                    <div class="publish-result" id="publishResult"></div>
                </div>
            </div>

            <div class="builder-nav">
                <button class="btn btn-secondary" id="prevBtn" style="visibility:hidden;" data-i18n="b_prev">السابق</button>
                <button class="btn btn-primary" id="nextBtn" data-i18n="b_next">التالي ←</button>
            </div>
            <p class="note-text mt-16" data-i18n="b_note">💾 يتم حفظ التعديلات تلقائياً، وتظهر المعاينة الحية أمامك في الهاتف.</p>
        </div>

        <!-- ===== يمين: المعاينة الحية ===== -->
        <div class="preview-column">
            <div class="preview-phone">
                <div class="bp-notch"></div>
                <div class="bp-screen" id="bpScreen">
                    <div class="bp-setenv" id="bpEnv">
                        <div class="env scaled">
                            <div class="env-back"></div>
                            <div class="env-letter"><span class="env-letter-text" id="bpEnvNames">L & A</span></div>
                            <div class="env-flap"></div>
                            <div class="env-seal"><i id="bpEnvSeal">❤</i></div>
                        </div>
                        <div class="env-hint" data-i18n="env_hint">اضغط هنا لفتح الدعوة</div>
                    </div>
                    <div class="bp-content">
                        <div class="bp-section bp-hero">
                            <small id="bpOccasion">دعوة زفاف</small>
                            <div class="bp-divider">❀</div>
                            <div class="bp-couple" id="bpCalligraphy">L & A</div>
                            <div class="bp-ar" id="bpNames">آدم & لارا</div>
                            <div class="bp-date" id="bpDate"></div>
                            <div class="bp-divider">❀</div>
                            <small id="bpWelcome">يسعدنا دعوتكم لمشاركتنا فرحة زواجنا</small>
                        </div>
                        <div class="bp-section bp-countdown">
                            <small data-i18n="pv_count_kick">باقي على الفرحة</small>
                            <div class="bp-timer" id="bpTimer"></div>
                        </div>
                        <div class="bp-section bp-venue">
                            <small data-i18n="pv_venue_kick">موعدنا</small>
                            <div class="bp-divider">❀</div>
                            <h3 id="bpVenue">قاعة الياسمين</h3>
                            <p id="bpAddress">طريق الأمير سلطان، جدة</p>
                        </div>
                        <div class="bp-section bp-gallery">
                            <small data-i18n="pv_gal_kick">معرض الصور</small>
                            <div class="bp-divider">❀</div>
                            <div id="bpGallery" class="bp-gallery-grid"></div>
                        </div>
                        <div class="bp-section bp-rsvp">
                            <small data-i18n="pv_rsvp_t">تأكيد الحضور</small>
                            <div class="bp-divider">❀</div>
                            <input type="text" placeholder="اسمك الكريم" style="width:100%;padding:9px;border:1px solid rgba(194,154,91,0.4);border-radius:8px;text-align:center;" data-i18n-ph="pv_name_ph">
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" id="fullPreviewBtn" style="width:100%;" data-i18n="b_nav_pv">🔍 معاينة كاملة</button>
        </div>
    </div>

    <a class="wa-fab" href="https://wa.me/963951742592" target="_blank" rel="noopener" aria-label="WhatsApp support" data-i18n-title="wa_tooltip">
        <svg viewBox="0 0 32 32"><path d="M16.04 3C9.5 3 4.16 8.34 4.16 14.87c0 2.09.55 4.13 1.59 5.93L4 26l5.36-1.4a11.85 11.85 0 0 0 6.68 2.07c6.54 0 11.87-5.33 11.87-11.86C28.1 8.34 22.58 3 16.04 3zm0 21.7c-1.87 0-3.7-.5-5.27-1.44l-.38-.22-3.1.81.83-3.03-.25-.4a9.84 9.84 0 0 1-1.51-5.25c0-5.43 4.42-9.85 9.85-9.85 5.43 0 9.84 4.42 9.84 9.85 0 5.43-4.41 9.53-9.84 9.53zm5.4-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
    </a>

    <script src="assets/builder.js"></script>
</body>
</html>
````

---

## studio\assets\style.css

````css
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
    --blush: #F5DCD8;
    --blush-light: #FDF6F3;
    --cream: #FAF3EC;
    --gold: #C29A5B;
    --gold-dark: #A9824A;
    --text: #5A4A46;
    --text-soft: #9A8B86;
    --ink: #4A3B3F;
    --surface: #FFFFFF;
}

html { scroll-behavior: smooth; }

body {
    font-family: 'IBM Plex Sans Arabic', 'Segoe UI', sans-serif;
    background: var(--cream);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
}

/* ============ MENU ============ */
.site-nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 5vw;
    transition: background 0.4s, box-shadow 0.4s, padding 0.4s;
}
.site-nav.scrolled {
    background: rgba(255,252,248,0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    padding: 12px 5vw;
}
.logo {
    font-family: 'Pinyon Script', cursive;
    font-size: 30px;
    color: var(--role-gold, var(--gold-dark));
    text-decoration: none;
}
.nav-links { display: flex; gap: 26px; align-items: center; }
.nav-links a { color: var(--text); text-decoration: none; font-size: 15px; font-weight: 400; transition: color 0.3s; }
.nav-links a:hover { color: var(--gold-dark); }
.nav-cta {
    padding: 9px 20px;
    background: var(--gold);
    color: #fff !important;
    border-radius: 30px;
    font-weight: 500;
    transition: background 0.3s;
}
.nav-cta:hover { background: var(--gold-dark); }
.hamburger { display: none; background: none; border: none; font-size: 26px; cursor: pointer; color: var(--text); }

/* ============ HERO ============ */
.hero {
    min-height: 100vh;
    display: flex; align-items: center;
    background: linear-gradient(135deg, #F5DCD8 0%, #FDF3EF 55%, #FBE9E2 100%);
    position: relative; overflow: hidden;
    padding: 120px 5vw 80px;
}
.hero::after {
    content: '❀';
    position: absolute; left: 6%; top: 18%;
    font-size: 90px; color: rgba(194,154,91,0.18);
    transform: rotate(-15deg);
}
.hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; max-width: 1200px; margin: 0 auto; width: 100%; align-items: center; }
.hero-script { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold); }
.hero h1 { font-family: 'El Messiri', serif; font-size: clamp(34px, 5vw, 58px); color: var(--ink); margin: 14px 0; line-height: 1.3; }
.hero h1 em { font-style: normal; color: var(--gold-dark); }
.hero p.lead { color: var(--text-soft); font-size: 17px; line-height: 1.9; max-width: 480px; }
.hero-ctas { display: flex; gap: 14px; margin-top: 30px; flex-wrap: wrap; }
.btn {
    display: inline-block;
    padding: 14px 30px;
    border-radius: 40px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.25s, box-shadow 0.25s, background 0.3s;
    border: none; cursor: pointer;
    font-family: inherit;
}
.btn-primary { background: var(--gold); color: #fff; box-shadow: 0 8px 22px rgba(194,154,91,0.35); }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(194,154,91,0.45); background: var(--gold-dark); }
.btn-ghost { background: transparent; color: var(--text); border: 1.5px solid rgba(194,154,91,0.6); }
.btn-ghost:hover { transform: translateY(-3px); background: rgba(194,154,91,0.08); }

/* هاتف معاينة في الـ hero */
.phone {
    width: 290px; height: 600px;
    background: var(--surface);
    border-radius: 44px;
    border: 10px solid #3B2E2A;
    box-shadow: 0 30px 60px rgba(0,0,0,0.3);
    overflow: hidden;
    margin: 0 auto;
    position: relative;
}
.phone-notch { width: 120px; height: 22px; background: #3B2E2A; border-radius: 0 0 14px 14px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 5; }
.phone-screen { height: 100%; overflow: hidden; position: relative; background: var(--blush-light); }
.phone-demo {
    height: 100%;
    overflow-y: auto;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 30px 16px;
    font-family: 'El Messiri', serif; color: var(--text);
}
.phone-demo .brief-couple { font-size: 30px; margin: 8px 0; }
.phone-demo .brief-line { font-size: 13px; height: 6px; border-radius: 3px; background: #E8CFC6; margin: 5px 0; width: 70%; }
.phone-demo .brief-line.gold { background: var(--gold); width: 40%; }
.phone-demo .brief-note { font-family: 'Pinyon Script', cursive; color: var(--gold); font-size: 22px; margin-bottom: 6px; }
.float-soft { animation: floaty 5s ease-in-out infinite; }
@keyframes floaty { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-12px);} }

/* ============ SECTIONS ============ */
.section { padding: 90px 5vw; position: relative; }
.section-tag { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold); display: block; text-align: center; }
.section-title { font-family: 'El Messiri', serif; font-size: clamp(28px, 4vw, 40px); color: var(--ink); text-align: center; margin: 10px 0 14px; }
.section-sub { text-align: center; color: var(--text-soft); max-width: 560px; margin: 0 auto 46px; font-size: 16px; line-height: 1.8; }

/* Steps */
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; max-width: 1000px; margin: 0 auto; }
.step-card { background: var(--surface); border-radius: 18px; padding: 34px 26px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(194,154,91,0.15); }
.step-num {
    width: 54px; height: 54px; margin: 0 auto 16px;
    background: linear-gradient(135deg, var(--blush), #F0C9BF);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'El Messiri', serif; font-weight: 700; font-size: 22px; color: var(--gold-dark);
}
.step-card h3 { font-family: 'El Messiri', serif; color: var(--text); margin-bottom: 8px; }
.step-card p { color: var(--text-soft); font-size: 14px; line-height: 1.8; }

/* Features */
.features { background: #FFFDFB; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
.feature { background: var(--blush-light); border: 1px solid rgba(194,154,91,0.18); border-radius: 16px; padding: 26px 22px; transition: transform 0.3s, box-shadow 0.3s; }
.feature:hover { transform: translateY(-6px); box-shadow: 0 14px 30px rgba(194,154,91,0.18); }
.feature-icon { font-size: 30px; margin-bottom: 12px; }
.feature h3 { font-family: 'El Messiri', serif; font-size: 17px; margin-bottom: 8px; color: var(--text); }
.feature p { color: var(--text-soft); font-size: 14px; line-height: 1.7; }

/* Templates gallery */
.templates-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; max-width: 1100px; margin: 0 auto; }
.template-card { border-radius: 18px; overflow: hidden; background: var(--surface); box-shadow: 0 10px 30px rgba(0,0,0,0.07); transition: transform 0.35s, box-shadow 0.35s; }
.template-card:hover { transform: translateY(-8px); box-shadow: 0 20px 42px rgba(194,154,91,0.25); }
.tpl-thumb { height: 260px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.tpl-1 { background: linear-gradient(160deg, #F5DCD8, #FDF3EF); }
.tpl-2 { background: linear-gradient(160deg, #EAD9F0, #F7F1FA); color: #5A3A63; }
.tpl-3 { background: linear-gradient(160deg, #DDE9E2, #F0F7F3); color: #33503F; }
.tpl-thumb .t-couple { font-family: 'Pinyon Script', cursive; font-size: 34px; }
.tpl-thumb .t-name { font-family: 'El Messiri', serif; font-size: 19px; margin-top: 6px; }
.tpl-thumb .t-date { font-size: 12px; margin-top: 4px; opacity: 0.75; letter-spacing: 2px; }
.tpl-thumb .t-wax { width: 34px; height: 34px; border-radius: 50%; position: absolute; bottom: 20px; background: radial-gradient(circle at 30% 30%, #E87A6B, #C94F43); }
.template-card .t-body { padding: 18px; text-align: center; }
.template-card .t-body h3 { font-family: 'El Messiri', serif; color: var(--text); }
.template-card .t-body p { color: var(--text-soft); font-size: 13px; margin-top: 5px; }

/* Pricing */
.pricing { background: linear-gradient(160deg, var(--blush), #FDF3EF); }
.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto; align-items: stretch; }
.price-card { background: var(--surface); border-radius: 20px; padding: 34px 28px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: flex; flex-direction: column; }
.price-card.popular { border: 2px solid var(--gold); position: relative; transform: scale(1.04); box-shadow: 0 18px 42px rgba(194,154,91,0.3); }
.popular-tag { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--gold); color: #fff; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.price-card h3 { font-family: 'El Messiri', serif; color: var(--text); }
.price-amount { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 700; color: var(--gold-dark); margin: 14px 0 4px; }
.price-amount small { font-size: 16px; color: var(--text-soft); }
.price-card ul { list-style: none; margin: 20px 0 26px; text-align: right; }
.price-card li { padding: 7px 0; color: var(--text-soft); font-size: 14px; }
.price-card li::before { content: '✦'; color: var(--gold); margin-left: 8px; }
.price-card .btn { margin-top: auto; }

/* زر الموسيقى */
.music-btn.playing { animation: spin 3s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* رفع الصور */
.publish-box { margin-top: 22px; background: var(--blush-light); border: 1px solid rgba(194,154,91,0.3); border-radius: 14px; padding: 18px; }
.publish-box h3 { font-family: 'El Messiri', serif; color: var(--text); margin-bottom: 6px; }
.publish-result { margin-top: 12px; }
.publish-link {
    display: flex; gap: 8px; align-items: center; margin-top: 8px;
    background: var(--surface); border: 1px solid rgba(194,154,91,0.4); border-radius: 10px; padding: 8px 10px;
}
.publish-link input { flex: 1; border: none; padding: 6px 8px; font-size: 13px; direction: ltr; text-align: left; background: transparent; }
.publish-link input:focus { outline: none; box-shadow: none; }
.copy-btn { background: var(--gold); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 13px; white-space: nowrap; }
.copy-btn:hover { background: var(--gold-dark); }
.publish-done { color: var(--gold-dark); font-size: 14px; font-weight: 600; }
.publish-err { color: #c0392b; font-size: 14px; }
.publish-note { margin-top: 8px; font-size: 12px; color: var(--text-soft); }

.photo-drop {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    padding: 34px 20px; margin-bottom: 18px;
    border: 2px dashed var(--gold); border-radius: 14px;
    background: var(--blush-light); cursor: pointer; text-align: center;
    transition: background 0.3s, transform 0.2s;
}
.photo-drop:hover { background: rgba(245,220,216,0.6); transform: scale(1.01); }
.photo-drop .pd-icon { font-size: 34px; }
.photo-drop b { color: var(--text); font-weight: 600; }
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.photo-cell {
    position: relative; aspect-ratio: 3/4; border-radius: 10px; overflow: hidden;
    border: 1px solid rgba(194,154,91,0.3); background: var(--blush-light);
}
.photo-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-cell .star {
    position: absolute; top: 6px; right: 6px; z-index: 2;
    background: rgba(255,255,255,0.9); border: none; font-size: 16px;
    width: 30px; height: 30px; border-radius: 50%; cursor: pointer; line-height: 1;
}
.photo-cell .star.active { background: var(--gold); }
.photo-cell .del {
    position: absolute; top: 6px; left: 6px; z-index: 2;
    background: rgba(225,95,80,0.92); color: #fff; border: none; font-size: 14px;
    width: 28px; height: 28px; border-radius: 50%; cursor: pointer; line-height: 1;
}
.photo-cell .cover-tag {
    position: absolute; bottom: 6px; right: 50%; transform: translateX(50%);
    background: rgba(0,0,0,0.55); color: #fff; font-size: 10px;
    padding: 3px 10px; border-radius: 10px; white-space: nowrap;
}
.bp-gallery { min-height: 150px; }
.bp-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 100%; max-width: 240px; }
.bp-gallery-grid .g-cell { aspect-ratio: 1; border-radius: 6px; overflow: hidden; border: 1px solid rgba(194,154,91,0.25); }
.bp-gallery-grid .g-cell img { width: 100%; height: 100%; object-fit: cover; }
.bp-gallery-grid .g-more {
    display: flex; align-items: center; justify-content: center;
    background: var(--blush); color: var(--gold-dark); font-size: 11px; font-weight: 700;
}

/* معاينة خريطة جوجل */
.map-preview {
    width: 100%; height: 190px; border: 0; border-radius: 12px;
    box-shadow: 0 8px 22px rgba(0,0,0,0.1);
}
.pv-map-wrap {
    width: 100%; max-width: 520px; margin-top: 24px;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 14px 36px rgba(0,0,0,0.18);
    border: 4px solid #fff;
    position: relative;
}
.pv-map-wrap iframe { width: 100%; height: 240px; border: 0; display: block; }
.map-actions { margin-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

/* Testimonials */
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; max-width: 1100px; margin: 0 auto; }
.quote { background: var(--surface); border-radius: 16px; padding: 26px; box-shadow: 0 8px 24px rgba(0,0,0,0.05); position: relative; }
.quote::before { content: '”'; font-family: 'Pinyon Script', cursive; font-size: 60px; color: var(--gold); position: absolute; top: 4px; right: 20px; opacity: 0.35; }
.quote p { color: var(--text); font-size: 15px; line-height: 1.8; margin-bottom: 16px; }
.quote .who { font-family: 'El Messiri', serif; font-size: 14px; color: var(--gold-dark); }
.quote .role { font-size: 12px; color: var(--text-soft); }

/* FAQ */
.faq { max-width: 720px; margin: 0 auto; }
.faq-item { background: var(--surface); border-radius: 14px; margin-bottom: 12px; overflow: hidden; border: 1px solid rgba(194,154,91,0.15); }
.faq-q { padding: 18px 22px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: var(--text); font-size: 15px; }
.faq-q::after { content: '+'; font-size: 24px; color: var(--gold); transition: transform 0.3s; }
.faq-item.open .faq-q::after { transform: rotate(45deg); }
.faq-a { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
.faq-a p { padding: 0 22px 20px; color: var(--text-soft); font-size: 14px; line-height: 1.8; }
.faq-item.open .faq-a { max-height: 300px; }

/* CTA band */
.cta-band { background: var(--text); color: #F3E7DE; text-align: center; padding: 80px 5vw; }
.cta-band h2 { font-family: 'El Messiri', serif; font-size: clamp(26px, 4vw, 40px); margin-bottom: 12px; }
.cta-band p { color: #CBB9AE; max-width: 520px; margin: 0 auto 28px; line-height: 1.8; }
.cta-band .btn-primary { font-size: 18px; padding: 16px 40px; }

/* Footer */
.site-footer { background: #2E2320; color: #CBB9AE; padding: 50px 5vw 30px; text-align: center; font-size: 14px; }
.site-footer .f-logo { font-family: 'Pinyon Script', cursive; font-size: 34px; color: var(--gold); }
.site-footer p { margin-top: 10px; line-height: 1.8; }
.site-footer .f-links { margin-top: 16px; display: flex; gap: 22px; justify-content: center; flex-wrap: wrap; }
.site-footer .f-links a { color: #CBB9AE; text-decoration: none; transition: color 0.3s; }
.site-footer .f-links a:hover { color: var(--gold); }
.site-footer .f-copy { margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; font-size: 12px; }

/* Reveal on scroll */
.reveal { opacity: 0; transform: translateY(36px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal.on { opacity: 1; transform: none; }

/* ============ BUILDER ============ */
.builder-page { background: #F2EAE3; }
.builder-shell { max-width: 1300px; margin: 0 auto; padding: 110px 5vw 60px; display: grid; grid-template-columns: 1fr 360px; gap: 34px; align-items: start; }
.builder-panel { }
.step-indicator { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.step-chip { padding: 8px 18px; border-radius: 30px; font-size: 13px; background: var(--surface); color: var(--text-soft); border: 1px solid rgba(194,154,91,0.3); cursor: pointer; transition: all 0.3s; }
.step-chip.active { background: var(--gold); color: #fff; border-color: var(--gold); }
.step-chip.done { background: var(--blush); border-color: var(--blush); color: var(--gold-dark); }

.builder-card { background: var(--surface); border-radius: 18px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); display: none; }
.builder-card.active { display: block; animation: fadeUp 0.4s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px);} to { opacity: 1; transform: none;} }
.builder-card h2 { font-family: 'El Messiri', serif; color: var(--text); margin-bottom: 6px; font-size: 22px; }
.builder-card > p { color: var(--text-soft); font-size: 14px; margin-bottom: 22px; }

.field { margin-bottom: 16px; }
.field label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
.field input, .field select, .field textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(194,154,91,0.4);
    border-radius: 10px;
    font-family: inherit;
    font-size: 15px;
    color: var(--text);
    background: var(--surface);
    outline: none;
    text-align: right;
    resize: vertical;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(194,154,91,0.15); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.story-repeater, .program-repeater { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.rep-item { background: var(--blush-light); border: 1px dashed rgba(194,154,91,0.5); border-radius: 12px; padding: 16px; position: relative; }
.rep-item .remove-rep { position: absolute; top: 10px; left: 10px; background: #E8776C; color: #fff; border: none; width: 26px; height: 26px; border-radius: 50%; cursor: pointer; font-size: 14px; line-height: 1; }
.rep-add { background: transparent; border: 1.5px dashed var(--gold); color: var(--gold-dark); padding: 10px; border-radius: 10px; cursor: pointer; font-family: inherit; font-weight: 600; width: 100%; transition: background 0.3s; }
.rep-add:hover { background: rgba(194,154,91,0.1); }

.template-picker { display: flex; gap: 12px; }
.tpl-option { flex: 1; border-radius: 14px; padding: 14px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.3s; font-family: 'El Messiri', serif; font-size: 14px; color: var(--text); background: var(--blush-light); }
.tpl-option .tpl-swatch { width: 100%; height: 70px; border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(0,0,0,0.06); }
.tpl-option.selected { border-color: var(--gold); box-shadow: 0 8px 20px rgba(194,154,91,0.25); transform: translateY(-3px); }

/* مفتاح تشغيل المظروف (اختياري) */
.env-toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--blush-light); border: 1px solid rgba(194,154,91,0.25); border-radius: 12px; padding: 12px 14px; }
.env-toggle .env-toggle-label { margin: 0 !important; font-size: 14px; }
.switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; position: absolute; }
.switch .slider { position: absolute; inset: 0; cursor: pointer; background: #C9BCAE; border-radius: 30px; transition: background .3s; }
.switch .slider::before { content: ''; position: absolute; width: 20px; height: 20px; right: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform .3s; box-shadow: 0 2px 6px rgba(0,0,0,.25); }
.switch input:checked + .slider { background: var(--gold); }
.switch input:checked + .slider::before { right: auto; left: 3px; }

.music-picker { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.music-chip {
    padding: 8px 16px; border-radius: 30px; border: 1.5px solid rgba(194,154,91,0.35);
    background: var(--surface); color: var(--text); cursor: pointer; font-size: 13.5px;
    font-family: 'El Messiri', serif; transition: all 0.25s;
}
.music-chip:hover { border-color: var(--gold); }
.music-chip.selected { background: var(--gold); color: #fff; border-color: var(--gold); box-shadow: 0 6px 16px rgba(194,154,91,0.3); }
.music-preview { display: flex; align-items: center; gap: 10px; margin-top: 4px; flex-wrap: wrap; }
.music-preview audio { flex: 1; min-width: 200px; }
.music-preview .rep-add { width: auto; padding: 8px 14px; }

.builder-nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
.btn-secondary { background: var(--surface); color: var(--text); border: 1.5px solid rgba(194,154,91,0.5); }
.btn-secondary:hover { background: var(--blush-light); }

/* Preview phone (في المنشئ) */
.preview-column { position: sticky; top: 96px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.preview-phone {
    width: 320px; height: 640px;
    background: var(--surface);
    border-radius: 46px;
    border: 10px solid #3B2E2A;
    box-shadow: 0 24px 50px rgba(0,0,0,0.28);
    overflow: hidden;
    position: relative;
}
.bp-notch { width: 128px; height: 22px; background: #3B2E2A; border-radius: 0 0 14px 14px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); z-index: 6; }
.bp-screen { height: 100%; overflow-y: auto; background: var(--blush-light); }
.bp-content { min-height: 100%; display: flex; flex-direction: column; }
.bp-section { padding: 26px 18px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.bp-section small { font-size: 11px; color: var(--text-soft); }
.bp-couple { font-family: 'Pinyon Script', cursive; font-size: 30px; color: var(--gold-dark); margin: 4px 0; }
.bp-ar { font-family: 'El Messiri', serif; font-size: 24px; color: var(--text); }
.bp-date { font-size: 12px; color: var(--text-soft); letter-spacing: 2px; border-bottom: 1px solid var(--gold); padding-bottom: 4px; margin-top: 8px; }
.bp-divider { color: var(--gold); font-size: 14px; padding: 8px 0; }
.bp-timer { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }
.bp-tbox { background: var(--surface); border: 1px solid rgba(194,154,91,0.25); border-radius: 8px; padding: 8px 10px; min-width: 46px; }
.bp-tbox b { display: block; font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--gold-dark); }
.bp-tbox small { font-size: 9px; }
.bp-venue h3 { font-family: 'El Messiri', serif; margin-top: 4px; }
.bp-venue p { font-size: 12px; color: var(--text-soft); margin-top: 4px; }
.bp-rsvp input { border: 1px solid rgba(194,154,91,0.4); padding: 8px; border-radius: 6px; }

/* Preview real page (preview.html) */
.preview-page { }
.pv-container { height: 100vh; overflow-y: auto; scroll-snap-type: y mandatory; background: var(--cream); }
.pv-slide { min-height: 100vh; scroll-snap-align: start; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; position: relative; }
.pv-script { font-family: 'Pinyon Script', cursive; font-size: 34px; color: var(--gold); }
.pv-welcome { font-size: 16px; color: var(--text-soft); margin-top: 14px; line-height: 1.8; }
.pv-occasion {
    display: inline-block; margin-top: 10px;
    font-family: 'El Messiri', serif; font-size: 15px; color: var(--gold-dark);
    border: 1px dashed var(--gold); padding: 6px 22px; border-radius: 30px;
}
.pv-h2 { font-family: 'El Messiri', serif; font-size: 34px; font-weight: 600; margin-bottom: 24px; }
.pv-couple { font-family: 'El Messiri', serif; font-weight: 700; font-size: clamp(40px, 8vw, 60px); }
.pv-amp { font-family: 'Cormorant Garamond', serif; font-style: italic; color: var(--gold); }
.pv-timer { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.pv-tbox { min-width: 82px; padding: 20px 10px; background: var(--surface); border-radius: 14px; border: 1px solid rgba(194,154,91,0.25); box-shadow: 0 8px 24px rgba(194,154,91,0.15); }
.pv-tbox b { display: block; font-family: 'Cormorant Garamond', serif; font-size: 38px; color: var(--gold-dark); }
.pv-tbox small { color: var(--text-soft); font-size: 12px; }
.pv-story { border-right: 2px solid rgba(194,154,91,0.4); max-width: 340px; padding-right: 22px; text-align: right; }
.pv-story-item { position: relative; margin-bottom: 30px; }
.pv-story-item::before { content: ''; position: absolute; right: -30px; top: 6px; width: 14px; height: 14px; background: var(--gold); border-radius: 50%; box-shadow: 0 0 0 4px #fff, 0 0 0 6px rgba(194,154,91,0.3); }
.pv-story-item h3 { font-family: 'El Messiri', serif; color: var(--gold-dark); margin-bottom: 6px; }
.pv-story-item p { color: var(--text-soft); font-size: 14px; line-height: 1.8; }
.pv-prog { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 380px; }
.pv-prog-card { background: rgba(255,255,255,0.85); border: 1px solid rgba(194,154,91,0.25); border-radius: 14px; padding: 18px 24px; }
.pv-prog-card .t { font-family: 'Pinyon Script', cursive; font-size: 24px; color: var(--gold-dark); }
.pv-prog-card h3 { font-family: 'El Messiri', serif; font-size: 16px; margin: 4px 0; }
.pv-prog-card p { color: var(--text-soft); font-size: 13px; }
.pv-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 420px; width: 100%; }
.pv-gallery .gi { position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); cursor: pointer; }
.pv-gallery .gi:nth-child(1) { grid-column: 1 / -1; aspect-ratio: 16/9; }
.pv-gallery .gi:not(:nth-child(1)) { aspect-ratio: 1; }
.pv-gallery img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
.pv-gallery .gi:hover img { transform: scale(1.05); }
/* لُقطة ضوء كبيرة أثناء الفتح (Lightbox) */
.lightbox {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(20,12,10,0.92);
    display: none; align-items: center; justify-content: center; padding: 24px;
}
.lightbox.open { display: flex; }
.lightbox img { max-width: 92vw; max-height: 88vh; border-radius: 10px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
.lightbox .lb-close { position: absolute; top: 20px; left: 24px; background: none; border: none; color: #fff; font-size: 34px; cursor: pointer; }
.pv-map { display: inline-block; margin-top: 22px; padding: 12px 26px; background: var(--gold); color: #fff; border-radius: 30px; text-decoration: none; box-shadow: 0 6px 16px rgba(194,154,91,0.35); }
.pv-map:hover { background: var(--gold-dark); }
.pv-rsvp-form { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
.pv-rsvp-form input, .pv-rsvp-form select { padding: 12px 14px; border: 1px solid rgba(194,154,91,0.4); border-radius: 10px; font-family: inherit; font-size: 15px; outline: none; text-align: right; }
.pv-rsvp-form button { padding: 13px; background: var(--gold); border: none; border-radius: 10px; color: #fff; font-family: inherit; font-size: 16px; cursor: pointer; }
.pv-rsvp-form button:hover { background: var(--gold-dark); }

/* Template themes */
.tpl-classic .pv-script, .tpl-classic .bp-couple, .tpl-classic .pv-prog-card .t { color: #C29A5B; }
.tpl-classic { --gold: #C29A5B; --gold-dark: #A9824A; --blush-light: #FDF6F3; --bg: linear-gradient(160deg,#F5DCD8,#FDF3EF); }
.tpl-rose { --gold: #B0628F; --gold-dark: #94487A; --blush-light: #FBF2F7; --bg: linear-gradient(160deg,#EDD8EA,#F9F0F7); color: #5A3A63; }
.tpl-rose .pv-script, .tpl-rose .bp-couple, .tpl-rose .pv-prog-card .t { color: #B0628F; }
.tpl-modern { --gold: #4E7A68; --gold-dark: #3C6354; --blush-light: #F0F6F3; --bg: linear-gradient(160deg,#DDE9E2,#F3F8F5); color: #33503F; }
.tpl-modern .pv-script, .tpl-modern .bp-couple, .tpl-modern .pv-prog-card .t { color: #4E7A68; }

.tpl-classic .pv-slide { background: var(--bg); }
.tpl-rose .pv-slide { background: var(--bg); }
.tpl-modern .pv-slide { background: var(--bg); }

/* ============ GENERAL UTILITIES ============ */
.container { max-width: 1200px; margin: 0 auto; }
.center { text-align: center; }
.note-text { font-size: 13px; color: var(--text-soft); }
.mt-16 { margin-top: 16px; }
.small-btn { padding: 9px 18px; }

/* Mobile */
.mobile-menu {
    position: fixed; top: 0; right: 0; height: 100vh; width: 260px;
    background: var(--surface); box-shadow: -10px 0 30px rgba(0,0,0,0.15);
    z-index: 1000; padding: 40px 26px;
    display: none; flex-direction: column; gap: 18px;
    transform: translateX(110%); transition: transform 0.4s ease;
}
.mobile-menu.open { transform: translateX(0); display: flex; }
.mobile-menu a { color: var(--text); text-decoration: none; font-size: 17px; }
.mobile-menu .close-menu { position: absolute; top: 16px; left: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text); }

@media (max-width: 900px) {
    .nav-links { display: none; }
    .hamburger { display: block; }
    .hero-inner { grid-template-columns: 1fr; text-align: center; }
    .hero p.lead { margin: 0 auto; }
    .hero-ctas { justify-content: center; }
    .phone { width: 240px; height: 500px; }
    .steps, .templates-grid, .pricing-grid, .testimonials-grid { grid-template-columns: 1fr; }
    .builder-shell { grid-template-columns: 1fr; }
    .preview-column { position: static; order: -1; }
    .field-row { grid-template-columns: 1fr; }
    .pv-couple { font-size: 38px; }
    .pv-tbox { min-width: 68px; padding: 14px 8px; }
    .pv-tbox b { font-size: 28px; }
}

/* شاشات صغيرة جداً: تقليص هاتف المعاينة للحفاظ على التناسق */
@media (max-width: 420px) {
    .preview-phone { width: 250px; height: 520px; }
    .bp-couple { font-size: 24px; }
    .bp-ar { font-size: 18px; }
    .pv-timer { gap: 8px; }
    .pv-tbox { min-width: 58px; padding: 10px 6px; }
    .pv-tbox b { font-size: 22px; }
    .pv-gallery { grid-template-columns: 1fr; }
    .photo-grid { grid-template-columns: repeat(2, 1fr); }
    .hero h1 { font-size: 30px; }
    .site-nav { padding: 12px 16px; }
    .builder-shell { padding-top: 90px; }
}

/* ============ اللغة والدعم ============ */
.lang-toggle {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 40px; padding: 8px 14px; border-radius: 30px;
    border: 1.5px solid rgba(194,154,91,0.55); background: rgba(255,255,255,0.7);
    color: var(--gold-dark); font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; text-decoration: none; transition: all 0.3s;
    line-height: 1;
}
.lang-toggle:hover { background: var(--gold); color: #fff; border-color: var(--gold); }

.lang-fab {
    position: fixed; top: 20px; inset-inline-end: 20px; z-index: 1200;
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.92); color: var(--gold-dark);
    border: 1.5px solid rgba(194,154,91,0.5); font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: inherit; box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    transition: all 0.3s;
}
.lang-fab:hover { background: var(--gold); color: #fff; }

.wa-fab {
    position: fixed; bottom: 20px; inset-inline-end: 20px; z-index: 1200;
    width: 56px; height: 56px; border-radius: 50%;
    background: #25D366; color: #fff; text-decoration: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; box-shadow: 0 8px 24px rgba(37,211,102,0.4);
    transition: transform 0.25s, box-shadow 0.25s;
}
.wa-fab:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 30px rgba(37,211,102,0.5); }
.wa-fab svg { width: 30px; height: 30px; fill: #fff; }

/* دعم في شريط الخلاصة */
.support-band {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 14px; padding: 20px 5vw; background: var(--blush-light);
    border-top: 1px solid rgba(194,154,91,0.2);
}
.support-band .sb-title { font-weight: 700; color: var(--ink); font-size: 15px; }
.support-band .sb-num { color: var(--text-soft); font-size: 14px; direction: ltr; }
.support-band a { text-decoration: none; }

/* ============ الوضع الليلي / النهاري ============ */
.theme-fab {
    position: fixed; bottom: 20px; inset-inline-end: 84px; z-index: 1400;
    width: 44px; height: 44px; border-radius: 50%;
    background: rgba(255,255,255,0.92); color: var(--gold-dark);
    border: 1.5px solid rgba(194,154,91,0.5); font-size: 18px;
    cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    transition: all 0.3s; line-height: 1;
}
.theme-fab:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.22); }

html.dark {
    --blush: #4A332E;
    --blush-light: #2A1E1B;
    --cream: #1E1613;
    --gold: #CFA66A;
    --gold-dark: #E0BC82;
    --text: #E7DAD2;
    --text-soft: #A89A92;
    --ink: #F6ECE4;
    --surface: #281C19;
    color-scheme: dark;
}
html.dark body { background: var(--cream); color: var(--text); }
html.dark .theme-fab { background: rgba(43,30,26,0.92); }
html.dark .site-nav.scrolled { background: rgba(30,22,19,0.92); box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
html.dark .hero { background: linear-gradient(135deg, #3A2620 0%, #241713 55%, #2E1D17 100%); }
html.dark .features { background: #211814; }
html.dark .pricing { background: linear-gradient(160deg, #3A2722, #241713); }
html.dark .cta-band { background: #3A2C28; }
html.dark .cta-band p { color: #B8A79C; }
html.dark .builder-page { background: #1A1210; }
html.dark .phone-demo .brief-line { background: rgba(232,207,198,0.2); }
html.dark .step-num { background: linear-gradient(135deg, #4A332E, #5A3B33); }
html.dark .publish-link { background: var(--surface); }
html.dark .photo-cell .star { background: rgba(30,22,19,0.9); }
html.dark .pv-prog-card { background: rgba(40,28,25,0.85); }
html.dark .pv-story-item::before { box-shadow: 0 0 0 4px #1E1613, 0 0 0 6px rgba(207,166,106,0.3); }
html.dark .pv-map-wrap { border-color: var(--surface); }
html.dark .pv-rsvp-form input, html.dark .pv-rsvp-form select,
html.dark .field input, html.dark .field select, html.dark .field textarea {
    background: var(--surface); color: var(--text);
}
html.dark .pv-rsvp-form input::placeholder, html.dark .field input::placeholder { color: var(--text-soft); }
html.dark .lang-toggle, html.dark .lang-fab { background: rgba(43,30,26,0.92); color: var(--gold-dark); }
html.dark .music-btn { background: rgba(43,30,26,0.92) !important; color: var(--gold-dark) !important; }

/* تدرجات الدعوة داخل الوضع الليلي */
html.dark .tpl-classic { --bg: linear-gradient(160deg, #3A251F, #241611); --blush-light: #2A1E1B; --gold: #CFA66A; --gold-dark: #E0BC82; }
html.dark .tpl-rose { --bg: linear-gradient(160deg, #3A2436, #26162A); --blush-light: #2A1E1B; --gold: #C78BA6; --gold-dark: #DEA9BF; color: #E7DAD2; }
html.dark .tpl-modern { --bg: linear-gradient(160deg, #20322B, #14241E); --blush-light: #1E2623; --gold: #8FC0A8; --gold-dark: #A9D1BC; color: #E7DAD2; }
html.dark .tpl-classic .pv-script, html.dark .tpl-classic .bp-couple, html.dark .tpl-classic .pv-prog-card .t,
html.dark .tpl-rose .pv-script, html.dark .tpl-rose .bp-couple, html.dark .tpl-rose .pv-prog-card .t,
html.dark .tpl-modern .pv-script, html.dark .tpl-modern .bp-couple, html.dark .tpl-modern .pv-prog-card .t {
    color: var(--gold);
}
html.dark .pv-slide { background: var(--bg); }
html.dark .pv-couple { color: var(--text); }
html.dark section#templates, html.dark section#testimonials { background: #211814 !important; }

/* المصغرات الفاتحة تبقى كمعاينة دعوة، مع نصوص ثابتة */
html.dark .demo .th h4 { color: #5A4A46; }
html.dark .tpl-1 .t-couple, html.dark .tpl-thumb .t-name { color: #5A4A46; }
html.dark .tpl-thumb .t-date { color: #7A6A61; }

/* ===== المظروف + ختم الشمع ===== */
body.env-lock { overflow: hidden; }

.env-overlay {
    position: fixed; inset: 0; z-index: 800;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px;
    background: radial-gradient(130% 110% at 70% 8%, #f9e8e4 0%, #fff9f6 40%, #fffdfb 68%, #f6e8e0 100%);
    transition: opacity .9s ease, visibility .9s ease;
}
.env-overlay::before {
    content: ''; position: absolute; top: -12vw; inset-inline-end: -10vw;
    width: 46vw; height: 46vw; max-width: 520px; max-height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(214,161,140,.5), transparent 68%);
    filter: blur(60px); pointer-events: none;
}
.env-overlay::after {
    content: ''; position: absolute; bottom: -12vw; inset-inline-start: -8vw;
    width: 40vw; height: 40vw; max-width: 440px; max-height: 440px; border-radius: 50%;
    background: radial-gradient(circle, rgba(245,220,216,.62), transparent 70%);
    filter: blur(60px); pointer-events: none;
}
.env-overlay.gone { opacity: 0; visibility: hidden; pointer-events: none; }
html.dark .env-overlay { background: radial-gradient(130% 110% at 70% 8%, #2c1a16 0%, #1f1210 42%, #190d0b 70%, #241510 100%); }
html.dark .env-overlay::before { background: radial-gradient(circle, rgba(184,115,90,.28), transparent 68%); }
html.dark .env-overlay::after { background: radial-gradient(circle, rgba(178,110,95,.22), transparent 70%); }

.env {
    position: relative; width: 348px; max-width: 88vw; height: 220px;
    cursor: pointer; perspective: 1200px;
    border-radius: 10px;
    box-shadow: 0 34px 80px rgba(140,79,61,.22), 0 6px 18px rgba(140,79,61,.12);
    background: linear-gradient(160deg, #fbe7df 0%, #f3d9cd 100%);
    animation: envFloat 6s ease-in-out infinite;
}
.env.scaled { transform: scale(.62); animation: none !important; }
@keyframes envFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.env.open { animation: none; }
.env.open { animation: envEaseUp .9s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes envEaseUp { from { transform: translateY(6px); } to { transform: translateY(-10px) scale(1.03); } }

.env-back {
    position: absolute; inset: 0; border-radius: 10px;
    background: linear-gradient(160deg, #FCEFE6 0%, #EFD8C8 100%);
    box-shadow: inset 0 0 0 1px rgba(184,115,90,.16);
}
.env-letter {
    position: absolute; left: 6%; right: 6%; top: 7%; bottom: 7%;
    background: linear-gradient(180deg, #FFFEFA 0%, #FFF7F0 100%);
    border: 1px solid rgba(184,115,90,.22);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 22px 48px rgba(140,79,61,.16), inset 0 0 0 1px rgba(255,255,255,.7);
    z-index: 2;
    transition: transform .95s cubic-bezier(.18,.95,.28,1.28);
}
.env-letter-text {
    font-family: 'Pinyon Script', cursive; font-size: 38px; color: #a36a3e; text-align: center; letter-spacing: 1px;
}
.env-flap {
    position: absolute; top: 0; left: 0; right: 0; height: 55%;
    background: linear-gradient(180deg, #F7E2D6 0%, #EBCBB9 100%);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    transform-origin: top center;
    transition: transform .8s cubic-bezier(.34,1.2,.4,1);
    z-index: 3;
    filter: drop-shadow(0 5px 9px rgba(140,79,61,.2));
}
.env-seal {
    position: absolute; top: calc(55% - 28px); left: 50%; transform: translate(-50%, -50%) rotate(-6deg);
    width: 72px; height: 72px; z-index: 5;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 23px; font-weight: 700; color: #fff6ea;
    border-radius: 53% 47% 60% 40% / 47% 61% 39% 55%;
    background:
        radial-gradient(circle at 30% 26%, rgba(255,236,218,.5) 0%, rgba(255,205,175,.16) 28%, transparent 56%),
        radial-gradient(circle at 68% 82%, rgba(80,10,8,.55) 30%, rgba(0,0,0,0) 62%),
        linear-gradient(155deg, #E8876A 0%, #C64A34 38%, #982517 66%, #6E120B 100%);
    box-shadow:
        0 8px 18px rgba(120,22,14,.45),
        0 2px 5px rgba(0,0,0,.25),
        0 0 30px rgba(230,138,109,.4),
        inset 0 4px 7px rgba(255,228,206,.5),
        inset -4px -6px 12px rgba(70,6,4,.55),
        inset 0 0 0 1px rgba(255,205,175,.2),
        inset 0 0 0 5px rgba(120,20,14,.12);
    transition: transform .6s ease, opacity .5s ease;
}
.env-seal i {
    font-style: normal; position: relative; z-index: 2; letter-spacing: 1px;
    color: rgba(66,7,4,.88);
    text-shadow: 0 1px 0 rgba(255,228,205,.55), 0 -1px 1px rgba(0,0,0,.42), 0 2px 3px rgba(0,0,0,.36);
}
.env-seal::before {
    content: '';
    position: absolute; left: 6%; right: 6%; bottom: -13px; height: 28px;
    background:
        radial-gradient(ellipse 10px 14px at 12% 88%, #B13A28 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 6px 15px at 30% 76%, #D0543E 45%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 12px 17px at 52% 94%, #9E2619 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 7px 14px at 74% 82%, #C04936 50%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 5px 9px at 91% 90%, #B8402D 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 4px 6px at 42% 70%, #C74A36 50%, rgba(140,28,15,0) 60%);
    filter: blur(.35px);
}
.env-seal::after {
    content: '';
    position: absolute; inset: -1px; border-radius: inherit;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0'/></filter><rect width='150' height='150' filter='url(%23n)'/></svg>");
    background-size: 130px 130px;
    mix-blend-mode: multiply;
    opacity: .34;
    pointer-events: none;
}
.env-word {
    position: relative; z-index: 1;
    font-family: 'Pinyon Script', cursive;
    font-size: 38px; color: #b8735a;
    letter-spacing: 2px; min-height: 46px; text-align: center;
    text-shadow: 0 1px 0 rgba(255,255,255,.35);
}
.env-word.type-caret::after {
    content: ''; display: inline-block; width: 2px; height: .9em;
    background: #b8735a; margin-inline-start: 5px; vertical-align: -1px;
    border-radius: 2px; animation: typeblink 1s steps(1) infinite;
}
@keyframes typeblink { 50% { opacity: 0; } }

.env-hint {
    position: relative; z-index: 1;
    color: #806862; font-size: 15px; font-family: 'El Messiri', serif;
    letter-spacing: .3px;
    animation: envPulse 2s ease-in-out infinite;
    text-shadow: 0 1px 0 rgba(255,255,255,.55);
}
html.dark .env-hint { color: #c9a68c; text-shadow: none; }
@keyframes envPulse { 0%, 100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }

.env.open .env-flap { transform: rotateX(178deg); z-index: 1; }
.env.open .env-seal {
    transform: translate(-50%, -50%) rotate(-6deg) scale(1.55) ;
    opacity: 0;
    animation: envSealBreak .6s ease-out forwards;
}
@keyframes envSealBreak {
    0% { opacity: 1; transform: translate(-50%,-50%) rotate(-6deg) scale(1); }
    45% { opacity: 1; transform: translate(-50%,-50%) rotate(10deg) scale(1.25); }
    100% { opacity: 0; transform: translate(-50%,-50%) rotate(30deg) scale(1.6); }
}
.env.open .env-letter {
    z-index: 6;
    transform: translateY(-132%) scale(1.04) rotate(-1.5deg);
}

.env-fab {
    position: fixed; bottom: 24px; inset-inline-start: 24px; z-index: 801;
    width: 56px; height: 56px; border-radius: 50%; border: 1px solid rgba(184,115,90,.28); cursor: pointer;
    background: linear-gradient(150deg, #b8735a, #8c4f3d); color: #fff; font-size: 22px;
    box-shadow: 0 18px 44px rgba(140,79,61,.28), inset 0 1px 0 rgba(255,255,255,.25);
    opacity: 0; visibility: hidden; transform: scale(.7); transition: all .35s;
}
.env-fab.show { opacity: 1; visibility: visible; transform: scale(1); }

/* ===== لافتة "حان الوقت!" ===== */
.pv-now-banner {
    position: fixed; inset: 0; z-index: 900;
    display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px;
    background: rgba(28, 22, 19, .74); backdrop-filter: blur(3px);
    opacity: 0; visibility: hidden; transition: opacity .6s ease, visibility .6s ease;
}
.pv-now-banner.show { opacity: 1; visibility: visible; }
.pv-now-card {
    background: linear-gradient(150deg, #B98A44, #E4C188);
    color: #fff; padding: 44px 36px; border-radius: 20px; max-width: 92vw;
    box-shadow: 0 34px 80px rgba(0,0,0,.45);
    transform: scale(.7) translateY(20px); transition: transform .55s cubic-bezier(.2, .9, .3, 1.25);
}
.pv-now-banner.show .pv-now-card { transform: scale(1) translateY(0); }
.pv-now-card .t { font-family: 'Pinyon Script', cursive; font-size: 60px; line-height: 1; }
.pv-now-card .s { font-family: 'El Messiri', serif; font-size: 20px; margin-top: 12px; line-height: 1.8; }
.pv-now-card .sub { font-size: 14px; opacity: .92; }
.pv-now-card button {
    margin-top: 24px; background: rgba(255,255,255,.95); border: none; color: #8A5A12;
    padding: 12px 30px; border-radius: 40px; font-family: 'El Messiri', serif;
    font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,.22);
}

/* ===== تمييز الفقرة الحالية في برنامج الحفل ("حان وقتها") ===== */
.pv-prog-card { position: relative; transition: transform .45s, box-shadow .45s, background .45s, border-color .45s; }
.pv-prog-card.now {
    background: linear-gradient(150deg, var(--gold), var(--gold-dark));
    border-color: transparent;
    transform: scale(1.055);
    box-shadow: 0 18px 44px rgba(194, 154, 91, .5);
    z-index: 1;
}
.pv-prog-card.now h3, .pv-prog-card.now p, .pv-prog-card.now .t { color: #fff; }
.pv-prog-card.now::before {
    content: '● الآن'; position: absolute; top: -11px; inset-inline-start: 18px;
    background: #A92318; color: #fff; font-size: 11px; font-family: 'El Messiri', serif;
    padding: 3px 14px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,.3);
}

/* ===== المظروف في هاتف المنشئ ===== */
.bp-screen { position: relative; overflow-y: hidden; }
.bp-setenv {
    position: absolute; inset: 0; z-index: 8;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
    background: linear-gradient(170deg, #E9D2BB 0%, #C8A582 100%);
    cursor: pointer;
    opacity: 1; visibility: visible;
    transition: opacity .7s ease, visibility .7s ease;
}
.bp-screen.env-opened .bp-setenv { opacity: 0; visibility: hidden; pointer-events: none; }
.bp-screen.env-opened { overflow-y: auto; }
html.dark .bp-setenv { background: linear-gradient(170deg, #3A2620 0%, #201310 100%); }
````

---

## studio\assets\i18n.js

````js
/* Wedding Studio — i18n: العربية / English (auto-detect + manual toggle) */
var I18N = (function () {
    var D = {
        ar: {
            // ===== meta =====
            hub_title: 'استوديو الدعوات | منصة الدعوات الرقمية الفاخرة',
            m_title: 'استوديو الدعوات | أنشئ دعوتك الرقمية الفاخرة',
            b_title: 'المنشئ | اصنع دعوتك',
            pv_title: 'دعوة زفاف',

            // ===== common =====
            lang_btn_ar: 'العربية',
            lang_btn_en: 'English',
            lang_hint: 'بدّل اللغة',
            wa_tooltip: 'الدعم الفني — واتساب',
            wa_hello: 'مرحباً، أحتاج مساعدة في استوديو الدعوات',

            // ===== المناسبات =====
            occ_wedding: 'زفاف',
            occ_engagement: 'خطوبة',
            occ_birthday: 'عيد ميلاد',
            occ_graduation: 'تخرج',
            occ_baby: 'استقبال مولود',
            occ_queen: 'حفل ملكة',
            occ_opening: 'افتتاح / مناسبة عمل',
            occ_family: 'لقاء عائلي',
            occ_religious: 'مناسبة دينية',
            occ_other: 'أخرى',
            invitation_word: 'دعوة',
            place_of: 'مكان {o}',
            rsvp_hint_by: 'نرجو تأكيد الحضور قبل {d}',
            rsvp_hint_soon: 'نرجو تأكيد الحضور مبكراً',

            // ===== Hub =====
            h_nav_platform: 'المنصة',
            h_nav_demos: 'الدعوات الجاهزة',
            h_nav_features: 'المميزات',
            h_nav_create: 'أنشئ دعوتك',
            h_tagline: 'اصنع لحظتك',
            h_title1: 'منصّة ',
            h_title_em: 'دعواتٍ رقمية',
            h_title2: ' تصنع ذِكرى لا تُنسى',
            h_lead: 'صمّم دعوة زفاف أو مناسبة فاخرة خلال دقائق: اختر الطابع، أضف التفاصيل، وشارك رابطاً سحرياً يفتح بموسيقى وعدّ تنازلي وتأكيد حضور — بلا أي خبرة برمجية.',
            h_start: 'ابدأ التصميم مجاناً ✨',
            h_browse: 'استعرض الدعوات',
            h_open: 'افتح الدعوة ▶',
            h_s1: 'دعوة أُنشئت',
            h_s2: 'ضيف تلقّى دعوة',
            h_s3: 'طابع تصميم',
            h_s4: 'رضا العرسان',
            h_dk: 'دعوات جاهزة',
            h_dt: 'دعوات جاهزة للتجربة',
            h_dsub: 'نماذج حية مصمّمة مسبقاً — افتح أي نموذج لتشعر بتجربة الضيف قبل أن تصنع نسختك.',
            h_d1: 'الدعوة الفاخرة 💌',
            h_d1m: 'ظرف بختم شمعي + عدّ تنازلي + خريطة',
            h_d2: 'الدعوة الراقية 👑',
            h_d2m: 'تمرير ثابت ومساحات أنيقة',
            h_d3: 'الدعوة المثالية 🌹',
            h_d3m: 'هيكل متدرّج وخطّ زمني أنيق',
            h_pk: 'الاستوديو',
            h_pt: 'أين تبدأ رحلتك؟',
            h_ps: 'أداة متكاملة من صفحة تسويقية وصولاً إلى دعوة تصل لضيفك.',
            h_c1: 'المنصّة الكاملة — أنشئ دعوتك',
            h_c1p: 'منشئ بصري بمعاينة حية على هاتف افتراضي، يحفظ تلقائياً ويبني دعوتك النهائية التفاعلية.',
            h_c1l1: 'اختيار الطابع بالألوان (كلاسيكي / رومانسي / عصري)',
            h_c1l2: 'قصة الزوجين + برنامج الحفل',
            h_c1l3: 'تأكيد حضور مع زر واتساب',
            h_c1go: 'افتح المنصة ←',
            h_c2: 'ماذا يشمل المشروع',
            h_c2p: 'بنية نظيفة سهلة الصيانة والتطوير — كل ملف في مكانه.',
            h_c2l1: 'studio/ — صفحات المنصة والمنشئ والمعاينة',
            h_c2l2: 'invitations/ — الدعوات الجاهزة كنماذج',
            h_c2l3: 'متوافق مع الجوال + خادم مشاركة',
            h_fk: 'المميزات',
            h_ft: 'كلّ أدوات الحفل في منصة واحدة',
            h_fs: 'مميزات تفاعلية تجعل ضيوفك يعيشون المناسبة قبل حضورها.',
            h_f1t: 'موسيقى', h_f1p: 'تشغيل تلقائي مع زر تحكم أنيق.',
            h_f2t: 'عدّ تنازلي', h_f2p: 'أيام وساعات ودقائق تتنفّس أحياء.',
            h_f3t: 'تأكيد حضور', h_f3p: 'اجمع الردود وعددها لحظياً.',
            h_f4t: 'خريطة', h_f4p: 'زر يفتح موقع الحفل مباشرة.',
            h_f5t: 'ظرف 3D', h_f5p: 'ختم شمعي يفتح بتجربة بصرية.',
            h_f6t: 'قصة الزوجين', h_f6p: 'خطّ زمني يلامس القلوب.',
            h_f7t: 'برنامج الحفل', h_f7p: 'سير المناسبة خطوة بخطوة.',
            h_f8t: 'رابط فوري', h_f8p: 'مشاركة عبر أي تطبيق خلال ثوانٍ.',
            h_ct: 'جاهز تصنع لحظتك الاستثنائية؟',
            h_cs: 'لا حاجة لأوراق ورقية ولا اتصالات مضنية — دعوتك تصل للجميع برابط واحد.',
            h_cb: 'ابدأ الآن — مجاناً',
            h_ftag: 'منصّة دعوات رقمية تفاعلية فاخرة.',
            h_fl1: 'الدعوات', h_fl2: 'المنصّة', h_fl3: 'المميزات', h_fl4: 'المنشئ',
            h_fcopy: '© 2026 Wedding Studio — جميع الحقوق محفوظة',

            // ===== الصفحة التسويقية =====
            m_how: 'طريقة العمل',
            m_templates: 'التصاميم',
            m_features: 'المميزات',
            m_pricing: 'الأسعار',
            m_faq: 'الأسئلة',
            m_cta: 'أنشئ دعوتك',
            m_hero_script: 'لحظات لا تُنسى',
            m_hero_t1: 'دعوتك الرقمية ',
            m_hero_em: 'الفاخرة',
            m_hero_t2: ' بلمساتك أنت',
            m_hero_lead: 'صمّم دعوة زفاف أو مناسبة تفاعلية أنيقة خلال دقائق. اختر التصميم، أضف تفاصيلك، واحصل على رابط دعوة سحري يجمع الأهل والأحباب — مع موسيقى، عد تنازلي، خريطة، وتأكيد حضور.',
            m_hero_c1: '✨ أنشئ دعوتك الآن — مجاناً',
            m_hero_c2: 'شاهد التصاميم',
            m_howk: 'كيف تعمل؟',
            m_howt: 'ثلاث خطوات فقط',
            m_hows: 'من اختيار التصميم حتى مشاركة رابط الدعوة، كل شيء سهل وسريع.',
            m_s1t: 'اختر تصميمك', m_s1p: 'تصفح مكتبة التصاميم الفاخرة واختر ما يعكس شخصيتكما — كلاسيكي، رومانسي، أو عصري.',
            m_s2t: 'أضف تفاصيلك', m_s2p: 'الاسم، التاريخ، المكان، قصتك، وبرنامج الحفل. شاهد معاينة حية تتحدث أمام عينيك.',
            m_s3t: 'شارك دعوتك', m_s3p: 'احصل على رابط أنيق تشاركه عبر واتساب أو إنستغرام. رتّب حضور ضيوفك من رابط واحد.',
            m_tplk: 'التصاميم',
            m_tplt: 'تصاميم تأسر القلوب',
            m_tpls: 'كل تصميم يُضاء بألوان تليق بمناسبتك وتفاصيلك.',
            m_t1t: 'الكلاسيكي الذهبي', m_t1p: 'ظرف بختم شمعي، خطوط كلاسيكية، ودفء الألوان الوردية.',
            m_t2t: 'الرومانسي الأرجواني', m_t2p: 'درجات البنفسجي الفاتح مع لمسات عاطفية ناعمة.',
            m_t3t: 'العصري الزمردي', m_t3p: 'بساطة معاصرة بلمسة خضراء راقية ومنظمة.',
            m_tplbtn: 'جرّب هذه التصاميم في المنشئ',
            m_fk: 'المميزات',
            m_ft: 'كل ما يحتاجه حفلٌ لا يُنسى',
            m_fs: 'مميزات تفاعلية تجعل ضيوفك يعيشون تفاصيل مناسبتك قبل وصولهم إليها.',
            m_e1t: 'موسيقى خلفية', m_e1p: 'أضف مقطوعتك المفضلة لتشتغل تلقائياً عند فتح الدعوة.',
            m_e2t: 'عد تنازلي حي', m_e2p: 'أيام، ساعات، دقائق وثوانٍ تنبض حتى موعد الفرح.',
            m_e3t: 'تأكيد الحضور', m_e3p: 'استقبل ردود ضيوفك وعدّها بالحضور أو الاعتذار بسهولة.',
            m_e4t: 'خريطة الموقع', m_e4p: 'زر يفتح موقع الحفل مباشرة على الخرائط.',
            m_e5t: 'ظرف ثلاثي الأبعاد', m_e5p: 'تجربة افتتاحية تبهر الضيوف بختم شمعي يفتح أمامهم.',
            m_e6t: 'قصتكم المصورة', m_e6p: 'رحلة لقائكما عبر خط زمني أنيق يلامس القلوب.',
            m_e7t: 'برنامج الحفل', m_e7p: 'تفاصيل سير المناسبة من الاستقبال حتى المأدبة.',
            m_e8t: 'رابط فوري', m_e8p: 'دعوتك على رابط خاص تشاركه في ثوانٍ عبر أي تطبيق.',
            m_pk: 'الأسعار',
            m_pt: 'خطط بسيطة وواضحة',
            m_ps: 'ابدأ مجاناً، ورقِّ عند الحاجة. لا تعقيدات ولا رسوم خفية.',
            m_free: 'المجانية', m_free_unit: 'ريال',
            m_free_btn: 'ابدأ مجاناً',
            m_free_l1: 'دعوة واحدة نشطة', m_free_l2: 'تصميم كلاسيكي واحد',
            m_free_l3: 'عد تنازلي وموسيقى', m_free_l4: 'نموذج تأكيد الحضور',
            m_free_l5: 'شعار استوديو الدعوات',
            m_pop: 'الأكثر شيوعاً',
            m_prem: 'البريميوم', m_prem_unit: 'ريال / مرة',
            m_prem_btn: 'اختر البريميوم',
            m_prem_l1: 'كل مميزات المجانية', m_prem_l2: 'كل التصاميم المتاحة',
            m_prem_l3: 'بلا شعار الاستوديو', m_prem_l4: 'موسيقى مخصصة وثلاث صور',
            m_prem_l5: 'خريطة + زر واتساب', m_prem_l6: 'دعوة غير محدودة النشاط',
            m_gold: 'الذهبية', m_gold_unit: 'ريال / مرة',
            m_gold_btn: 'اختر الذهبية',
            m_gold_l1: 'كل مميزات البريميوم', m_gold_l2: 'تصميم دعوة مخصصة بالكامل',
            m_gold_l3: 'خطة زفاف: عقد + عرس', m_gold_l4: 'أرشفة ذكريات بعد الحفل',
            m_gold_l5: 'أولوية في الدعم',
            m_tk: 'رسائل محبة',
            m_tt: 'قالوا عنا',
            m_ts: 'عشرات العرسان والمنظمين اختاروا استوديو الدعوات ليتألقوا.',
            m_q1: 'كنت أظن أن تصميم دعوة رقمية يحتاج مبرمج أو مصمم. خلال ربع ساعة حصلت على دعوة حلمي وشاركتها مع ٣٠٠ ضيف!',
            m_q1w: 'نورة الشمري', m_q1r: 'عروس — البريميوم',
            m_q2: 'العد التنازلي الحيّ أثار حماس الضيوف بشكل لا يوصف. الجميع كان يفتح الرابط يومياً لمتابعته!',
            m_q2w: 'فهد العتيبي', m_q2r: 'أخو العريس — المجانية',
            m_q3: 'استخدمناها لدعوة افتتاح محلاتنا التجارية، والنتيجة كانت فخامة وتنظيم فاق كل التوقعات.',
            m_q3w: 'ريم القحطاني', m_q3r: 'مؤسِّسة مشروع — الذهبية',
            m_faqk: 'الأسئلة الشائعة',
            m_q_a1: 'هل أحتاج أي مهارات تقنية؟', m_a_a1: 'إطلاقاً. المنشئ البصري يملأ كل شيء نيابة عنك، وتشاهد المعاينة الحية أثناء كتابتك.',
            m_q_a2: 'هل يمكنني مشاركة الرابط على واتساب وإنستغرام؟', m_a_a2: 'نعم. الدعوة تعمل على أي متصفح وموبايل، مع معاينة جميلة تظهر عند مشاركة الرابط.',
            m_q_a3: 'هل يمكن للضيوف تأكيد الحضور إلكترونياً؟', m_a_a3: 'نعم، نموذج تأكيد الحضور مدمج، وتصل ردودهم إليك مباشرة.',
            m_q_a4: 'كم من الوقت تستغرق الدعوة لتكون جاهزة؟', m_a_a4: 'دعوة كاملة الفخامة في أقل من ١٥ دقيقة — مع المعاينة الحية الفورية.',
            m_ct: 'جاهز تصنع شيئاً لا يُنسى؟',
            m_cs: 'انضم إلى آلاف العرسان والمنظمين الذين حولوا دعواتهم إلى تجارب تفاعلية رائعة.',
            m_cb: 'ابدأ التصميم الآن',
            m_ftag: 'دعوات رقمية تفاعلية فاخرة لكل المناسبات.',
            m_fl_how: 'طريقة العمل', m_fl_tpl: 'التصاميم', m_fl_price: 'الأسعار', m_fl_build: 'المنشئ',
            m_fcopy: '© 2026 Invite Studio. جميع الحقوق محفوظة.',

            // ===== المنشئ =====
            b_nav_home: 'الرئيسية',
            b_nav_tpl: 'التصاميم',
            b_nav_gallery: '🖼️ معرض الصور',
            b_nav_pv: 'معاينة كاملة',
            b_st0: '1 · التصميم', b_st_mu: '2 · المناسبة والموسيقى', b_st1: '3 · الأساسيات', b_st2: '4 · القصة',
            b_st3: '5 · البرنامج', b_st4: '6 · الصور', b_st5: '7 · الخاتمة',
            mus_title: 'المناسبة والموسيقى',
            mus_sub: 'اختر نوع المناسبة وفئة موسيقية تناسب أجواءها، أو ارفع مقطعاً مخصصاً.',
            mus_t: 'فئة الموسيقى (تُشغَّل تلقائياً للضيوف)',
            mus_custom: 'رفع مقطع صوتي مخصص (اختياري، يحل محل الفئة)',
            mus_clear: '✕ إزالة المقطع',
            mus_note: 'تظهر فئة الموسيقى للضيوف كزر تشغيل في الدعوة. المقطع المخصص يُشغَّل تلقائياً عند فتح الدعوة من الضيف.',
            mus_bad: 'يجب اختيار ملف صوتي فقط (MP3 / WAV / M4A / OGG).',
            mus_big: 'الملف الصوتي أكبر من 4MB. اختر مقطعاً أقصر أو من فئة الموسيقى المدمجة.',
            mus_k_soft: 'هادئة عذبة', mus_k_oriental: 'شرقية', mus_k_western: 'غربية', mus_k_classic: 'كلاسيكية', mus_k_none: 'بلا موسيقى',
            b0_t: 'اختر الطابع',
            b0_s: 'الطابع يتحكم في ألوان دعوتك بالكامل.',
            b0_classic: 'الكلاسيكي ♥', b0_rose: 'الرومانسي', b0_modern: 'العصري',
            b1_t: 'تفاصيل المناسبة',
            b1_s: 'أدخل أسماء العروسين وأهم التفاصيل.',
            b1_occ: 'نوع المناسبة',
            b1_groom: 'اسم العريس / صاحب المناسبة',
            b1_bride: 'اسم العروس / صاحبة المناسبة',
            b1_callig: 'سطر إنجليزي أنيق (اختياري)',
            b1_wel: 'نص الترحيب',
            b1_date: 'تاريخ المناسبة',
            b1_time: 'الوقت',
            b1_rsvpdl: 'آخر موعد لتأكيد الحضور (اختياري)',
            b1_venue: 'اسم المكان / القاعة',
            b1_addr: 'العنوان التفصيلي',
            b1_map: '📍 موقع المكان في خرائط جوجل',
            b1_mappv: 'معاينة الخريطة',
            b2_t: 'قصتكما',
            b2_s: 'أضف ما تشاء من محطات حكايتكما (اختياري).',
            b2_add: '+ إضافة محطة',
            rep_title: 'العنوان', rep_text: 'النص',
            b3_t: 'برنامج الحفل',
            b3_s: 'حدد سير المناسبة خطوة بخطوة.',
            b3_add: '+ إضافة فقرة',
            pr_time: 'الوقت', pr_title: 'العنوان', pr_desc: 'الوصف',
            b4_t: 'صور المناسبة',
            b4_s: 'أضف صوراً للعروسين أو لحظات مميزة لتظهر للضيوف في معرض الصور (حتى 9 صور). الرجاء اختيار صورة رئيسية مميزة.',
            b4_drop: 'اضغط أو اسحب الصور هنا',
            b4_notes: 'يُسمح بصيغ JPG / PNG / WebP',
            b5_t: 'اللمسات الأخيرة',
            b5_s: 'أكّد التفاصيل ثم شاهد دعوتك كاملة.',
            b5_closer: 'رسالة ختامية',
            b1_occname: '✍️ اكتب اسم المناسبة',
            b1_phone: '⭐ رقم هاتفك (مطلوب للتواصل معك)',
            env_opt: 'المظروف بختم الشمع عند فتح الدعوة',
            b5_foot: 'الأسماء الرسمية للتذييل',
            b5_wa: 'رابط واتساب لتأكيد أسرع (اختياري)',
            fin_phone_err: 'يرجى إدخال رقم هاتفك في خطوة "المناسبة والموسيقى" قبل الإنهاء.',
            fin_occ_err: 'يرجى كتابة اسم المناسبة في خطوة "المناسبة والموسيقى" قبل الإنهاء.',
            pub_t: '🏁 إنهاء وإرسال',
            pub_s: 'اضغط زر الإنهاء لنشر دعوتك ورفع الصور — تُرسل معلوماتك (الاسم، الهاتف، تفاصيل الدعوة) مباشرة إلى فريق المنصة عبر تيليجرام.',
            pub_btn: '🏁 إنهاء — إرسال دعوتي',
            pub_loading: 'جارٍ النشر...',
            pub_warn: '⚠️ شغّل الموقع عبر الخادم أولاً: افتح <b>Command Prompt</b> في مجلد <b>server</b> واكتب <code>node server.js</code> ثم افتح http://localhost:3000',
            pub_ok: '✅ تم نشر دعوتك! شارك هذا الرابط:',
            pub_copy: 'نسخ', pub_copied: '✅ تم',
            pub_note: 'الضيوف سيفتحون صفحة دعوة كاملة تفاعلية، وتصل تأكيدات الحضور إليك لحظياً.',
            pub_err: 'تعذر النشر',
            pub_up_err: 'فشل رفع صورة',
            pub_errgen: 'حدث خطأ',
            b_prev: 'السابق', b_next: 'التالي ←', b_last: 'حفظ ومعاينة كاملة',
            b_note: '💾 يتم حفظ التعديلات تلقائياً، وتظهر المعاينة الحية أمامك في الهاتف.',
            b_done: '✓',
            no_photos_yet: 'لا صور بعد',
            st_add_title: 'محطة جديدة', st_add_text: 'وصف هذه المحطة...',
            pr_add_time: '08:00 مساءً', pr_add_title: 'فقرة جديدة', pr_add_text: 'وصف الفقرة...',
            photo_notice: 'تم حفظ {n} صورة. اضغط ★ لاختيار الرئيسية.',
            photo_proc: 'جارٍ معالجة الصور...',
            photo_ok: 'تمت إضافة الصور بنجاح ✅',
            photo_full: 'المساحة ممتلئة، اكتفِ بعدد أقل من الصور (يُفضل 3-4 صور عالية الجودة).',
            photo_max: 'الحد الأقصى 9 صور. أزل بعض الصور أولاً.',
            gallery_note: '🖼️ حتى الآن يمكنك إضافة الصور من خطوة "الصور".',

            // ===== المعاينة =====
            pv_welcome_kick: 'يسعدنا دعوتكم لمشاركتنا',
            pv_wait: 'ننتظركم',
            pv_scroll: '⬇ ابدأ التمرير',
            pv_count_kick: 'باقي على الفرحة',
            pv_count_t: 'باقي على فرحتنا',
            pv_day: 'يوم', pv_hour: 'ساعة', pv_min: 'دقيقة', pv_sec: 'ثانية',
            pv_story_kick: 'قصتنا',
            pv_story_t: 'قصتنا',
            pv_prog_kick: 'الاحتفال',
            pv_prog_t: 'برنامج الحفل',
            pv_gal_kick: 'لحظاتنا',
            pv_gal_t: 'لحظاتنا',
            pv_venue_kick: 'المكان',
            pv_map_open: 'فتح في خرائط جوجل ↗',
            pv_map_title: 'خريطة الموقع',
            pv_rsvp_kick: 'هل ستنضمون إلينا؟',
            pv_rsvp_t: 'تأكيد الحضور',
            pv_name_ph: 'الاسم الكريم',
            pv_choice: 'هل ستشرفوننا بحضوركم؟',
            pv_yes: 'نعم، بكل سرور',
            pv_no: 'أعتذر، لا أستطيع الحضور',
            pv_send: 'إرسال الرد',
            pv_wa_yes: 'شكراً {n}! سيتم تحويلك إلى واتساب للتأكيد...',
            pv_yes_done: 'شكراً {n}! سُجّل حضورك — الردود حتى الآن: {t} ❤',
            pv_no_done: 'سُجّل اعتذارك، شكراً {n} لاهتمامك.',
            pv_yes_msg: 'شكراً {n}، يسعدنا حضوركم وبانتظاركم! ❤',
            pv_no_msg: 'شكراً {n}، ستفقدنا فرحة حضوركم، ونشكر اهتمامكم.',
            pv_err_t: 'تعذر تحميل الدعوة',
            pv_err_s: 'تأكد أن الخادم يعمل (node server.js) أو أن الرابط صحيح.',
            pv_music: 'تشغيل الموسيقى',
env_hint: 'اضغط هنا لفتح الدعوة',
env_reopen: 'أعد فتح المظروف',
pv_now_h: 'حان الوقت! 🎉',
pv_now_btn: 'نعم، نحن في الطريق',
            pv_open_cue: '▶ اضغطوها هنا',
            m_support: '💬 فريق الدعم جاهز لمساعدتك',
            m_support_hint: '(واتساب — إرسال بالعربية أو الإنجليزية)',
            pv_wa_confirm_yes: 'أؤكد حضوري في {o} {g} و {b} 🎉',
            pv_wa_confirm_no: 'أعتذر عن حضور {o} {g} و {b}'
        },

        en: {
            hub_title: 'Invite Studio | Luxury Digital Invitations Platform',
            m_title: 'Invite Studio | Create your luxury digital invitation',
            b_title: 'Builder | Create your invitation',
            pv_title: 'Wedding Invitation',

            lang_btn_ar: 'العربية',
            lang_btn_en: 'English',
            lang_hint: 'Switch language',
            wa_tooltip: 'Support — WhatsApp',
            wa_hello: 'Hello, I need help with Invite Studio',

            occ_wedding: 'Wedding',
            occ_engagement: 'Engagement',
            occ_birthday: 'Birthday',
            occ_graduation: 'Graduation',
            occ_baby: 'Baby shower',
            occ_queen: 'Queen\'s night',
            occ_opening: 'Opening / Event',
            occ_family: 'Family gathering',
            occ_religious: 'Religious event',
            occ_other: 'Other',
            invitation_word: 'invitation',
            place_of: '{o} venue',
            rsvp_hint_by: 'Please confirm attendance by {d}',
            rsvp_hint_soon: 'Please confirm your attendance early',

            h_nav_platform: 'The Studio',
            h_nav_demos: 'Ready Invitations',
            h_nav_features: 'Features',
            h_nav_create: 'Create yours',
            h_tagline: 'Craft Your Moment',
            h_title1: 'A ',
            h_title_em: 'digital invitation',
            h_title2: ' platform that crafts an unforgettable memory',
            h_lead: 'Design a wedding or occasion invitation in minutes: pick a theme, add your details, and share a magical link that opens with music, countdown and RSVP — no coding skills needed.',
            h_start: 'Start designing free ✨',
            h_browse: 'Browse invitations',
            h_open: 'Open invitation ▶',
            h_s1: 'Invitations created',
            h_s2: 'Guests invited',
            h_s3: 'Design themes',
            h_s4: 'Client satisfaction',
            h_dk: 'Ready Invitations',
            h_dt: 'Ready-to-try invitations',
            h_dsub: 'Live pre-designed samples — open any to feel the guest experience before crafting your own.',
            h_d1: 'The Luxury Invitation 💌',
            h_d1m: 'Wax-sealed envelope + countdown + map',
            h_d2: 'The Premium Invitation 👑',
            h_d2m: 'Smooth scroll & elegant spaces',
            h_d3: 'The Perfect Invitation 🌹',
            h_d3m: 'Layered structure & elegant timeline',
            h_pk: 'The Studio',
            h_pt: 'Where does your journey begin?',
            h_ps: 'An all-in-one tool from a marketing page to an invitation that reaches your guest.',
            h_c1: 'Full Studio — Create yours',
            h_c1p: 'A visual builder with a live phone preview that auto-saves and assembles your interactive invitation.',
            h_c1l1: 'Choose a theme & colors (Classic / Romantic / Modern)',
            h_c1l2: 'Couple\'s story + celebration program',
            h_c1l3: 'RSVP with WhatsApp button',
            h_c1go: 'Open the studio ←',
            h_c2: 'What the project includes',
            h_c2p: 'Clean, easy-to-maintain structure — every file in its place.',
            h_c2l1: 'studio/ — platform, builder & preview pages',
            h_c2l2: 'invitations/ — ready-made invite samples',
            h_c2l3: 'Mobile-friendly + sharing server',
            h_fk: 'Features',
            h_ft: 'All event tools in one platform',
            h_fs: 'Interactive features that make your guests live the occasion before attending.',
            h_f1t: 'Music', h_f1p: 'Auto-play with an elegant control button.',
            h_f2t: 'Countdown', h_f2p: 'Days, hours & minutes ticking live.',
            h_f3t: 'RSVP', h_f3p: 'Collect & count replies instantly.',
            h_f4t: 'Map', h_f4p: 'A button that opens the venue location directly.',
            h_f5t: '3D Envelope', h_f5p: 'A wax seal opens with a visual experience.',
            h_f6t: 'Couple\'s Story', h_f6p: 'A timeline that touches hearts.',
            h_f7t: 'Program', h_f7p: 'The event flow step by step.',
            h_f8t: 'Instant Link', h_f8p: 'Share via any app in seconds.',
            h_ct: 'Ready to craft your extraordinary moment?',
            h_cs: 'No paper, no tedious calls — your invitation reaches everyone with one link.',
            h_cb: 'Start now — free',
            h_ftag: 'A luxury interactive digital invitation platform.',
            h_fl1: 'Invitations', h_fl2: 'The Studio', h_fl3: 'Features', h_fl4: 'Builder',
            h_fcopy: '© 2026 Wedding Studio — All rights reserved',

            m_how: 'How it works',
            m_templates: 'Templates',
            m_features: 'Features',
            m_pricing: 'Pricing',
            m_faq: 'FAQ',
            m_cta: 'Create yours',
            m_hero_script: 'Create unforgettable moments',
            m_hero_t1: 'Your ',
            m_hero_em: 'luxury',
            m_hero_t2: ' digital invitation, crafted by you',
            m_hero_lead: 'Design an elegant interactive wedding or occasion invitation in minutes. Choose a design, add your details, and get a magical link that gathers family and friends — with music, countdown, map and RSVP.',
            m_hero_c1: '✨ Create yours now — free',
            m_hero_c2: 'See the designs',
            m_howk: 'How it works',
            m_howt: 'Just three steps',
            m_hows: 'From choosing a design to sharing your invitation link — everything is easy and fast.',
            m_s1t: 'Choose your design', m_s1p: 'Browse the luxury template library and pick what reflects your personality — classic, romantic or modern.',
            m_s2t: 'Add your details', m_s2p: 'Names, date, venue, your story and the event program. Watch a live preview adapt as you type.',
            m_s3t: 'Share your invitation', m_s3p: 'Get an elegant link to share on WhatsApp or Instagram. Organize your guests from one link.',
            m_tplk: 'Templates',
            m_tplt: 'Designs that capture hearts',
            m_tpls: 'Each design glows with colors that suit your occasion and details.',
            m_t1t: 'Golden Classic', m_t1p: 'Wax-sealed envelope, classic lines and warm pink tones.',
            m_t2t: 'Purple Romantic', m_t2p: 'Soft purple shades with delicate emotional touches.',
            m_t3t: 'Emerald Modern', m_t3p: 'Contemporary simplicity with an elegant, organized green touch.',
            m_tplbtn: 'Try these designs in the builder',
            m_fk: 'Features',
            m_ft: 'Everything an unforgettable celebration needs',
            m_fs: 'Interactive features that make your guests live your occasion before arriving.',
            m_e1t: 'Background music', m_e1p: 'Add your favorite track that plays automatically when the invitation opens.',
            m_e2t: 'Live countdown', m_e2p: 'Days, hours, minutes and seconds pulsing until the big moment.',
            m_e3t: 'RSVP', m_e3p: 'Receive guests\' replies and count attendance or regrets easily.',
            m_e4t: 'Venue map', m_e4p: 'A button that opens the venue directly on maps.',
            m_e5t: '3D Envelope', m_e5p: 'An opening experience that delights guests with a wax seal reveal.',
            m_e6t: 'Your photo story', m_e6p: 'Your journey through an elegant timeline that touches hearts.',
            m_e7t: 'Event program', m_e7p: 'The flow of the occasion from reception to dinner.',
            m_e8t: 'Instant link', m_e8p: 'Your invitation on a private link you share in seconds via any app.',
            m_pk: 'Pricing',
            m_pt: 'Simple, clear plans',
            m_ps: 'Start free, upgrade when needed. No complications, no hidden fees.',
            m_free: 'Free', m_free_unit: 'SAR',
            m_free_btn: 'Start free',
            m_free_l1: 'One active invitation', m_free_l2: 'One classic design',
            m_free_l3: 'Countdown & music', m_free_l4: 'RSVP form',
            m_free_l5: 'Invite Studio logo',
            m_pop: 'Most popular',
            m_prem: 'Premium', m_prem_unit: 'SAR / one-time',
            m_prem_btn: 'Choose Premium',
            m_prem_l1: 'Everything in Free', m_prem_l2: 'All available designs',
            m_prem_l3: 'No studio logo', m_prem_l4: 'Custom music & three photos',
            m_prem_l5: 'Map + WhatsApp button', m_prem_l6: 'Unlimited active invitation',
            m_gold: 'Gold', m_gold_unit: 'SAR / one-time',
            m_gold_btn: 'Choose Gold',
            m_gold_l1: 'Everything in Premium', m_gold_l2: 'Fully custom invitation design',
            m_gold_l3: 'Wedding plan: contract + reception', m_gold_l4: 'Memories archive after the event',
            m_gold_l5: 'Priority support',
            m_tk: 'Love notes',
            m_tt: 'What they said about us',
            m_ts: 'Dozens of couples and organizers chose Invite Studio to shine.',
            m_q1: 'I thought designing a digital invitation needed a programmer or designer. In a quarter of an hour I got my dream invitation and shared it with 300 guests!',
            m_q1w: 'Noura Alshammari', m_q1r: 'Bride — Premium',
            m_q2: 'The live countdown got guests hyped beyond words. Everyone opened the link daily to follow it!',
            m_q2w: 'Fahad Alotaibi', m_q2r: 'Groom\'s brother — Free',
            m_q3: 'We used it for our shops\' opening invitation, and the result was an elegance and organization beyond all expectations.',
            m_q3w: 'Reem Alqahtani', m_q3r: 'Project founder — Gold',
            m_faqk: 'Frequently asked questions',
            m_q_a1: 'Do I need any technical skills?', m_a_a1: 'Not at all. The visual builder fills everything for you, and you watch a live preview as you type.',
            m_q_a2: 'Can I share the link on WhatsApp and Instagram?', m_a_a2: 'Yes. The invitation works on any browser and phone, with a beautiful preview when you share the link.',
            m_q_a3: 'Can guests confirm attendance electronically?', m_a_a3: 'Yes, an RSVP form is built in, and their replies reach you instantly.',
            m_q_a4: 'How long does an invitation take to be ready?', m_a_a4: 'A fully luxurious invitation in under 15 minutes — with an instant live preview.',
            m_ct: 'Ready to create something unforgettable?',
            m_cs: 'Join thousands of couples and organizers who turned their invitations into amazing interactive experiences.',
            m_cb: 'Start designing now',
            m_ftag: 'Luxury interactive digital invitations for every occasion.',
            m_fl_how: 'How it works', m_fl_tpl: 'Templates', m_fl_price: 'Pricing', m_fl_build: 'Builder',
            m_fcopy: '© 2026 Invite Studio. All rights reserved.',

            b_nav_home: 'Home',
            b_nav_tpl: 'Templates',
            b_nav_gallery: '🖼️ Gallery',
            b_nav_pv: 'Full preview',
            b_st0: '1 · Design', b_st_mu: '2 · Occasion & Music', b_st1: '3 · Basics', b_st2: '4 · Story',
            b_st3: '5 · Program', b_st4: '6 · Photos', b_st5: '7 · Final touches',
            mus_title: 'Occasion & Music',
            mus_sub: 'Pick your occasion and a music category that fits its mood, or upload your own clip.',
            mus_t: 'Music category (plays automatically for guests)',
            mus_custom: 'Upload a custom audio clip (optional, overrides the category)',
            mus_clear: '✕ Remove clip',
            mus_note: 'The music category appears to guests as a play button on the invitation. A custom clip plays automatically when a guest opens the invitation.',
            mus_bad: 'Please choose an audio file only (MP3 / WAV / M4A / OGG).',
            mus_big: 'The audio file is larger than 4MB. Pick a shorter clip or use a built-in music category.',
            mus_k_soft: 'Soft & sweet', mus_k_oriental: 'Oriental', mus_k_western: 'Western', mus_k_classic: 'Classic', mus_k_none: 'No music',
            b0_t: 'Choose your theme',
            b0_s: 'The theme controls the entire color palette of your invitation.',
            b0_classic: 'Classic ♥', b0_rose: 'Romantic', b0_modern: 'Modern',
            b1_t: 'Event details',
            b1_s: 'Enter the names of the couple and key details.',
            b1_occ: 'Occasion type',
            b1_groom: 'Groom / Host name',
            b1_bride: 'Bride / Hostess name',
            b1_callig: 'Elegant English line (optional)',
            b1_wel: 'Welcome text',
            b1_date: 'Event date',
            b1_time: 'Time',
            b1_rsvpdl: 'RSVP deadline (optional)',
            b1_venue: 'Venue name',
            b1_addr: 'Full address',
            b1_map: '📍 Venue location on Google Maps',
            b1_mappv: 'Map preview',
            b2_t: 'Your story',
            b2_s: 'Add as many chapters of your story as you wish (optional).',
            b2_add: '+ Add chapter',
            rep_title: 'Title', rep_text: 'Text',
            b3_t: 'Celebration program',
            b3_s: 'Define the flow of the event step by step.',
            b3_add: '+ Add segment',
            pr_time: 'Time', pr_title: 'Title', pr_desc: 'Description',
            b4_t: 'Occasion photos',
            b4_s: 'Add photos of the couple or special moments to show guests in the gallery (up to 9). Please pick a standout cover photo.',
            b4_drop: 'Click or drag photos here',
            b4_notes: 'JPG / PNG / WebP allowed',
            b5_t: 'Final touches',
            b5_s: 'Confirm the details then view your complete invitation.',
            b5_closer: 'Closing message',
            b5_foot: 'Official footer names',
            b5_wa: 'WhatsApp link for faster confirmation (optional)',
            b1_occname: '✍️ Write the occasion name',
            b1_phone: '⭐ Your phone number (required to contact you)',
            env_opt: 'Wax-seal envelope when opening the invitation',
            fin_phone_err: 'Please enter your phone number in the "Occasion & Music" step before finishing.',
            fin_occ_err: 'Please write the occasion name in the "Occasion & Music" step before finishing.',
            pub_t: '🏁 Finish & send',
            pub_s: 'Click finish to publish your invitation and upload photos — your details (names, phone, invitation) are sent straight to the platform team via Telegram.',
            pub_btn: '🏁 Finish — send my invitation',
            pub_loading: 'Publishing...',
            pub_warn: '⚠️ Run the website through the server first: open <b>Command Prompt</b> in the <b>server</b> folder, type <code>node server.js</code>, then open http://localhost:3000',
            pub_ok: '✅ Your invitation is live! Share this link:',
            pub_copy: 'Copy', pub_copied: '✅ Copied',
            pub_note: 'Guests will open a full interactive invitation page, and their RSVPs reach you in real time.',
            pub_err: 'Publish failed',
            pub_up_err: 'Photo upload failed',
            pub_errgen: 'Something went wrong',
            b_prev: 'Back', b_next: 'Next →', b_last: 'Save & full preview',
            b_note: '💾 Changes are saved automatically, and the live preview updates right before you.',
            b_done: '✓',
            no_photos_yet: 'No photos yet',
            st_add_title: 'New chapter', st_add_text: 'Describe this chapter...',
            pr_add_time: '08:00 PM', pr_add_title: 'New segment', pr_add_text: 'Describe the segment...',
            photo_notice: 'Saved {n} photos. Tap ★ to pick the cover.',
            photo_proc: 'Processing photos...',
            photo_ok: 'Photos added successfully ✅',
            photo_full: 'Storage full — use fewer photos (3-4 high-quality recommended).',
            photo_max: 'Maximum 9 photos. Remove some first.',
            gallery_note: '🖼️ For now you can add photos from the "Photos" step.',

            pv_welcome_kick: 'We are honored to have you share in our joy',
            pv_wait: 'We await you',
            pv_scroll: '⬇ Start scrolling',
            pv_count_kick: 'Counting down',
            pv_count_t: 'Counting down to our day',
            pv_day: 'Day', pv_hour: 'Hrs', pv_min: 'Min', pv_sec: 'Sec',
            pv_story_kick: 'Our Story',
            pv_story_t: 'Our Story',
            pv_prog_kick: 'The Celebration',
            pv_prog_t: 'Celebration Program',
            pv_gal_kick: 'Our Moments',
            pv_gal_t: 'Our Moments',
            pv_venue_kick: 'The Venue',
            pv_map_open: 'Open in Google Maps ↗',
            pv_map_title: 'Venue map',
            pv_rsvp_kick: 'Will you join us?',
            pv_rsvp_t: 'RSVP',
            pv_name_ph: 'Your full name',
            pv_choice: 'Will you grace us with your presence?',
            pv_yes: 'Yes, gladly',
            pv_no: 'Sorry, I can\'t attend',
            pv_send: 'Send response',
            pv_wa_yes: 'Thank you {n}! Redirecting you to WhatsApp to confirm...',
            pv_yes_done: 'Thank you {n}! Attendance recorded — {t} replies so far ❤',
            pv_no_done: 'Apology recorded — thank you {n}.',
            pv_yes_msg: 'Thank you {n}, we look forward to seeing you! ❤',
            pv_no_msg: 'Thank you {n}, your presence will be missed.',
            pv_err_t: 'Couldn\'t load the invitation',
            pv_err_s: 'Make sure the server is running (node server.js) or the link is correct.',
            pv_music: 'Play music',
env_hint: 'Click here to open the invitation',
env_reopen: 'Reopen the envelope',
pv_now_h: 'It is time! 🎉',
pv_now_btn: 'Yes, we are on our way',
            pv_open_cue: '▶ Tap here',
            m_support: '💬 Our support team is here to help',
            m_support_hint: '(WhatsApp — send in Arabic or English)',
            pv_wa_confirm_yes: 'I confirm my attendance at {o} for {g} & {b} 🎉',
            pv_wa_confirm_no: 'I apologize for not attending {o} for {g} & {b}'
        }
    };

    var KEY = 'locale';
    function detect() {
        var s = null;
        try { s = localStorage.getItem(KEY); } catch (e) {}
        if (s && D[s]) return s;
        var nav = (navigator.language || 'ar').toLowerCase();
        return nav.indexOf('ar') === 0 ? 'ar' : 'en';
    }
    var lang = detect();

    function t(k) {
        var v = (D[lang] && D[lang][k]);
        if (v === undefined || v === null) v = D.ar[k];
        return (v === undefined || v === null) ? k : v;
    }
    function f(k, vars) {
        var v = t(k);
        for (var key in vars) {
            if (Object.prototype.hasOwnProperty.call(vars, key)) {
                v = v.split('{' + key + '}').join(vars[key]);
            }
        }
        return v;
    }
    function apply() {
        document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
        document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = t(el.getAttribute('data-i18n-title')); });
        document.querySelectorAll('[data-i18n-value]').forEach(function (el) { el.value = t(el.getAttribute('data-i18n-value')); });
        var tt = document.documentElement.getAttribute('data-title');
        if (tt) document.title = t(tt);
        var btn = document.getElementById('langBtn');
        if (btn) btn.textContent = lang === 'ar' ? t('lang_btn_en') : t('lang_btn_ar');
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    }
    function set(l) {
        if (!D[l]) l = 'ar';
        lang = l;
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        apply();
    }
    function toggle() { set(lang === 'ar' ? 'en' : 'ar'); }
    function get() { return lang; }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }

    return { D: D, t: t, f: f, apply: apply, set: set, toggle: toggle, get: get };
})();

if (typeof window !== 'undefined') window.I18N = I18N;
````

---

## studio\assets\preview.js

````js
const DEFAULTS = {
    tpl: 'classic',
    occasion: 'wedding',
    env: true,
    groom: 'آدم', bride: 'لارا', calligraphy: 'L & A',
    welcome: 'يسعدنا دعوتكم لمشاركتنا فرحة زواجنا',
    date: '2026-09-24', time: '19:00', rsvpDeadline: '2026-09-10',
    venue: 'قاعة الياسمين', address: 'طريق الأمير سلطان، جدة', mapQuery: 'فندق روزوود جدة',
    story: [
        { title: 'البداية', text: 'التقينا في الربيع الماضي في مقهى صغير، وأدركنا أن هذه بداية حكاية جميلة.' },
        { title: 'الخطوبة', text: 'في حضور العائلتين، اتخذنا أجمل قرار في حياتنا.' },
        { title: 'الزفاف', text: 'الآن نستعد لأجمل فصل في حياتنا، وننتظر أن نرى ضيوفنا الأعزاء.' }
    ],
    program: [
        { time: '07:00 مساءً', title: 'استقبال الضيوف', text: 'باب الضيافة مفتوح وأنتم على رأس القائمة.' },
        { time: '07:30 مساءً', title: 'مراسم العقد', text: 'لحظة توقيع عقد الزواج بمشاركة العائلتين.' },
        { time: '09:00 مساءً', title: 'مأدبة العشاء', text: 'مأدبة عشاء فاخرة على أنغام الموسيقى.' }
    ],
    closer: 'قرأتما وشاهدتما كل شيء... انتظرونا في الموعد المحدد لنحتفل معاً ❤',
    footerNames: 'لارا & آدم', whatsapp: '',
    music: { kind: 'category', category: 'soft', custom: '' }
};

let data = { ...DEFAULTS };
let serverMode = false;
let shareId = null;

// ---------- المناسبات: مفتاح ثابت + تسمية بلغة المتصفح ----------
const OCC_KEYS = ['wedding', 'engagement', 'birthday', 'graduation', 'baby', 'queen', 'opening', 'family', 'religious', 'other'];
const OCC_LEGACY = { 'زفاف': 'wedding', 'خطوبة': 'engagement', 'عيد ميلاد': 'birthday', 'تخرج': 'graduation', 'استقبال مولود': 'baby', 'حفل ملكة': 'queen', 'افتتاح / مناسبة عمل': 'opening', 'لقاء عائلي': 'family', 'مناسبة دينية': 'religious', 'أخرى': 'other' };
function occKey(v) {
    const s = String(v || '').trim();
    if (OCC_KEYS.indexOf(s) !== -1) return s;
    return OCC_LEGACY[s] || 'other';
}
function occLabel(k) { return I18N.t('occ_' + occKey(k)); }
function mapsLang() { return I18N.get() === 'en' ? 'en' : 'ar'; }

// وضع المشاركة عبر الرابط: id=?id=XXX
const params = new URLSearchParams(location.search);
shareId = params.get('id');

// إخفاء المحتوى حتى جاهزية البيانات في وضع الخادم
function hideEnvNow() {
    const ov = document.getElementById('envOverlay');
    if (ov) ov.classList.add('gone');
    document.body.classList.remove('env-lock');
}
function showLoadError(msg) {
    hideEnvNow();
    document.getElementById('pvContainer').innerHTML =
        '<div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;">' +
        '<div style="font-size:40px;margin-bottom:12px;">📭</div>' +
        '<h2 style="font-family:\'El Messiri\',serif;color:#5A4A46;">' + I18N.t('pv_err_t') + '</h2>' +
        '<p style="color:#978784;margin-top:8px;">' + msg + '</p>' +
        '</div>';
}

async function loadInvite() {
    if (shareId) {
        try {
            const r = await fetch('/api/invite/' + shareId);
            if (!r.ok) throw new Error();
            const serverData = await r.json();
            data = { ...DEFAULTS, ...serverData };
            serverMode = true;
        } catch (e) {
            showLoadError(I18N.t('pv_err_s'));
            return false;
        }
    } else {
        try {
            const saved = localStorage.getItem('invite-studio.builder');
            if (saved) data = { ...DEFAULTS, ...JSON.parse(saved) };
        } catch (e) {}
        if (window.location.protocol.startsWith('http')) serverMode = true;
    }
    data.occasion = occKey(data.occasion);
    return true;
}

// ---------- العرض ----------
let occ = '';

// ---------- المظروف / تمييز البرنامج / لافتة الوقت ----------
let progTimes = [], progTick = null, bannerShown = false;

function parseTimeOfDay(str) {
    if (!str) return null;
    const m = String(str).match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    let h = +m[1], min = +m[2], s = String(str);
    if (/(مساءً|م|pm|PM|pm\.)/.test(s)) { if (h < 12) h += 12; }
    else if (/(صباحاً|ص|am|AM)/.test(s)) { if (h === 12) h = 0; }
    else if (h < 8) h += 12;
    const d = new Date(); d.setHours(h, min, 0, 0); return d;
}

function updateProgramNow() {
    const now = new Date();
    progTimes.forEach((it) => it.card && it.card.classList.remove('now'));
    let active = null;
    for (let i = 0; i < progTimes.length; i++) {
        if (progTimes[i].start && progTimes[i].start <= now) active = i;
        else break;
    }
    if (active !== null && progTimes[active].start) {
        const next = progTimes.slice(active + 1).find((x) => x.start);
        const end = next ? next.start : new Date(progTimes[active].start.getTime() + 90 * 60000);
        if (now >= progTimes[active].start && now < end) progTimes[active].card.classList.add('now');
    }
}

function firstLet(n) {
    const s = String(n || '').trim();
    return s ? Array.from(s)[0] : '';
}
function envMonogram() {
    const a = firstLet(data.groom), b = firstLet(data.bride);
    return a || b ? a + '&' + b : '❤';
}

function wireEnvIntro() {
    const overlay = document.getElementById('envOverlay');
    const card = document.getElementById('envCard');
    const fab = document.getElementById('envFab');
    if (!overlay || !card) return;
    const mono = data.calligraphy || (data.groom + ' & ' + data.bride);
    document.getElementById('envNames').textContent = mono;
    document.getElementById('nowMonogram').textContent = mono;
    const seal = document.getElementById('envSeal');
    if (seal) seal.textContent = envMonogram();
    const typed = document.getElementById('envType');
    if (typed) {
        const fullTxt = mono;
        let i = 0;
        const step = () => {
            typed.textContent = fullTxt.slice(0, i++);
            if (i <= fullTxt.length) setTimeout(step, 130);
        };
        setTimeout(step, 500);
    }
    // اختياري: إن لم يُفعَّل المظروف في المنشئ، تُعرض الدعوة مباشرة دون ستر
    if (data.env === false) {
        document.body.classList.remove('env-lock');
        overlay.classList.add('gone');
        return;
    }
    document.body.classList.add('env-lock');
    const openIt = () => {
        card.classList.add('open');
        document.body.classList.remove('env-lock');
        setTimeout(() => { overlay.classList.add('gone'); if (fab) fab.classList.add('show'); }, 900);
    };
    const reopen = () => {
        if (fab) fab.classList.remove('show');
        card.classList.remove('open');
        overlay.classList.remove('gone');
        document.body.classList.add('env-lock');
        setTimeout(openIt, 80);
    };
    card.addEventListener('click', openIt);
    if (fab) fab.addEventListener('click', reopen);
}

function wireNowBanner() {
    const banner = document.getElementById('pvNowBanner');
    if (!banner) return;
    const first = (data.program && data.program[0] && data.program[0].title) || '';
    document.getElementById('nowFirstTitle').textContent = first;
    banner.querySelector('button').addEventListener('click', () => banner.classList.remove('show'));
}

// ---------- نصوص تعتمد على اللغة (تحدث عند تغيير اللغة) ----------
function refreshLang() {
    occ = data.occasionName || occLabel(data.occasion);
    document.getElementById('pvOccasion').textContent = occ + ' — ' + I18N.t('pv_wait');

    // عنوان قسم المكان حسب المناسبة
    document.getElementById('pvPlaceTitle').textContent = I18N.f('place_of', { o: occLabel(data.occasion) });

    // الخريطة: استعلام جوجل من mapQuery أو العنوان
    const mapQ = (data.mapQuery || data.venue || data.address || '').trim();
    const encodedQ = encodeURIComponent(mapQ);
    document.getElementById('pvMapFrame').src = 'https://maps.google.com/maps?q=' + encodedQ + '&z=14&output=embed&hl=' + mapsLang();
    document.getElementById('pvMapBtn').href = 'https://maps.google.com/?q=' + encodedQ;

    // تاريخ تأكيد الحضور
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const dl = data.rsvpDeadline ? new Date(data.rsvpDeadline) : null;
    document.getElementById('pvRsvpHint').textContent = dl && !isNaN(dl)
        ? I18N.f('rsvp_hint_by', { d: dl.getDate() + ' ' + months[dl.getMonth()] + ' ' + dl.getFullYear() })
        : I18N.t('rsvp_hint_soon');
}

function initRender() {
    // ---------- تطبيق الثيم ----------
    document.body.classList.add('tpl-' + data.tpl);
    document.querySelector('.pv-container').style.background = 'var(--cream)';

    // ---------- الموسيقى ----------
    if (typeof syncMusicVisibility === 'function') syncMusicVisibility();

    // ---------- المظروف بختم الشمع ----------
    wireEnvIntro();
    wireNowBanner();

    // ---------- تعبئة النصوص ----------
    document.getElementById('pvCalligraphy').textContent = data.calligraphy || 'L & A';
    document.getElementById('pvGroom').textContent = data.groom;
    document.getElementById('pvBride').textContent = data.bride;
    document.getElementById('pvWelcome').textContent = data.welcome;
    document.getElementById('pvVenue').textContent = data.venue;
    document.getElementById('pvAddress').textContent = data.address;
    document.getElementById('pvCloser').textContent = data.closer;
    document.getElementById('pvFooterNames').textContent = data.footerNames;

    refreshLang();

    const d = new Date(data.date + 'T' + (data.time || '19:00'));
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    if (!isNaN(d)) {
        document.getElementById('pvDate').textContent = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    // ---------- العد التنازلي ----------
    const timerEl = document.getElementById('pvTimer');
    const pad = (n) => String(n).padStart(2, '0');
    function updateTimer() {
        const diff = d.getTime() - Date.now();
        if (diff <= 0 && !isNaN(d.getTime()) && !bannerShown) {
            bannerShown = true;
            const banner = document.getElementById('pvNowBanner');
            if (banner) banner.classList.add('show');
        }
        const boxes = [
            { v: diff > 0 ? Math.floor(diff / 86400000) : 0, l: 'يوم' },
            { v: diff > 0 ? Math.floor(diff % 86400000 / 3600000) : 0, l: 'ساعة' },
            { v: diff > 0 ? Math.floor(diff % 3600000 / 60000) : 0, l: 'دقيقة' },
            { v: diff > 0 ? Math.floor(diff % 60000 / 1000) : 0, l: 'ثانية' }
        ];
        const els = timerEl.children;
        for (let i = 0; i < els.length; i++) {
            els[i].querySelector('b').textContent = pad(boxes[i].v);
        }
    }
    timerEl.innerHTML = [I18N.t('pv_day'), I18N.t('pv_hour'), I18N.t('pv_min'), I18N.t('pv_sec')]
        .map((l) => '<div class="pv-tbox"><b>00</b><small>' + l + '</small></div>').join('');
    updateTimer();
    setInterval(updateTimer, 1000);

    // ---------- القصة ----------
    const storyEl = document.getElementById('pvStory');
    storyEl.innerHTML = '';
    (data.story && data.story.length ? data.story : []).forEach((s) => {
        if (!s.title && !s.text) return;
        const el = document.createElement('div');
        el.className = 'pv-story-item';
        el.innerHTML = '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>';
        storyEl.appendChild(el);
    });

    // ---------- البرنامج ----------
    const progEl = document.getElementById('pvProgram');
    progEl.innerHTML = '';
    progTimes = [];
    (data.program && data.program.length ? data.program : []).forEach((p, i) => {
        if (!p.title) return;
        const el = document.createElement('div');
        el.className = 'pv-prog-card';
        el.innerHTML = '<div class="t">' + esc(p.time) + '</div><h3>' + esc(p.title) + '</h3><p>' + esc(p.text) + '</p>';
        progEl.appendChild(el);
        progTimes.push({ card: el, start: parseTimeOfDay(p.time) });
    });
    clearInterval(progTick);
    updateProgramNow();
    progTick = setInterval(updateProgramNow, 30000);

    // ---------- معرض الصور ----------
    const gallerySec = document.getElementById('pvGallerySec');
    const galleryEl = document.getElementById('pvGallery');
    function buildGallery() {
        const photos = data.photos && data.photos.length ? data.photos : [];
        if (!photos.length) { gallerySec.style.display = 'none'; return; }
        gallerySec.style.display = 'flex';
        // الرئيسية أولاً
        const ordered = [...photos];
        const cover = data.coverIdx || 0;
        if (cover > 0 && cover < ordered.length) {
            const c = ordered.splice(cover, 1)[0];
            ordered.unshift(c);
        }
        galleryEl.innerHTML = '';
        ordered.forEach((src) => {
            const gi = document.createElement('div');
            gi.className = 'gi';
            gi.innerHTML = '<img src="' + src + '" alt="لحظة">';
            gi.addEventListener('click', () => openLightbox(src));
            galleryEl.appendChild(gi);
        });
    }
    // Lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lb-close" id="lbClose">✕</button><img id="lbImg" alt="">';
    document.body.appendChild(lightbox);
    function openLightbox(src) {
        document.getElementById('lbImg').src = src;
        lightbox.classList.add('open');
    }
    document.getElementById('lbClose').addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
    buildGallery();
}

function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- نموذج تأكيد الحضور ----------
document.getElementById('pvForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const ans = document.getElementById('guestAttendance').value;
    const msg = document.getElementById('formMessage');

    // في وضع المشاركة عبر الخادم: سجّل الرد على الخادم أولاً
    if (serverMode && shareId) {
        try {
            const r = await fetch('/api/rsvp/' + shareId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, attending: ans })
            });
            if (r.ok) {
                const j = await r.json();
                msg.textContent = ans === 'yes'
                    ? I18N.f('pv_yes_done', { n: name, t: j.total })
                    : I18N.f('pv_no_done', { n: name });
                e.target.reset();
                setTimeout(() => (msg.textContent = ''), 7000);
                return;
            }
        } catch (err) {}
    }

    if (data.whatsapp) {
        const text = encodeURIComponent(ans === 'yes'
            ? I18N.f('pv_wa_confirm_yes', { n: name, o: occ, g: data.groom, b: data.bride })
            : I18N.f('pv_wa_confirm_no', { n: name, o: occ, g: data.groom, b: data.bride }));
        msg.textContent = I18N.f('pv_wa_yes', { n: name });
        window.open(data.whatsapp + (data.whatsapp.includes('?') ? '&' : '?') + 'text=' + text, '_blank');
    } else {
        msg.textContent = ans === 'yes'
            ? I18N.f('pv_yes_msg', { n: name })
            : I18N.f('pv_no_msg', { n: name });
    }
    e.target.reset();
    setTimeout(() => (msg.textContent = ''), 7000);
});

// ---------- اللغة ----------
document.addEventListener('langchange', () => {
    if (typeof initRender === 'function' && document.getElementById('pvContainer')) {
        refreshLang();
    }
});
document.getElementById('langBtn').addEventListener('click', () => I18N.toggle());

// ---------- الموسيقى ----------
const musicBtn = document.getElementById('musicBtn');
let audioCtx = null, musicOn = false, musicTimer = null, audioEl = null;

// نغم لكل فئة موسيقية: تتابع كورال + لحن + باس
const SONGS = {
    soft: {
        chords: [[261.63, 329.63, 392.00], [220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66]],
        arp: [523.25, 659.25, 783.99, 659.25],
        bass: [130.81, 110.00, 87.31, 98.00]
    },
    oriental: {
        chords: [[164.81, 207.65, 261.63], [155.56, 196.00, 246.94], [146.83, 185.00, 220.00], [164.81, 207.65, 261.63]],
        arp: [440.00, 523.25, 659.25, 830.61],
        bass: [82.41, 77.78, 73.42, 82.41]
    },
    western: {
        chords: [[196.00, 246.94, 293.66], [174.61, 220.00, 261.63], [164.81, 207.65, 246.94], [196.00, 246.94, 293.66]],
        arp: [587.33, 739.99, 880.00, 987.77],
        bass: [98.00, 87.31, 82.41, 98.00]
    },
    classic: {
        chords: [[261.63, 329.63, 392.00], [220.00, 261.63, 329.63], [174.61, 261.63, 329.63], [196.00, 246.94, 293.66]],
        arp: [523.25, 659.25, 783.99, 1046.50],
        bass: [130.81, 110.00, 87.31, 98.00]
    }
};

function musicCat() {
    const m = data.music || {};
    return SONGS[m.category] ? m.category : 'soft';
}
function isCustomMusic() {
    const m = data.music || {};
    return m.kind === 'custom' && m.custom ? true : false;
}
function musicAvailable() {
    return isCustomMusic() || (musicCat() !== 'none' && musicCat() in SONGS);
}

function syncMusicVisibility() {
    if (!musicAvailable()) musicBtn.style.display = 'none';
}

function playNote(freq, time, dur = 1.4, vol = 0.12) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
}

// أربع مقاطع: وتر + باس + لحن — تُعاد كل 8 ثوانٍ كأغنية كاملة
function playSong() {
    if (!audioCtx || !musicOn) return;
    const song = SONGS[musicCat()];
    if (!song) return;
    let t = audioCtx.currentTime + 0.2;
    const bar = 2.0;
    for (let i = 0; i < song.chords.length; i++) {
        song.chords[i].forEach((n) => playNote(n, t, bar * 0.9, 0.045));
        playNote(song.bass[i], t, bar * 0.9, 0.05);
        song.arp.forEach((n, a) => playNote(n, t + (a * bar) / 4, bar * 0.45, 0.11));
        t += bar;
    }
    musicTimer = setTimeout(playSong, bar * song.chords.length + 100);
}

function stopMusic() {
    clearTimeout(musicTimer);
    if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
    musicOn = false;
    musicBtn.classList.remove('playing');
}

musicBtn.addEventListener('click', () => {
    // مقطع صوتي مخصص ← تشغيل عبر عنصر audio حقيقي
    if (isCustomMusic()) {
        if (!audioEl) {
            audioEl = new Audio(data.music.custom);
            audioEl.loop = true;
        }
        if (musicOn) {
            stopMusic();
        } else {
            audioEl.play().catch(() => {});
            musicOn = true;
            musicBtn.classList.add('playing');
            clearTimeout(musicTimer);
        }
        return;
    }

    // فئة مدمجة ← أغنية مولّدة عبر WebAudio (كورال + باس + لحن)
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    musicOn = !musicOn;
    if (musicOn) {
        musicBtn.classList.add('playing');
        playSong();
    } else {
        stopMusic();
    }
});

// ---------- البدء ----------
loadInvite().then((ok) => { if (ok) initRender(); });
````

---

## studio\assets\builder.js

````js
const $ = (id) => document.getElementById(id);

// ---------- حالة الافتراضية ----------
const DEFAULT_DATA = {
    tpl: 'classic',
    occasion: 'wedding',
    occasionName: '',
    phone: '',
    env: true,
    groom: 'آدم',
    bride: 'لارا',
    calligraphy: 'L & A',
    welcome: 'يسعدنا دعوتكم لمشاركتنا فرحة زواجنا',
    date: '2026-09-24',
    time: '19:00',
    rsvpDeadline: '2026-09-10',
    venue: 'قاعة الياسمين',
    address: 'طريق الأمير سلطان، جدة',
    mapQuery: 'فندق روزوود جدة',
    story: [
        { title: 'البداية', text: 'التقينا في الربيع الماضي في مقهى صغير، وأدركنا أن هذه بداية حكاية جميلة.' },
        { title: 'الخطوبة', text: 'في حضور العائلتين، اتخذنا أجمل قرار في حياتنا.' },
        { title: 'الزفاف', text: 'الآن نستعد لأجمل فصل في حياتنا، وننتظر أن نرى ضيوفنا الأعزاء.' }
    ],
    program: [
        { time: '07:00 مساءً', title: 'استقبال الضيوف', text: 'باب الضيافة مفتوح وأنتم على رأس القائمة.' },
        { time: '07:30 مساءً', title: 'مراسم العقد', text: 'لحظة توقيع عقد الزواج بمشاركة العائلتين.' },
        { time: '09:00 مساءً', title: 'مأدبة العشاء', text: 'مأدبة عشاء فاخرة على أنغام الموسيقى.' }
    ],
    closer: 'قرأتما وشاهدتما كل شيء... انتظرونا في الموعد المحدد لنحتفل معاً ❤',
    footerNames: 'لارا & آدم',
    whatsapp: '',
    photos: [],
    coverIdx: 0,
    music: { kind: 'category', category: 'soft', custom: '' }
};

let data = { ...DEFAULT_DATA };

// ---------- المناسبات (مفاتيح ثابتة + تسميات ثنائية اللغة) ----------
const OCCS = [
    { key: 'wedding', emoji: '💍' },
    { key: 'engagement', emoji: '💞' },
    { key: 'birthday', emoji: '🎂' },
    { key: 'graduation', emoji: '🎓' },
    { key: 'baby', emoji: '👶' },
    { key: 'queen', emoji: '👑' },
    { key: 'opening', emoji: '🏪' },
    { key: 'family', emoji: '👨‍👩‍👧‍👦' },
    { key: 'religious', emoji: '🕌' },
    { key: 'other', emoji: '✨' }
];
const OCC_LEGACY = { 'زفاف': 'wedding', 'خطوبة': 'engagement', 'عيد ميلاد': 'birthday', 'تخرج': 'graduation', 'استقبال مولود': 'baby', 'حفل ملكة': 'queen', 'افتتاح / مناسبة عمل': 'opening', 'لقاء عائلي': 'family', 'مناسبة دينية': 'religious', 'أخرى': 'other' };
function occKey(v) {
    const s = String(v || '').trim();
    if (OCCS.some((o) => o.key === s)) return s;
    return OCC_LEGACY[s] || 'other';
}
function occLabel(k) { return I18N.t('occ_' + occKey(k)); }
function buildOccasionOptions(keep) {
    const sel = $('fOccasion');
    const prev = keep !== undefined ? keep : sel.value;
    sel.innerHTML = OCCS.map((o) => '<option value="' + o.key + '">' + o.emoji + ' ' + occLabel(o.key) + '</option>').join('');
    if (prev) sel.value = occKey(prev);
    else sel.value = data.occasion;
}

// ---------- تحميل محفوظ ----------
try {
    const saved = localStorage.getItem('invite-studio.builder');
    if (saved) data = { ...DEFAULT_DATA, ...JSON.parse(saved) };
} catch (e) {}
data.occasion = occKey(data.occasion);
data.music = Object.assign({ kind: 'category', category: 'soft', custom: '' }, data.music || {});

// ---------- فئات الموسيقى ----------
const MUSICS = [
    { key: 'soft', emoji: '🌿' },
    { key: 'oriental', emoji: '🕌' },
    { key: 'western', emoji: '🎻' },
    { key: 'classic', emoji: '🎹' },
    { key: 'none', emoji: '🔇' }
];
function musicLabel(k) { return I18N.t('mus_k_' + (MUSICS.some((m) => m.key === k) ? k : 'soft')); }

function renderMusicPicker() {
    const box = $('musicPicker');
    if (!box) return;
    const active = data.music.kind === 'category' ? data.music.category : 'soft';
    box.innerHTML = MUSICS.map((m) =>
        '<button type="button" class="music-chip' + (m.key === active ? ' selected' : '') + '" data-music="' + m.key + '">' +
        m.emoji + ' ' + musicLabel(m.key) + '</button>'
    ).join('');
    box.querySelectorAll('.music-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
            data.music.kind = 'category';
            data.music.category = btn.dataset.music;
            data.music.custom = data.music.custom || '';
            renderMusicPicker();
            saveNow();
        });
    });
}

function renderMusicPreview() {
    const box = $('musicPreviewBox');
    if (!box) return;
    const hasCustom = data.music && data.music.kind === 'custom' && data.music.custom;
    box.style.display = hasCustom ? 'flex' : 'none';
    if (hasCustom) $('musicPreview').src = data.music.custom;
}

$('musicInput').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!/^audio\//.test(f.type)) { alert(I18N.t('mus_bad')); return; }
    if (f.size > 4 * 1024 * 1024) { alert(I18N.t('mus_big')); return; }
    const reader = new FileReader();
    reader.onload = () => {
        data.music.kind = 'custom';
        data.music.custom = reader.result;
        renderMusicPicker();
        renderMusicPreview();
        renderPreview();
        saveNow();
    };
    reader.readAsDataURL(f);
});

$('musicClear').addEventListener('click', () => {
    data.music = { kind: 'category', category: 'none', custom: '' };
    renderMusicPicker();
    renderMusicPreview();
    saveNow();
});

// ---------- تعبئة النماذج من البيانات ----------
function fillForm() {
    $('fOccasion').value = data.occasion;
    $('fOccasionName').value = data.occasionName || '';
    $('fPhone').value = data.phone || '';
    $('fGroom').value = data.groom;
    $('fBride').value = data.bride;
    $('fCalligraphy').value = data.calligraphy;
    $('fWelcome').value = data.welcome;
    $('fDate').value = data.date;
    $('fTime').value = data.time;
    $('fRsvpDeadline').value = data.rsvpDeadline;
    $('fVenue').value = data.venue;
    $('fAddress').value = data.address;
    $('fMapQuery').value = data.mapQuery;
    $('fCloser').value = data.closer;
    $('fFooterNames').value = data.footerNames;
    $('fWhatsapp').value = data.whatsapp || '';
    if (data.env === undefined) data.env = true;
    const fEnv = document.getElementById('fEnv');
    if (fEnv) fEnv.checked = !!data.env;
    document.querySelectorAll('.tpl-option').forEach((el) => {
        el.classList.toggle('selected', el.dataset.tpl === data.tpl);
    });
    renderStory();
    renderProgram();
    renderPhotos();
}

function collect() {
    data.tpl = document.querySelector('.tpl-option.selected')?.dataset.tpl || 'classic';
    data.occasion = occKey($('fOccasion').value);
    data.occasionName = $('fOccasionName').value.trim();
    data.phone = $('fPhone').value.trim();
    data.occasionLabel = occLabel(data.occasion);
    data.groom = $('fGroom').value;
    data.bride = $('fBride').value;
    data.calligraphy = $('fCalligraphy').value || 'L & A';
    data.welcome = $('fWelcome').value;
    data.date = $('fDate').value;
    data.time = $('fTime').value;
    data.rsvpDeadline = $('fRsvpDeadline').value;
    data.venue = $('fVenue').value;
    data.address = $('fAddress').value;
    data.mapQuery = $('fMapQuery').value;
    data.closer = $('fCloser').value;
    data.footerNames = $('fFooterNames').value;
    data.whatsapp = $('fWhatsapp').value;
    data.env = !!document.getElementById('fEnv')?.checked;

    data.story = [];
    document.querySelectorAll('#storyRepeater .rep-item').forEach((item, i) => {
        data.story.push({ title: item.querySelector('.st-title').value, text: item.querySelector('.st-text').value });
    });
    data.program = [];
    document.querySelectorAll('#programRepeater .rep-item').forEach((item, i) => {
        data.program.push({ time: item.querySelector('.pr-time').value, title: item.querySelector('.pr-title').value, text: item.querySelector('.pr-text').value });
    });

    try {
        localStorage.setItem('invite-studio.builder', JSON.stringify(data));
    } catch (e) {
        // تجاوز حد التخزين: نبقي النصوص ونزيل بعض الصور القديمة
        const photos = data.photos;
        if (photos.length > 3) photos.splice(3);
        try { localStorage.setItem('invite-studio.builder', JSON.stringify(data)); }
        catch (e2) { console.warn('تخزين غير متاح', e2); }
    }
}

// ---------- معاينة حية ----------
function renderPreview() {
    collect();
    const bp = $('bpScreen');
    bp.classList.remove('tpl-classic', 'tpl-rose', 'tpl-modern');
    bp.classList.add('tpl-' + data.tpl);

    // ثيم على مستوى الصفحة
    document.querySelector('.preview-phone').style.setProperty('--role-gold', 'inherit');

    $('bpCalligraphy').textContent = data.calligraphy;
    $('bpNames').textContent = data.groom + ' & ' + data.bride;
    const bpEnvN = document.getElementById('bpEnvNames');
    if (bpEnvN) bpEnvN.textContent = data.calligraphy || (data.groom + ' & ' + data.bride);
    const bpSeal = document.getElementById('bpEnvSeal');
    if (bpSeal) {
        const g = String(data.groom || '').trim();
        const b = String(data.bride || '').trim();
        const fg = g ? Array.from(g)[0] : '';
        const fb = b ? Array.from(b)[0] : '';
        bpSeal.textContent = (fg || fb) ? fg + '&' + fb : '❤';
    }
    $('bpOccasion').textContent = (data.occasionName || occLabel(data.occasion)) + ' — ' + I18N.t('invitation_word');
    $('bpWelcome').textContent = data.welcome;
    $('bpVenue').textContent = data.venue || 'قاعة الياسمين';
    $('bpAddress').textContent = data.address || '';

    // الخريطة الحية
    updateMapPreview();

    // التاريخ
    const d = data.date ? new Date(data.date + (data.time ? 'T' + data.time : '')) : null;
    if (d && !isNaN(d)) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        $('bpDate').textContent = dd + ' / ' + mm + ' / ' + yyyy;
    } else {
        $('bpDate').textContent = '— / — / —';
    }

    // العد التنازلي (مؤقت للمعاينة)
    const timerEl = $('bpTimer');
    timerEl.innerHTML = '';
    if (d && !isNaN(d)) {
        let diff = d.getTime() - Date.now();
        if (diff < 0) diff = 86400000;
        const sec = Math.floor(diff / 1000) % 60;
        const min = Math.floor(diff / 60000) % 60;
        const hr = Math.floor(diff / 3600000) % 24;
        const day = Math.floor(diff / 86400000);
        [day, hr, min, sec].forEach((v) => {
            const box = document.createElement('div');
            box.className = 'bp-tbox';
            box.innerHTML = '<b>' + String(v).padStart(2, '0') + '</b><small></small>';
            timerEl.appendChild(box);
        });
    }

    // معرض الصور في هاتف المعاينة
    const gEl = $('bpGallery');
    gEl.innerHTML = '';
    if (data.photos && data.photos.length) {
        const shown = data.photos.slice(0, 6);
        shown.forEach((p, i) => {
            const c = document.createElement('div');
            c.className = 'g-cell' + (i === data.coverIdx ? ' g-cover' : '');
            c.innerHTML = '<img src="' + p + '" alt="">';
            gEl.appendChild(c);
        });
        if (data.photos.length > 6) {
            const more = document.createElement('div');
            more.className = 'g-cell g-more';
            more.textContent = '+' + (data.photos.length - 6);
            gEl.appendChild(more);
        }
    } else {
        const ph = document.createElement('div');
        ph.className = 'note-text';
        ph.textContent = I18N.t('no_photos_yet');
        gEl.appendChild(ph);
    }
}

// ---------- Repeaters ----------
function renderStory() {
    const r = $('storyRepeater');
    r.innerHTML = '';
    data.story.forEach((s) => r.appendChild(storyItem(s)));
}
function storyItem(s) {
    const el = document.createElement('div');
    el.className = 'rep-item';
    el.innerHTML = `
        <button class="remove-rep" type="button">✕</button>
        <div class="field-row">
            <div class="field"><label>${I18N.t('rep_title')}</label><input class="st-title" value="${esc(s.title)}"></div>
        </div>
        <div class="field"><label>${I18N.t('rep_text')}</label><textarea class="st-text" rows="2">${esc(s.text)}</textarea></div>`;
    el.querySelector('.remove-rep').addEventListener('click', () => {
        data.story = data.story.filter((_, i) => i !== data.story.findIndex((x) => x === s));
        renderStory();
    });
    return el;
}
function renderProgram() {
    const r = $('programRepeater');
    r.innerHTML = '';
    data.program.forEach((p) => r.appendChild(programItem(p)));
}
function programItem(p) {
    const el = document.createElement('div');
    el.className = 'rep-item';
    el.innerHTML = `
        <button class="remove-rep" type="button">✕</button>
        <div class="field-row">
            <div class="field"><label>${I18N.t('pr_time')}</label><input class="pr-time" value="${esc(p.time)}"></div>
            <div class="field"><label>${I18N.t('pr_title')}</label><input class="pr-title" value="${esc(p.title)}"></div>
        </div>
        <div class="field"><label>${I18N.t('pr_desc')}</label><input class="pr-text" value="${esc(p.text)}"></div>`;
    el.querySelector('.remove-rep').addEventListener('click', () => {
        data.program = data.program.filter((_, i) => i !== data.program.findIndex((x) => x === p));
        renderProgram();
    });
    return el;
}
function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

$('addStory').addEventListener('click', () => {
    data.story.push({ title: I18N.t('st_add_title'), text: I18N.t('st_add_text') });
    renderStory();
});
$('addProgram').addEventListener('click', () => {
    data.program.push({ time: I18N.t('pr_add_time'), title: I18N.t('pr_add_title'), text: I18N.t('pr_add_text') });
    renderProgram();
});

// ---------- التنقل بين الخطوات ----------
let step = 0;
const steps = document.querySelectorAll('.builder-card');
const chips = document.querySelectorAll('.step-chip');

function goTo(n) {
    step = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach((c, i) => c.classList.toggle('active', i === step));
    chips.forEach((c, i) => {
        c.classList.toggle('active', i === step);
        c.classList.toggle('done', i < step);
    });
    $('prevBtn').style.visibility = step === 0 ? 'hidden' : 'visible';
    $('nextBtn').textContent = step === steps.length - 1 ? I18N.t('b_last') : I18N.t('b_next');
}
chips.forEach((c) => c.addEventListener('click', () => goTo(parseInt(c.dataset.step))));
$('prevBtn').addEventListener('click', () => goTo(step - 1));
$('nextBtn').addEventListener('click', () => {
    collect();
    if (step === steps.length - 1) {
        window.location.href = 'preview.html';
    } else {
        goTo(step + 1);
    }
});

// المعاينة الكاملة
$('fullPreviewBtn').addEventListener('click', () => {
    collect();
    window.location.href = 'preview.html';
});
$('previewTopBtn').addEventListener('click', (e) => {
    e.preventDefault();
    collect();
    window.location.href = 'preview.html';
});
$('openToolbar').addEventListener('click', (e) => {
    e.preventDefault();
    alert(I18N.t('gallery_note'));
});

// المظروف بختم الشمع في معاينة الهاتف (اختياري حسب المفتاح)
const bpEnv = $('bpEnv');
const fEnvBox = document.getElementById('fEnv');
function bpEnvSync() {
    const screen = $('bpScreen');
    const envCard = bpEnv ? bpEnv.querySelector('.env') : null;
    if (fEnvBox && !fEnvBox.checked) {
        screen.classList.add('env-opened');
        screen.scrollTop = 0;
    } else {
        screen.classList.remove('env-opened');
        if (envCard) envCard.classList.remove('open');
    }
}
if (fEnvBox) fEnvBox.addEventListener('change', bpEnvSync);
if (bpEnv) bpEnv.addEventListener('click', () => {
    if (fEnvBox && !fEnvBox.checked) return;
    const envCard = bpEnv.querySelector('.env');
    if (envCard) envCard.classList.add('open');
    setTimeout(() => {
        const screen = $('bpScreen');
        screen.classList.add('env-opened');
        screen.scrollTop = 0;
    }, 1150);
});
bpEnvSync();

// ---------- خريطة جوجل الحية في المنشئ ----------
function updateMapPreview() {
    const q = (data.mapQuery || data.venue || data.address || '').trim();
    const frame = $('mapPreview');
    if (!frame) return;
    frame.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=14&output=embed&hl=' + (I18N.get() === 'en' ? 'en' : 'ar');
}

// ---------- الصور ----------
function renderPhotos() {
    const grid = $('photoGrid');
    grid.innerHTML = '';
    const photos = data.photos || [];
    if (!photos.length) {
        $('photoNotice').textContent = '';
        return;
    }
    photos.forEach((src, i) => {
        const cell = document.createElement('div');
        cell.className = 'photo-cell';
        cell.innerHTML =
            '<img src="' + src + '" alt="صورة ' + (i + 1) + '">' +
            '<button type="button" class="star' + (i === data.coverIdx ? ' active' : '') + '" title="اجعلها رئيسية">★</button>' +
            '<button type="button" class="del" title="حذف">✕</button>' +
            (i === data.coverIdx ? '<span class="cover-tag">الصورة الرئيسية</span>' : '');
        cell.querySelector('.star').addEventListener('click', () => {
            data.coverIdx = i;
            renderPhotos();
            renderPreview();
            saveNow();
        });
        cell.querySelector('.del').addEventListener('click', () => {
            data.photos.splice(i, 1);
            if (data.coverIdx >= data.photos.length) data.coverIdx = data.photos.length - 1;
            if (data.coverIdx < 0) data.coverIdx = 0;
            renderPhotos();
            renderPreview();
            saveNow();
        });
        grid.appendChild(cell);
    });
    $('photoNotice').textContent = I18N.f('photo_notice', { n: photos.length });
}

// ضغط صورة وتخزينها كـ Data URL داخل localStorage
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const MAX = 800;
                let { width, height } = img;
                if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.72));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

$('photoInput').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    await handleFiles(files);
    e.target.value = '';
});

// السحب والإفلات
const dropZone = document.querySelector('.photo-drop');
['dragover', 'dragenter'].forEach((ev) => dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.style.background = 'rgba(194,154,91,0.2)'; }));
['dragleave', 'drop'].forEach((ev) => dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.style.background = ''; }));
dropZone.addEventListener('drop', async (e) => {
    const files = Array.from(e.dataTransfer.files);
    if (files.length) await handleFiles(files);
});

async function handleFiles(files) {
    if (!files.length) return;
    if ((data.photos.length + files.length) > 9) {
        alert(I18N.t('photo_max'));
        return;
    }
    $('photoNotice').textContent = I18N.t('photo_proc');
    for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        try {
            const compressed = await compressImage(f);
            data.photos.push(compressed);
        } catch (err) { console.warn(err); }
    }
    try {
        saveNow();
        renderPhotos();
        renderPreview();
        $('photoNotice').textContent = I18N.t('photo_ok');
    } catch (err) {
        // تجاوز حد التخزين
        data.photos = data.photos.slice(0, 3);
        localStorage.setItem('invite-studio.builder', JSON.stringify(data));
        renderPhotos();
        renderPreview();
        $('photoNotice').textContent = I18N.t('photo_full');
    }
}

// ---------- النشر ومشاركة الرابط ----------
async function publishInvite() {
    const btn = $('publishBtn');
    const result = $('publishResult');
    btn.disabled = true;
    btn.textContent = I18N.t('pub_loading');
    result.innerHTML = '';

    collect();

    // التحقق قبل الإنهاء: الهاتف واسم المناسبة مطلوبان للإرسال إلى فريق المنصة
    if (!data.phone || String(data.phone).replace(/\D/g, '').length < 9) {
        btn.disabled = false;
        btn.textContent = I18N.t('pub_btn');
        result.innerHTML = '<p class="publish-err">' + I18N.t('fin_phone_err') + '</p>';
        goTo(1);
        return;
    }
    if (!data.occasionName) {
        btn.disabled = false;
        btn.textContent = I18N.t('pub_btn');
        result.innerHTML = '<p class="publish-err">' + I18N.t('fin_occ_err') + '</p>';
        goTo(1);
        return;
    }

    if (!window.location.protocol.startsWith('http')) {
        result.innerHTML = '<p class="publish-err">' + I18N.t('pub_warn') + '</p>';
        btn.disabled = false;
        btn.textContent = I18N.t('pub_btn');
        return;
    }

    try {
        collect();

        // الصور تُرسل مضمّنة (data URLs)؛ يقرر الخادم تخزينها في قاعدة البيانات أو على القرص
        const payload = { ...data };
        payload.photos = Array.isArray(data.photos) ? data.photos : [];

        const res = await fetch('/api/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(I18N.t('pub_err'));
        const j = await res.json();

        const link = (window.location.origin + j.url).replace(/\/$/, '');
        result.innerHTML =
            '<p class="publish-done">' + I18N.t('pub_ok') + '</p>' +
            '<div class="publish-link"><input id="pubLink" value="' + link + '" readonly onclick="this.select()">' +
            '<button class="copy-btn" id="pubCopy">' + I18N.t('pub_copy') + '</button></div>' +
            '<p class="publish-note">' + I18N.t('pub_note') + '</p>';

        document.getElementById('pubCopy').addEventListener('click', () => {
            const inp = document.getElementById('pubLink');
            inp.select();
            try { navigator.clipboard.writeText(link); } catch (e) {}
            document.getElementById('pubCopy').textContent = I18N.t('pub_copied');
            setTimeout(() => { document.getElementById('pubCopy').textContent = I18N.t('pub_copy'); }, 2000);
        });
    } catch (err) {
        result.innerHTML = '<p class="publish-err">⚠️ ' + (err.message || I18N.t('pub_errgen')) + '</p>';
    }
    btn.disabled = false;
    btn.textContent = I18N.t('pub_btn');
}

$('publishBtn').addEventListener('click', publishInvite);

// ---------- اللغة ----------
function wireLang() {
    const btn = document.getElementById('langBtn');
    const btnM = document.getElementById('langBtnM');
    const sync = () => { const txt = I18N.get() === 'ar' ? I18N.t('lang_btn_en') : I18N.t('lang_btn_ar'); if (btn) btn.textContent = txt; if (btnM) btnM.textContent = txt; };
    if (btn) btn.addEventListener('click', () => { I18N.toggle(); });
    if (btnM) btnM.addEventListener('click', () => { I18N.toggle(); });
    sync();
}
wireLang();
document.addEventListener('langchange', () => {
    collect();
    buildOccasionOptions(data.occasion);
    fillForm();
    renderMusicPicker();
    renderMusicPreview();
    renderStory();
    renderProgram();
    renderPhotos();
    renderPreview();
    goTo(step);
});
buildOccasionOptions();

// ---------- ربط الأحداث ----------
document.querySelectorAll('.tpl-option').forEach((el) => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.tpl-option').forEach((x) => x.classList.remove('selected'));
        el.classList.add('selected');
        data.tpl = el.dataset.tpl;
        renderPreview();
        saveNow();
    });
});
document.querySelectorAll('.builder-card input, .builder-card select, .builder-card textarea').forEach((el) => {
    el.addEventListener('input', () => { renderPreview(); saveNow(); });
});
document.querySelector('#storyRepeater').addEventListener('input', () => { renderPreview(); saveNow(); });
document.querySelector('#programRepeater').addEventListener('input', () => { renderPreview(); saveNow(); });

function saveNow() {
    collect();
}

// ---------- تهيئة ----------
fillForm();
renderMusicPicker();
renderMusicPreview();
renderPreview();
goTo(0);

// تحديث العد التنازلي في المعاينة كل ثانية
setInterval(renderPreview, 1000);

// قائمة الموبايل
document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileMenu').classList.add('open'));
document.getElementById('closeMenu').addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open'));
````

---

## studio\assets\theme.js

````js
/* theme.js — الوضع الليلي / النهاري (dark / light)
 * - يقرأ التفضيل المحفوظ أو يتبع إعدادات النظام تلقائياً
 * - يضيف كلاس `dark` على <html> لتطبيق ألوان CSS
 * - يفرش زر تبديل عائم (.theme-fab) في كل صفحة إن لم يوجد
 * - يحدّث meta theme-color ليتناسق مع الوضع
 */
(function () {
    'use strict';

    var KEY = 'invite-studio.theme';

    function current() {
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch (e) {}
        if (saved === 'dark' || saved === 'light') return saved;
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    function apply(theme) {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.setAttribute('data-theme', theme);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#1E1613' : '#F5DCD8';
    }

    function sync() {
        var theme = current();
        document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
            el.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
        document.querySelectorAll('.theme-fab').forEach(function (fab) {
            fab.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    }

    function toggle() {
        var next = current() === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(KEY, next); } catch (e) {}
        apply(next);
        sync();
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    }

    window.Theme = { get: current, toggle: toggle, apply: apply };

    apply(current());

    function boot() {
        if (!document.querySelector('.theme-fab')) {
            var fab = document.createElement('button');
            fab.type = 'button';
            fab.className = 'theme-fab';
            fab.setAttribute('aria-label', 'Dark / light mode');
            fab.addEventListener('click', toggle);
            document.body.appendChild(fab);
        }
        sync();
        document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
            el.addEventListener('click', toggle);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
````

---

## invitations\assets\wax-seal.svg

````xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>3D digital wax seal stamp, rose gold, embossed letter S with botanical leaves</title>
  <defs>
    <linearGradient id="metalFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#FCE6D0"/>
      <stop offset="0.16" stop-color="#F2C9A3"/>
      <stop offset="0.4"  stop-color="#DFA175"/>
      <stop offset="0.58" stop-color="#C67F50"/>
      <stop offset="0.76" stop-color="#A75F36"/>
      <stop offset="0.9"  stop-color="#8A4320"/>
      <stop offset="1"    stop-color="#6B2E12"/>
    </linearGradient>

    <radialGradient id="sheen" cx="0.36" cy="0.28" r="0.85">
      <stop offset="0"    stop-color="#FFFFFF" stop-opacity="0.3"/>
      <stop offset="0.3"  stop-color="#FFEEDB" stop-opacity="0.1"/>
      <stop offset="0.62" stop-color="#000000" stop-opacity="0"/>
      <stop offset="0.85" stop-color="#2E1206" stop-opacity="0.1"/>
      <stop offset="1"    stop-color="#3A1606" stop-opacity="0.28"/>
    </radialGradient>

    <linearGradient id="letterBright" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#FFF3DF"/>
      <stop offset="0.5"  stop-color="#E2A97B"/>
      <stop offset="1"    stop-color="#9C5428"/>
    </linearGradient>

    <linearGradient id="leafFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#F8D7B5"/>
      <stop offset="0.5"  stop-color="#C9824F"/>
      <stop offset="1"    stop-color="#753516"/>
    </linearGradient>

    <linearGradient id="beadFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#FBE0C0"/>
      <stop offset="1"    stop-color="#93471F"/>
    </linearGradient>

    <linearGradient id="topGlow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>

    <!-- وجه شمعي عضوي = ختم بارز -->
    <filter id="sealEdge" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="5" result="disp"/>
      <feDisplacementMap in="SourceGraphic" in2="disp" scale="17" xChannelSelector="R" yChannelSelector="G" result="warped"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="12" result="grainT"/>
      <feColorMatrix in="grainT" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.085 0" result="grainA"/>
      <feComposite operator="in" in="grainA" in2="warped" result="grainClip"/>
      <feBlend mode="multiply" in="grainClip" in2="warped"/>
    </filter>

    <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="microBlur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>

    <!-- ورقة (تتشعب من الطرف الأيسر لليمين) -->
    <g id="leaf">
      <path d="M0 0 Q42 -58 86 0 Q42 58 0 0 Z" fill="url(#leafFace)" stroke="#6B2A0E" stroke-width="3"/>
      <path d="M3 0 Q45 -9 83 0" fill="none" stroke="#FFE9CD" stroke-width="2.5" opacity=".85"/>
      <path d="M3 0 Q45 32 83 0" fill="none" stroke="#54200A" stroke-width="2" opacity=".5"/>
    </g>
  </defs>

  <!-- خلفية خضراء صلبة للعزل / الاستخلاص -->
  <rect width="1024" height="1024" fill="#00A64E"/>

  <!-- ظل سفلي ناعم -->
  <ellipse cx="512" cy="636" rx="362" ry="318" fill="#04200E" opacity="0.5" filter="url(#softBlur)"/>

  <!-- جسم الختم -->
  <g filter="url(#sealEdge)">
    <circle cx="512" cy="512" r="330" fill="url(#metalFace)"/>
    <circle cx="512" cy="512" r="318" fill="none" stroke="#8A4520" stroke-width="10" opacity="0.55"/>
    <circle cx="512" cy="512" r="330" fill="url(#sheen)"/>

    <!-- حافة داخلية محفورة -->
    <circle cx="512" cy="512" r="258" fill="none" stroke="#6E2D11" stroke-width="14"/>
    <circle cx="512" cy="512" r="258" fill="none" stroke="#F6CFA9" stroke-width="5"/>

    <!-- خرز زخرفي -->
    <circle cx="512" cy="512" r="288" fill="none" stroke="url(#beadFace)" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 30"/>

    <!-- لمعان علوي -->
    <path d="M 300 226 A 330 330 0 0 1 724 226" fill="none" stroke="url(#topGlow)" stroke-width="40" filter="url(#microBlur)" opacity="0.5"/>
  </g>

  <!-- أغصان نباتية (غار) على الجانبين -->
  <g>
    <!-- يسار -->
    <use href="#leaf" transform="translate(214 728) rotate(-64)"/>
    <use href="#leaf" transform="translate(252 706) rotate(-36)"/>
    <use href="#leaf" transform="translate(290 660) rotate(-10)"/>
    <!-- يمين -->
    <use href="#leaf" transform="translate(810 728) rotate(64) scale(-1,1)"/>
    <use href="#leaf" transform="translate(772 706) rotate(36) scale(-1,1)"/>
    <use href="#leaf" transform="translate(734 660) rotate(10) scale(-1,1)"/>

    <!-- الحرف S محفور بارز -->
    <g transform="rotate(-4 512 512)"
       font-family="'Playfair Display','Georgia','Times New Roman',serif"
       font-weight="700" font-size="252"
       text-anchor="middle" dominant-baseline="central">
      <text x="512" y="514" fill="#4A1C07" transform="translate(9 13)" opacity="0.92">S</text>
      <text x="512" y="514" fill="#FFF2DC" transform="translate(-8 -9)">S</text>
      <text x="512" y="514" fill="url(#letterBright)">S</text>
    </g>
  </g>
</svg>
````

---

## invitations\luxury\index.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#F5DCD8">
    <title>دعوة زفاف | لارا وآدم</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,500&family=Playfair+Display:wght@500;600;700&family=El+Messiri:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=Pinyon+Script&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- زخارف أزهار -->
    <svg class="floral floral-tl" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#C29A5B" stroke-width="1.2" opacity=".55">
            <circle cx="26" cy="26" r="7"/><ellipse cx="26" cy="19" rx="4.5" ry="7"/>
            <ellipse cx="19" cy="26" rx="7" ry="4.5"/><ellipse cx="26" cy="33" rx="4.5" ry="7"/>
            <ellipse cx="33" cy="26" rx="7" ry="4.5"/>
            <path d="M26 26 Q44 8 62 12"/>
            <circle cx="62" cy="12" r="5"/>
        </g>
        <g fill="none" stroke="#C29A5B" stroke-width="1.2" opacity=".45">
            <path d="M26 33 Q20 52 30 60"/><ellipse cx="30" cy="64" rx="4" ry="6"/>
            <path d="M33 30 Q52 44 58 60"/><ellipse cx="59" cy="64" rx="4" ry="6"/>
        </g>
    </svg>
    <svg class="floral floral-br" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#C29A5B" stroke-width="1.2" opacity=".55">
            <circle cx="74" cy="74" r="7"/><ellipse cx="74" cy="67" rx="4.5" ry="7"/>
            <ellipse cx="67" cy="74" rx="7" ry="4.5"/><ellipse cx="74" cy="81" rx="4.5" ry="7"/>
            <ellipse cx="81" cy="74" rx="7" ry="4.5"/>
            <path d="M74 74 Q56 92 38 88"/>
            <circle cx="38" cy="88" r="5"/>
        </g>
    </svg>
    <svg class="floral floral-hero" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#C29A5B" stroke-width="1.3" opacity=".6">
            <circle cx="50" cy="50" r="9"/><ellipse cx="50" cy="40" rx="5.5" ry="9"/>
            <ellipse cx="40" cy="50" rx="9" ry="5.5"/><ellipse cx="50" cy="60" rx="5.5" ry="9"/>
            <ellipse cx="60" cy="50" rx="9" ry="5.5"/>
        </g>
    </svg>

    <!-- زر تشغيل الموسيقى -->
    <button id="musicBtn" class="music-btn" title="تشغيل الموسيقى">🎵</button>

    <!-- تخصيص الأسماء -->
    <button id="namesBtn" class="names-btn" title="تخصيص الأسماء">✎ تحرير الأسماء</button>
    <div id="namesPanel" class="names-panel">
        <label>اسم العريس
            <input id="editGroom" type="text" value="آدم">
        </label>
        <label>اسم العروس
            <input id="editBride" type="text" value="لارا">
        </label>
        <button id="namesApply">تطبيق</button>
    </div>

    <!-- شاشة فتح الظرف -->
    <div class="envelope-screen" id="envelopeScreen">
        <div class="envelope" onclick="openInvitation()">
            <div class="env-paper"><span class="env-calligraphy">L & A</span></div>
            <div class="env-flap"></div>
            <div class="env-front"></div>
            <div class="env-back"></div>
            <div class="wax-seal"><span class="seal-txt">A & L</span></div>
        </div>
        <p class="env-hint">اضغط على الظرف لفتح الدعوة</p>
    </div>

    <!-- محتوى الدعوة -->
    <div class="scroll-container" id="invitation">

        <!-- القسم الأول: الترحيب -->
        <section class="slide hero">
            <div class="hero-deco">❀</div>
            <p class="script-en">Together with their families</p>
            <h1 class="couple-ar">لارا <span class="amp">&</span> آدم</h1>
            <p class="sub">نتشرف بدعوتكم لمشاركتنا فرحة زواجنا</p>
            <div class="hero-date">
                <span>السبت</span>
                <span>24 سبتمبر</span>
                <span>2026</span>
            </div>
            <div class="scroll-cue">⬇ للتمرير</div>
        </section>

        <!-- القسم الثاني: العد التنازلي -->
        <section class="slide countdown-section">
            <p class="script-en">Counting the days</p>
            <h2>باقي على فرحتنا</h2>
            <div id="countdown" class="timer">
                <div class="time-box"><span id="days">00</span><small>يوم</small></div>
                <div class="time-box"><span id="hours">00</span><small>ساعة</small></div>
                <div class="time-box"><span id="minutes">00</span><small>دقيقة</small></div>
                <div class="time-box"><span id="seconds">00</span><small>ثانية</small></div>
            </div>
        </section>

        <!-- القسم الثالث: قصتنا -->
        <section class="slide story-section">
            <p class="script-en">Our Story</p>
            <h2>قصتنا</h2>
            <div class="story-line">
                <div class="story-item">
                    <span class="story-dot"></span>
                    <h3>البداية</h3>
                    <p>التقينا في ربيع 2019 في مقهى صغير، ومن أول محادثة عرفنا أن هذه بداية حكاية جميلة.</p>
                </div>
                <div class="story-item">
                    <span class="story-dot"></span>
                    <h3>الخطوبة</h3>
                    <p>في شتاء 2024، وفي حضور العائلتين، اتخذنا أجمل قرار في حياتنا.</p>
                </div>
                <div class="story-item">
                    <span class="story-dot"></span>
                    <h3>الزفاف</h3>
                    <p>وهنا نستعد لبداية فصلنا الأجمل، ونحن بأمس الشوق لمشاركتكم فرحتنا.</p>
                </div>
            </div>
        </section>

        <!-- القسم الرابع: برنامج الحفل -->
        <section class="slide program-section">
            <p class="script-en">The Celebration</p>
            <h2>برنامج الحفل</h2>
            <div class="program-cards">
                <div class="prog-card">
                    <div class="prog-time">7:00 مساءً</div>
                    <h3>استقبال الضيوف</h3>
                    <p>باب الضيافة مفتوح وطابور الاستقبال ينتظركم</p>
                </div>
                <div class="prog-card">
                    <div class="prog-time">7:30 مساءً</div>
                    <h3>مراسم العقد</h3>
                    <p>لحظة توقيع عقد الزواج بمشاركة العائلتين</p>
                </div>
                <div class="prog-card">
                    <div class="prog-time">9:00 مساءً</div>
                    <h3>مأدبة العشاء</h3>
                    <p>مأدبة عشاء فاخرة على أنغام الموسيقى</p>
                </div>
            </div>
        </section>

        <!-- القسم الخامس: الموقع -->
        <section class="slide venue-section">
            <p class="script-en">The Venue</p>
            <h2>مكان الحفل</h2>
            <p class="venue-name">قاعة الياسمين للمناسبات</p>
            <p class="venue-address">طريق الأمير سلطان، جدة</p>
            <a class="map-btn" href="https://maps.google.com/?q=Jeddah" target="_blank" rel="noopener">
                افتح الموقع في الخريطة
            </a>
        </section>

        <!-- القسم السادس: تأكيد الحضور -->
        <section class="slide rsvp-section">
            <p class="script-en">Will you join us?</p>
            <h2>تأكيد الحضور</h2>
            <p class="rsvp-hint">نتشرف بردّكم قبل 10 سبتمبر</p>
            <form id="rsvpForm">
                <input type="text" id="guestName" placeholder="الاسم الكريم" required>
                <select id="guestAttendance" required>
                    <option value="" disabled selected>هل ستشرفوننا بحضوركم؟</option>
                    <option value="yes">نعم، بكل سرور</option>
                    <option value="no">أعتذر، لا أستطيع الحضور</option>
                </select>
                <button type="submit">إرسال الرد</button>
            </form>
            <p class="form-message" id="formMessage"></p>
        </section>

        <!-- التذييل -->
        <footer class="footer">
            <div class="footer-calligraphy">L & A</div>
            <p>لارا & آدم</p>
            <p class="footer-note">24 . 09 . 2026 — انتظرونا في الموعد المحدد</p>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>
````

---

## invitations\luxury\style.css

````css
* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
    --blush: #F5DCD8;
    --blush-light: #FDF6F3;
    --cream: #FAF3EC;
    --gold: #C29A5B;
    --gold-dark: #A9824A;
    --text: #5A4A46;
    --text-soft: #9A8B86;
}

html { scroll-behavior: smooth; }

body {
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    background: var(--cream);
    color: var(--text);
    overflow: hidden;
    height: 100vh;
}

/* ---------- زر الموسيقى ---------- */
.music-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
    width: 48px;
    height: 48px;
    border: 1px solid rgba(194,154,91,0.5);
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s;
    opacity: 0;
    pointer-events: none;
}
.music-btn.playing { animation: spin 3s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ---------- شاشة الظرف ---------- */
.envelope-screen {
    position: fixed;
    inset: 0;
    background: radial-gradient(130% 110% at 70% 8%, #f9e8e4 0%, #fff9f6 40%, #fffdfb 68%, #f6e8e0 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    transition: opacity 0.8s ease;
}
.envelope-screen.fade-out { opacity: 0; pointer-events: none; }

.envelope {
    position: relative;
    width: 300px;
    height: 210px;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
}
@keyframes envLuxFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.envelope-screen::before {
    content: ''; position: absolute; top: -12vw; right: -10vw;
    width: 46vw; height: 46vw; max-width: 520px; max-height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(214,161,140,.5), transparent 68%);
    filter: blur(60px); pointer-events: none;
}
@media (min-width: 561px) { .envelope { animation: envLuxFloat 6s ease-in-out infinite; } }
.envelope:hover { animation: none; transform: scale(1.03); }
.env-back {
    position: absolute; inset: 0;
    background: #E8C6BE;
    border-radius: 8px;
    z-index: 0;
}
.env-paper {
    position: absolute; left: 20px; right: 20px; top: 26px; bottom: 40px;
    background: #FFFDF6; border-radius: 4px; z-index: 2;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 10px 22px rgba(0,0,0,.18);
    transition: transform .9s cubic-bezier(.2,.9,.3,1.14);
}
.envelope .env-calligraphy { font-family: 'Pinyon Script', cursive; font-size: 36px; color: var(--gold); }
.envelope.open .env-paper { transform: translateY(-150%) scale(1.05) rotate(-1.5deg); z-index: 10; }

.env-front {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #F6E3DC, #EFCFC6);
    border-radius: 8px;
    z-index: 4;
    clip-path: polygon(0 18%, 50% 62%, 100% 18%, 100% 100%, 0 100%);
}
.env-flap {
    position: absolute; top: 0; left: 0; width: 100%; height: 58%;
    background: linear-gradient(180deg, #EED8CF, #E2C8BE);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    border-radius: 8px 8px 0 0;
    transform-origin: top;
    z-index: 5;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
}
.envelope.open .env-flap { transform: rotateX(178deg); z-index: 1; }

.wax-seal {
    position: absolute;
    top: 118px; left: 50%;
    transform: translate(-50%, -50%) rotate(-5deg);
    width: 70px; height: 70px;
    border-radius: 53% 47% 60% 40% / 47% 61% 39% 55%;
    display: flex; align-items: center; justify-content: center;
    color: #FFF6EA;
    font-family: 'Pinyon Script', cursive;
    font-size: 23px;
    z-index: 6;
background:
        radial-gradient(circle at 30% 26%, rgba(255,236,218,.5) 0%, rgba(255,205,175,.16) 28%, transparent 56%),
        radial-gradient(circle at 68% 82%, rgba(70,8,6,.55) 30%, rgba(0,0,0,0) 62%),
        linear-gradient(155deg, #E8876A 0%, #C64A34 38%, #982517 66%, #6E120B 100%);
    box-shadow:
        0 8px 18px rgba(110,18,12,.45),
        0 2px 5px rgba(0,0,0,.25),
        inset 0 4px 7px rgba(255,228,206,.5),
        inset -4px -6px 12px rgba(60,4,2,.55),
        inset 0 0 0 1.5px rgba(255,210,180,.28),
        inset 0 0 0 6px rgba(115,18,12,.16);
    transition: transform .6s cubic-bezier(.34,1.56,.64,1), opacity .5s ease, filter .5s ease;
}
.wax-seal::before {
    content: ''; position: absolute; left: 6%; right: 6%; bottom: -13px; height: 28px;
    background:
        radial-gradient(ellipse 10px 14px at 12% 88%, #B13A28 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 6px 15px at 30% 76%, #D0543E 45%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 12px 17px at 52% 94%, #9E2619 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 7px 14px at 74% 82%, #C04936 50%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 5px 9px at 91% 90%, #B8402D 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 4px 6px at 42% 70%, #C74A36 50%, rgba(140,28,15,0) 60%);
    filter: blur(.35px);
}
.wax-seal::after {
    content: ''; position: absolute; inset: -1px; border-radius: inherit;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0'/></filter><rect width='150' height='150' filter='url(%23n)'/></svg>");
    background-size: 130px 130px;
    mix-blend-mode: multiply;
    opacity: .34;
    pointer-events: none;
}
.envelope.open .wax-seal { transform: translate(-50%, -50%) rotate(20deg) scale(1.5); opacity: 0; }

.env-hint {
    margin-top: 30px;
    color: #806862;
    font-size: 15px;
    letter-spacing: 0.5px;
    animation: probe 2s ease-in-out infinite;
}
@keyframes probe { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }

/* ---------- التمرير ---------- */
.scroll-container {
    height: 100vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    opacity: 0;
    transition: opacity 1s ease;
}
.scroll-container.visible { opacity: 1; }

.slide {
    min-height: 100vh;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
    position: relative;
}

/* ---------- نصوص مشتركة ---------- */
.script-en {
    font-family: 'Pinyon Script', cursive;
    font-size: 34px;
    color: var(--gold);
    margin-bottom: 6px;
}
h2 {
    font-family: 'El Messiri', serif;
    font-size: 34px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 30px;
}

/* ---------- الترحيب ---------- */
.hero { background: linear-gradient(160deg, #F5DCD8, #FDF3EF 60%, #FBE98F22); }
.hero-deco { font-size: 40px; color: var(--gold); margin-bottom: 10px; }
.couple-ar {
    font-family: 'El Messiri', serif;
    font-size: 56px;
    font-weight: 700;
    color: var(--text);
}
.couple-ar .amp { font-family: 'Cormorant Garamond', serif; color: var(--gold); font-style: italic; }
.sub { color: var(--text-soft); font-weight: 300; margin-top: 12px; font-size: 17px; }
.hero-date {
    display: flex; gap: 28px;
    margin-top: 30px;
    font-family: 'El Messiri', serif;
}
.hero-date span { font-size: 15px; color: var(--text-soft); border-bottom: 1px solid var(--gold); padding-bottom: 6px; }
.scroll-cue {
    position: absolute; bottom: 30px;
    color: var(--text-soft);
    font-size: 13px;
    animation: bounce 2s infinite;
}
@keyframes bounce { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(8px);} }

/* ---------- العد التنازلي ---------- */
.countdown-section { background: var(--blush-light); }
.timer { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.time-box {
    min-width: 84px;
    padding: 22px 10px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(194,154,91,0.15);
    border: 1px solid rgba(194,154,91,0.25);
}
.time-box span {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 600;
    color: var(--gold-dark);
}
.time-box small { color: var(--text-soft); font-size: 13px; }

/* ---------- القصة ---------- */
.story-section { background: #FFFDFB; }
.story-line { border-right: 2px solid rgba(194,154,91,0.4); max-width: 340px; padding-right: 24px; margin-top: 10px; }
.story-item { position: relative; margin-bottom: 34px; text-align: right; }
.story-dot {
    position: absolute;
    right: -33px; top: 6px;
    width: 14px; height: 14px;
    background: var(--gold);
    border-radius: 50%;
    box-shadow: 0 0 0 4px #fff, 0 0 0 6px rgba(194,154,91,0.3);
}
.story-item h3 { font-family: 'El Messiri', serif; color: var(--gold-dark); margin-bottom: 6px; }
.story-item p { color: var(--text-soft); font-size: 14px; line-height: 1.8; }

/* ---------- البرنامج ---------- */
.program-section { background: linear-gradient(160deg, #F5DCD8, #FFF5F0); }
.program-cards { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 380px; }
.prog-card {
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(194,154,91,0.25);
    border-radius: 14px;
    padding: 20px 24px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.05);
    transition: transform 0.3s;
}
.prog-card:hover { transform: translateY(-4px); }
.prog-time {
    font-family: 'Pinyon Script', cursive;
    font-size: 26px;
    color: var(--gold-dark);
}
.prog-card h3 { font-family: 'El Messiri', serif; margin: 4px 0; }
.prog-card p { color: var(--text-soft); font-size: 13px; }

/* ---------- المكان ---------- */
.venue-section { background: #FFFDFB; }
.venue-name { font-family: 'El Messiri', serif; font-size: 24px; color: var(--text); }
.venue-address { color: var(--text-soft); margin-top: 8px; font-size: 15px; }
.map-btn {
    display: inline-block;
    margin-top: 24px;
    padding: 12px 26px;
    background: var(--gold);
    color: #fff;
    border-radius: 30px;
    text-decoration: none;
    font-size: 15px;
    box-shadow: 0 6px 16px rgba(194,154,91,0.35);
    transition: background 0.3s;
}
.map-btn:hover { background: var(--gold-dark); }

/* ---------- تأكيد الحضور ---------- */
.rsvp-section { background: var(--blush-light); }
.rsvp-hint { color: var(--text-soft); font-size: 14px; margin-bottom: 22px; margin-top: -20px; }
#rsvpForm { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 340px; }
input, select {
    padding: 14px 16px;
    border: 1px solid rgba(194,154,91,0.4);
    border-radius: 10px;
    background: #fff;
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    font-size: 15px;
    color: var(--text);
    outline: none;
    text-align: right;
}
input:focus, select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(194,154,91,0.15); }
button[type="submit"] {
    padding: 14px;
    background: var(--gold);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'IBM Plex Sans Arabic', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s;
}
button[type="submit"]:hover { background: var(--gold-dark); }
.form-message { margin-top: 16px; font-size: 15px; color: var(--gold-dark); min-height: 20px; font-weight: 500; }

/* ---------- التذييل ---------- */
.footer {
    scroll-snap-align: end;
    min-height: 60vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    background: var(--text);
    color: #F3E7DE;
    padding: 40px 20px;
}
.footer-calligraphy {
    font-family: 'Pinyon Script', cursive;
    font-size: 46px;
    color: var(--gold);
}
.footer p { margin-top: 8px; font-family: 'El Messiri', serif; }
.footer-note { color: #CBB9AE; font-size: 13px; font-family: 'IBM Plex Sans Arabic', sans-serif !important; }

/* ---------- ظهور تدريجي عند التمرير ---------- */
.reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.on { opacity: 1; transform: none; }

a, button, input, select { -webkit-tap-highlight-color: transparent; }

/* ---------- زخارف أزهار ---------- */
.floral { position: fixed; width: 200px; height: 200px; pointer-events: none; z-index: 60; }
.floral-tl { top: -28px; left: -28px; animation: floralSway 7s ease-in-out infinite; }
.floral-br { bottom: -28px; right: -28px; animation: floralSway 6.5s ease-in-out infinite reverse; }
.floral-hero { position: absolute; top: 34px; right: 20px; width: 84px; height: 84px; animation: floralSpin 16s linear infinite; }
@keyframes floralSway {
    0%, 100% { transform: rotate(-4deg) translate(0, 0); }
    50%      { transform: rotate(4deg) translate(3px, -4px); }
}
@keyframes floralSpin { to { transform: rotate(360deg); } }

/* ---------- زر ولوحة تخصيص الأسماء ---------- */
.names-btn {
    position: fixed; top: 20px; right: 20px; z-index: 120;
    background: #fff; border: 1px solid rgba(194,154,91,.45);
    color: var(--gold-dark); font-family: 'IBM Plex Sans Arabic', sans-serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.12);
    transition: transform .2s, background .2s;
}
.names-btn:hover { transform: translateY(-2px); background: #fffdf6; }
.names-panel {
    position: fixed; top: 72px; right: 20px; z-index: 120;
    background: #fff; border-radius: 14px; border: 1px solid rgba(194,154,91,.3);
    padding: 18px; width: 240px; box-shadow: 0 16px 40px rgba(0,0,0,.18);
    display: none; flex-direction: column; gap: 12px;
    font-family: 'IBM Plex Sans Arabic', sans-serif;
}
.names-panel.open { display: flex; animation: panelIn .3s ease; }
@keyframes panelIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.names-panel label { font-size: 13px; color: var(--text-soft); display: flex; flex-direction: column; gap: 6px; }
.names-panel input {
    padding: 10px 12px; border: 1px solid rgba(194,154,91,.4); border-radius: 8px;
    font-family: inherit; text-align: right; font-size: 14px; color: var(--text);
}
.names-panel input:focus { border-color: var(--gold); outline: none; }
.names-panel button {
    padding: 11px; border: none; border-radius: 8px; background: var(--gold); color: #fff;
    font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.names-panel button:hover { background: var(--gold-dark); }

/* الختم: الحرف محفور في الشمع */
.wax-seal .seal-txt {
    font-family: 'Pinyon Script', cursive;
    color: rgba(70,8,4,.92);
    text-shadow: 0 1px 0 rgba(255,228,205,.55), 0 -1px 1px rgba(0,0,0,.4), 0 2px 3px rgba(0,0,0,.38);
}

@media (max-width: 420px) {
    .couple-ar { font-size: 44px; }
    .time-box { min-width: 70px; }
    .time-box span { font-size: 32px; }
}
````

---

## invitations\luxury\script.js

````js
// ---------- فتح الدعوة ----------
function openInvitation() {
    const env = document.querySelector('.envelope');
    env.classList.add('open');

    setTimeout(() => {
        document.getElementById('envelopeScreen').classList.add('fade-out');
        const invite = document.getElementById('invitation');
        invite.classList.add('visible');
        document.body.style.overflow = 'hidden';
        document.querySelector('.music-btn').style.opacity = '1';
        document.querySelector('.music-btn').style.pointerEvents = 'auto';
        startCountdown();
        addReveals();
    }, 800);
}

// ---------- العد التنازلي ----------
function startCountdown() {
    const target = new Date('September 24, 2026 19:00:00').getTime();
    const d = (n) => String(n).padStart(2, '0');

    const update = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        document.getElementById('days').textContent = d(Math.floor(diff / 86400000));
        document.getElementById('hours').textContent = d(Math.floor(diff % 86400000 / 3600000));
        document.getElementById('minutes').textContent = d(Math.floor(diff % 3600000 / 60000));
        document.getElementById('seconds').textContent = d(Math.floor(diff % 60000 / 1000));
    };
    update();
    setInterval(update, 1000);
}

// ---------- ظهور تدريجي ----------
function addReveals() {
    const els = document.querySelectorAll('#invitation .slide > *:not(.scroll-cue)');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add('on');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    els.forEach((el) => {
        el.classList.add('reveal');
        io.observe(el);
    });

    // بطاقات البرنامج تظهر واحدة تلو الأخرى عند التمرير
    const cards = document.querySelectorAll('.prog-card');
    cards.forEach((card, i) => {
        card.classList.add('reveal');
        card.style.transitionDelay = (0.15 * i) + 's';
        io.observe(card);
    });
}

// ---------- تخصيص الأسماء (بأحرف محفورة) ----------
const namesBtn = document.getElementById('namesBtn');
const namesPanel = document.getElementById('namesPanel');
if (namesBtn && namesPanel) {
    namesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        namesPanel.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (namesPanel.classList.contains('open') &&
            !namesPanel.contains(e.target) &&
            e.target !== namesBtn &&
            !namesBtn.contains(e.target)) {
            namesPanel.classList.remove('open');
        }
    });
    document.getElementById('namesApply').addEventListener('click', () => {
        const groom = document.getElementById('editGroom').value.trim();
        const bride = document.getElementById('editBride').value.trim();
        if (!groom || !bride) return;
        const gI = Array.from(groom)[0].toUpperCase();
        const bI = Array.from(bride)[0].toUpperCase();
        document.querySelector('.couple-ar').innerHTML = bride + ' <span class="amp">&amp;</span> ' + groom;
        document.querySelectorAll('.env-calligraphy, .footer-calligraphy').forEach((el) => (el.textContent = bI + ' & ' + gI));
        document.querySelectorAll('.seal-txt').forEach((el) => (el.textContent = gI + ' & ' + bI));
        document.title = 'دعوة زفاف | ' + bride + ' و' + groom;
        namesPanel.classList.remove('open');
    });
}

// ---------- الموسيقى (نغمات لطيفة عبر Web Audio) ----------
const musicBtn = document.getElementById('musicBtn');
let audioCtx = null;
let musicOn = false;
let musicTimer = null;

const NOTES = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25];

function playNote(freq, time, dur = 1.4, vol = 0.12) {
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
}

function playMelody() {
    if (!audioCtx || !musicOn) return;
    const now = audioCtx.currentTime;
    let t = now + 0.1;
    NOTES.forEach((n) => {
        playNote(n, t);
        playNote(n * 0.5, t, 1.4, 0.06); // نغمة أوكتاف منخفضة
        t += 0.55;
    });
    musicTimer = setTimeout(playMelody, 4000);
}

musicBtn.addEventListener('click', () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    musicOn = !musicOn;
    if (musicOn) {
        musicBtn.textContent = '🎵';
        musicBtn.classList.add('playing');
        playMelody();
    } else {
        clearTimeout(musicTimer);
        musicBtn.classList.remove('playing');
    }
});

// ---------- نموذج تأكيد الحضور ----------
document.getElementById('rsvpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const answer = document.getElementById('guestAttendance').value;
    const msg = document.getElementById('formMessage');

    if (answer === 'yes') {
        msg.textContent = 'شكراً ' + name + '، يسعدنا حضوركم وبانتظاركم! ❤';
    } else {
        msg.textContent = 'شكراً ' + name + '، ستفقدنا فرحة حضوركم، ونشكر اهتمامكم.';
    }
    e.target.reset();
    setTimeout(() => (msg.textContent = ''), 6000);
});
````

---

## invitations\perfect\index.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@200;400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <title>دعوة زفاف</title>
</head>
<body>

    <svg class="floral floral-tl" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#6B8E95" stroke-width="1.2" opacity=".5">
            <circle cx="26" cy="26" r="7"/><ellipse cx="26" cy="19" rx="4.5" ry="7"/>
            <ellipse cx="19" cy="26" rx="7" ry="4.5"/><ellipse cx="26" cy="33" rx="4.5" ry="7"/>
            <ellipse cx="33" cy="26" rx="7" ry="4.5"/>
            <path d="M26 26 Q44 8 62 12"/>
            <circle cx="62" cy="12" r="5"/>
            <path d="M26 33 Q20 52 30 60"/><ellipse cx="30" cy="64" rx="4" ry="6"/>
            <path d="M33 30 Q52 44 58 60"/><ellipse cx="59" cy="64" rx="4" ry="6"/>
        </g>
    </svg>
    <svg class="floral floral-br" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#6B8E95" stroke-width="1.2" opacity=".5">
            <circle cx="74" cy="74" r="7"/><ellipse cx="74" cy="67" rx="4.5" ry="7"/>
            <ellipse cx="67" cy="74" rx="7" ry="4.5"/><ellipse cx="74" cy="81" rx="4.5" ry="7"/>
            <ellipse cx="81" cy="74" rx="7" ry="4.5"/>
            <path d="M74 74 Q56 92 38 88"/>
            <circle cx="38" cy="88" r="5"/>
        </g>
    </svg>

    <button id="namesBtn" class="names-btn" title="تخصيص الأسماء">✎ تحرير الأسماء</button>
    <div id="namesPanel" class="names-panel">
        <label>اسم العريس <input id="editGroom" type="text" value="آدم"></label>
        <label>اسم العروس <input id="editBride" type="text" value="لارا"></label>
        <button id="namesApply">تطبيق</button>
    </div>

    <div class="container">
        <!-- قسم الظرف -->
        <section class="slide" id="envelope-section">
            <div class="envelope" onclick="openInvitation()">
                <div class="env-paper">L & A</div>
                <div class="flap"></div>
                <div class="front"></div>
                <div class="seal"><span class="seal-txt">A&L</span></div>
            </div>
            <p class="open-hint">اضغط على الظرف لفتح الدعوة</p>
        </section>

        <!-- قسم الترحيب -->
        <section class="slide hidden" id="main-invitation">
            <h1>آل المنصور وآل العمري</h1>
            <p>نتشرف بدعوتكم لمشاركتنا فرحتنا</p>
            <div class="names">لارا & آدم</div>
            <div class="date">24 . 09 . 2026</div>
        </section>

        <!-- قسم الجدول الزمني -->
        <section class="slide hidden" id="timeline">
            <h2>برنامج الحفل</h2>
            <div class="timeline-line">
                <div class="event"><span>7:00</span> استقبال الضيوف</div>
                <div class="event"><span>7:30</span> مراسم العقد</div>
                <div class="event"><span>8:00</span> جلسة التهاني</div>
                <div class="event"><span>9:00</span> مأدبة العشاء</div>
            </div>
        </section>
    </div>

    <script>
        function openInvitation() {
            const env = document.querySelector('.envelope');
            if (!env || env.classList.contains('open')) return;
            env.classList.add('open');
            setTimeout(function () {
                document.getElementById('envelope-section').style.display = 'none';
                document.getElementById('main-invitation').classList.remove('hidden');
                document.getElementById('timeline').classList.remove('hidden');
                wireReveals();
            }, 1000);
        }

        // ظهور تدريجي عند التمرير
        function wireReveals() {
            const io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('on');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12 });
            document.querySelectorAll('.event, .slide h1, .slide h2, .slide > p').forEach(function (el, i) {
                el.classList.add('reveal');
                el.style.transitionDelay = (0.1 * i) + 's';
                io.observe(el);
            });
        }

        // تخصيص الأسماء (بأحرف محفورة)
        var namesBtn = document.getElementById('namesBtn');
        var namesPanel = document.getElementById('namesPanel');
        namesBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            namesPanel.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (namesPanel.classList.contains('open') && !namesPanel.contains(e.target) &&
                e.target !== namesBtn && !namesBtn.contains(e.target)) {
                namesPanel.classList.remove('open');
            }
        });
        document.getElementById('namesApply').addEventListener('click', function () {
            var groom = document.getElementById('editGroom').value.trim();
            var bride = document.getElementById('editBride').value.trim();
            if (!groom || !bride) return;
            document.querySelector('.names').textContent = bride + ' & ' + groom;
            document.querySelector('.env-paper').textContent = bride.charAt(0).toUpperCase() + ' & ' + groom.charAt(0).toUpperCase();
            document.querySelector('.seal-txt').textContent = groom.charAt(0).toUpperCase() + '&' + bride.charAt(0).toUpperCase();
            namesPanel.classList.remove('open');
        });
    </script>
</body>
</html>
````

---

## invitations\perfect\script.js

````js
// عد تنازلي بسيط ليوم 24-9-2026
const targetDate = new Date('September 24, 2026 19:00:00').getTime();

setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
}, 1000);
````

---

## invitations\perfect\style.css

````css
* { box-sizing: border-box; }
html, body {
    margin: 0; padding: 0;
    font-family: 'Amiri', serif;
    background-color: #f7f3ef;
    color: #5c6b73;
}

.container {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
}

.slide { width: 100%; height: 100vh; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.slide#envelope-section { background: radial-gradient(130% 110% at 70% 8%, #f9e8e4 0%, #fff9f6 40%, #fffdfb 68%, #f6e8e0 100%); }
.hidden { display: none; }

/* الظرف */
.envelope {
    position: relative;
    width: 280px; height: 200px;
    background: #e6d6c4;
    border-radius: 6px;
    cursor: pointer;
    transition: transform .4s;
}
@keyframes envPerfFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.slide#envelope-section::before {
    content: ''; position: absolute; top: -12vw; right: -10vw;
    width: 46vw; height: 46vw; max-width: 520px; max-height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(214,161,140,.5), transparent 68%);
    filter: blur(60px); pointer-events: none;
}
@media (min-width: 561px) { .envelope { animation: envPerfFloat 6s ease-in-out infinite; } }
.envelope:hover { animation: none; transform: scale(1.03); }

.front {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #F0E2D2, #E2CDB8);
    border-radius: 6px;
    clip-path: polygon(0 20%, 50% 64%, 100% 20%, 100% 100%, 0 100%);
    z-index: 4;
}
.env-paper {
    position: absolute; left: 18px; right: 18px; top: 22px; bottom: 34px;
    background: #fffaf0;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: #a48040; font-size: 26px; font-family: 'Cinzel', serif;
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
    z-index: 2;
    transition: transform .9s cubic-bezier(.2,.9,.3,1.12);
}
.flap {
    position: absolute; top: 0; left: 0; width: 100%; height: 56%;
    background: linear-gradient(180deg, #EBD9C4, #DCC5AC);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    border-radius: 6px 6px 0 0;
    transform-origin: top;
    transition: transform .7s ease;
    z-index: 5;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
}
.seal {
    position: absolute; top: 112px; left: 50%;
    transform: translate(-50%, -50%) rotate(-5deg);
    width: 70px; height: 70px;
    border-radius: 53% 47% 60% 40% / 47% 61% 39% 55%;
    display: flex; align-items: center; justify-content: center;
    color: #fff6ea; font-size: 22px; font-weight: bold;
    z-index: 6;
    background:
        radial-gradient(circle at 30% 26%, rgba(255,236,218,.5) 0%, rgba(255,205,175,.16) 28%, transparent 56%),
        radial-gradient(circle at 68% 82%, rgba(80,10,8,.55) 30%, rgba(0,0,0,0) 62%),
        linear-gradient(155deg, #E8876A 0%, #C64A34 38%, #982517 66%, #6E120B 100%);
    box-shadow:
        0 8px 16px rgba(120,22,14,.45),
        0 2px 5px rgba(0,0,0,.25),
        inset 0 4px 7px rgba(255,228,206,.5),
        inset -4px -6px 12px rgba(70,6,4,.55),
        inset 0 0 0 1px rgba(255,205,175,.2),
        inset 0 0 0 5px rgba(120,20,14,.12);
    transition: transform .5s, opacity .5s;
}
.seal::before {
    content: ''; position: absolute; left: 6%; right: 6%; bottom: -13px; height: 28px;
    background:
        radial-gradient(ellipse 10px 14px at 12% 88%, #B13A28 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 6px 15px at 30% 76%, #D0543E 45%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 12px 17px at 52% 94%, #9E2619 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 7px 14px at 74% 82%, #C04936 50%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 5px 9px at 91% 90%, #B8402D 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 4px 6px at 42% 70%, #C74A36 50%, rgba(140,28,15,0) 60%);
    filter: blur(.35px);
}
.seal::after {
    content: ''; position: absolute; inset: -1px; border-radius: inherit;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0'/></filter><rect width='150' height='150' filter='url(%23n)'/></svg>");
    background-size: 130px 130px;
    mix-blend-mode: multiply;
    opacity: .34;
    pointer-events: none;
}
.envelope.open .env-paper { transform: translateY(-150%) scale(1.05) rotate(-1.5deg); z-index: 10; }
.envelope.open .flap { transform: rotateX(178deg); z-index: 1; }
.envelope.open .seal { transform: translate(-50%, -50%) rotate(20deg) scale(1.5); opacity: 0; }

.open-hint { margin-top: 26px; color: #8a7a6a; font-size: 15px; animation: pulse 1.8s infinite; }
@keyframes pulse { 0%,100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }

/* ---------- أحرف محفورة (فقط داخل الختم) ---------- */
.seal-txt {
    color: rgba(40,55,62,.95);
    text-shadow: 0 1px 0 rgba(255,244,232,.6), 0 -1px 1px rgba(0,0,0,.4), 0 2px 3px rgba(0,0,0,.35);
}

/* ---------- زخارف أزهار ---------- */
.floral { position: fixed; width: 170px; height: 170px; pointer-events: none; z-index: 60; }
.floral-tl { top: -24px; left: -24px; animation: floralSway 7s ease-in-out infinite; }
.floral-br { bottom: -24px; right: -24px; animation: floralSway 6.5s ease-in-out infinite reverse; }
@keyframes floralSway {
    0%, 100% { transform: rotate(-4deg) translate(0, 0); }
    50%      { transform: rotate(4deg) translate(3px, -4px); }
}

/* ---------- زر ولوحة تخصيص الأسماء ---------- */
.names-btn {
    position: fixed; top: 18px; right: 18px; z-index: 120;
    background: #fff; border: 1px solid rgba(106,142,149,.5);
    color: #4a5a63; font-family: 'Cairo', sans-serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    transition: transform .2s, background .2s;
}
.names-btn:hover { transform: translateY(-2px); background: #f7fafb; }
.names-panel {
    position: fixed; top: 68px; right: 18px; z-index: 120;
    background: #fff; border-radius: 14px; border: 1px solid rgba(106,142,149,.35);
    padding: 18px; width: 240px; box-shadow: 0 16px 40px rgba(0,0,0,.16);
    display: none; flex-direction: column; gap: 12px;
    font-family: 'Cairo', sans-serif;
}
.names-panel.open { display: flex; animation: panelIn .3s ease; }
@keyframes panelIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.names-panel input {
    padding: 10px 12px; border: 1px solid rgba(106,142,149,.4); border-radius: 8px;
    font-family: inherit; text-align: right; font-size: 14px; color: #4a5a63;
}
.names-panel input:focus { border-color: #6B8E95; outline: none; }
.names-panel button {
    padding: 11px; border: none; border-radius: 8px; background: #6B8E95; color: #fff;
    font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
}
.names-panel button:hover { background: #4a5a63; }

/* ---------- ظهور تدريجي عند التمرير ---------- */
.reveal {
    opacity: 0;
    transform: translateY(34px);
    transition: opacity .8s ease, transform .8s ease;
}
.reveal.on { opacity: 1; transform: none; }

/* التنسيق العام للنصوص */
h1 { font-size: 2.5rem; font-weight: normal; margin-bottom: 10px; }
.names { font-size: 3rem; margin: 20px 0; color: #4a5a63; }
.date { font-size: 1.2rem; letter-spacing: 5px; }

/* Timeline */
.timeline-line { border-right: 1px solid #dcdcdc; padding-right: 20px; margin-top: 30px; }
.event { margin: 20px 0; font-size: 1.2rem; }
.event span { display: block; font-size: 0.9rem; color: #a3b1ba; }
````

---

## invitations\premium\index.html

````html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>دعوة زفاف لارا & آدم</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <svg class="floral floral-tl" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#8B5E3C" stroke-width="1.2" opacity=".45">
            <circle cx="26" cy="26" r="7"/><ellipse cx="26" cy="19" rx="4.5" ry="7"/>
            <ellipse cx="19" cy="26" rx="7" ry="4.5"/><ellipse cx="26" cy="33" rx="4.5" ry="7"/>
            <ellipse cx="33" cy="26" rx="7" ry="4.5"/>
            <path d="M26 26 Q44 8 62 12"/>
            <circle cx="62" cy="12" r="5"/>
            <path d="M26 33 Q20 52 30 60"/><ellipse cx="30" cy="64" rx="4" ry="6"/>
            <path d="M33 30 Q52 44 58 60"/><ellipse cx="59" cy="64" rx="4" ry="6"/>
        </g>
    </svg>
    <svg class="floral floral-br" viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="#8B5E3C" stroke-width="1.2" opacity=".45">
            <circle cx="74" cy="74" r="7"/><ellipse cx="74" cy="67" rx="4.5" ry="7"/>
            <ellipse cx="67" cy="74" rx="7" ry="4.5"/><ellipse cx="74" cy="81" rx="4.5" ry="7"/>
            <ellipse cx="81" cy="74" rx="7" ry="4.5"/>
            <path d="M74 74 Q56 92 38 88"/>
            <circle cx="38" cy="88" r="5"/>
        </g>
    </svg>

    <button id="namesBtn" class="names-btn" title="تخصيص الأسماء">✎ تحرير الأسماء</button>
    <div id="namesPanel" class="names-panel">
        <label>اسم العريس <input id="editGroom" type="text" value="آدم"></label>
        <label>اسم العروس <input id="editBride" type="text" value="لارا"></label>
        <button id="namesApply">تطبيق</button>
    </div>

    <div class="scroll-container">
        <!-- شاشة الظرف التفاعلية -->
        <section class="slide" id="opening">
            <div class="envelope-box" onclick="openInvitation()" role="button" aria-label="افتح الدعوة">
                <div class="env-back"></div>
                <div class="env-paper">L & A</div>
                <div class="env-front"></div>
                <div class="env-flap"></div>
                <div class="wax-seal"><span class="seal-txt">A&L</span></div>
            </div>
            <p class="open-hint">اضغط على الظرف لفتح الدعوة</p>
        </section>

        <!-- الترحيب -->
        <section class="slide">
            <div class="content-box">
                <h1>آل المنصور وآل العمري</h1>
                <p>نتشرف بدعوتكم لمشاركتنا فرحة زفافنا</p>
                <div class="couple-names">لارا & آدم</div>
                <div class="wedding-date">24.09.2026</div>
            </div>
        </section>

        <!-- البرنامج الزمني -->
        <section class="slide">
            <div class="timeline">
                <h2>برنامج الحفل</h2>
                <div class="item"><span>7:00</span> استقبال الضيوف</div>
                <div class="item"><span>7:30</span> مراسم العقد</div>
                <div class="item"><span>8:00</span> مأدبة العشاء</div>
            </div>
        </section>
    </div>

    <script>
        function openInvitation() {
            var box = document.querySelector('.envelope-box');
            if (!box || box.classList.contains('opened')) return;
            box.classList.add('opened');
            setTimeout(function () {
                var slide = document.getElementById('opening');
                if (slide) slide.remove();
                wireReveals();
            }, 1000);
        }

        // ظهور تدريجي عند التمرير
        function wireReveals() {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('on');
                        io.unobserve(e.target);
                    }
                });
            }, { threshold: 0.12 });
            document.querySelectorAll('.item, .content-box h1, .content-box > p, .timeline h2').forEach(function (el, i) {
                el.classList.add('reveal');
                el.style.transitionDelay = (0.1 * i) + 's';
                io.observe(el);
            });
        }

        // تخصيص الأسماء (بأحرف محفورة)
        var namesBtn = document.getElementById('namesBtn');
        var namesPanel = document.getElementById('namesPanel');
        namesBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            namesPanel.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (namesPanel.classList.contains('open') && !namesPanel.contains(e.target) &&
                e.target !== namesBtn && !namesBtn.contains(e.target)) {
                namesPanel.classList.remove('open');
            }
        });
        document.getElementById('namesApply').addEventListener('click', function () {
            var groom = document.getElementById('editGroom').value.trim();
            var bride = document.getElementById('editBride').value.trim();
            if (!groom || !bride) return;
            document.querySelector('.couple-names').textContent = bride + ' & ' + groom;
            document.querySelector('.env-paper').textContent = bride.charAt(0).toUpperCase() + ' & ' + groom.charAt(0).toUpperCase();
            document.querySelector('.seal-txt').textContent = groom.charAt(0).toUpperCase() + '&' + bride.charAt(0).toUpperCase();
            namesPanel.classList.remove('open');
        });
    </script>
</body>
</html>
````

---

## invitations\premium\style.css

````css
* { box-sizing: border-box; }
body { margin: 0; background: #fdfaf7; font-family: 'Amiri', serif; color: #5c6b73; }
.scroll-container { height: 100vh; overflow-y: auto; scroll-snap-type: y mandatory; }
.slide { height: 100vh; scroll-snap-align: start; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-bottom: 1px solid #f1e6df; position: relative; }
.slide#opening { background: radial-gradient(130% 110% at 70% 8%, #f9e8e4 0%, #fff9f6 40%, #fffdfb 68%, #f6e8e0 100%); }

/* الظرف */
.envelope-box {
    position: relative;
    width: 300px; height: 210px;
    background: #dcd0c0;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.4s;
    overflow: visible;
}
@keyframes envPremFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.slide#opening::before {
    content: ''; position: absolute; top: -12vw; right: -10vw;
    width: 46vw; height: 46vw; max-width: 520px; max-height: 520px; border-radius: 50%;
    background: radial-gradient(circle, rgba(214,161,140,.5), transparent 68%);
    filter: blur(60px); pointer-events: none;
}
@media (min-width: 561px) { .envelope-box { animation: envPremFloat 6s ease-in-out infinite; } }
.envelope-box:hover { animation: none; transform: scale(1.03); }

.env-back {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #e9ddcd, #cdbbab);
    border-radius: 5px 5px 10px 10px;
    z-index: 1;
}
.env-paper {
    position: absolute; left: 18px; right: 18px; top: 22px; bottom: 34px;
    background: #fffaf0;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: #a48040; font-size: 28px; font-family: 'Cinzel', serif;
    box-shadow: 0 8px 16px rgba(0,0,0,0.12);
    z-index: 2;
    transition: transform .8s cubic-bezier(.2,.9,.3,1.1);
}
.env-front {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #EADAC8, #DDC6AE);
    border-radius: 5px;
    z-index: 4;
    clip-path: polygon(0 20%, 50% 64%, 100% 20%, 100% 100%, 0 100%);
}
.env-flap {
    position: absolute; top: 0; left: 0; width: 100%; height: 56%;
    background: linear-gradient(180deg, #EFE0CE, #DDC5AC);
    clip-path: polygon(0 0, 50% 100%, 100% 0);
    border-radius: 5px 5px 0 0;
    transform-origin: top;
    transition: transform .7s ease;
    z-index: 5;
    filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
}
.wax-seal {
    position: absolute; top: 112px; left: 50%;
    transform: translate(-50%, -50%) rotate(-5deg);
    width: 70px; height: 70px;
    border-radius: 53% 47% 60% 40% / 47% 61% 39% 55%;
    display: flex; align-items: center; justify-content: center;
    color: #fff6ea; font-size: 23px; font-weight: bold;
    z-index: 6;
    background:
        radial-gradient(circle at 30% 26%, rgba(255,236,218,.5) 0%, rgba(255,205,175,.16) 28%, transparent 56%),
        radial-gradient(circle at 68% 82%, rgba(80,10,8,.55) 30%, rgba(0,0,0,0) 62%),
        linear-gradient(155deg, #E8876A 0%, #C64A34 38%, #982517 66%, #6E120B 100%);
    box-shadow:
        0 8px 16px rgba(120,22,14,.45),
        0 2px 5px rgba(0,0,0,.25),
        inset 0 4px 7px rgba(255,228,206,.5),
        inset -4px -6px 12px rgba(70,6,4,.55),
        inset 0 0 0 1px rgba(255,205,175,.2),
        inset 0 0 0 5px rgba(120,20,14,.12);
    transition: transform .5s, opacity .5s;
}
.wax-seal::before {
    content: ''; position: absolute; left: 6%; right: 6%; bottom: -13px; height: 28px;
    background:
        radial-gradient(ellipse 10px 14px at 12% 88%, #B13A28 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 6px 15px at 30% 76%, #D0543E 45%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 12px 17px at 52% 94%, #9E2619 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 7px 14px at 74% 82%, #C04936 50%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 5px 9px at 91% 90%, #B8402D 55%, rgba(140,28,15,0) 62%),
        radial-gradient(ellipse 4px 6px at 42% 70%, #C74A36 50%, rgba(140,28,15,0) 60%);
    filter: blur(.35px);
}
.wax-seal::after {
    content: ''; position: absolute; inset: -1px; border-radius: inherit;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.8 0'/></filter><rect width='150' height='150' filter='url(%23n)'/></svg>");
    background-size: 130px 130px;
    mix-blend-mode: multiply;
    opacity: .34;
    pointer-events: none;
}
.open-hint { margin-top: 26px; color: #8a7a6a; font-size: 15px; animation: pulse 1.8s infinite; }

/* فتح الظرف */
.envelope-box.opened .env-paper {
    transform: translateY(-150%) rotate(-1.5deg) scale(1.05);
    z-index: 10;
}
.envelope-box.opened .env-flap { transform: rotateX(178deg); z-index: 1; }
.envelope-box.opened .wax-seal { transform: translate(-50%, -50%) rotate(20deg) scale(1.5); opacity: 0; }

.timeline { width: 80%; }
.item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #dcdcdc; }
.item span { color: #a3b1ba; }
.couple-names { font-size: 3.5rem; margin: 20px 0; color: #4a5a63; }

@keyframes pulse { 0%,100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }

/* ---------- أحرف محفورة (فقط داخل الختم) ---------- */
.seal-txt {
    color: rgba(70,8,4,.92);
    text-shadow: 0 1px 0 rgba(255,228,205,.55), 0 -1px 1px rgba(0,0,0,.4), 0 2px 3px rgba(0,0,0,.38);
}

/* ---------- زخارف أزهار ---------- */
.floral { position: fixed; width: 170px; height: 170px; pointer-events: none; z-index: 60; }
.floral-tl { top: -24px; left: -24px; animation: floralSway 7s ease-in-out infinite; }
.floral-br { bottom: -24px; right: -24px; animation: floralSway 6.5s ease-in-out infinite reverse; }
@keyframes floralSway {
    0%, 100% { transform: rotate(-4deg) translate(0, 0); }
    50%      { transform: rotate(4deg) translate(3px, -4px); }
}

/* ---------- زر ولوحة تخصيص الأسماء ---------- */
.names-btn {
    position: fixed; top: 18px; right: 18px; z-index: 120;
    background: #fff; border: 1px solid rgba(164,128,64,.5);
    color: #a48040; font-family: 'Amiri', serif;
    font-size: 13px; padding: 8px 16px; border-radius: 20px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.1);
    transition: transform .2s, background .2s;
}
.names-btn:hover { transform: translateY(-2px); background: #fffaf0; }
.names-panel {
    position: fixed; top: 68px; right: 18px; z-index: 120;
    background: #fff; border-radius: 14px; border: 1px solid rgba(164,128,64,.35);
    padding: 18px; width: 240px; box-shadow: 0 16px 40px rgba(0,0,0,.16);
    display: none; flex-direction: column; gap: 12px;
    font-family: 'Amiri', serif;
}
.names-panel.open { display: flex; animation: panelIn .3s ease; }
@keyframes panelIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.names-panel input {
    padding: 10px 12px; border: 1px solid rgba(164,128,64,.4); border-radius: 8px;
    font-family: inherit; text-align: right; font-size: 14px; color: #5c6b73;
}
.names-panel input:focus { border-color: #a48040; outline: none; }
.names-panel button {
    padding: 11px; border: none; border-radius: 8px; background: #a48040; color: #fff;
    font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
}
.names-panel button:hover { background: #8a6a34; }

/* ---------- ظهور تدريجي عند التمرير ---------- */
.reveal {
    opacity: 0;
    transform: translateY(34px);
    transition: opacity .8s ease, transform .8s ease;
}
.reveal.on { opacity: 1; transform: none; }
````

---

## server\package.json

````json
{
  "name": "wedding-studio-server",
  "version": "1.0.0",
  "private": true,
  "description": "Wedding Studio server — Node.js (PostgreSQL على Render اختيارياً، أو ملفات JSON محلية)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "pg": "^8.11.3"
  }
}
````

---

## server\db.js

````js
'use strict';
/*
 * db.js — طبقة تخزين واحدة بوضعين:
 *   1) PostgreSQL (Render) عند توفر متغير DATABASE_URL
 *   2) ملفات JSON محلية (للاختبار بلا قاعدة بيانات)
 */
const fs = require('fs');
const path = require('path');

const DB_URL = (process.env.DATABASE_URL || '').trim();
let mode = DB_URL ? 'pg' : 'file';

let cfg = { invitesDir: '', rsvpsDir: '' };

let pool = null;
function getPool() {
    if (!pool) {
        const { Pool } = require('pg');
        const isInternal = !/localhost|127\.0\.0\.1/.test(DB_URL);
        pool = new Pool({
            connectionString: DB_URL,
            ssl: isInternal ? { rejectUnauthorized: false } : false
        });
    }
    return pool;
}

async function ensureSchema() {
    fs.mkdirSync(cfg.invitesDir, { recursive: true });
    fs.mkdirSync(cfg.rsvpsDir, { recursive: true });

    if (mode !== 'pg') return;

    try {
        const client = await getPool().connect();
        await client.query('CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())');
        await client.query("CREATE TABLE IF NOT EXISTS rsvps (invite_id TEXT PRIMARY KEY, list JSONB NOT NULL DEFAULT '[]'::jsonb)");
        client.release();
        console.log('✅ متصل بقاعدة بيانات PostgreSQL');
    } catch (e) {
        mode = 'file';
        console.warn('⚠️ تعذر الاتصال بقاعدة بيانات PostgreSQL: ' + (e.message || e));
        console.warn('سيتابع الخادم بالتخزين المحلي (ملفات JSON) حتى تصلح DATABASE_URL.');
    }
}

async function saveInvite(id, data) {
    if (mode === 'pg') {
        await getPool().query(
            'INSERT INTO invites(id, data) VALUES($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
            [id, JSON.stringify(data)]
        );
        return;
    }
    fs.writeFileSync(path.join(cfg.invitesDir, id + '.json'), JSON.stringify(data, null, 2));
}

async function loadInvite(id) {
    if (mode === 'pg') {
        const r = await getPool().query('SELECT data FROM invites WHERE id = $1', [id]);
        return r.rowCount ? r.rows[0].data : null;
    }
    const f = path.join(cfg.invitesDir, id + '.json');
    if (!fs.existsSync(f)) return null;
    return JSON.parse(fs.readFileSync(f, 'utf8'));
}

async function appendRsvp(id, entry) {
    if (mode === 'pg') {
        const client = await getPool().connect();
        try {
            await client.query(
                "INSERT INTO rsvps(invite_id, list) VALUES($1, $2) ON CONFLICT (invite_id) DO UPDATE SET list = rsvps.list || EXCLUDED.list",
                [id, JSON.stringify([entry])]
            );
            const rr = await client.query('SELECT list FROM rsvps WHERE invite_id = $1', [id]);
            const list = rr.rows[0] ? rr.rows[0].list : [];
            return { list, total: list.length };
        } finally {
            client.release();
        }
    }
    const f = path.join(cfg.rsvpsDir, id + '.json');
    const list = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
    list.push(entry);
    fs.writeFileSync(f, JSON.stringify(list, null, 2));
    return { list, total: list.length };
}

async function listRsvps(id) {
    if (mode === 'pg') {
        const r = await getPool().query('SELECT list FROM rsvps WHERE invite_id = $1', [id]);
        return r.rows[0] ? r.rows[0].list : [];
    }
    const f = path.join(cfg.rsvpsDir, id + '.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
}

module.exports = {
    configure(c) { cfg = c; },
    ensureSchema,
    saveInvite,
    loadInvite,
    appendRsvp,
    listRsvps,
    mode() { return mode; }
};
````

---

## server\server.js

````js
/*
 * Wedding Studio — خادم خفيف بلغة Node.js
 *
 * التخزين (طبقة جد db.js):
 *   - PostgreSQL عبر متغير البيئة DATABASE_URL (موصى به على Render).
 *   - بدون DATABASE_URL → ملفات JSON محلية (server/data/) للاختبار فقط.
 *
 * التشغيل:
 *   1) ثبّت Node.js من https://nodejs.org (يفضّل النسخة 18+)
 *   2) في هذا المجلد (server):   npm install   ثم   npm start
 *   3) افتح المتصفح على:  http://localhost:3000
 *
 * الوظائف:
 *   - تقديم ملفات الموقع الثابتة
 *   - رفع صورة:          POST /api/upload   { data: "data:image/..." } (توافقياً)
 *   - نشر دعوة:          POST /api/invite   { ...بيانات الدعوة, photos: ["data:image/.."] }
 *   - جلب دعوة:          GET  /api/invite/:id
 *   - استقبال حضور:      POST /api/rsvp/:id { name, attending }
 *   - عرض الحضور:        GET  /api/rsvps/:id
 *   - رابط المشاركة:     GET  /v/:id   (يعيد تحويل الضيف إلى صفحة الدعوة)
 *
 * إشعارات تيليجرام (اختياري):
 *   - متغيرات بيئة:  TELEGRAM_TOKEN ، TELEGRAM_CHAT_ID  (موصى بها على Render)
 *   - أو انسخ config.local.example.json → config.local.json وضع التوكن و chatId.
 *   (config.local.json مستثنى من Git حتى لا تُرفع الأسرار إلى GitHub)
 */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const db = require('./db.js');

// ----- جذر المشروع -----
const cliArg = process.argv[2];
const PROJECT_ROOT = cliArg && fs.existsSync(cliArg)
    ? path.resolve(cliArg)
    : path.resolve(__dirname, '..');

const SERVER_DIR = path.join(PROJECT_ROOT, 'server');
const UPLOAD_DIR = path.join(SERVER_DIR, 'uploads');
const DATA_DIR = path.join(SERVER_DIR, 'data');
const INVITES_DIR = path.join(DATA_DIR, 'invites');
const RSVPS_DIR = path.join(DATA_DIR, 'rsvps');

db.configure({ invitesDir: INVITES_DIR, rsvpsDir: RSVPS_DIR });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const PORT = process.env.PORT || 3000;

// ----- إعدادات تيليجرام: متغيرات البيئة أولاً ثم config.local.json -----
const CONFIG_FILE = path.join(__dirname, 'config.local.json');
let TG = { token: '', chatId: '' };
let tgWarned = false;
try {
    if (fs.existsSync(CONFIG_FILE)) {
        const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        TG.token = String(cfg.telegramToken || '').trim();
        TG.chatId = String(cfg.telegramChatId || '').trim();
    }
} catch (e) {
    console.warn('⚠️ تعذر قراءة config.local.json:', e.message);
}
if (process.env.TELEGRAM_TOKEN) TG.token = String(process.env.TELEGRAM_TOKEN).trim();
if (process.env.TELEGRAM_CHAT_ID) TG.chatId = String(process.env.TELEGRAM_CHAT_ID).trim();

// إرسال رسالة إلى تيليجرام (متجاهل الأخطاء حتى لا يكسر الخادم)
function tgSend(text) {
    if (!TG.token || !TG.chatId) {
        if (!tgWarned) {
            tgWarned = true;
            console.log('ℹ️ تيليجرام غير مفعل: أنشئ server/config.local.json يحتوي {"telegramToken":"...","telegramChatId":"..."} لاستقبال إشعارات الدعوات.');
        }
        return;
    }
    try {
        const body = JSON.stringify({ chat_id: TG.chatId, text: text, disable_web_page_preview: false });
        const req = https.request({
            hostname: 'api.telegram.org',
            path: '/bot' + TG.token + '/sendMessage',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, (res) => {
            res.resume();
        });
        req.on('error', (err) => console.warn('⚠️ فشل إرسال تيليجرام:', err.message));
        req.setTimeout(8000, () => req.destroy());
        req.end(body);
    } catch (e) {
        console.warn('⚠️ خطأ تيليجرام:', e.message);
    }
}

// صياغة رسالة "دعوة جديدة" لصاحب المنصة
function inviteToTelegram(invite, host) {
    const occ = invite.occasionLabel || invite.occasion || '';
    const name = invite.occasionName ? ' («' + invite.occasionName + '»)' : '';
    const phone = invite.phone ? '\n📞 هاتف صاحب الدعوة: ' + invite.phone : '';
    return [
        '🆕 <b>دعوة جديدة منشورة!</b>',
        '━━━━━━━━━━━━',
        '👤 ' + (invite.groom || '-') + ' & ' + (invite.bride || '-'),
        '🎉 المناسبة: ' + occ + name,
        '📅 ' + (invite.date || '-') + '  ' + (invite.time || ''),
        '📍 ' + (invite.venue || '-') + (invite.address ? ' — ' + invite.address : ''),phone,
        '🖼 الصور: ' + (Array.isArray(invite.photos) ? invite.photos.length : 0),
        '🌐 ' + invite.url + '   (المنشأ: ' + (host || '-') + ')',
        '──────────────────────',
        '👥 ردود الضيوف ستصل هنا فور تأكيدهم.'
    ].join('\n');
}

// صياغة رسالة "تأكيد حضور" لصاحب المنصة
function rsvpToTelegram(invite, entry, count) {
    return [
        (entry.attending === 'yes' ? '✅ <b>تأكيد حضور جديد</b>' : '❌ <b>اعتذار جديد</b>'),
        '━━━━━━━━━━━━',
        '👤 ' + entry.name,
        '📣 ' + (entry.attending === 'yes' ? 'سأحضر' : 'لن أحضر'),
        '🎉 ' + (invite.groom || '') + ' & ' + (invite.bride || '') + ' — ' + (invite.occasionLabel || invite.occasion || ''),
        '🔗 ' + invite.url,
        '📊 إجمالي الردود المسجلة: ' + count
    ].join('\n');
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.woff2': 'font/woff2'
};

function safeJoin(base, target) {
    const resolved = path.resolve(base, '.' + path.normalize('/' + target));
    if (resolved !== base && !resolved.startsWith(base + path.sep)) return null;
    return resolved;
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (c) => { raw += c; if (raw.length > 25 * 1024 * 1024) { req.destroy(); reject(new Error('body too large')); } });
        req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (e) { reject(new Error('bad json')); } });
        req.on('error', reject);
    });
}

function send(res, code, obj, type) {
    let body = obj;
    if (!Buffer.isBuffer(obj)) body = JSON.stringify(obj);
    res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
}

function randomId() {
    return crypto.randomBytes(4).toString('hex');
}

// في وضع الملفات نكتب الصور على القرص ونستبدلها بمسار /uploads/
// في وضع PostgreSQL تُخزَّن الصور داخل قاعدة البيانات (data URLs) لأن قرص Render مؤقت.
function storePhotos(photos) {
    if (db.mode() === 'pg') return Array.isArray(photos) ? photos : [];
    return (Array.isArray(photos) ? photos : []).map((src) => {
        if (!src || !src.startsWith('data:')) return src;
        const m = src.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.*)$/);
        if (!m) return src;
        const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
        const buf = Buffer.from(m[3], 'base64');
        if (buf.length > 6 * 1024 * 1024) return src;
        const name = 'inv-' + Date.now() + '-' + randomId() + '.' + ext;
        fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
        return '/uploads/' + name;
    });
}

// ----- التوجيه -----
const server = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    const method = req.method;

    // CORS بسيط
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    try {
        // ---- API: رفع صورة ----
        if (method === 'POST' && url === '/api/upload') {
            const body = await readBody(req);
            const dataUrl = String(body.data || '');
            const m = dataUrl.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.*)$/);
            if (!m) return send(res, 400, { error: 'صيغة الصورة غير صحيحة' });
            const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
            const buf = Buffer.from(m[3], 'base64');
            if (buf.length > 6 * 1024 * 1024) return send(res, 400, { error: 'الصورة أكبر من 6MB' });
            const name = 'inv-' + Date.now() + '-' + randomId() + '.' + ext;
            fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
            return send(res, 200, { url: '/uploads/' + name });
        }

        // ---- API: نشر دعوة ----
        if (method === 'POST' && url === '/api/invite') {
            const invite = await readBody(req);
            if (!invite.groom) return send(res, 400, { error: 'بيانات ناقصة' });
            const id = randomId();
            invite.id = id;
            invite.createdAt = new Date().toISOString();
            invite.photos = storePhotos(invite.photos);
            await db.saveInvite(id, invite);
            const host = req.headers && req.headers.host;
            const abs = 'http://' + (host || 'localhost:' + PORT);
            invite.url = abs + '/v/' + id;
            tgSend(inviteToTelegram(invite, host));
            return send(res, 200, { id, url: '/v/' + id, fullUrl: abs + '/v/' + id });
        }

        // ---- API: جلب دعوة ----
        if (method === 'GET' && url.startsWith('/api/invite/')) {
            const id = url.slice('/api/invite/'.length).replace(/[^a-f0-9]/g, '');
            const obj = await db.loadInvite(id);
            if (!obj) return send(res, 404, { error: 'الدعوة غير موجودة' });
            return send(res, 200, obj);
        }

        // ---- API: استقبال تأكيد حضور ----
        if (method === 'POST' && url.startsWith('/api/rsvp/')) {
            const id = url.slice('/api/rsvp/'.length).replace(/[^a-f0-9]/g, '');
            const invite = await db.loadInvite(id);
            if (!invite) return send(res, 404, { error: 'الدعوة غير موجودة' });
            const body = await readBody(req);
            if (!body.name) return send(res, 400, { error: 'أدخل اسمك' });
            const entry = { name: String(body.name).slice(0, 80), attending: body.attending === 'yes' ? 'yes' : 'no', at: new Date().toISOString() };
            const { total } = await db.appendRsvp(id, entry);
            tgSend(rsvpToTelegram(invite, entry, total));
            return send(res, 200, { ok: true, total });
        }

        // ---- API: عرض تأكيدات الحضور ----
        if (method === 'GET' && url.startsWith('/api/rsvps/')) {
            const id = url.slice('/api/rsvps/'.length).replace(/[^a-f0-9]/g, '');
            const list = await db.listRsvps(id);
            return send(res, 200, list);
        }

        // ---- رابط المشاركة ----
        if (url.startsWith('/v/')) {
            const id = url.slice('/v/'.length).replace(/[^a-f0-9]/g, '');
            res.writeHead(302, { Location: '/studio/preview.html?id=' + id });
            return res.end();
        }

        // ---- فحص صحة ----
        if (url === '/api/health') return send(res, 200, { ok: true, app: 'Wedding Studio', db: db.mode() });

        // ---- الملفات الثابتة ----
        let filePath = url === '/' ? '/index.html' : url;
        const joined = safeJoin(PROJECT_ROOT, filePath);
        if (!joined) return send(res, 403, { error: 'غير مسموح' });

        // مجلد؟ نعم → نسعى لـ index.html داخله
        let target = joined;
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
            target = path.join(target, 'index.html');
        }
        if (!fs.existsSync(target)) return send(res, 404, { error: 'غير موجود' });
        const ext = path.extname(target).toLowerCase();
        return send(res, 200, fs.readFileSync(target), MIME[ext] || 'application/octet-stream');
    } catch (err) {
        return send(res, 500, { error: String(err && err.message || err) });
    }
});

// ----- تشغيل الخادم بعد تهيئة التخزين -----
db.ensureSchema().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        const os = require('os');
        const nets = os.networkInterfaces();
        const addrs = [];
        for (const name of Object.keys(nets)) {
            for (const n of nets[name]) {
                if (n.family === 'IPv4' && !n.internal) addrs.push(n.address);
            }
        }
        console.log('✅ Wedding Studio يعمل الآن:');
        console.log('   التخزين: ' + (db.mode() === 'pg' ? 'PostgreSQL' : 'ملفات JSON محلية'));
        console.log('   محلياً:   http://localhost:' + PORT);
        addrs.forEach((a) => console.log('   على الشبكة: http://' + a + ':' + PORT));
        console.log('   (قام ببدء الجذر: ' + PROJECT_ROOT + ')');
    });
}).catch((err) => {
    console.error('💥 تعذر بدء الخادم:', err);
    process.exit(1);
});
````


