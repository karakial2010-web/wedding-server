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