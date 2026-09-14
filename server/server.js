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