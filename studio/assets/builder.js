const $ = (id) => document.getElementById(id);

// ---------- إشعارات تيليجرام (صاحب المنصة) ----------
const TG_TOKEN = '8824585629:AAH_LvoiuuRFLrAZG_uKEiQNTUZce_k8-aE';
const TG_CHAT_ID = '6902746761';
let __tgSent = false;

function tgEsc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildTgText() {
    const occ = { wedding: '💍 زفاف', engagement: '💞 خطوبة', birthday: '🎂 عيد ميلاد', graduation: '🎓 تخرج', baby: '👶 مولود', queen: '👑 حفلة ملكة', opening: '🏪 افتتاح', family: '👨‍👩‍👧‍👦 لقاء عائلي', religious: '🕌 مناسبة دينية', other: '✨ أخرى' }[data.occasion] || data.occasion || '—';
    const photos = (Array.isArray(data.photos) ? data.photos : []).filter(Boolean);
    const prog = (Array.isArray(data.program) ? data.program : []).filter(Boolean);
    const lines = [
        '💍 <b>زبون جديد أنشأ موقعاً من المنصّة!</b>',
        '━━━━━━━━━━━━━━',
        '👤 العريس/الزبون: ' + tgEsc(data.groom),
        '👰 العروس: ' + tgEsc(data.bride),
        '🎉 المناسبة: ' + tgEsc(occ) + (data.occasionName ? ' (' + tgEsc(data.occasionName) + ')' : ''),
        '📅 التاريخ: ' + tgEsc(data.date) + ' — ' + tgEsc(data.time),
        '📍 المكان: ' + tgEsc(data.venue) + ' — ' + tgEsc(data.address),
        '🗺 الخريطة: ' + tgEsc(data.mapQuery),
        '📞 هاتف الزبون: ' + tgEsc(data.phone)
    ];
    if (prog.length) {
        lines.push('📋 البرنامج:');
        prog.forEach((p, i) => lines.push('   ' + (i + 1) + '. ' + tgEsc(p.time) + ' — ' + tgEsc(p.title)));
    }
    lines.push('🖼 الصور: ' + (photos.length ? photos.length + ' صورة' : 'لا توجد'));
    return lines.join('\n');
}

function tgSendPhotoMsg() {
    const photos = (Array.isArray(data.photos) ? data.photos : []).filter(Boolean);
    const src = photos[0];
    if (!src) return Promise.resolve(false);
    try {
        const caption = '🖼 أول صورة من ' + (data.groom || '') + ' & ' + (data.bride || '') + ' — ' + (data.date || '');
        if (/^data:image\//.test(src)) {
            const blobArr = src.split(',');
            const raw = atob(blobArr[1]);
            const u8 = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
            const file = new File([u8], 'cover.jpg', { type: blobArr[0].match(/data:(.*?);/)[1] });
            const fd = new FormData();
            fd.append('chat_id', TG_CHAT_ID);
            fd.append('caption', caption);
            fd.append('photo', file);
            return fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', { method: 'POST', body: fd }).then(() => true).catch(() => false);
        }
        if (/^https?:\/\//.test(src)) {
            const fd = new FormData();
            fd.append('chat_id', TG_CHAT_ID);
            fd.append('caption', caption);
            fd.append('photo', src);
            return fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendPhoto', { method: 'POST', body: fd }).then(() => true).catch(() => false);
        }
    } catch (e) {}
    return Promise.resolve(false);
}

function notifyTelegram() {
    if (__tgSent) return;
    __tgSent = true;
    try {
        fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TG_CHAT_ID, text: buildTgText(), parse_mode: 'HTML' })
        }).catch(() => {});
        tgSendPhotoMsg();
    } catch (e) {}
}

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
        notifyTelegram();
        window.location.href = 'preview.html';
    } else {
        goTo(step + 1);
    }
});

// المعاينة الكاملة
$('fullPreviewBtn').addEventListener('click', () => {
    collect();
    notifyTelegram();
    window.location.href = 'preview.html';
});
$('previewTopBtn').addEventListener('click', (e) => {
    e.preventDefault();
    collect();
    notifyTelegram();
    window.location.href = 'preview.html';
});
$('openToolbar').addEventListener('click', (e) => {
    e.preventDefault();
    alert(I18N.t('gallery_note'));
});

// المظروف بختم الشمع في المعاينة: أُزيل من المعاينة الحية (تظهر الدعوة مباشرة)
const fEnvBox = document.getElementById('fEnv');
function bpEnvSync() {
    const screen = $('bpScreen');
    screen.classList.add('env-opened');
    screen.scrollTop = 0;
}
if (fEnvBox) fEnvBox.addEventListener('change', bpEnvSync);
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

    notifyTelegram();

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

// ---------- تحميل الفيديو والخلفية من الدعوة المدمجة ----------
function loadTemplateAssets() {
    try {
        const host = window.parent && window.parent !== window ? window.parent : null;
        const inv = host && host.INVSTR ? String(host.INVSTR) : '';
        if (!inv) return;
        const vm = inv.match(/src="(data:video\/[^"]+)"/);
        const vid = document.getElementById('bpIntroVideo');
        if (vm && vm[1] && vid) {
            vid.src = vm[1];
            const p = vid.play();
            if (p && p.catch) p.catch(() => {});
        }
        const bm = inv.match(/url\((data:image\/[^)]+)\)/);
        const bp = document.getElementById('bpScreen');
        if (bm && bm[1] && bp) {
            bp.style.backgroundImage = 'url(' + bm[1] + ')';
            bp.style.backgroundSize = 'cover';
            bp.style.backgroundPosition = 'center';
        }
    } catch (e) { /* تعذر الوصول */ }
}
loadTemplateAssets();

// تحديث العد التنازلي في المعاينة كل ثانية
setInterval(renderPreview, 1000);

// قائمة الموبايل
document.getElementById('hamburger').addEventListener('click', () => document.getElementById('mobileMenu').classList.add('open'));
document.getElementById('closeMenu').addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open'));