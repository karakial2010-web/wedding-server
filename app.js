// ---------- إعدادات الدخول ----------
const PANEL_USER = 'hza';
const PANEL_PASS_HASH = '4b7dcde45fac24a6dd67f0fca895984643890d29852b6946b434d07e0a0de5a0';
const SETTINGS_KEY = 'wedding_site_settings';
const SESSION_KEY = 'wedding_panel_session';

// ---------- القيم الافتراضية ----------
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
    program: [
        { time: '7:00 مساءً', title: 'استقبال الضيوف', desc: 'باب الضيافة مفتوح وطابور الاستقبال ينتظركم' },
        { time: '7:30 مساءً', title: 'مراسم العقد', desc: 'لحظة توقيع عقد الزواج بمشاركة العائلتين' },
        { time: '9:00 مساءً', title: 'مأدبة العشاء', desc: 'مأدبة عشاء فاخرة على أنغام الموسيقى' }
    ]
};

// ---------- أدوات ----------
const $ = (id) => document.getElementById(id);

function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        const parsed = JSON.parse(raw);
        return Object.assign(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), parsed);
    } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
}

function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function initials(a, b) {
    const first = (n) => (n && n.trim()) ? Array.from(n.trim())[0].toUpperCase() : '';
    return first(b) + ' & ' + first(a);
}

// ---------- تسجيل الدخول ----------
async function hashPass(p) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

$('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = $('loginUser').value.trim();
    const pass = $('loginPass').value;
    $('loginErr').textContent = '';
    const loginBtn = $('loginForm').querySelector('button[type="submit"]');
    loginBtn.disabled = true;
    loginBtn.textContent = '...جاري التحقق';
    try {
        const ok = user === PANEL_USER && (await hashPass(pass)) === PANEL_PASS_HASH;
        if (ok) {
            sessionStorage.setItem(SESSION_KEY, '1');
            showDash();
            toast('أهلاً بك في لوحة التحكم');
        } else {
            $('loginErr').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'دخول';
    }
});

function showDash() {
    $('loginView').classList.add('hidden');
    $('dashView').classList.add('active');
    loadForm();
}

$('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    $('dashView').classList.remove('active');
    $('loginView').classList.remove('hidden');
    $('loginPass').value = '';
});

// ---------- تعبئة النموذج ----------
function progRowHTML(row) {
    return '<div class="prog-row">' +
        '<input class="p-time" type="text" placeholder="الوقت" value="' + esc(row.time || '') + '">' +
        '<input class="p-title" type="text" placeholder="العنوان" value="' + esc(row.title || '') + '">' +
        '<input class="p-desc" type="text" placeholder="الوصف" value="' + esc(row.desc || '') + '">' +
        '<button type="button" class="p-del" title="حذف">✕</button>' +
        '</div>';
}

function esc(v) {
    return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function loadForm() {
    const s = loadSettings();
    $('fGroom').value = s.groom;
    $('fBride').value = s.bride;
    $('fFamilies').value = s.families;
    $('fDate').value = s.date;
    $('fDay').value = s.day;
    $('fMonth').value = s.month;
    $('fYear').value = s.year;
    $('fCountdown').value = s.countdown;
    $('fVenueName').value = s.venueName;
    $('fVenueAddress').value = s.venueAddress;
    $('fVenueMap').value = s.venueMap;
    $('fVideo').value = s.video;
    $('fRsvpHint').value = s.rsvpHint;
    $('fTemplate').value = s.template || 'luxury';

    const rows = $('progRows');
    rows.innerHTML = '';
    const list = Array.isArray(s.program) && s.program.length ? s.program : DEFAULT_SETTINGS.program;
    list.forEach((r) => rows.insertAdjacentHTML('beforeend', progRowHTML(r)));
}

$('addProgBtn').addEventListener('click', () => {
    $('progRows').insertAdjacentHTML('beforeend', progRowHTML({ time: '', title: '', desc: '' }));
});

$('progRows').addEventListener('click', (e) => {
    if (e.target.classList.contains('p-del')) {
        const rowEls = $('progRows').querySelectorAll('.prog-row');
        if (rowEls.length > 1) {
            e.target.closest('.prog-row').remove();
        } else {
            toast('لا يمكن حذف آخر فقرة');
        }
    }
});

// ---------- جمع القيم ----------
function collect() {
    const rows = Array.from($('progRows').querySelectorAll('.prog-row')).map((r) => ({
        time: r.querySelector('.p-time').value.trim(),
        title: r.querySelector('.p-title').value.trim(),
        desc: r.querySelector('.p-desc').value.trim()
    }));
    const s = Object.assign(loadSettings(), {
        groom: $('fGroom').value.trim(),
        bride: $('fBride').value.trim(),
        families: $('fFamilies').value.trim(),
        date: $('fDate').value.trim(),
        day: $('fDay').value.trim(),
        month: $('fMonth').value.trim(),
        year: $('fYear').value.trim(),
        countdown: $('fCountdown').value,
        venueName: $('fVenueName').value.trim(),
        venueAddress: $('fVenueAddress').value.trim(),
        venueMap: $('fVenueMap').value.trim(),
        video: $('fVideo').value.trim(),
        rsvpHint: $('fRsvpHint').value.trim(),
        program: rows.filter((r) => r.title),
        template: $('fTemplate').value
    });
    return s;
}

$('saveBtn').addEventListener('click', () => {
    const s = collect();
    saveSettings(s);
    toast('تم حفظ الإعدادات — افتح الدعوة لمشاهدتها');
});

$('resetBtn').addEventListener('click', () => {
    if (!confirm('إعادة ضبط كل الإعدادات على الافتراضي؟')) return;
    localStorage.removeItem(SETTINGS_KEY);
    loadForm();
    toast('تمت إعادة التعيين');
});

// ---------- تصدير / استيراد ----------
$('exportBtn').addEventListener('click', () => {
    const s = collect();
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wedding-settings.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('تم تصدير النسخة');
});

$('importBtn').addEventListener('click', () => $('importFile').click());

$('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const s = JSON.parse(reader.result);
            const merged = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), s);
            saveSettings(merged);
            loadForm();
            toast('تم استيراد النسخة');
        } catch (err) {
            toast('ملف غير صالح');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// ---------- معاينة ----------
$('previewBtn').addEventListener('click', () => {
    const s = collect();
    saveSettings(s);
    const tpl = s.template || 'luxury';
    window.open('../' + tpl + '/index.html', '_blank');
});

// ---------- بدء التشغيل ----------
(function init() {
    if (sessionStorage.getItem(SESSION_KEY) === '1') showDash();
})();