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