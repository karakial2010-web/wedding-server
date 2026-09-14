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