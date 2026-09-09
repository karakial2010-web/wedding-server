const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ---------- بيانات الدخول ----------
// مهم: غيّرهم من Environment Variables على Render، لا تتركهم بالقيمة الافتراضية
const PANEL_USER = process.env.PANEL_USER || 'hza';
const PANEL_PASS = process.env.PANEL_PASS || 'changeme123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'wedding-secret-change-me';

// ---------- تخزين الإعدادات ----------
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
    groom: 'آدم',
    bride: 'لارا',
    families: 'آل المنصور وآل العمري',
    date: '24 . 09 . 2026',
    day: 'السبت',
    month: '24 سبتمبر',
    year: '2026',
    countdown: '2026-09-24T19:00',
    venueName: 'قاعة الياسمين للمناسبات',
    venueAddress: 'طريق الأمير سلطان، جدة',
    venueMap: 'https://maps.google.com/?q=Jeddah',
    video: 'wedding-intro.mp4',
    rsvpHint: 'نتشرف بردّكم قبل 10 سبتمبر',
    template: 'luxury',
    program: [
        { time: '7:00 مساءً', title: 'استقبال الضيوف', desc: 'باب الضيافة مفتوح وطابور الاستقبال ينتظركم' },
        { time: '7:30 مساءً', title: 'مراسم العقد', desc: 'لحظة توقيع عقد الزواج بمشاركة العائلتين' },
        { time: '9:00 مساءً', title: 'مأدبة العشاء', desc: 'مأدبة عشاء فاخرة على أنغام الموسيقى' }
    ]
};

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
}

function readSettings() {
    ensureDataFile();
    try {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_SETTINGS, parsed);
    } catch (e) {
        return { ...DEFAULT_SETTINGS };
    }
}

function writeSettings(s) {
    ensureDataFile();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(s, null, 2));
}

// ---------- الإعدادات العامة ----------
app.set('trust proxy', 1); // ضروري على Render حتى تشتغل الكوكيز الآمنة صح
app.use(express.json());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 6 // الجلسة صالحة 6 ساعات
    }
}));

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    return res.status(401).json({ ok: false, error: 'غير مسجل الدخول' });
}

// ---------- API ----------
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body || {};
    if (user === PANEL_USER && pass === PANEL_PASS) {
        req.session.authenticated = true;
        return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

app.get('/api/settings', (req, res) => {
    res.json(readSettings());
});

app.post('/api/settings', requireAuth, (req, res) => {
    const merged = Object.assign(readSettings(), req.body || {});
    writeSettings(merged);
    res.json({ ok: true, settings: merged });
});

app.post('/api/settings/reset', requireAuth, (req, res) => {
    writeSettings(DEFAULT_SETTINGS);
    res.json({ ok: true, settings: DEFAULT_SETTINGS });
});

// ---------- تقديم ملفات الموقع (HTML/CSS/JS/صور) ----------
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`السيرفر شغال على المنفذ ${PORT}`);
});
