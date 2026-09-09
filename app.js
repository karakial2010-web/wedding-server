// ---------- أدوات ----------
const $ = (id) => document.getElementById(id);

// ---------- القيم الافتراضية (نسخة احتياطية بالمتصفح فقط في حال فشل الاتصال) ----------
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

function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ---------- الاتصال بالسيرفر ----------
async function loadSettings() {
    try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        return Object.assign(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), data);
    } catch (e) {
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
}

async function saveSettings(s) {
    try {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(s)
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}

async function checkSession() {
    try {
        const res = await fetch('/api/session', { credentials: 'include' });
        const data = await res.json();
        return !!data.authenticated;
    } catch (e) {
        return false;
    }
}

function initials(a, b) {
    const first = (n) => (n && n.trim()) ? Array.from(n.trim())[0].toUpperCase() : '';
    return first(b) + ' & ' + first(a);
}

// ---------- تسجيل الدخول ----------
$('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = $('loginUser').value.trim();
    const pass = $('loginPass').value;
    $('loginErr').textContent = '';
    const loginBtn = $('loginForm').querySelector('button[type="submit"]');
    loginBtn.disabled = true;
    loginBtn.textContent = '...جاري التحقق';
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user, pass })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
            showDash();
            toast('أهلاً بك في لوحة التحكم');
        } else {
            $('loginErr').textContent = data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
        }
    } catch (e) {
        $('loginErr').textContent = 'تعذر الاتصال بالسيرفر';
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

$('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
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

async function loadForm() {
    const s = await loadSettings();
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
async function collect() {
    const rows = Array.from($('progRows').querySelectorAll('.prog-row')).map((r) => ({
        time: r.querySelector('.p-time').value.trim(),
        title: r.querySelector('.p-title').value.trim(),
        desc: r.querySelector('.p-desc').value.trim()
    }));
    const current = await loadSettings();
    const s = Object.assign(current, {
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

$('saveBtn').addEventListener('click', async () => {
    const s = await collect();
    const ok = await saveSettings(s);
    toast(ok ? 'تم حفظ الإعدادات — افتح الدعوة لمشاهدتها' : 'حدث خطأ أثناء الحفظ، حاول مرة أخرى');
});

$('resetBtn').addEventListener('click', async () => {
    if (!confirm('إعادة ضبط كل الإعدادات على الافتراضي؟')) return;
    await fetch('/api/settings/reset', { method: 'POST', credentials: 'include' });
    await loadForm();
    toast('تمت إعادة التعيين');
});

// ---------- تصدير / استيراد ----------
$('exportBtn').addEventListener('click', async () => {
    const s = await collect();
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
    reader.onload = async () => {
        try {
            const s = JSON.parse(reader.result);
            const merged = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), s);
            await saveSettings(merged);
            await loadForm();
            toast('تم استيراد النسخة');
        } catch (err) {
            toast('ملف غير صالح');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// ---------- معاينة ----------
$('previewBtn').addEventListener('click', async () => {
    const s = await collect();
    await saveSettings(s);
    const tpl = s.template || 'luxury';
    window.open('../' + tpl + '/index.html', '_blank');
});

// ---------- بدء التشغيل ----------
(async function init() {
    const authed = await checkSession();
    if (authed) showDash();
})();
