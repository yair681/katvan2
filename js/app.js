/* Katvan - Hebrew-first word processor */
(function () {
  'use strict';

  /* =========================================================
     Constants
     ========================================================= */
  var PX_PER_CM = 96 / 2.54;
  var GAP = 28;
  var LS_INDEX = 'ktv.index';
  var LS_DOC = 'ktv.doc.';
  var LS_CURRENT = 'ktv.current';
  var LS_PREFS = 'ktv.prefs';
  var BLOCK_SEL = 'p,h1,h2,h3,h4,h5,h6,blockquote,li,pre,div:not(.page-break)';
  var FLOW_TAGS = { P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, BLOCKQUOTE: 1, LI: 1, TABLE: 1, HR: 1, PRE: 1, FIGURE: 1 };

  var FONTS = [
    { name: 'Arial', css: 'Arial' },
    { name: 'David', css: 'David, "David Libre"' },
    { name: 'David Libre', css: '"David Libre", David' },
    { name: 'Frank Ruhl Libre', css: '"Frank Ruhl Libre", David' },
    { name: 'Assistant', css: 'Assistant, Arial' },
    { name: 'Heebo', css: 'Heebo, Arial' },
    { name: 'Rubik', css: 'Rubik, Arial' },
    { name: 'Noto Sans Hebrew', css: '"Noto Sans Hebrew", Arial' },
    { name: 'Secular One', css: '"Secular One", Arial' },
    { name: 'Times New Roman', css: '"Times New Roman"' },
    { name: 'Calibri', css: 'Calibri, Arial' },
    { name: 'Segoe UI', css: '"Segoe UI", Arial' },
    { name: 'Courier New', css: '"Courier New"' }
  ];
  var SIZES = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
  var TEXT_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#d9d9d9', '#efefef', '#ffffff',
    '#c62828', '#e8710a', '#f9ab00', '#188038', '#12857a', '#1a73e8', '#3d5afe', '#8e24aa',
    '#8c1d18', '#a14f06', '#b06000', '#0d652d', '#0b5c55', '#174ea6', '#283593', '#5e1b78',
    '#f28b82', '#fbbc75', '#fdd663', '#81c995', '#78d9cc', '#8ab4f8', '#9fa8ff', '#d7aefb'
  ];
  var HIGHLIGHTS = ['#fff176', '#ffe0a3', '#ffcdd2', '#f8bbd0', '#e1bee7', '#c5cae9', '#b3e5fc', '#b2f2bb', '#dcedc8', '#e5e7eb', '#ffd54f', '#80deea'];
  var CELL_SHADES = ['#ffffff', '#f3f4f6', '#e5e7eb', '#fef3c7', '#fde2e2', '#e0e7ff', '#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe', '#cffafe', '#fff7ed'];
  var LINE_SPACINGS = [1, 1.15, 1.5, 2, 2.5, 3];
  var MARGIN_PRESETS = [
    { id: 'normal', name: 'רגילים', top: 2.54, bottom: 2.54, side: 2.54 },
    { id: 'narrow', name: 'צרים', top: 1.27, bottom: 1.27, side: 1.27 },
    { id: 'moderate', name: 'בינוניים', top: 2.54, bottom: 2.54, side: 1.91 },
    { id: 'wide', name: 'רחבים', top: 2.54, bottom: 2.54, side: 5.08 }
  ];
  var SYMBOLS = [
    { title: 'מתמטיקה', items: ['×', '÷', '±', '∓', '=', '≠', '≈', '≡', '<', '>', '≤', '≥', '√', '∛', 'π', '∞', '°', '²', '³', 'ⁿ', '½', '⅓', '¼', '¾', '∑', '∏', '∫', '∆', '∠', '⊥', '∥', '%', '‰', '∈', '∉', '∩', '∪', '⊂', '∅', '∴'] },
    { title: 'אותיות יווניות', items: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'σ', 'φ', 'ω', 'Ω'] },
    { title: 'חצים', items: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔'] },
    { title: 'עברית ופיסוק', items: ['״', '׳', '־', '₪', '–', '—', '…', '•', '«', '»', '„', '“', '”', '§', '©', '€', '$', '£', '№', '✓'] }
  ];

  /* =========================================================
     DOM refs
     ========================================================= */
  var $ = function (id) { return document.getElementById(id); };
  var editor = $('editor');
  var canvas = $('canvas');
  var pageWrap = $('pageWrap');
  var pagesLayer = $('pagesLayer');
  var zoomSizer = $('zoomSizer');
  var imgOverlay = $('imgOverlay');

  /* =========================================================
     Small utils
     ========================================================= */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); var a = arguments; t = setTimeout(function () { fn.apply(null, a); }, ms); }; }
  function plural(n, one, many) { return n === 1 ? one : n.toLocaleString('he-IL') + ' ' + many; }

  var toastTimer;
  function toast(msg, isErr, ms) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.toggle('err', !!isErr);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || (isErr ? 5200 : 2600));
  }

  /* =========================================================
     Storage (all wrapped)
     ========================================================= */
  var ls = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  function lsJson(k, fallback) { try { var v = ls.get(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

  var idbP = null;
  function idb() {
    if (idbP) return idbP;
    idbP = new Promise(function (resolve) {
      try {
        var req = indexedDB.open('katvan', 1);
        req.onupgradeneeded = function () { req.result.createObjectStore('docs'); };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
    return idbP;
  }
  function idbOp(mode, fn) {
    return idb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        try {
          var tx = db.transaction('docs', mode);
          var r = fn(tx.objectStore('docs'));
          tx.oncomplete = function () { resolve(r && 'result' in r ? r.result : true); };
          tx.onerror = tx.onabort = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    });
  }
  var idbGet = function (k) { return idbOp('readonly', function (s) { return s.get(k); }); };
  var idbSet = function (k, v) { return idbOp('readwrite', function (s) { s.put(v, k); }); };
  var idbDel = function (k) { return idbOp('readwrite', function (s) { s.delete(k); }); };

  var prefs = Object.assign({ theme: null, zoom: 1, outline: false, spell: true, ribbonCollapsed: false, textColor: '#c62828', highlight: '#fff176' }, lsJson(LS_PREFS, {}));
  function savePrefs() { ls.set(LS_PREFS, JSON.stringify(prefs)); }

  /* =========================================================
     Library loader (local vendor folder, lazy, graceful)
     ========================================================= */
  var LIBS = {
    jszip: { url: 'vendor/jszip.min.js', test: function () { return window.JSZip; } },
    mammoth: { url: 'vendor/mammoth.browser.min.js', test: function () { return window.mammoth; } },
    jspdf: { url: 'vendor/jspdf.umd.min.js', test: function () { return window.jspdf && window.jspdf.jsPDF ? window.jspdf : null; } },
    mathlive: { url: 'vendor/mathlive/mathlive.min.js', test: function () { return window.MathLive && window.MathfieldElement ? window.MathLive : null; } }
  };
  /* extension points used by js/extras.js */
  var hooks = {};
  var libPromises = {};
  function loadLib(name) {
    var lib = LIBS[name];
    if (lib.test()) return Promise.resolve(lib.test());
    if (libPromises[name]) return libPromises[name];
    libPromises[name] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; fail(); } }, 25000);
      function fail() { delete libPromises[name]; s.remove(); markLib(name, false); reject(new Error('LIB_' + name)); }
      s.src = lib.url;
      s.async = true;
      s.onload = function () { if (done) return; done = true; clearTimeout(timer); if (lib.test()) { markLib(name, true); resolve(lib.test()); } else fail(); };
      s.onerror = function () { if (done) return; done = true; clearTimeout(timer); fail(); };
      document.head.appendChild(s);
    });
    return libPromises[name];
  }
  var LIB_BUTTONS = { jszip: '[data-cmd="saveDocx"]', jspdf: '[data-cmd="exportPdf"]', mammoth: null };
  function markLib(name, ok) {
    var sel = LIB_BUTTONS[name];
    if (!sel) return;
    document.querySelectorAll(sel).forEach(function (b) {
      b.classList.toggle('lib-missing', !ok);
      var note = b.querySelector('.lib-note');
      if (!ok && !note) { note = document.createElement('span'); note.className = 'lib-note'; note.textContent = 'רכיב חסר'; b.appendChild(note); }
      if (ok && note) note.remove();
      b.title = ok ? '' : 'רכיב מתיקיית התוכנה (vendor) לא נטען. ודא שהתיקייה שלמה ונסה שוב.';
    });
  }

  /* =========================================================
     Document state
     ========================================================= */
  function defaultSettings() {
    return { orientation: 'portrait', margins: { top: 2.54, bottom: 2.54, side: 2.54 }, header: '', footer: '', pageNumbers: false, numberFirst: true };
  }
  var cur = null;          // { id, title, titleManual, settings, created, updated }
  var dirty = false;
  var fileHandle = null;   // { handle, kind, name }

  function geom() {
    var s = cur ? cur.settings : defaultSettings();
    var land = s.orientation === 'landscape';
    var W = (land ? 29.7 : 21) * PX_PER_CM;
    var H = (land ? 21 : 29.7) * PX_PER_CM;
    return { W: W, H: H, top: s.margins.top * PX_PER_CM, bottom: s.margins.bottom * PX_PER_CM, side: s.margins.side * PX_PER_CM, P: H + GAP };
  }

  /* =========================================================
     Selection helpers
     ========================================================= */
  var savedRange = null;
  function inEditor(node) { return node && (node === editor || editor.contains(node)); }
  function currentRange() {
    var sel = window.getSelection();
    if (sel.rangeCount && inEditor(sel.getRangeAt(0).commonAncestorContainer)) return sel.getRangeAt(0);
    return savedRange;
  }
  function restoreSel() {
    var sel = window.getSelection();
    var live = sel.rangeCount && inEditor(sel.getRangeAt(0).commonAncestorContainer);
    if (document.activeElement !== editor) editor.focus({ preventScroll: true });
    if (!live && savedRange && inEditor(savedRange.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRange);
    } else if (!live && !(sel.rangeCount && inEditor(sel.getRangeAt(0).commonAncestorContainer))) {
      placeCaret(editor.firstElementChild || editor, true);
    }
  }
  function placeCaret(node, atStart) {
    var r = document.createRange();
    r.selectNodeContents(node);
    r.collapse(!!atStart);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
    savedRange = r.cloneRange();
  }
  function closestBlock(node) {
    if (!node) return null;
    var el = node.nodeType === 1 ? node : node.parentNode;
    while (el && el !== editor) {
      if (el.matches && el.matches(BLOCK_SEL + ',td,th')) return el;
      el = el.parentNode;
    }
    return null;
  }
  function topBlock(node) {
    var el = node && (node.nodeType === 1 ? node : node.parentNode);
    if (!el || !inEditor(el) || el === editor) return null;
    while (el.parentNode && el.parentNode !== editor) el = el.parentNode;
    return el.parentNode === editor ? el : null;
  }
  function selectedBlocks() {
    var r = currentRange();
    if (!r) return [];
    if (selectedImg) { var bi = closestBlock(selectedImg); return bi ? [bi] : []; }
    if (r.collapsed) { var b = closestBlock(r.startContainer); return b ? [b] : []; }
    var startBlock = closestBlock(r.startContainer);
    var all = Array.prototype.slice.call(editor.querySelectorAll(BLOCK_SEL));
    var res = all.filter(function (el) { return r.intersectsNode(el); });
    res = res.filter(function (el) { return !res.some(function (o) { return o !== el && el.contains(o); }); });
    res = res.filter(function (el) {
      if (el === startBlock || el.contains(startBlock)) return true;
      try {
        var probe = document.createRange();
        probe.setStart(el, 0);
        probe.setEnd(r.endContainer, r.endOffset);
        return probe.toString().length > 0 || probe.cloneContents().querySelector('img');
      } catch (e) { return true; }
    });
    if (!res.length && startBlock) res = [startBlock];
    return res;
  }
  function pathOf(node) {
    var path = [];
    while (node && node !== editor) {
      var i = 0, n = node;
      while ((n = n.previousSibling)) i++;
      path.unshift(i);
      node = node.parentNode;
    }
    return node === editor ? path : null;
  }
  function nodeAt(path) {
    var n = editor;
    for (var i = 0; i < path.length; i++) { n = n.childNodes[path[i]]; if (!n) return null; }
    return n;
  }
  function getSelPath() {
    var r = currentRange();
    if (!r) return null;
    var a = pathOf(r.startContainer), f = pathOf(r.endContainer);
    if (!a || !f) return null;
    return { a: a, ao: r.startOffset, f: f, fo: r.endOffset };
  }
  function setSelPath(p) {
    try {
      if (!p) throw 0;
      var a = nodeAt(p.a), f = nodeAt(p.f);
      if (!a || !f) throw 0;
      var r = document.createRange();
      r.setStart(a, Math.min(p.ao, a.nodeType === 3 ? a.length : a.childNodes.length));
      r.setEnd(f, Math.min(p.fo, f.nodeType === 3 ? f.length : f.childNodes.length));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      savedRange = r.cloneRange();
    } catch (e) {
      placeCaret(editor.lastElementChild || editor, false);
    }
  }

  /* =========================================================
     Clean serialization
     ========================================================= */
  function cleanHTML(root) {
    var clone = (root || editor).cloneNode(true);
    clone.querySelectorAll('.pg-push').forEach(function (el) {
      el.classList.remove('pg-push');
      el.style.marginTop = '';
    });
    clone.querySelectorAll('.img-sel').forEach(function (el) { el.classList.remove('img-sel'); });
    clone.querySelectorAll('[class=""]').forEach(function (el) { el.removeAttribute('class'); });
    clone.querySelectorAll('[style=""]').forEach(function (el) { el.removeAttribute('style'); });
    clone.querySelectorAll('font').forEach(function (f) {
      var span = document.createElement('span');
      if (f.getAttribute('style')) span.setAttribute('style', f.getAttribute('style'));
      if (f.getAttribute('color')) span.style.color = f.getAttribute('color');
      if (f.getAttribute('face')) span.style.fontFamily = f.getAttribute('face');
      while (f.firstChild) span.appendChild(f.firstChild);
      f.parentNode.replaceChild(span, f);
    });
    return clone.innerHTML;
  }
  function docText() { return editor.innerText || ''; }
  function isEmptyDoc() {
    return !docText().trim() && !editor.querySelector('img,table,hr,.page-break');
  }

  /* =========================================================
     Sanitizer (paste + import)
     ========================================================= */
  var KEEP_TAGS = { P: 'p', BR: 'br', B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', S: 's', STRIKE: 's', DEL: 's', SUB: 'sub', SUP: 'sup', SPAN: 'span', FONT: 'span',
    A: 'a', UL: 'ul', OL: 'ol', LI: 'li', H1: 'h1', H2: 'h2', H3: 'h3', H4: 'h3', H5: 'h3', H6: 'h3', BLOCKQUOTE: 'blockquote', TABLE: 'table', THEAD: 'thead', TBODY: 'tbody',
    TFOOT: 'tbody', TR: 'tr', TD: 'td', TH: 'th', IMG: 'img', HR: 'hr', DIV: 'div', PRE: 'p', CODE: 'span', MARK: 'span', INS: 'u', CENTER: 'p', ARTICLE: 'div', SECTION: 'div', MAIN: 'div', HEADER: 'div', FOOTER: 'div', FIGURE: 'div', FIGCAPTION: 'p', CAPTION: 'p' };
  var DROP_TAGS = { SCRIPT: 1, STYLE: 1, META: 1, LINK: 1, TITLE: 1, HEAD: 1, SVG: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, INPUT: 1, BUTTON: 1, SELECT: 1, TEXTAREA: 1, NOSCRIPT: 1, TEMPLATE: 1, CANVAS: 1, VIDEO: 1, AUDIO: 1, FORM: 1 };
  var INLINE_STYLE = ['font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'color', 'background-color', 'font-size', 'font-family', 'vertical-align'];
  var BLOCK_STYLE = ['text-align', 'line-height', 'direction', 'margin-inline-start', 'margin-right', 'margin-left', 'background-color'];
  // Katvan's own structural classes and data attributes survive reopening a saved file
  var KEEP_CLASSES = { math: 1, tab: 1, sol: 1, sys: 1, l: 1, e: 1, r: 1, br: 1, fn: 1, sources: 1, eq: 1, graph: 1 };
  var KEEP_DATA = ['data-note', 'data-latex', 'data-graph'];

  function filterStyle(src, tag) {
    if (!src) return '';
    var probe = document.createElement('span');
    probe.setAttribute('style', src);
    var st = probe.style;
    var out = [];
    var isBlock = /^(p|h1|h2|h3|li|blockquote|div|td|th)$/.test(tag);
    var allowed = INLINE_STYLE.concat(isBlock ? BLOCK_STYLE : []);
    if (tag === 'img') allowed = ['width'];
    allowed.forEach(function (prop) {
      var v = st.getPropertyValue(prop);
      if (!v) return;
      v = v.trim();
      if (prop === 'background-color' && /transparent|rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|^(#fff|#ffffff|white|rgb\(255,\s*255,\s*255\))$/i.test(v)) return;
      if (prop === 'font-size') {
        var m = v.match(/^([\d.]+)(pt|px)$/);
        if (!m) return;
        var pt = m[2] === 'px' ? parseFloat(m[1]) * 0.75 : parseFloat(m[1]);
        if (pt < 5 || pt > 120) return;
        v = (Math.round(pt * 2) / 2) + 'pt';
      }
      if (prop === 'line-height' && !/^[\d.]+$/.test(v)) return;
      if ((prop === 'margin-right' || prop === 'margin-left' || prop === 'margin-inline-start') && !/^[\d.]+(pt|px|cm)$/.test(v)) return;
      if ((prop === 'margin-right' || prop === 'margin-left') && parseFloat(v) === 0) return;
      if (prop === 'font-family') { v = v.split(',')[0].trim(); if (/^(inherit|initial|-apple|system-ui|sans-serif|serif)/i.test(v)) return; if (/["']/.test(v) === false && /\s/.test(v)) v = '"' + v + '"'; }
      if (prop === 'width' && !/^[\d.]+(px|%)$/.test(v)) return;
      if (prop === 'vertical-align' && !/^(super|sub)$/.test(v)) return;
      if (prop === 'font-weight' && /^(normal|400)$/.test(v) && tag !== 'b') return;
      out.push(prop + ':' + v);
    });
    return out.join(';');
  }

  function sanitizeHTML(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var out = document.createElement('div');
    function walk(src, dst) {
      for (var n = src.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); continue; }
        if (n.nodeType !== 1) continue;
        var tagU = n.tagName.toUpperCase();
        if (DROP_TAGS[tagU] || tagU.indexOf(':') > 0) continue;
        if (n.classList && n.classList.contains('fn-notes')) continue;   // regenerated from the note markers
        var tag = KEEP_TAGS[tagU];
        if (!tag) { walk(n, dst); continue; }
        if ((tagU === 'B' || tagU === 'STRONG') && /font-weight:\s*(normal|400)/i.test(n.getAttribute('style') || '')) tag = 'span';
        var el = document.createElement(tag);
        if (tag === 'a') {
          var href = n.getAttribute('href') || '';
          if (/^(https?:|mailto:|tel:)/i.test(href)) el.setAttribute('href', href); else { walk(n, dst); continue; }
        }
        if (tag === 'img') {
          var srcA = n.getAttribute('src') || '';
          if (!/^(data:image\/|https?:)/i.test(srcA)) continue;
          el.setAttribute('src', srcA);
          if (n.getAttribute('alt')) el.setAttribute('alt', n.getAttribute('alt'));
          var wAttr = parseInt(n.getAttribute('width'), 10);
          if (wAttr > 0 && !/width/.test(n.getAttribute('style') || '')) el.style.width = wAttr + 'px';
        }
        if ((tag === 'td' || tag === 'th')) {
          if (+n.getAttribute('colspan') > 1) el.setAttribute('colspan', n.getAttribute('colspan'));
          if (+n.getAttribute('rowspan') > 1) el.setAttribute('rowspan', n.getAttribute('rowspan'));
        }
        if (tag === 'ol' && +n.getAttribute('start') > 1) el.setAttribute('start', n.getAttribute('start'));
        var dir = (n.getAttribute('dir') || '').toLowerCase();
        if (dir === 'rtl' || dir === 'ltr') el.setAttribute('dir', dir);
        if (tagU === 'DIV' && n.classList.contains('page-break')) { el.className = 'page-break'; el.setAttribute('contenteditable', 'false'); dst.appendChild(el); continue; }
        if (n.getAttribute('data-ph')) el.setAttribute('data-ph', n.getAttribute('data-ph'));
        var keepCls = Array.prototype.filter.call(n.classList || [], function (c) { return KEEP_CLASSES[c]; });
        if (keepCls.length) el.className = keepCls.join(' ');
        KEEP_DATA.forEach(function (a) { var v = n.getAttribute(a); if (v != null) el.setAttribute(a, v); });
        var style = filterStyle(n.getAttribute('style'), tag);
        if (tagU === 'FONT') {
          var extra = [];
          if (n.getAttribute('color')) extra.push('color:' + n.getAttribute('color'));
          if (n.getAttribute('face')) extra.push('font-family:' + n.getAttribute('face').split(',')[0]);
          style = [style].concat(extra).filter(Boolean).join(';');
        }
        if (tagU === 'CENTER') style = 'text-align:center;' + style;
        var align = n.getAttribute('align');
        if (align && /^(p|div|h1|h2|h3|td|th)$/.test(tag) && /^(left|right|center|justify)$/i.test(align)) style = 'text-align:' + align.toLowerCase() + ';' + style;
        if (style) el.setAttribute('style', style);
        if (tag === 'span' && !style && !el.attributes.length) { walk(n, dst); continue; }
        walk(n, el);
        dst.appendChild(el);
      }
    }
    walk(doc.body || doc.documentElement, out);
    // div -> p where it holds only inline content; unwrap container divs
    out.querySelectorAll('div:not(.page-break)').forEach(function (d) {
      var hasBlock = Array.prototype.some.call(d.children, function (c) { return /^(P|DIV|H\d|UL|OL|TABLE|BLOCKQUOTE|HR)$/.test(c.tagName); });
      if (hasBlock) {
        while (d.firstChild) d.parentNode.insertBefore(d.firstChild, d);
        d.remove();
      } else {
        var p = document.createElement('p');
        Array.prototype.forEach.call(d.attributes, function (a) { p.setAttribute(a.name, a.value); });
        while (d.firstChild) p.appendChild(d.firstChild);
        d.parentNode.replaceChild(p, d);
      }
    });
    // empty table cells need a caret target
    out.querySelectorAll('td,th').forEach(function (c) { if (!c.firstChild) c.innerHTML = '<br>'; });
    out.querySelectorAll('p').forEach(function (p) { if (!p.firstChild) p.innerHTML = '<br>'; });
    return out.innerHTML;
  }

  /* =========================================================
     History (own stack; native undo is bypassed)
     ========================================================= */
  var hist = { stack: [], idx: -1, timer: null };
  function snapshot() { return { html: cleanHTML(), sel: getSelPath() }; }
  function histReset() { hist.stack = [snapshot()]; hist.idx = 0; clearTimeout(hist.timer); hist.timer = null; updateUndoButtons(); }
  function histCommit() {
    clearTimeout(hist.timer); hist.timer = null;
    var s = snapshot();
    var top = hist.stack[hist.idx];
    if (top && top.html === s.html) { top.sel = s.sel; return; }
    hist.stack = hist.stack.slice(0, hist.idx + 1);
    hist.stack.push(s);
    if (hist.stack.length > 300) hist.stack.shift();
    // cap memory: documents with photos make each snapshot large
    var total = 0;
    for (var i = 0; i < hist.stack.length; i++) total += hist.stack[i].html.length;
    while (total > 40e6 && hist.stack.length > 2) total -= hist.stack.shift().html.length;
    hist.idx = hist.stack.length - 1;
    updateUndoButtons();
  }
  function histSchedule(ms) { clearTimeout(hist.timer); hist.timer = setTimeout(histCommit, ms == null ? 700 : ms); }
  function histFlush() { if (hist.timer) histCommit(); }
  function histRestore(s) {
    editor.innerHTML = s.html;
    ensureContent();
    deselectImage();
    setSelPath(s.sel);
    afterDomChange(false);
    updateUndoButtons();
  }
  function undo() { histFlush(); if (hist.idx > 0) { hist.idx--; histRestore(hist.stack[hist.idx]); } }
  function redo() { histFlush(); if (hist.idx < hist.stack.length - 1) { hist.idx++; histRestore(hist.stack[hist.idx]); } }
  function updateUndoButtons() {
    document.querySelectorAll('[data-cmd="undo"]').forEach(function (b) { b.disabled = hist.idx <= 0 && !hist.timer; });
    document.querySelectorAll('[data-cmd="redo"]').forEach(function (b) { b.disabled = hist.idx >= hist.stack.length - 1; });
  }

  /* run a mutating command with history + relayout */
  function act(fn) {
    restoreSel();
    histFlush();
    var r = fn();
    normalize();
    histCommit();
    afterDomChange(true);
    return r;
  }
  var wantCaret = false;
  function ensureCaretVisible() {
    var sel = window.getSelection();
    if (!sel.rangeCount || !inEditor(sel.getRangeAt(0).startContainer)) return;
    var r = sel.getRangeAt(0);
    var rect = r.getClientRects()[0];
    if (!rect) { var n = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode; rect = n.getBoundingClientRect(); }
    if (!rect || (!rect.height && !rect.top)) return;
    var cr = canvas.getBoundingClientRect();
    if (rect.bottom > cr.bottom - 24) canvas.scrollTop += rect.bottom - cr.bottom + 90;
    else if (rect.top < cr.top + 8) canvas.scrollTop -= cr.top - rect.top + 60;
  }
  function afterDomChange(markDirtyFlag) {
    markDirty();
    wantCaret = true;
    scheduleLayout();
    scheduleToolbar();
    scheduleOutline();
    scheduleCount();
    if (findState.open) scheduleFind();
    positionOverlay();
    if (hooks.changed) hooks.changed();
  }

  /* =========================================================
     Normalization
     ========================================================= */
  function ensureContent() {
    var kids = editor.childNodes;
    var meaningful = false;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.nodeType === 1 || (k.nodeType === 3 && k.nodeValue.trim())) { meaningful = true; break; }
    }
    if (!meaningful || (editor.children.length === 1 && editor.firstElementChild.tagName === 'BR' && !editor.textContent)) {
      editor.innerHTML = '<p><br></p>';
      return true;
    }
    return false;
  }
  function normalize() {
    ensureContent();
    // wrap stray top-level inline nodes in paragraphs
    var run = [];
    var flush = function () {
      if (!run.length) return;
      var has = run.some(function (n) { return n.nodeType === 1 || n.nodeValue.trim(); });
      if (has) {
        var p = document.createElement('p');
        run[0].parentNode.insertBefore(p, run[0]);
        run.forEach(function (n) { p.appendChild(n); });
      } else run.forEach(function (n) { n.remove(); });
      run = [];
    };
    Array.prototype.slice.call(editor.childNodes).forEach(function (n) {
      if (n.nodeType === 3 || (n.nodeType === 1 && !FLOW_TAGS[n.tagName] && !n.classList.contains('page-break') && n.tagName !== 'UL' && n.tagName !== 'OL')) {
        if (n.nodeType === 1 && n.tagName === 'BR' && !run.length && n.nextSibling) { n.remove(); return; }
        run.push(n);
      } else flush();
    });
    flush();
    // lists wrapped in p (Chrome quirk)
    editor.querySelectorAll('p > ul, p > ol').forEach(function (list) {
      var p = list.parentNode;
      if (p.parentNode) {
        while (p.firstChild) p.parentNode.insertBefore(p.firstChild, p);
        p.remove();
      }
    });
    // convert Chrome size=7 markers into real sizes
    fixFontMarkers();
    if (hooks.normalize) hooks.normalize();
    // last element should allow typing after a table / page break
    var last = editor.lastElementChild;
    var notes = last && last.classList.contains('fn-notes') ? last : null;
    if (notes) last = notes.previousElementSibling;
    if (!last || last.tagName === 'TABLE' || last.classList.contains('page-break') || last.tagName === 'HR' || last.classList.contains('sources')) {
      var np = document.createElement('p'); np.innerHTML = '<br>'; editor.insertBefore(np, notes);
    }
  }
  /* last block the caret can go into (the generated notes list is read-only) */
  function lastEditable() {
    var l = editor.lastElementChild;
    while (l && l.getAttribute('contenteditable') === 'false') l = l.previousElementSibling;
    while (l && (l.tagName === 'UL' || l.tagName === 'OL') && l.lastElementChild) l = l.lastElementChild;
    return l || editor;
  }
  var pendingFontSize = null;
  function fixFontMarkers() {
    editor.querySelectorAll('font[size]').forEach(function (f) {
      var sz = f.getAttribute('size');
      f.removeAttribute('size');
      if (sz === '7' && pendingFontSize) {
        f.style.fontSize = pendingFontSize + 'pt';
        f.querySelectorAll('[style*="font-size"]').forEach(function (d) { d.style.fontSize = ''; });
      }
    });
  }

  /* =========================================================
     Pagination (visual A4 pages)
     ========================================================= */
  var layoutQueued = false;
  var composing = false;
  var pageCount = 1;
  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(function () { layoutQueued = false; if (!composing) layout(); });
  }
  function flowBlocks() {
    var out = [];
    for (var c = editor.firstElementChild; c; c = c.nextElementSibling) {
      if (c.tagName === 'UL' || c.tagName === 'OL') {
        for (var li = c.firstElementChild; li; li = li.nextElementSibling) if (li.tagName === 'LI') out.push(li);
      } else if (FLOW_TAGS[c.tagName] || c.classList.contains('page-break')) out.push(c);
    }
    return out;
  }
  function clearPagination() {
    editor.querySelectorAll('.pg-push').forEach(function (el) {
      el.classList.remove('pg-push');
      el.style.marginTop = '';
      if (!el.getAttribute('style')) el.removeAttribute('style');
      if (!el.getAttribute('class')) el.removeAttribute('class');
    });
  }
  function layout() {
    if (isFluid()) { layoutFluid(); return; }
    pageWrap.classList.remove('fluid');
    var g = geom();
    editor.style.width = g.W + 'px';
    editor.style.padding = g.top + 'px ' + g.side + 'px ' + g.bottom + 'px';
    clearPagination();
    var P = g.P, H = g.H;
    var zoneH = H - g.top - g.bottom;
    var blocks = flowBlocks();
    var lastBottom = 0;
    var forcedPage = -1;
    var minPages = 1;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b.classList.contains('page-break')) {
        var pbTop = b.offsetTop;
        forcedPage = Math.floor(pbTop / P) + 1;
        minPages = Math.max(minPages, forcedPage + 1);
        continue;
      }
      var top = b.offsetTop, h = b.offsetHeight;
      var page = Math.floor(top / P);
      var within = top - page * P;
      var target = null;
      if (forcedPage >= 0) {
        if (page < forcedPage || within < g.top) target = forcedPage * P + g.top;
        forcedPage = -1;
      }
      if (target === null) {
        if (within > H - g.bottom) target = (page + 1) * P + g.top;              // starts in bottom margin / gap
        else if (within < g.top - 1 && page > 0) target = page * P + g.top;      // starts in top margin
        else if (within + h > H - g.bottom + 0.5 && h <= zoneH) target = (page + 1) * P + g.top;
      }
      if (target !== null && target > top + 0.5) {
        var cm = parseFloat(getComputedStyle(b).marginTop) || 0;
        b.classList.add('pg-push');
        b.style.marginTop = (cm + target - top) + 'px';
        var nt = b.offsetTop;
        if (Math.abs(nt - target) > 0.5) b.style.marginTop = (parseFloat(b.style.marginTop) + target - nt) + 'px';
        top = b.offsetTop;
      }
      lastBottom = Math.max(lastBottom, top + b.offsetHeight);
    }
    var pages = Math.max(minPages, Math.floor(Math.max(lastBottom - 1, 0) / P) + 1);
    if (lastBottom > 0) {
      var lastPageStart = (pages - 1) * P;
      if (lastBottom > lastPageStart + H - g.bottom + 2 && lastBottom - lastPageStart > H) pages++;
    }
    pageCount = pages;
    editor.style.minHeight = (pages * P - GAP) + 'px';
    renderPages(g, pages);
    applyZoom();
    positionOverlay();
    if (wantCaret) { wantCaret = false; ensureCaretVisible(); }
    updatePageIndicator();
  }
  /* phones: the document is one fluid column (no A4 width, no zoom). pageCount keeps the last A4 value;
     exports and printing call suspendView() first, which makes layout() paginate in A4 again. */
  function layoutFluid() {
    pageWrap.classList.add('fluid');
    clearPagination();
    editor.style.width = '';
    editor.style.padding = '';
    editor.style.minHeight = Math.max(0, canvas.clientHeight) + 'px';
    while (pagesLayer.firstChild) pagesLayer.firstChild.remove();
    pageWrap.style.width = '';
    pageWrap.style.height = '';
    pageWrap.style.transform = '';
    zoomSizer.style.width = '';
    zoomSizer.style.height = '';
    positionOverlay();
    if (wantCaret) { wantCaret = false; ensureCaretVisible(); }
  }
  /* real A4 page count, also while the phone shows the fluid column */
  function a4PageCount() {
    if (!isFluid()) return pageCount;
    var st = canvas.scrollTop;
    forceA4 = true;
    try { layout(); } finally { forceA4 = false; }
    var n = pageCount;
    layout();
    canvas.scrollTop = st;
    return n;
  }
  function renderPages(g, pages) {
    var s = cur.settings;
    while (pagesLayer.children.length > pages) pagesLayer.lastChild.remove();
    for (var i = 0; i < pages; i++) {
      var pg = pagesLayer.children[i];
      if (!pg) {
        pg = document.createElement('div');
        pg.className = 'page';
        pg.innerHTML = '<div class="page-hf hf-top"></div><div class="page-hf hf-bottom"></div>';
        pagesLayer.appendChild(pg);
      }
      pg.style.top = (i * g.P) + 'px';
      pg.style.height = g.H + 'px';
      var top = pg.firstChild, bot = pg.lastChild;
      top.style.top = '0'; top.style.height = g.top + 'px';
      bot.style.bottom = '0'; bot.style.height = g.bottom + 'px';
      top.textContent = s.header || '';
      var showNum = s.pageNumbers && (s.numberFirst || i > 0);
      var foot = (s.footer || '');
      bot.textContent = '';
      if (foot) bot.appendChild(document.createTextNode(foot));
      if (showNum) {
        var sp = document.createElement('span');
        sp.className = 'page-num';
        sp.textContent = (foot ? '   ' : '') + (i + 1);
        bot.appendChild(sp);
      }
    }
    pageWrap.style.width = g.W + 'px';
    pageWrap.style.height = (pages * g.P - GAP) + 'px';
  }

  /* =========================================================
     Zoom
     ========================================================= */
  function zoomNow() { return isFluid() ? 1 : prefs.zoom; }
  function applyZoom() {
    if (isFluid()) { pageWrap.style.transform = ''; zoomSizer.style.width = ''; zoomSizer.style.height = ''; return; }
    var z = prefs.zoom;
    var g = geom();
    var h = pageCount * g.P - GAP;
    pageWrap.style.transform = z === 1 ? '' : 'scale(' + z + ')';
    zoomSizer.style.width = (g.W * z) + 'px';
    zoomSizer.style.height = (h * z) + 'px';
    $('zoomRange').value = Math.round(z * 100);
    $('zoomVal').textContent = Math.round(z * 100) + '%';
  }
  function setZoom(z) {
    prefs.zoom = Math.round(clamp(z, 0.5, 2) * 100) / 100;
    savePrefs();
    applyZoom();
    positionOverlay();
  }

  /* =========================================================
     Autosave + documents index
     ========================================================= */
  function readIndex() { var v = lsJson(LS_INDEX, []); return Array.isArray(v) ? v : []; }
  function writeIndex(ix) { return ls.set(LS_INDEX, JSON.stringify(ix)); }
  function derivedTitle() {
    var first = (editor.innerText || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean)[0] || '';
    return first.length > 48 ? first.slice(0, 48).trim() + '…' : first;
  }
  function displayTitle() { return (cur.titleManual && cur.title) ? cur.title : (derivedTitle() || 'מסמך ללא שם'); }
  function markDirty() {
    dirty = true;
    setSaveState('pending');
  }
  var saving = false;
  function setSaveState(state) {
    var el = $('saveState');
    el.classList.remove('warn');
    if (state === 'pending') { el.textContent = ''; }
    else if (state === 'saved') { el.innerHTML = Icons.svg('check') + '<span>נשמר</span>'; }
    else if (state === 'fail') { el.classList.add('warn'); el.innerHTML = Icons.svg('alert') + '<span>השמירה האוטומטית נכשלה: שמור קובץ למחשב</span>'; }
  }
  function saveNow() {
    if (!cur || saving) return Promise.resolve();
    var html = cleanHTML();
    var ix = readIndex();
    var entryIdx = ix.findIndex(function (e) { return e.id === cur.id; });
    if (isEmptyDoc() && entryIdx < 0 && !cur.titleManual) { dirty = false; setSaveState(''); return Promise.resolve(); }
    cur.updated = Date.now();
    var payload = JSON.stringify({ id: cur.id, title: cur.title, titleManual: cur.titleManual, settings: cur.settings, created: cur.created, updated: cur.updated, html: html });
    var entry = { id: cur.id, title: displayTitle(), updated: cur.updated, snippet: docText().replace(/\s+/g, ' ').trim().slice(0, 140), store: 'ls' };
    var finish = function (ok) {
      if (!ok) { setSaveState('fail'); return; }
      var ix2 = readIndex().filter(function (e) { return e.id !== cur.id; });
      ix2.unshift(entry);
      if (!writeIndex(ix2)) { setSaveState('fail'); return; }
      ls.set(LS_CURRENT, cur.id);
      dirty = false;
      setSaveState('saved');
      if (hooks.saved) hooks.saved(html);
    };
    if (ls.set(LS_DOC + cur.id, payload)) { finish(true); return Promise.resolve(); }
    // too large for localStorage (usually images): keep it in IndexedDB instead
    saving = true;
    entry.store = 'idb';
    return idbSet(cur.id, payload).then(function (ok) {
      saving = false;
      if (ok) ls.del(LS_DOC + cur.id);
      finish(!!ok);
    });
  }
  function loadDocData(id) {
    var ix = readIndex();
    var e = ix.find(function (x) { return x.id === id; });
    if (!e) return Promise.resolve(null);
    var raw = ls.get(LS_DOC + id);
    if (raw) { try { return Promise.resolve(JSON.parse(raw)); } catch (err) { return Promise.resolve(null); } }
    return idbGet(id).then(function (v) { try { return v ? JSON.parse(v) : null; } catch (err) { return null; } });
  }
  function deleteDoc(id) {
    writeIndex(readIndex().filter(function (e) { return e.id !== id; }));
    ls.del(LS_DOC + id);
    idbDel(id);
    if (ls.get(LS_CURRENT) === id) ls.del(LS_CURRENT);
  }

  /* =========================================================
     Open / new documents
     ========================================================= */
  function openDoc(data) {
    cur = {
      id: data.id || uid(),
      title: data.title || '',
      titleManual: !!data.titleManual,
      settings: Object.assign(defaultSettings(), data.settings || {}),
      created: data.created || Date.now(),
      updated: data.updated || Date.now()
    };
    cur.settings.margins = Object.assign(defaultSettings().margins, cur.settings.margins || {});
    fileHandle = null;
    deselectImage();
    editor.innerHTML = data.html || '<p><br></p>';
    normalize();
    if (hooks.prepareDoc) hooks.prepareDoc();
    $('docTitle').value = cur.titleManual ? cur.title : '';
    syncLayoutInputs();
    histReset();
    dirty = false;
    setSaveState('');
    layout();
    updateTitle();
    scheduleOutline();
    scheduleCount();
    scheduleToolbar();
    canvas.scrollTop = 0;
    if (data.id) ls.set(LS_CURRENT, cur.id);
    if (hooks.docOpened) hooks.docOpened();
  }
  function newDoc(html, settings, title) {
    if (cur && dirty) saveNow();
    openDoc({ id: uid(), html: html || '<p><br></p>', settings: settings || defaultSettings(), title: title || '', titleManual: !!title });
    closeBackstage();
    if (!isEmptyDoc()) { markDirty(); saveNow(); }
    else ls.set(LS_CURRENT, cur.id);
    editor.focus({ preventScroll: true });
    placeCaret(firstEditable(), true);
  }
  function firstEditable() {
    var ph = editor.querySelector('[data-ph]');
    if (ph) return ph;
    var empty = docText().length < 200 && Array.prototype.find.call(editor.querySelectorAll('p,li,blockquote,td'), function (b) { return !b.textContent.trim() && !b.querySelector('img'); });
    return empty || editor.firstElementChild || editor;
  }
  function updateTitle() {
    var t = displayTitle();
    document.title = t + ' – כתבן 2.0';
    $('docTitle').placeholder = derivedTitle() || 'מסמך ללא שם';
  }

  function hebDate(kind) {
    var d = new Date();
    try {
      if (kind === 'hebrew') return new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      if (kind === 'short') return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
      if (kind === 'weekday') return new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) { return d.toLocaleDateString(); }
  }
  var TEMPLATES = {
    school: function () {
      var empty = '<p><br></p>';
      return {
        title: '',
        settings: Object.assign(defaultSettings(), { pageNumbers: true, numberFirst: false }),
        html:
          empty + empty + empty + empty +
          '<h1 style="text-align:center;font-size:28pt" data-ph="שם העבודה"><br></h1>' +
          '<p style="text-align:center;font-size:15pt" data-ph="מקצוע"><br></p>' +
          empty + empty + empty + empty + empty + empty + empty +
          '<p style="text-align:center;font-size:13pt">מגיש/ה: </p>' +
          '<p style="text-align:center;font-size:13pt">כיתה: </p>' +
          '<p style="text-align:center;font-size:13pt">בית ספר: </p>' +
          '<p style="text-align:center;font-size:13pt">שם המורה: </p>' +
          '<p style="text-align:center;font-size:13pt">תאריך הגשה: ' + hebDate() + '</p>' +
          '<div class="page-break" contenteditable="false"></div>' +
          '<h1>מבוא</h1><p><br></p>' +
          '<h1>פרק ראשון</h1><p><br></p>' +
          '<h1>סיכום</h1><p><br></p>' +
          '<h1>ביבליוגרפיה</h1><p><br></p>'
      };
    },
    letter: function () {
      return {
        title: '',
        settings: defaultSettings(),
        html:
          '<p style="text-align:left">' + hebDate() + '</p>' +
          '<p>לכבוד</p><p data-ph="שם הנמען"><br></p><p><br></p>' +
          '<p style="text-align:center"><b><u>הנדון: </u></b></p><p><br></p>' +
          '<p>שלום רב,</p><p><br></p><p><br></p><p><br></p>' +
          '<p>בברכה,</p><p data-ph="שם השולח"><br></p>'
      };
    },
    tanach: function () {
      var e = '<p><br></p>';
      return {
        title: '',
        settings: defaultSettings(),
        html: '<h2>פסוק</h2><blockquote><br></blockquote><h2>פירוש</h2>' + e + '<h2>שאלות</h2><ol><li><br></li></ol>' + e
      };
    },
    history: function () {
      var e = '<p><br></p>';
      return {
        title: '',
        settings: defaultSettings(),
        html: '<h2>שאלה</h2>' + e + '<h2>תשובה</h2>' + e + '<h2>ציר זמן</h2>' +
          '<table><tbody><tr><th style="width:25%">שנה</th><th>אירוע</th></tr>' +
          '<tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table>' + e
      };
    },
    science: function () {
      var e = '<p><br></p>';
      return {
        title: '',
        settings: defaultSettings(),
        html: '<h1>דוח מעבדה</h1><h2>מטרה</h2>' + e + '<h2>השערה</h2>' + e + '<h2>מהלך</h2><ol><li><br></li></ol>' +
          '<h2>תוצאות</h2>' + e + '<h2>מסקנה</h2>' + e
      };
    }
  };

  /* =========================================================
     Formatting commands
     ========================================================= */
  function exec(cmd, val) { return document.execCommand(cmd, false, val == null ? null : val); }
  function blockVisualAlign(el) {
    var cs = getComputedStyle(el);
    var ta = cs.textAlign, rtl = cs.direction === 'rtl';
    if (ta === 'start' || ta === '-webkit-auto' || ta === 'auto') return rtl ? 'right' : 'left';
    if (ta === 'end') return rtl ? 'left' : 'right';
    return ta.replace('-webkit-', '');
  }
  function setAlign(visual) {
    act(function () {
      selectedBlocks().forEach(function (el) {
        var rtl = getComputedStyle(el).direction === 'rtl';
        var start = rtl ? 'right' : 'left';
        el.style.textAlign = visual === start ? '' : visual;
        if (!el.getAttribute('style')) el.removeAttribute('style');
      });
    });
  }
  function setDir(dir) {
    act(function () {
      selectedBlocks().forEach(function (el) {
        var target = el.tagName === 'LI' ? el.parentNode : el;
        var parentDir = getComputedStyle(target.parentNode).direction;
        if (dir === parentDir) target.removeAttribute('dir'); else target.setAttribute('dir', dir);
        if (target !== el) el.removeAttribute('dir');
        // explicit left/right alignment that matched the old start side is reset
        if (el.style.textAlign === 'left' || el.style.textAlign === 'right') {
          var start = dir === 'rtl' ? 'right' : 'left';
          if (el.style.textAlign === start) el.style.textAlign = '';
        }
        if (!el.getAttribute('style')) el.removeAttribute('style');
      });
    });
  }
  function setBlock(tag) {
    act(function () {
      var blocks = selectedBlocks();
      var allSame = blocks.length && blocks.every(function (b) { return blockTag(b) === tag; });
      var target = (allSame && tag !== 'p') ? 'p' : tag;
      exec('formatBlock', '<' + target + '>');
      // remove explicit sizes so the style's size shows
      if (target !== 'p') {
        selectedBlocks().forEach(function (b) {
          b.querySelectorAll('[style*="font-size"]').forEach(function (s) { s.style.fontSize = ''; });
        });
      }
    });
  }
  function blockTag(b) {
    if (!b) return 'p';
    if (b.closest('blockquote')) return 'blockquote';
    var t = b.tagName.toLowerCase();
    if (/^h[1-3]$/.test(t)) return t;
    if (/^h[4-6]$/.test(t)) return 'h3';
    return 'p';
  }
  function setLineHeight(v) {
    act(function () {
      selectedBlocks().forEach(function (el) { el.style.lineHeight = String(+(v * 1.2).toFixed(3)); });
    });
  }
  function currentLineSpacing() {
    var r = currentRange();
    var b = r && closestBlock(r.startContainer);
    var el = b && b.closest('[style*="line-height"]');
    if (el && inEditor(el)) { var v = parseFloat(el.style.lineHeight); if (v) return Math.round(v / 1.2 * 100) / 100; }
    return 1.15;
  }
  function indent(delta) {
    act(function () {
      var r = currentRange();
      var li = r && closestBlock(r.startContainer);
      if (li && li.closest('li')) { exec(delta > 0 ? 'indent' : 'outdent'); return; }
      selectedBlocks().forEach(function (el) {
        if (el.tagName === 'TD' || el.tagName === 'TH') return;
        var curPt = parseFloat(el.style.marginInlineStart) || 0;
        if (/px$/.test(el.style.marginInlineStart)) curPt = curPt * 0.75;
        var next = Math.max(0, curPt + delta * 36);
        el.style.marginInlineStart = next ? next + 'pt' : '';
        if (!el.getAttribute('style')) el.removeAttribute('style');
      });
    });
  }
  function applyFontSize(pt) {
    pt = Math.round(clamp(pt, 1, 400) * 2) / 2;
    act(function () {
      pendingFontSize = pt;
      exec('styleWithCSS', false);
      exec('fontSize', '7');
      exec('styleWithCSS', true);
      fixFontMarkers();
    });
    $('fontSize').value = pt;
  }
  function currentFontSizePt() {
    var r = currentRange();
    if (!r) return 12;
    var n = r.startContainer;
    var el = n.nodeType === 1 ? n : n.parentNode;
    if (el === editor) el = editor.firstElementChild || editor;
    return Math.round(parseFloat(getComputedStyle(el).fontSize) * 0.75 * 2) / 2;
  }
  function stepFont(dir) {
    var size = currentFontSizePt();
    var next;
    if (dir > 0) next = SIZES.find(function (s) { return s > size + 0.01; }) || size + 10;
    else next = SIZES.slice().reverse().find(function (s) { return s < size - 0.01; }) || Math.max(1, size - 1);
    applyFontSize(next);
  }
  function applyFontFamily(name) {
    var f = FONTS.find(function (x) { return x.name === name; });
    act(function () {
      exec('styleWithCSS', true);
      exec('fontName', f ? f.css : name);
    });
  }
  function applyColor(color) {
    prefs.textColor = color; savePrefs();
    $('textColorBar').style.background = color;
    act(function () { exec('styleWithCSS', true); exec('foreColor', color); });
  }
  function applyHighlight(color) {
    if (color) { prefs.highlight = color; savePrefs(); $('highlightBar').style.background = color; }
    act(function () { exec('styleWithCSS', true); exec('hiliteColor', color || 'transparent'); });
  }
  function clearFormat() {
    act(function () {
      exec('removeFormat');
      exec('unlink');
      var r = currentRange();
      if (r && !r.collapsed) {
        editor.querySelectorAll('span[style], font').forEach(function (s) {
          if (r.intersectsNode(s)) {
            while (s.firstChild) s.parentNode.insertBefore(s.firstChild, s);
            s.remove();
          }
        });
      }
      selectedBlocks().forEach(function (b) {
        b.style.lineHeight = ''; b.style.textAlign = ''; b.style.marginInlineStart = ''; b.style.fontSize = '';
        if (!b.getAttribute('style')) b.removeAttribute('style');
      });
      var bt = blockTag(closestBlock(r && r.startContainer));
      if (bt !== 'p') exec('formatBlock', '<p>');
    });
  }

  /* =========================================================
     Insertions
     ========================================================= */
  function insertBlockAfterCaret(nodes, caretTarget) {
    var r = currentRange();
    var tb = r ? topBlock(r.startContainer) : null;
    var blk = r ? closestBlock(r.startContainer) : null;
    var emptyP = tb && tb.tagName === 'P' && !tb.textContent.trim() && !tb.querySelector('img') && tb === blk;
    var ref = tb ? tb.nextSibling : null;
    nodes.forEach(function (n) { editor.insertBefore(n, ref); });
    if (emptyP) tb.remove();
    if (caretTarget) placeCaret(caretTarget, true);
  }
  function insertTable(rows, cols) {
    act(function () {
      var t = document.createElement('table');
      var tb = document.createElement('tbody');
      for (var i = 0; i < rows; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < cols; j++) { var td = document.createElement('td'); td.innerHTML = '<br>'; tr.appendChild(td); }
        tb.appendChild(tr);
      }
      t.appendChild(tb);
      var after = document.createElement('p'); after.innerHTML = '<br>';
      var r = currentRange();
      var inCell = r && r.startContainer && (r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode).closest('td,th');
      if (inCell && inEditor(inCell)) {
        var outer = inCell.closest('table');
        outer.parentNode.insertBefore(t, outer.nextSibling);
        outer.parentNode.insertBefore(after, t.nextSibling);
        placeCaret(t.rows[0].cells[0], true);
      } else {
        insertBlockAfterCaret([t, after], null);
        placeCaret(t.rows[0].cells[0], true);
      }
    });
  }
  function insertPageBreak() {
    act(function () {
      var r = currentRange();
      var tb = r ? topBlock(r.startContainer) : null;
      var pb = document.createElement('div');
      pb.className = 'page-break';
      pb.setAttribute('contenteditable', 'false');
      if (tb && tb.tagName === 'P' && r.collapsed) {
        var tail = document.createRange();
        tail.setStart(r.startContainer, r.startOffset);
        tail.setEndAfter(tb.lastChild || tb);
        var rest = tail.toString();
        var head = document.createRange();
        head.setStartBefore(tb.firstChild || tb);
        head.setEnd(r.startContainer, r.startOffset);
        if (rest.trim() || tail.cloneContents().querySelector('img')) {
          if (!head.toString().trim() && !head.cloneContents().querySelector('img')) {
            tb.parentNode.insertBefore(pb, tb);
            placeCaret(tb, true);
            return;
          }
          var frag = tail.extractContents();
          var np = tb.cloneNode(false);
          np.classList.remove('pg-push'); np.style.marginTop = '';
          np.appendChild(frag);
          if (!np.textContent && !np.querySelector('img')) np.innerHTML = '<br>';
          if (!tb.textContent && !tb.querySelector('img')) tb.innerHTML = '<br>';
          tb.parentNode.insertBefore(np, tb.nextSibling);
          tb.parentNode.insertBefore(pb, np);
          placeCaret(np, true);
          return;
        }
      }
      var np2 = document.createElement('p'); np2.innerHTML = '<br>';
      if (tb) { editor.insertBefore(pb, tb.nextSibling); editor.insertBefore(np2, pb.nextSibling); }
      else { editor.appendChild(pb); editor.appendChild(np2); }
      placeCaret(np2, true);
    });
  }
  function insertHr() {
    act(function () {
      var hr = document.createElement('hr');
      var p = document.createElement('p'); p.innerHTML = '<br>';
      insertBlockAfterCaret([hr, p], p);
    });
  }
  function insertText(text) { act(function () { exec('insertText', text); }); }

  /* ----- images ----- */
  function contentWidth() { var g = geom(); return g.W - 2 * g.side; }
  function processImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || 800, h = img.naturalHeight || 600;
        var keepGif = file.type === 'image/gif' && file.size < 1.5e6;
        var reader = new FileReader();
        if (keepGif) {
          reader.onload = function () { URL.revokeObjectURL(url); resolve({ src: reader.result, w: w, h: h }); };
          reader.readAsDataURL(file);
          return;
        }
        var max = 1600;
        var scale = Math.min(1, max / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var c = document.createElement('canvas');
        c.width = cw; c.height = ch;
        var cx = c.getContext('2d');
        var asPng = file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/svg+xml' || file.type === 'image/webp' && false;
        if (!asPng) { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cw, ch); }
        cx.drawImage(img, 0, 0, cw, ch);
        var src = asPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88);
        if (asPng && src.length > 2.5e6) { cx.globalCompositeOperation = 'destination-over'; cx.fillStyle = '#fff'; cx.fillRect(0, 0, cw, ch); src = c.toDataURL('image/jpeg', 0.88); }
        URL.revokeObjectURL(url);
        resolve({ src: src, w: cw, h: ch });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('IMG')); };
      img.src = url;
    });
  }
  function insertImageFiles(files) {
    var list = Array.prototype.filter.call(files, function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    Promise.all(list.map(processImage)).then(function (imgs) {
      act(function () {
        var maxW = contentWidth();
        var html = imgs.map(function (im) {
          var w = Math.round(Math.min(im.w, maxW));
          return '<img src="' + im.src + '" style="width:' + w + 'px" alt="">';
        }).join('');
        exec('insertHTML', html);
      });
    }).catch(function () { toast('לא הצלחתי לקרוא את התמונה. נסה קובץ JPG או PNG.', true); });
  }

  var selectedImg = null;
  function selectImage(img) {
    if (selectedImg && selectedImg !== img) selectedImg.classList.remove('img-sel');
    selectedImg = img;
    img.classList.add('img-sel');
    var r = document.createRange();
    r.selectNode(img);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(r);
    savedRange = r.cloneRange();
    imgOverlay.hidden = false;
    positionOverlay();
    updateContext();
  }
  function deselectImage() {
    if (selectedImg) selectedImg.classList.remove('img-sel');
    selectedImg = null;
    imgOverlay.hidden = true;
    updateContext();
  }
  function positionOverlay() {
    if (!selectedImg) return;
    if (!editor.contains(selectedImg)) { deselectImage(); return; }
    var z = zoomNow();
    var wr = pageWrap.getBoundingClientRect();
    var r = selectedImg.getBoundingClientRect();
    imgOverlay.style.left = ((r.left - wr.left) / z) + 'px';
    imgOverlay.style.top = ((r.top - wr.top) / z) + 'px';
    imgOverlay.style.width = (r.width / z) + 'px';
    imgOverlay.style.height = (r.height / z) + 'px';
  }
  (function initImageResize() {
    var drag = null;
    imgOverlay.addEventListener('pointerdown', function (e) {
      var h = e.target.dataset.h;
      if (!h || !selectedImg) return;
      e.preventDefault();
      histFlush();
      drag = { h: h, x: e.clientX, w: selectedImg.offsetWidth, ratio: selectedImg.offsetHeight / Math.max(1, selectedImg.offsetWidth) };
      imgOverlay.classList.add('dragging');
      e.target.setPointerCapture(e.pointerId);
    });
    imgOverlay.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = (e.clientX - drag.x) / zoomNow();
      var east = drag.h === 'ne' || drag.h === 'se';
      var nw = clamp(drag.w + (east ? dx : -dx), 24, contentWidth());
      selectedImg.style.width = Math.round(nw) + 'px';
      selectedImg.style.height = '';
      $('imgSizeTip').textContent = Math.round(nw) + ' × ' + Math.round(nw * drag.ratio);
      positionOverlay();
    });
    var end = function () {
      if (!drag) return;
      drag = null;
      imgOverlay.classList.remove('dragging');
      histCommit(); markDirty(); scheduleLayout();
    };
    imgOverlay.addEventListener('pointerup', end);
    imgOverlay.addEventListener('pointercancel', end);
  })();
  function imgSize(pct) {
    if (!selectedImg) return;
    var img = selectedImg;
    act(function () { img.style.width = Math.round(contentWidth() * pct / 100) + 'px'; img.style.height = ''; });
    selectImage(img);
  }
  function deleteImage() {
    if (!selectedImg) return;
    var img = selectedImg;
    deselectImage();
    act(function () { img.remove(); });
  }

  /* ----- links ----- */
  function normalizeUrl(u) {
    u = u.trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) return 'mailto:' + u;
    return 'https://' + u.replace(/^\/+/, '');
  }
  function linkDialog() {
    restoreSel();
    var r = currentRange();
    var anchorEl = r && (r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode).closest('a');
    if (anchorEl && !inEditor(anchorEl)) anchorEl = null;
    var selText = r ? r.toString() : '';
    var keepRange = r ? r.cloneRange() : null;
    modal({
      title: anchorEl ? 'עריכת קישור' : 'הוספת קישור',
      body: '<label>טקסט להצגה<input type="text" id="lnkText"></label><label>כתובת<input type="url" id="lnkUrl" dir="ltr" placeholder="https://"></label>',
      onOpen: function () {
        $('lnkText').value = anchorEl ? anchorEl.textContent : selText;
        $('lnkUrl').value = anchorEl ? anchorEl.getAttribute('href') : '';
        (($('lnkText').value) ? $('lnkUrl') : $('lnkText')).focus();
      },
      actions: [
        { label: 'אישור', primary: true, run: function () {
          var url = normalizeUrl($('lnkUrl').value);
          var text = $('lnkText').value;
          if (!url) return false;
          savedRange = keepRange;
          act(function () {
            if (anchorEl) {
              anchorEl.setAttribute('href', url);
              if (text && text !== anchorEl.textContent) anchorEl.textContent = text;
            } else if (keepRange && !keepRange.collapsed && text === selText) {
              exec('createLink', url);
            } else {
              exec('insertHTML', '<a href="' + escHtml(url) + '">' + escHtml(text || url) + '</a> ');
            }
          });
        } },
        anchorEl ? { label: 'הסרת קישור', danger: true, run: function () {
          savedRange = keepRange;
          act(function () { var t = document.createTextNode(anchorEl.textContent); anchorEl.parentNode.replaceChild(t, anchorEl); });
        } } : null,
        { label: 'ביטול' }
      ]
    });
  }

  /* ----- tables ----- */
  function curCell() {
    var r = currentRange();
    if (!r) return null;
    var n = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode;
    var c = n.closest && n.closest('td,th');
    return c && inEditor(c) ? c : null;
  }
  function tableOp(op, arg) {
    var cell = curCell();
    if (!cell) return;
    var row = cell.parentNode, table = cell.closest('table');
    var rows = Array.prototype.slice.call(table.rows);
    var ci = cell.cellIndex;
    var rtl = getComputedStyle(table).direction === 'rtl';
    act(function () {
      var newRow = function (like) {
        var tr = document.createElement('tr');
        for (var i = 0; i < like.cells.length; i++) {
          var td = document.createElement('td');
          td.innerHTML = '<br>';
          if (like.cells[i].colSpan > 1) td.colSpan = like.cells[i].colSpan;
          tr.appendChild(td);
        }
        return tr;
      };
      if (op === 'rowAbove') { var a = newRow(row); row.parentNode.insertBefore(a, row); placeCaret(a.cells[Math.min(ci, a.cells.length - 1)], true); }
      else if (op === 'rowBelow') { var b = newRow(row); row.parentNode.insertBefore(b, row.nextSibling); placeCaret(b.cells[Math.min(ci, b.cells.length - 1)], true); }
      else if (op === 'colRight' || op === 'colLeft') {
        var before = (op === 'colRight') === rtl;
        rows.forEach(function (r) {
          var idx = Math.min(ci, r.cells.length - 1);
          var ref = r.cells[idx];
          var nc = document.createElement(ref && ref.tagName === 'TH' ? 'th' : 'td');
          nc.innerHTML = '<br>';
          if (!ref) r.appendChild(nc);
          else r.insertBefore(nc, before ? ref : ref.nextSibling);
        });
        placeCaret(row.cells[before ? ci : ci + 1], true);
      }
      else if (op === 'deleteRow') {
        if (rows.length <= 1) { removeTable(table); return; }
        var ri = rows.indexOf(row);
        row.remove();
        var nr = table.rows[Math.min(ri, table.rows.length - 1)];
        placeCaret(nr.cells[Math.min(ci, nr.cells.length - 1)], true);
      }
      else if (op === 'deleteCol') {
        var maxCells = Math.max.apply(null, rows.map(function (r) { return r.cells.length; }));
        if (maxCells <= 1) { removeTable(table); return; }
        rows.forEach(function (r) { if (r.cells[ci]) r.deleteCell(ci); });
        var c2 = row.cells[Math.min(ci, row.cells.length - 1)];
        if (c2) placeCaret(c2, true);
      }
      else if (op === 'deleteTable') removeTable(table);
      else if (op === 'headerRow') {
        var first = table.rows[0];
        var toTh = !Array.prototype.every.call(first.cells, function (c) { return c.tagName === 'TH'; });
        Array.prototype.slice.call(first.cells).forEach(function (c) {
          var n = document.createElement(toTh ? 'th' : 'td');
          Array.prototype.forEach.call(c.attributes, function (at) { n.setAttribute(at.name, at.value); });
          while (c.firstChild) n.appendChild(c.firstChild);
          c.parentNode.replaceChild(n, c);
        });
        placeCaret(first.cells[Math.min(ci, first.cells.length - 1)], true);
      }
      else if (op === 'shade') {
        cell.style.backgroundColor = (arg === '#ffffff') ? '' : arg;
        if (!cell.getAttribute('style')) cell.removeAttribute('style');
      }
    });
  }
  function removeTable(table) {
    var next = table.nextElementSibling;
    if (!next) { next = document.createElement('p'); next.innerHTML = '<br>'; table.parentNode.insertBefore(next, table.nextSibling); }
    table.remove();
    placeCaret(next, true);
  }

  /* =========================================================
     Find & replace
     ========================================================= */
  var findState = { open: false, matches: [], cur: -1 };
  var hasHighlightAPI = !!(window.CSS && CSS.highlights && window.Highlight);
  var scheduleFind = debounce(function () { runFind(false); }, 120);
  function openFind(withReplace) {
    findState.open = true;
    $('findPanel').hidden = false;
    $('replaceRow').hidden = !withReplace;
    var r = currentRange();
    var s = r ? r.toString() : '';
    if (s && s.length < 80 && s.indexOf('\n') < 0) $('findInput').value = s;
    $('findInput').focus();
    $('findInput').select();
    runFind(false);
  }
  function closeFind() {
    findState.open = false;
    $('findPanel').hidden = true;
    clearFindHighlights();
    if (findState.cur >= 0 && findState.matches[findState.cur]) {
      var m = findState.matches[findState.cur];
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(m); savedRange = m.cloneRange();
    }
    editor.focus({ preventScroll: true });
  }
  function clearFindHighlights() { if (hasHighlightAPI) { CSS.highlights.delete('find-all'); CSS.highlights.delete('find-cur'); } }
  function buildTextMap() {
    var walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    var nodes = [], text = '', n;
    while ((n = walker.nextNode())) { nodes.push({ node: n, start: text.length }); text += n.nodeValue; }
    return { nodes: nodes, text: text };
  }
  function posToPoint(map, pos) {
    var lo = 0, hi = map.nodes.length - 1;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (map.nodes[mid].start <= pos) lo = mid; else hi = mid - 1; }
    var e = map.nodes[lo];
    return { node: e.node, offset: Math.min(pos - e.start, e.node.length) };
  }
  function runFind(keepIndex) {
    var q = $('findInput').value;
    findState.matches = [];
    if (q) {
      var map = buildTextMap();
      var hay = map.text.toLocaleLowerCase(), needle = q.toLocaleLowerCase();
      var i = 0, idx;
      while ((idx = hay.indexOf(needle, i)) >= 0 && findState.matches.length < 5000) {
        var a = posToPoint(map, idx), b = posToPoint(map, idx + needle.length);
        var r = document.createRange();
        try { r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset); findState.matches.push(r); } catch (e) { /* skip */ }
        i = idx + Math.max(1, needle.length);
      }
    }
    if (!keepIndex || findState.cur >= findState.matches.length) {
      // first match after the caret
      findState.cur = findState.matches.length ? 0 : -1;
      var cr = savedRange;
      if (cr && findState.matches.length) {
        for (var k = 0; k < findState.matches.length; k++) {
          if (findState.matches[k].compareBoundaryPoints(Range.START_TO_START, cr) >= 0) { findState.cur = k; break; }
        }
      }
    }
    paintFind(false);
  }
  function paintFind(scroll) {
    var n = findState.matches.length;
    var q = $('findInput').value;
    $('findCount').textContent = !q ? '' : n ? (findState.cur + 1) + ' / ' + n : 'אין תוצאות';
    if (!hasHighlightAPI) return;
    CSS.highlights.set('find-all', new Highlight(...findState.matches));
    if (findState.cur >= 0) CSS.highlights.set('find-cur', new Highlight(findState.matches[findState.cur]));
    else CSS.highlights.delete('find-cur');
    if (scroll && findState.cur >= 0) scrollRangeIntoView(findState.matches[findState.cur]);
  }
  function scrollRangeIntoView(r) {
    var rect = r.getBoundingClientRect();
    var cr = canvas.getBoundingClientRect();
    if (rect.top < cr.top + 60 || rect.bottom > cr.bottom - 40) {
      canvas.scrollTop += rect.top - cr.top - cr.height / 3;
    }
  }
  function findStep(d) {
    if (!findState.matches.length) { runFind(false); }
    var n = findState.matches.length;
    if (!n) return;
    findState.cur = (findState.cur + d + n) % n;
    paintFind(true);
    if (!hasHighlightAPI) { var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(findState.matches[findState.cur]); }
  }
  function replaceOne() {
    var m = findState.matches[findState.cur];
    if (!m) { findStep(1); return; }
    var rep = $('replaceInput').value;
    savedRange = m.cloneRange();
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(m);
    act(function () { if (rep) exec('insertText', rep); else exec('delete'); });
    var keep = findState.cur;
    runFind(true);
    findState.cur = Math.min(keep, findState.matches.length - 1);
    paintFind(true);
    $('replaceInput').focus();
  }
  function replaceAll() {
    runFind(false);
    var n = findState.matches.length;
    if (!n) return;
    var rep = $('replaceInput').value;
    act(function () {
      for (var i = findState.matches.length - 1; i >= 0; i--) {
        var r = findState.matches[i];
        r.deleteContents();
        if (rep) r.insertNode(document.createTextNode(rep));
      }
      editor.normalize();
    });
    runFind(false);
    toast(n === 1 ? 'בוצעה החלפה אחת' : 'בוצעו ' + n.toLocaleString('he-IL') + ' החלפות');
  }

  /* =========================================================
     Toolbar state / context
     ========================================================= */
  var tbQueued = false;
  function scheduleToolbar() {
    if (tbQueued) return;
    tbQueued = true;
    requestAnimationFrame(function () { tbQueued = false; updateToolbar(); });
  }
  function qs(cmd) { try { return document.queryCommandState(cmd); } catch (e) { return false; } }
  function updateToolbar() {
    var r = currentRange();
    var st = {};
    if (r) {
      ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript', 'insertUnorderedList', 'insertOrderedList'].forEach(function (c) { st[c] = qs(c); });
      var b = closestBlock(r.startContainer) || editor.firstElementChild;
      if (b) {
        st['align-' + blockVisualAlign(b)] = true;
        st['dir-' + getComputedStyle(b).direction] = true;
        st['block-' + blockTag(b)] = true;
        $('sbDir').textContent = getComputedStyle(b).direction === 'rtl' ? 'מימין לשמאל' : 'משמאל לימין';
      }
      var el = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentNode;
      if (el === editor) el = editor.firstElementChild || editor;
      var fam = (getComputedStyle(el).fontFamily || '').split(',')[0].trim().replace(/^["']|["']$/g, '');
      var sel = $('fontFamily');
      var known = FONTS.some(function (f) { return f.name === fam; });
      if (!known && fam) {
        var o = sel.querySelector('option[data-extra]');
        if (!o) { o = document.createElement('option'); o.dataset.extra = '1'; sel.appendChild(o); }
        o.value = fam; o.textContent = fam;
      }
      sel.value = fam;
      if (document.activeElement !== $('fontSize')) $('fontSize').value = currentFontSizePt();
    }
    st.outline = prefs.outline;
    st.spell = editor.spellcheck;
    var cell = curCell();
    st.headerRow = !!(cell && Array.prototype.every.call(cell.closest('table').rows[0].cells, function (c) { return c.tagName === 'TH'; }));
    document.querySelectorAll('[data-state]').forEach(function (btn) {
      btn.classList.toggle('on', !!st[btn.dataset.state]);
    });
    updateContext();
    updateSelectionCount();
  }
  function updateContext() {
    var inTable = !!curCell();
    var tTab = document.querySelector('.rtab[data-tab="table"]');
    var iTab = document.querySelector('.rtab[data-tab="image"]');
    tTab.hidden = !inTable;
    iTab.hidden = !selectedImg;
    $('mTableBtn').hidden = !inTable;
    $('mImageBtn').hidden = !selectedImg;
    var active = document.querySelector('.rtab.active');
    if (active && active.hidden) switchTab('home');
    if (hooks.context) hooks.context();
  }
  function switchTab(name) {
    document.querySelectorAll('.rtab[data-tab]').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    document.querySelectorAll('.rpanel').forEach(function (p) { p.classList.toggle('active', p.dataset.panel === name); });
    if (document.body.classList.contains('ribbon-collapsed')) toggleRibbon(false);
  }
  function toggleRibbon(force) {
    var collapse = typeof force === 'boolean' ? force : !document.body.classList.contains('ribbon-collapsed');
    document.body.classList.toggle('ribbon-collapsed', collapse);
    prefs.ribbonCollapsed = collapse; savePrefs();
  }

  /* =========================================================
     Counts, page indicator, outline
     ========================================================= */
  function countWords(t) { var m = t.match(/[^\s ]+/g); return m ? m.length : 0; }
  var scheduleCount = debounce(function () {
    var t = docText();
    var w = countWords(t);
    $('sbWords').dataset.total = w;
    updateSelectionCount();
    updateTitle();
  }, 250);
  function updateSelectionCount() {
    var total = +($('sbWords').dataset.total || 0);
    var r = currentRange();
    var selW = r && !r.collapsed ? countWords(r.toString()) : 0;
    var goal = cur && +cur.settings.wordGoal > 0 ? +cur.settings.wordGoal : 0;
    var label;
    if (selW) label = 'בסימון: ' + selW.toLocaleString('he-IL') + ' מתוך ' + total.toLocaleString('he-IL') + ' מילים';
    else if (goal) label = total.toLocaleString('he-IL') + ' מתוך ' + goal.toLocaleString('he-IL') + ' מילים';
    else label = total === 1 ? 'מילה אחת' : total.toLocaleString('he-IL') + ' מילים';
    $('sbWordsLabel').textContent = label;
    var bar = $('sbGoal');
    bar.hidden = !goal;
    if (goal) {
      var pct = Math.min(100, Math.round(total / goal * 100));
      bar.firstElementChild.style.width = pct + '%';
      bar.classList.toggle('done', total >= goal);
      bar.title = pct + '% מהיעד';
    }
  }
  function updatePageIndicator() {
    var g = geom();
    var z = zoomNow();
    var y = canvas.scrollTop + canvas.clientHeight / 3 - zoomSizer.offsetTop;
    var p = clamp(Math.floor(y / (g.P * z)) + 1, 1, pageCount);
    $('sbPage').textContent = 'עמוד ' + p + ' מתוך ' + pageCount;
  }
  var scheduleOutline = debounce(renderOutline, 300);
  function renderOutline() {
    if (!prefs.outline) return;
    var list = $('outlineList');
    var hs = editor.querySelectorAll('h1,h2,h3');
    list.innerHTML = '';
    $('outlineEmpty').hidden = hs.length > 0;
    hs.forEach(function (h) {
      var txt = h.textContent.trim();
      if (!txt) return;
      var b = document.createElement('button');
      b.className = 'outline-item l' + h.tagName[1];
      b.textContent = txt;
      b.title = txt;
      b.addEventListener('click', function () {
        var z = zoomNow();
        var top = zoomSizer.offsetTop + (h.offsetTop - 24) * z;
        canvas.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        editor.focus({ preventScroll: true });
        placeCaret(h, true);
      });
      list.appendChild(b);
    });
  }
  function toggleOutline() {
    prefs.outline = !prefs.outline; savePrefs();
    $('outline').hidden = !prefs.outline;
    renderOutline();
    scheduleToolbar();
  }

  /* =========================================================
     Files: open
     ========================================================= */
  function baseName(name) { return name.replace(/\.[^.]+$/, ''); }
  function handleFile(file) {
    if (!file) return;
    var name = file.name || '';
    var ext = (name.match(/\.([^.]+)$/) || [, ''])[1].toLowerCase();
    if (ext === 'docx') return openDocx(file);
    if (ext === 'html' || ext === 'htm' || ext === 'ktv') return file.text().then(function (t) { openHtmlText(t, baseName(name)); });
    if (ext === 'txt' || file.type === 'text/plain') return file.text().then(function (t) {
      var html = t.replace(/\r\n?/g, '\n').split('\n').map(function (l) { return '<p>' + (l ? escHtml(l) : '<br>') + '</p>'; }).join('');
      newDoc(html, null, baseName(name));
    });
    if (ext === 'doc') { toast('קבצי ‎.doc‎ ישנים אינם נתמכים. פתח אותם ב-Word או ב-Google Docs ושמור כ-‎.docx‎.', true, 7000); return; }
    toast('סוג הקובץ הזה אינו נתמך. אפשר לפתוח ‎.docx‎, ‎.html‎ או ‎.txt‎.', true);
  }
  function openHtmlText(text, title) {
    var doc = new DOMParser().parseFromString(text, 'text/html');
    var metaEl = doc.getElementById('katvan-meta');
    var meta = null;
    if (metaEl) { try { meta = JSON.parse(metaEl.textContent); } catch (e) { meta = null; } }
    var body = doc.getElementById('katvan-doc') || doc.body;
    var html = sanitizeHTML(body ? body.innerHTML : text);
    newDoc(html, meta && meta.settings, (meta && meta.title) || title);
    toast('הקובץ נפתח');
  }
  function openDocx(file) {
    toast('פותח את הקובץ…', false, 8000);
    var bufP = file.arrayBuffer();
    var embedded = loadLib('jszip').then(function (JSZip) {
      return bufP.then(function (buf) { return JSZip.loadAsync(buf); }).then(DocxExport.readSource);
    }).catch(function () { return null; });
    return embedded.then(function (data) {
      if (data && data.html) {
        newDoc(sanitizeHTML(data.html), data.settings, data.title || baseName(file.name));
        toast('הקובץ נפתח');
        return;
      }
      return loadLib('mammoth').then(function (mammoth) {
        return bufP.then(function (buf) {
          return mammoth.convertToHtml({ arrayBuffer: buf }, {
            styleMap: ['u => u', 'strike => s', "p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh", "p[style-name='Quote'] => blockquote:fresh"]
          });
        });
      }).then(function (res) {
        var html = sanitizeHTML(res.value || '');
        newDoc(html || '<p><br></p>', null, baseName(file.name));
        toast('הקובץ נפתח. חלק מהעיצוב המורכב של Word עשוי להיראות אחרת.', false, 4500);
      }).catch(function (err) {
        if (err && /LIB_/.test(err.message)) toast('רכיב פתיחת קובצי Word לא נטען מתיקיית התוכנה (vendor). ודא שהתיקייה שלמה.', true, 7000);
        else toast('לא הצלחתי לפתוח את הקובץ. ייתכן שהוא פגום או מוגן בסיסמה.', true, 6000);
      });
    });
  }

  /* =========================================================
     Files: save / export
     ========================================================= */
  function safeFileName(s) { return (s || 'מסמך').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90).replace(/[.\s…]+$/, '') || 'מסמך'; }
  var FILE_TYPES = {
    docx: { description: 'מסמך Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, ext: '.docx' },
    pdf: { description: 'PDF', accept: { 'application/pdf': ['.pdf'] }, ext: '.pdf' },
    html: { description: 'קובץ כתבן', accept: { 'text/html': ['.html'] }, ext: '.html' }
  };
  function downloadBlob(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function saveBlob(blob, kind, useHandle) {
    var t = FILE_TYPES[kind];
    var filename = safeFileName(displayTitle()) + t.ext;
    if (useHandle && fileHandle && fileHandle.kind === kind) {
      return writeHandle(fileHandle.handle, blob).then(function () { return fileHandle.name; });
    }
    if (window.showSaveFilePicker && window.isSecureContext !== false) {
      return window.showSaveFilePicker({ suggestedName: filename, types: [{ description: t.description, accept: t.accept }] })
        .then(function (h) {
          return writeHandle(h, blob).then(function () {
            if (kind !== 'pdf') fileHandle = { handle: h, kind: kind, name: h.name };
            return h.name;
          });
        }, function (err) {
          if (err && err.name === 'AbortError') return null;
          downloadBlob(blob, filename);
          return filename;
        });
    }
    downloadBlob(blob, filename);
    return Promise.resolve(filename);
  }
  function writeHandle(h, blob) {
    return h.createWritable().then(function (w) { return w.write(blob).then(function () { return w.close(); }); });
  }
  function buildDocxBlob() {
    return loadLib('jszip').then(function () {
      deselectImage();
      suspendView();
      if (mobileUI) layout();   // phones: measure tables/images at the real A4 width, like the desktop
      clearPagination();
      try {
        var g = geom();
        var src = cleanHTML();
        var p = DocxExport.build({ editor: editor, settings: cur.settings, title: displayTitle(), contentWidthPx: g.W - 2 * g.side, defaultDir: 'rtl', defaultFont: 'Arial', sourceHtml: src, manualTitle: cur.titleManual ? cur.title : '' });
        resumeView();
        layout();
        return p;
      } catch (e) { resumeView(); layout(); throw e; }
    });
  }
  function saveDocx(useHandle) {
    closeBackstage();
    return buildDocxBlob().then(function (blob) { return saveBlob(blob, 'docx', useHandle); })
      .then(function (name) { if (name) toast('נשמר: ' + name); return name; })
      .catch(function (err) {
        if (err && /LIB_|JSZIP/.test(err.message)) {
          libFailDialog('רכיב השמירה כ-Word לא נטען מתיקיית התוכנה (vendor). העבודה שלך שמורה בדפדפן.', 'saveNative', 'שמירה כקובץ כתבן במקום');
        } else { console.error(err); toast('השמירה נכשלה. נסה שוב.', true); }
      });
  }
  function nativeHtml() {
    var meta = JSON.stringify({ app: 'katvan', v: 1, title: cur.titleManual ? cur.title : '', settings: cur.settings }).replace(/</g, '\\u003c');
    var g = geom();
    return '<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="generator" content="Katvan">\n<title>' + escHtml(displayTitle()) + '</title>\n' +
      '<script type="application/json" id="katvan-meta">' + meta + '<\/script>\n' +
      '<style>body{background:#e6e8ec;margin:0;padding:24px 0}#katvan-doc{background:#fff;width:' + Math.round(g.W) + 'px;max-width:100%;box-sizing:border-box;margin:0 auto;padding:' +
      Math.round(g.top) + 'px ' + Math.round(g.side) + 'px;font:12pt/1.38 Arial,sans-serif;color:#000;box-shadow:0 2px 10px rgba(0,0,0,.12)}' +
      '#katvan-doc p{margin:0 0 8pt}#katvan-doc h1{font-size:20pt;color:#1f3a8a}#katvan-doc h2{font-size:16pt;color:#2a4ba8}#katvan-doc h3{font-size:13pt;color:#3c5cc0}' +
      '#katvan-doc table{border-collapse:collapse;width:100%;table-layout:fixed}#katvan-doc td,#katvan-doc th{border:1px solid #8f98a8;padding:4pt 6pt;vertical-align:top}' +
      '#katvan-doc blockquote{margin:8pt 0;padding:2pt 14pt;border-inline-start:3px solid #b9c3d6;color:#4b5563;font-style:italic}#katvan-doc img{max-width:100%}' +
      KATVAN_DOC_CSS.replace(/\.editor /g, '#katvan-doc ') +
      '#katvan-doc .page-break{border-top:1px dashed #c3c8d2;margin:16px 0}@media print{body{background:#fff;padding:0}#katvan-doc{box-shadow:none;width:auto;padding:0}#katvan-doc .page-break{border:0;break-after:page}}</style>\n' +
      '</head>\n<body>\n<article id="katvan-doc" dir="rtl">' + cleanHTML() + '</article>\n</body>\n</html>\n';
  }
  function saveNative(useHandle) {
    closeBackstage();
    var blob = new Blob([nativeHtml()], { type: 'text/html;charset=utf-8' });
    return saveBlob(blob, 'html', useHandle).then(function (name) { if (name) toast('נשמר: ' + name); return name; })
      .catch(function () { toast('השמירה נכשלה. נסה שוב.', true); });
  }
  /* styles of Katvan's own elements, shared by the PDF renderer and the standalone .html file */
  var KATVAN_DOC_CSS =
    '.editor .tab{white-space:pre}' +
    '.editor .math{font-family:"Cambria Math","Times New Roman",serif;direction:ltr;unicode-bidi:isolate}' +
    '.editor table.sol{width:auto;margin:6pt auto 10pt;border:0;table-layout:auto;direction:ltr}' +
    '.editor table.sol td{border:0;padding:1pt 4pt;font-family:"Cambria Math","Times New Roman",serif;white-space:nowrap;vertical-align:middle}' +
    '.editor table.sol td.l{text-align:right}.editor table.sol td.e{text-align:center;padding:1pt 2pt}.editor table.sol td.r{text-align:left}' +
    '.editor table.sol td.br{padding:0 2pt 0 0;font-size:1.5em;line-height:1;text-align:center}' +
    '.editor sup.fn{color:#1a56db;font-weight:700;padding:0 1px}' +
    '.editor .fn-notes{margin-top:18pt;padding-top:6pt;border-top:1px solid #9aa3b2;font-size:10pt;color:#333}' +
    '.editor .fn-notes .fn-title{font-weight:700;margin:0 0 4pt}.editor .fn-notes ol{margin:0;padding-inline-start:20pt}' +
    '.editor img.eq{vertical-align:middle}';
  /* PDF: each visual page is rendered by the browser itself (SVG foreignObject),
     so Hebrew, mixed-direction text, lists and tables look exactly like the screen. */
  var PDF_CSS =
    '*{box-sizing:border-box}' +
    '.page-wrap{position:relative;background:#fff}' +
    '.pages-layer{position:absolute;inset:0}' +
    '.page{position:absolute;left:0;right:0;background:#fff}' +
    '.page-hf{position:absolute;left:0;right:0;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;direction:rtl;padding:0 40px;text-align:center;white-space:pre;overflow:hidden}' +
    '.page-num{font-size:12.5px;color:#6b7280}' +
    '.editor{position:relative;color:#000;font-family:Arial,sans-serif;font-size:12pt;line-height:1.38;word-wrap:break-word;overflow-wrap:break-word;tab-size:4}' +
    '.editor p,.editor div:not(.page-break){margin:0 0 8pt}' +
    '.editor h1{font-size:20pt;font-weight:700;color:#1f3a8a;margin:18pt 0 8pt;line-height:1.25}' +
    '.editor h2{font-size:16pt;font-weight:700;color:#2a4ba8;margin:14pt 0 6pt;line-height:1.3}' +
    '.editor h3{font-size:13pt;font-weight:700;color:#3c5cc0;margin:12pt 0 4pt;line-height:1.3}' +
    '.editor h4,.editor h5,.editor h6{font-size:12pt;font-weight:700;margin:10pt 0 4pt}' +
    '.editor>:first-child{margin-top:0}' +
    '.editor blockquote{margin:8pt 0 10pt;padding:2pt 14pt;border-inline-start:3px solid #b9c3d6;color:#4b5563;font-style:italic}' +
    '.editor ul,.editor ol{margin:0 0 8pt;padding-inline-start:26pt}' +
    '.editor li{margin:0 0 2pt}.editor li>ul,.editor li>ol{margin:2pt 0 0}' +
    '.editor ul{list-style-type:disc}.editor ul ul{list-style-type:circle}.editor ul ul ul{list-style-type:square}' +
    '.editor a{color:#1a56db;text-decoration:underline}' +
    '.editor hr{border:0;border-top:1px solid #9aa3b2;margin:12pt 0;height:0}' +
    '.editor img{max-width:100%;height:auto;vertical-align:bottom}' +
    '.editor table{border-collapse:collapse;width:100%;margin:4pt 0 10pt;table-layout:fixed}' +
    '.editor td,.editor th{border:1px solid #8f98a8;padding:4pt 6pt;vertical-align:top;word-break:break-word}' +
    '.editor th{background:#eef1f7;font-weight:700}' +
    '.editor td>p:last-child,.editor th>p:last-child{margin-bottom:0}' +
    '.editor .page-break{height:0;margin:0;border:0}' +
    '.editor sup,.editor sub{line-height:0}' + KATVAN_DOC_CSS;

  function loadImg(src) {
    return new Promise(function (resolve, reject) {
      var im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error('SVG_RENDER')); };
      im.src = src;
    });
  }
  function exportPdf() {
    closeBackstage();
    toast('מכין PDF…', false, 20000);
    return loadLib('jspdf').then(function (jspdfNs) {
      histFlush();
      deselectImage();
      suspendView();
      layout();
      var g = geom();
      var s = cur.settings;
      var pages = pageCount;
      var totalH = pages * g.P - GAP;
      var clone = pageWrap.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.transform = '';
      clone.style.width = g.W + 'px';
      clone.style.height = totalH + 'px';
      var ov = clone.querySelector('.img-overlay'); if (ov) ov.remove();
      var ed = clone.querySelector('.editor');
      ed.removeAttribute('contenteditable');
      ed.removeAttribute('id');
      ed.querySelectorAll('[data-ph]').forEach(function (e) { e.removeAttribute('data-ph'); });
      ed.querySelectorAll('.img-sel').forEach(function (e) { e.classList.remove('img-sel'); });
      var xhtml = new XMLSerializer().serializeToString(clone);
      resumeView();
      if (mobileUI) layout();   // back to the fluid column while the pages render
      var scale = 2;
      var land = s.orientation === 'landscape';
      var pdf = new jspdfNs.jsPDF({ unit: 'mm', format: 'a4', orientation: land ? 'landscape' : 'portrait', compress: true });
      var pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      var c = document.createElement('canvas');
      c.width = Math.round(g.W * scale); c.height = Math.round(g.H * scale);
      var cx = c.getContext('2d');
      var chain = Promise.resolve();
      for (var i = 0; i < pages; i++) {
        (function (i) {
          chain = chain.then(function () {
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + c.width + '" height="' + c.height + '" viewBox="0 ' + (i * g.P) + ' ' + g.W + ' ' + g.H + '">' +
              '<foreignObject x="0" y="0" width="' + g.W + '" height="' + totalH + '"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" lang="he" style="width:' + g.W + 'px;height:' + totalH + 'px;background:#fff">' +
              '<style>' + PDF_CSS + '</style>' + xhtml + '</div></foreignObject></svg>';
            return loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)).then(function (im) {
              cx.fillStyle = '#fff';
              cx.fillRect(0, 0, c.width, c.height);
              cx.drawImage(im, 0, 0, c.width, c.height);
              if (i > 0) pdf.addPage('a4', land ? 'landscape' : 'portrait');
              pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
            });
          });
        })(i);
      }
      return chain.then(function () {
        pdf.setProperties({ title: displayTitle() });
        return pdf.output('blob');
      });
    }).then(function (blob) {
      resumeView();
      layout();
      return saveBlob(blob, 'pdf', false);
    }).then(function (name) {
      if (name) toast('PDF נשמר: ' + name);
    }).catch(function (err) {
      if (viewSuspended) { resumeView(); layout(); }
      if (err && /LIB_/.test(err.message)) {
        libFailDialog('רכיב ה-PDF לא נטען מתיקיית התוכנה (vendor). אפשר במקום זה להדפיס ולבחור במדפסת "שמירה כ-PDF" (Save as PDF).', 'print', 'הדפסה / שמירה כ-PDF');
      } else { console.error(err); toast('יצירת ה-PDF נכשלה. אפשר להדפיס ולבחור "שמירה כ-PDF".', true, 6000); }
    });
  }
  function libFailDialog(text, altCmd, altLabel) {
    modal({
      title: 'רכיב דרוש לא נטען',
      body: '<p style="margin:0">' + escHtml(text) + '</p>',
      actions: [{ label: altLabel, primary: true, run: function () { setTimeout(function () { runCmd(altCmd); }, 50); } }, { label: 'סגירה' }]
    });
  }
  function doPrint() {
    closeBackstage();
    deselectImage();
    setTimeout(function () { window.print(); }, 60);
  }
  function cssStr(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"'; }
  function updatePrintStyle() {
    var s = cur.settings;
    var m = s.margins;
    var css = '@page { size: A4 ' + (s.orientation === 'landscape' ? 'landscape' : 'portrait') + '; margin: ' + m.top + 'cm ' + m.side + 'cm ' + m.bottom + 'cm ' + m.side + 'cm;';
    if (s.header) css += ' @top-center { content: ' + cssStr(s.header) + '; font: 10pt Arial, sans-serif; color: #6b7280; }';
    var foot = [];
    if (s.footer) foot.push(cssStr(s.footer));
    if (s.pageNumbers) foot.push((s.footer ? '"   " ' : '') + 'counter(page)');
    if (foot.length) css += ' @bottom-center { content: ' + foot.join(' ') + '; font: 10pt Arial, sans-serif; color: #6b7280; }';
    css += ' }';
    if (s.pageNumbers && !s.numberFirst) css += ' @page :first { @bottom-center { content: ' + (s.footer ? cssStr(s.footer) : 'none') + '; } }';
    $('print-page-style').textContent = '@media print { ' + css + ' }';
  }
  window.addEventListener('beforeprint', function () { histFlush(); updatePrintStyle(); suspendView(); if (mobileUI) layout(); clearPagination(); });
  window.addEventListener('afterprint', function () { resumeView(); layout(); });
  /* view-only modes (reading mode) must not leak into exported files */
  var viewSuspended = false;
  function suspendView() { if (viewSuspended) return; viewSuspended = true; if (hooks.suspendView) hooks.suspendView(); }
  function resumeView() { if (!viewSuspended) return; viewSuspended = false; if (hooks.resumeView) hooks.resumeView(); }

  function saveQuick() {
    saveNow();
    if (fileHandle) {
      var p = fileHandle.kind === 'docx' ? saveDocx(true) : saveNative(true);
      return p;
    }
    modal({
      title: 'שמירת המסמך',
      body: '<p style="margin:0 0 4px;color:var(--text-2)">המסמך כבר שמור אוטומטית בדפדפן. כדי לשמור עותק במחשב, בחר פורמט:</p>' +
        '<div class="save-choices">' +
        '<button class="save-choice" data-choice="docx">' + Icons.svg('fileWord') + '<span><b>מסמך Word <bdi dir="ltr">(.docx)</bdi></b><small>להגשה למורים, לפתיחה ב-Word וב-Google Docs</small></span></button>' +
        '<button class="save-choice" data-choice="pdf">' + Icons.svg('filePdf') + '<span><b>PDF</b><small>לשליחה והדפסה, נראה זהה בכל מחשב</small></span></button>' +
        '<button class="save-choice" data-choice="html">' + Icons.svg('fileCode') + '<span><b>קובץ כתבן <bdi dir="ltr">(.html)</bdi></b><small>לגיבוי ולהמשך עריכה כאן בלי לאבד עיצוב</small></span></button>' +
        '</div>',
      onOpen: function (box) {
        box.querySelectorAll('.save-choice').forEach(function (b) {
          b.addEventListener('click', function () {
            closeModal();
            var c = b.dataset.choice;
            if (c === 'docx') saveDocx(false); else if (c === 'pdf') exportPdf(); else saveNative(false);
          });
        });
        box.querySelector('.save-choice').focus();
      },
      actions: [{ label: 'ביטול' }]
    });
  }

  /* =========================================================
     Modal
     ========================================================= */
  var modalKeyHandler = null;
  function modal(o) {
    var back = $('modalBack');
    back.querySelector('.modal').className = 'modal' + (o.wide ? ' wide' : '') + (o.cls ? ' ' + o.cls : '');
    $('modalTitle').textContent = o.title;
    $('modalBody').innerHTML = o.body || '';
    var acts = $('modalActions');
    acts.innerHTML = '';
    var first = null;
    (o.actions || []).filter(Boolean).forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger' : '');
      b.textContent = a.label;
      b.addEventListener('click', function () {
        if (a.run && a.run() === false) return;
        closeModal();
      });
      acts.appendChild(b);
      if (a.primary && !first) first = a;
    });
    back.hidden = false;
    if (modalKeyHandler) back.removeEventListener('keydown', modalKeyHandler);   // one dialog replacing another
    modalKeyHandler = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      else if (e.key === 'Enter' && first && e.target.tagName === 'INPUT') { e.preventDefault(); if (first.run() !== false) closeModal(); }
    };
    back.addEventListener('keydown', modalKeyHandler);
    modalOnClose = o.onClose || null;
    if (o.onOpen) o.onOpen($('modalBody'));
    else { var pb = acts.querySelector('.btn'); if (pb) pb.focus(); }
  }
  function closeModal() {
    var back = $('modalBack');
    back.hidden = true;
    if (modalKeyHandler) back.removeEventListener('keydown', modalKeyHandler);
    modalKeyHandler = null;
    var oc = modalOnClose; modalOnClose = null;
    if (oc) { try { oc(); } catch (e) { console.error(e); } }
    if ($('backstage').hidden) restoreSel();
  }
  var modalOnClose = null;
  $('modalBack').addEventListener('mousedown', function (e) { if (e.target === $('modalBack')) closeModal(); });

  /* =========================================================
     Popovers
     ========================================================= */
  var openPop = null;
  function buildPopovers() {
    // sizes
    var sz = $('pop-sizes');
    sz.innerHTML = '<div class="size-list">' + SIZES.map(function (s) { return '<button class="menu-item" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div>';
    sz.addEventListener('click', function (e) { var b = e.target.closest('[data-size]'); if (b) { closePop(); applyFontSize(+b.dataset.size); } });
    // colors
    var colorPop = function (id, colors, noneLabel, onPick) {
      var p = $(id);
      p.innerHTML = '<div class="swatches">' + colors.map(function (c) { return '<button class="swatch" style="background:' + c + '" data-color="' + c + '" title="' + c + '" aria-label="' + c + '"></button>'; }).join('') + '</div>' +
        '<button class="menu-item swatch-none" data-color=""><span class="swatch"></span><span>' + noneLabel + '</span></button>' +
        '<label class="custom-color"><input type="color" value="#3d5afe"><span>צבע מותאם אישית…</span></label>';
      p.addEventListener('click', function (e) { var b = e.target.closest('[data-color]'); if (b) { closePop(); onPick(b.dataset.color); } });
      p.querySelector('input[type=color]').addEventListener('change', function (e) { closePop(); onPick(e.target.value); });
    };
    colorPop('pop-textColor', TEXT_COLORS, 'אוטומטי (שחור)', function (c) { applyColor(c || '#000000'); });
    colorPop('pop-highlight', HIGHLIGHTS, 'ללא סימון', function (c) { applyHighlight(c || null); });
    colorPop('pop-cellShade', CELL_SHADES, 'ללא צבע', function (c) { tableOp('shade', c || '#ffffff'); });
    // line spacing
    var lsP = $('pop-lineSpacing');
    lsP.addEventListener('click', function (e) { var b = e.target.closest('[data-ls]'); if (b) { closePop(); setLineHeight(+b.dataset.ls); } });
    // table grid
    var grid = $('tgGrid');
    for (var r = 1; r <= 8; r++) for (var c = 1; c <= 10; c++) {
      var cell = document.createElement('button');
      cell.className = 'tg-cell'; cell.dataset.r = r; cell.dataset.c = c;
      cell.setAttribute('aria-label', 'טבלה ' + r + ' שורות על ' + c + ' עמודות');
      grid.appendChild(cell);
    }
    grid.addEventListener('mouseover', function (e) {
      var t = e.target.closest('.tg-cell'); if (!t) return;
      var R = +t.dataset.r, C = +t.dataset.c;
      grid.querySelectorAll('.tg-cell').forEach(function (x) { x.classList.toggle('hot', +x.dataset.r <= R && +x.dataset.c <= C); });
      $('tgLabel').textContent = R + ' שורות × ' + C + ' עמודות';
    });
    grid.addEventListener('click', function (e) {
      var t = e.target.closest('.tg-cell'); if (!t) return;
      closePop(); insertTable(+t.dataset.r, +t.dataset.c);
    });
    // symbols
    var sy = $('pop-symbols');
    sy.innerHTML = SYMBOLS.map(function (g) {
      return '<div class="pop-section"><div class="pop-title">' + g.title + '</div><div class="symbol-grid">' +
        g.items.map(function (s) { return '<button class="sym" data-sym="' + escHtml(s) + '" title="' + escHtml(s) + '">' + escHtml(s) + '</button>'; }).join('') + '</div></div>';
    }).join('');
    sy.addEventListener('click', function (e) { var b = e.target.closest('[data-sym]'); if (b) { insertText(b.dataset.sym); } });
    // dates
    $('pop-dates').addEventListener('click', function (e) { var b = e.target.closest('[data-date]'); if (b) { closePop(); insertText(b.dataset.date); } });
    // margins
    $('pop-margins').addEventListener('click', function (e) {
      var b = e.target.closest('[data-margin]'); if (!b) return;
      var mp = MARGIN_PRESETS.find(function (x) { return x.id === b.dataset.margin; });
      closePop();
      updateSettings(function (s) { s.margins = { top: mp.top, bottom: mp.bottom, side: mp.side }; });
    });
    $('pop-orientation').addEventListener('click', function (e) {
      var b = e.target.closest('[data-orient]'); if (!b) return;
      closePop();
      updateSettings(function (s) { s.orientation = b.dataset.orient; });
    });
  }
  function fillDynamicPop(id) {
    if (id === 'lineSpacing') {
      var curLs = currentLineSpacing();
      $('pop-lineSpacing').innerHTML = '<div class="pop-title">ריווח שורות</div>' + LINE_SPACINGS.map(function (v) {
        return '<button class="menu-item' + (Math.abs(v - curLs) < 0.02 ? ' on' : '') + '" data-ls="' + v + '">' + v.toFixed(v % 1 ? 2 : 1).replace(/0$/, '') + '</button>';
      }).join('');
    } else if (id === 'dates') {
      var kinds = [['long', 'לועזי'], ['short', 'מקוצר'], ['weekday', 'עם יום בשבוע'], ['hebrew', 'עברי']];
      $('pop-dates').innerHTML = '<div class="pop-title">הוספת התאריך של היום</div>' + kinds.map(function (k) {
        var d = hebDate(k[0]);
        return '<button class="menu-item" data-date="' + escHtml(d) + '"><span>' + escHtml(d) + '</span><span class="mi-sub">' + k[1] + '</span></button>';
      }).join('');
    } else if (id === 'margins') {
      var m = cur.settings.margins;
      $('pop-margins').innerHTML = '<div class="pop-title">שולי העמוד</div>' + MARGIN_PRESETS.map(function (p) {
        var on = Math.abs(p.top - m.top) < 0.01 && Math.abs(p.side - m.side) < 0.01 && Math.abs(p.bottom - m.bottom) < 0.01;
        return '<button class="menu-item' + (on ? ' on' : '') + '" data-margin="' + p.id + '">' + Icons.svg('margins') + '<span>' + p.name + '</span><span class="mi-sub">למעלה ' + p.top + ' · צדדים ' + p.side + ' ס״מ</span></button>';
      }).join('');
    } else if (id === 'orientation') {
      var o = cur.settings.orientation;
      $('pop-orientation').innerHTML = '<div class="orient-row">' +
        '<button class="orient-btn' + (o === 'portrait' ? ' on' : '') + '" data-orient="portrait"><span class="orient-shape" style="width:30px;height:40px"></span>לאורך</button>' +
        '<button class="orient-btn' + (o === 'landscape' ? ' on' : '') + '" data-orient="landscape"><span class="orient-shape" style="width:40px;height:30px"></span>לרוחב</button></div>';
    }
  }
  function togglePop(id, anchor) {
    if (openPop && openPop.id === id) { closePop(); return; }
    closePop();
    var p = $('pop-' + id);
    if (!p) return;
    fillDynamicPop(id);
    p.classList.add('open');
    var a = anchor.getBoundingClientRect();
    var pw = p.offsetWidth, ph = p.offsetHeight;
    var left = a.right - pw;
    left = clamp(left, 8, window.innerWidth - pw - 8);
    var top = a.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, a.top - ph - 6);
    p.style.left = left + 'px';
    p.style.top = top + 'px';
    openPop = { id: id, el: p, anchor: anchor };
    anchor.setAttribute('aria-expanded', 'true');
  }
  function closePop() {
    if (!openPop) return;
    openPop.el.classList.remove('open');
    openPop.anchor.removeAttribute('aria-expanded');
    openPop = null;
  }

  /* =========================================================
     Settings (layout tab)
     ========================================================= */
  function updateSettings(fn) {
    histFlush();
    fn(cur.settings);
    syncLayoutInputs();
    markDirty();
    layout();
    histCommit();
  }
  function syncLayoutInputs() {
    var s = cur.settings;
    $('headerText').value = s.header || '';
    $('footerText').value = s.footer || '';
    $('pageNumbers').checked = !!s.pageNumbers;
    $('numberFirst').checked = s.numberFirst !== false;
    $('numberFirst').disabled = !s.pageNumbers;
    $('numberFirst').closest('label').style.opacity = s.pageNumbers ? '' : '.5';
  }

  /* =========================================================
     Backstage
     ========================================================= */
  function openBackstage() {
    closePop();
    histFlush();
    if (dirty) saveNow();
    renderRecents();
    var h = new Date().getHours();
    $('bsGreeting').textContent = h < 5 ? 'לילה טוב' : h < 12 ? 'בוקר טוב' : h < 17 ? 'צהריים טובים' : h < 21 ? 'ערב טוב' : 'לילה טוב';
    $('backstage').hidden = false;
  }
  function closeBackstage() {
    if ($('backstage').hidden) return;
    $('backstage').hidden = true;
    setTimeout(function () { restoreSel(); }, 0);
  }
  function fmtDate(ts) {
    var d = new Date(ts), now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    try {
      if (sameDay) return 'היום, ' + new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' }).format(d);
      var y = new Date(now); y.setDate(now.getDate() - 1);
      if (d.toDateString() === y.toDateString()) return 'אתמול, ' + new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' }).format(d);
      return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' }).format(d);
    } catch (e) { return d.toLocaleString(); }
  }
  function renderRecents() {
    var ix = readIndex();
    var list = $('recentList');
    list.innerHTML = '';
    $('recentEmpty').hidden = ix.length > 0;
    ix.forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'recent-item' + (cur && e.id === cur.id ? ' cur' : '');
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.innerHTML = '<span class="ri-icon">' + Icons.svg('file') + '</span><span class="ri-main"><div class="ri-title"></div><div class="ri-snip"></div></span><span class="ri-date"></span>' +
        '<button class="icon-btn sm ri-del" title="מחיקה" aria-label="מחיקת המסמך">' + Icons.svg('trash') + '</button>';
      row.querySelector('.ri-title').textContent = e.title || 'מסמך ללא שם';
      row.querySelector('.ri-snip').textContent = e.snippet || '';
      row.querySelector('.ri-date').textContent = fmtDate(e.updated);
      var open = function () {
        if (cur && e.id === cur.id) { closeBackstage(); return; }
        if (dirty) saveNow();
        loadDocData(e.id).then(function (data) {
          if (!data) { toast('לא הצלחתי לטעון את המסמך הזה.', true); return; }
          openDoc(data);
          ls.set(LS_CURRENT, data.id);
          closeBackstage();
        });
      };
      row.addEventListener('click', function (ev) { if (!ev.target.closest('.ri-del')) open(); });
      row.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') open(); });
      row.querySelector('.ri-del').addEventListener('click', function (ev) {
        ev.stopPropagation();
        modal({
          title: 'מחיקת מסמך',
          body: '<p style="margin:0">למחוק את "' + escHtml(e.title || 'מסמך ללא שם') + '"? אי אפשר לבטל את המחיקה.</p>',
          actions: [{ label: 'מחיקה', primary: true, run: function () {
            var wasCur = cur && cur.id === e.id;
            deleteDoc(e.id);
            if (wasCur) openDoc({ id: uid(), html: '<p><br></p>' });
            renderRecents();
          } }, { label: 'ביטול' }]
        });
      });
      list.appendChild(row);
    });
  }

  /* =========================================================
     Theme, focus, spell, speech, word count
     ========================================================= */
  function applyTheme() {
    var theme = prefs.theme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    var tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', theme === 'dark' ? '#1d2026' : '#ffffff');
  }
  function toggleTheme() {
    var now = document.documentElement.getAttribute('data-theme');
    prefs.theme = now === 'dark' ? 'light' : 'dark';
    savePrefs(); applyTheme();
  }
  function toggleFocus() {
    var on = !document.body.classList.contains('focus-mode');
    document.body.classList.toggle('focus-mode', on);
    var ex = document.querySelector('.focus-exit');
    if (on && !ex) {
      ex = document.createElement('button');
      ex.className = 'focus-exit';
      ex.textContent = 'יציאה ממצב מיקוד (Esc)';
      ex.addEventListener('mousedown', function (e) { e.preventDefault(); });
      ex.addEventListener('click', toggleFocus);
      document.body.appendChild(ex);
    } else if (!on && ex) ex.remove();
    restoreSel();
  }
  function toggleSpell() {
    prefs.spell = !editor.spellcheck; savePrefs();
    editor.spellcheck = prefs.spell;
    // force Chrome to re-evaluate markers
    var html = editor.innerHTML; var sp = getSelPath();
    editor.innerHTML = html; setSelPath(sp); scheduleLayout();
    scheduleToolbar();
    toast(prefs.spell ? 'בדיקת איות פועלת' : 'בדיקת איות כבויה');
  }
  var speaking = false;
  function hebVoice() {
    if (!window.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices();
    return vs.find(function (v) { return /^he|^iw/i.test(v.lang); }) || null;
  }
  function setSpeakUi(on) {
    speaking = on;
    $('speakLabel').textContent = on ? 'עצירה' : 'הקראה';
    var i = $('speakBtn').querySelector('i');
    i.innerHTML = Icons.svg(on ? 'stop' : 'speaker');
    document.querySelectorAll('.m-speak').forEach(function (b) {
      b.classList.toggle('on', on);
      b.querySelector('i').innerHTML = Icons.svg(on ? 'stop' : 'speaker');
      b.setAttribute('aria-label', on ? 'עצירת ההקראה' : 'הקראה');
    });
  }
  function speak() {
    if (!window.speechSynthesis) { toast('הדפדפן הזה אינו תומך בהקראה.', true); return; }
    if (speaking) { speechSynthesis.cancel(); setSpeakUi(false); return; }
    var v = hebVoice();
    if (!v) {
      modal({ title: 'אין קול עברי במחשב', body: '<p style="margin:0">כדי להשתמש בהקראה צריך קול עברי. ב-Windows: הגדרות ← זמן ושפה ← דיבור ← הוספת קולות ← עברית. אחרי ההתקנה, סגור ופתח מחדש את הדפדפן.</p>', actions: [{ label: 'הבנתי', primary: true }] });
      return;
    }
    var r = currentRange();
    var text = r && !r.collapsed ? r.toString() : docText();
    if (!text.trim()) { toast('אין טקסט להקראה'); return; }
    var chunks = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
    setSpeakUi(true);
    chunks.forEach(function (c, i) {
      var u = new SpeechSynthesisUtterance(c);
      u.voice = v; u.lang = v.lang; u.rate = 0.95;
      if (i === chunks.length - 1) u.onend = function () { setSpeakUi(false); };
      u.onerror = function () { setSpeakUi(false); };
      speechSynthesis.speak(u);
    });
  }
  function wordCountDialog() {
    var t = docText();
    var r = currentRange();
    var sel = r && !r.collapsed ? r.toString() : '';
    var paras = Array.prototype.filter.call(editor.querySelectorAll('p,h1,h2,h3,li,blockquote'), function (p) { return p.textContent.trim(); }).length;
    var row = function (k, v) { return '<tr><td>' + k + '</td><td>' + v.toLocaleString('he-IL') + '</td></tr>'; };
    modal({
      title: 'ספירת מילים',
      body: (sel ? '<p style="margin:0;color:var(--text-2)">בטקסט המסומן: ' + countWords(sel).toLocaleString('he-IL') + ' מילים</p>' : '') +
        '<table class="stat-table">' + row('עמודים', a4PageCount()) + row('מילים', countWords(t)) + row('תווים (עם רווחים)', t.replace(/\n/g, '').length) +
        row('תווים (בלי רווחים)', t.replace(/\s/g, '').length) + row('פסקאות', paras) + '</table>' +
        '<label class="goal-field">יעד מילים למסמך הזה<span class="goal-input-row"><input type="number" id="wcGoal" min="0" max="100000" step="50" dir="ltr"><span>מילים (0 = בלי יעד)</span></span></label>',
      onOpen: function () { var g = $('wcGoal'); g.value = +cur.settings.wordGoal || 0; g.focus(); g.select(); },
      actions: [
        { label: 'שמירה', primary: true, run: function () {
          var v = Math.max(0, Math.min(100000, Math.round(+$('wcGoal').value || 0)));
          if (v !== (+cur.settings.wordGoal || 0)) { cur.settings.wordGoal = v; markDirty(); updateSelectionCount(); }
        } },
        { label: 'סגירה' }
      ]
    });
  }

  /* =========================================================
     Command registry
     ========================================================= */
  var CMDS = {
    undo: undo, redo: redo,
    bold: function () { act(function () { exec('bold'); }); },
    italic: function () { act(function () { exec('italic'); }); },
    underline: function () { act(function () { exec('underline'); }); },
    strikeThrough: function () { act(function () { exec('strikeThrough'); }); },
    superscript: function () { act(function () { exec('superscript'); }); },
    subscript: function () { act(function () { exec('subscript'); }); },
    growFont: function () { stepFont(1); },
    shrinkFont: function () { stepFont(-1); },
    applyTextColor: function () { applyColor(prefs.textColor); },
    applyHighlight: function () { applyHighlight(prefs.highlight); },
    clearFormat: clearFormat,
    bulletList: function () { act(function () { exec('insertUnorderedList'); }); },
    numberList: function () { act(function () { exec('insertOrderedList'); }); },
    indent: function () { indent(1); },
    outdent: function () { indent(-1); },
    dirRtl: function () { setDir('rtl'); },
    dirLtr: function () { setDir('ltr'); },
    alignRight: function () { setAlign('right'); },
    alignCenter: function () { setAlign('center'); },
    alignLeft: function () { setAlign('left'); },
    alignJustify: function () { setAlign('justify'); },
    find: function () { openFind(false); },
    replace: function () { openFind(true); },
    findNext: function () { findStep(1); },
    findPrev: function () { findStep(-1); },
    toggleReplaceRow: function () { var rr = $('replaceRow'); rr.hidden = !rr.hidden; if (!rr.hidden) $('replaceInput').focus(); },
    closeFind: closeFind,
    replaceOne: replaceOne,
    replaceAll: replaceAll,
    insertImage: function () { $('imageOpen').click(); },
    insertLink: linkDialog,
    insertHr: insertHr,
    insertPageBreak: insertPageBreak,
    toggleOutline: toggleOutline,
    toggleFocus: toggleFocus,
    toggleTheme: toggleTheme,
    toggleRibbon: function () { toggleRibbon(); },
    zoomIn: function () { setZoom(prefs.zoom + 0.1); },
    zoomOut: function () { setZoom(prefs.zoom - 0.1); },
    zoom100: function () { setZoom(1); },
    zoomFit: function () { setZoom((canvas.clientWidth - 56) / geom().W); },
    toggleSpell: toggleSpell,
    wordCount: wordCountDialog,
    speak: speak,
    rowAbove: function () { tableOp('rowAbove'); },
    rowBelow: function () { tableOp('rowBelow'); },
    colRight: function () { tableOp('colRight'); },
    colLeft: function () { tableOp('colLeft'); },
    deleteRow: function () { tableOp('deleteRow'); },
    deleteCol: function () { tableOp('deleteCol'); },
    deleteTable: function () { tableOp('deleteTable'); },
    toggleHeaderRow: function () { tableOp('headerRow'); },
    imgSize: function (arg) { imgSize(+arg); },
    deleteImage: deleteImage,
    openBackstage: openBackstage,
    closeBackstage: closeBackstage,
    newDoc: function () { newDoc(); },
    newFromTemplate: function (arg) { var t = TEMPLATES[arg](); newDoc(t.html, t.settings, t.title); },
    openFile: function () { $('fileOpen').click(); },
    saveDocx: function () { saveDocx(false); },
    saveNative: function () { saveNative(false); },
    exportPdf: exportPdf,
    print: doPrint,
    saveQuick: saveQuick
  };
  function runCmd(name, arg) {
    var f = CMDS[name];
    if (!f) return;
    try { f(arg); } catch (e) { console.error(e); toast('הפעולה נכשלה', true); }
  }

  /* =========================================================
     Event wiring
     ========================================================= */
  function wire() {
    // keep editor selection when clicking chrome buttons
    document.addEventListener('mousedown', function (e) {
      var b = e.target.closest('button, .swatch, .tg-cell');
      if (b && !e.target.closest('.modal, .backstage, .find-panel')) e.preventDefault();
      if (openPop && !e.target.closest('.popover') && !e.target.closest('[data-pop]')) closePop();
    });
    document.addEventListener('click', function (e) {
      var pb = e.target.closest('[data-pop]');
      if (pb) { togglePop(pb.dataset.pop, pb); return; }
      var cb = e.target.closest('[data-cmd]');
      if (cb && !cb.disabled) { if (!cb.closest('.popover')) closePop(); runCmd(cb.dataset.cmd, cb.dataset.arg); return; }
      var tb = e.target.closest('.rtab[data-tab]');
      if (tb) { switchTab(tb.dataset.tab); return; }
      var sc = e.target.closest('.style-card');
      if (sc) { setBlock(sc.dataset.block); }
    });
    // font family select
    var fsel = $('fontFamily');
    fsel.innerHTML = FONTS.map(function (f) { return '<option value="' + escHtml(f.name) + '" style="font-family:' + escHtml(f.css) + '">' + escHtml(f.name) + '</option>'; }).join('');
    fsel.addEventListener('change', function () { applyFontFamily(fsel.value); });
    // font size input
    var fsz = $('fontSize');
    fsz.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); var v = parseFloat(fsz.value); if (v > 0) applyFontSize(v); else fsz.value = currentFontSizePt(); }
      else if (e.key === 'Escape') { fsz.value = currentFontSizePt(); restoreSel(); }
    });
    fsz.addEventListener('change', function () { var v = parseFloat(fsz.value); if (v > 0 && v !== currentFontSizePt()) applyFontSize(v); });

    // editor events
    editor.addEventListener('beforeinput', function (e) {
      if (e.inputType === 'historyUndo') { e.preventDefault(); undo(); }
      else if (e.inputType === 'historyRedo') { e.preventDefault(); redo(); }
    });
    editor.addEventListener('input', function (e) {
      if (ensureContent()) placeCaret(editor.firstElementChild, true);
      if (hooks.input) { try { hooks.input(e); } catch (err) { console.error(err); } }
      fixFontMarkers();
      if (selectedImg && !editor.contains(selectedImg)) deselectImage();
      if (e.inputType === 'insertParagraph' || e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop' || (e.data && /\s/.test(e.data))) histSchedule(0);
      else histSchedule();
      updateUndoButtons();
      afterDomChange(true);
    });
    editor.addEventListener('compositionstart', function () { composing = true; });
    editor.addEventListener('compositionend', function () { composing = false; scheduleLayout(); });
    editor.addEventListener('load', function () { scheduleLayout(); }, true);
    editor.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && (e.ctrlKey || e.metaKey) && a.getAttribute('href')) { e.preventDefault(); window.open(a.getAttribute('href'), '_blank', 'noopener'); return; }
      if (e.target.tagName === 'IMG') { selectImage(e.target); return; }
      if (selectedImg) deselectImage();
    });
    editor.addEventListener('mouseover', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a && !a.title) a.title = (a.getAttribute('href') || '') + '\nCtrl + לחיצה לפתיחת הקישור';
    });
    editor.addEventListener('keydown', onEditorKey);
    editor.addEventListener('paste', onPaste);
    editor.addEventListener('drop', function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length && Array.prototype.some.call(files, function (f) { return /^image\//.test(f.type); })) {
        e.preventDefault();
        e.stopPropagation();
        var pos = document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
        if (pos) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(pos); savedRange = pos.cloneRange(); }
        insertImageFiles(files);
      }
    });
    document.addEventListener('selectionchange', function () {
      var sel = window.getSelection();
      if (sel.rangeCount && inEditor(sel.getRangeAt(0).commonAncestorContainer)) {
        savedRange = sel.getRangeAt(0).cloneRange();
        if (selectedImg) {
          var r = sel.getRangeAt(0);
          if (!(r.startContainer === selectedImg.parentNode && r.endOffset - r.startOffset === 1)) deselectImage();
        }
        scheduleToolbar();
      }
    });

    // window-level file drop
    window.addEventListener('dragover', function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) e.preventDefault(); });
    window.addEventListener('drop', function (e) {
      if (e.defaultPrevented) return;
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      e.preventDefault();
      if (/^image\//.test(f.type)) { insertImageFiles(e.dataTransfer.files); return; }
      handleFile(f);
    });

    $('fileOpen').addEventListener('change', function (e) { var f = e.target.files[0]; e.target.value = ''; handleFile(f); });
    $('imageOpen').addEventListener('change', function (e) { var fl = e.target.files; insertImageFiles(fl); setTimeout(function () { e.target.value = ''; }, 0); });

    // title
    $('docTitle').addEventListener('input', function (e) {
      cur.title = e.target.value.trim();
      cur.titleManual = !!cur.title;
      markDirty(); updateTitle();
    });
    $('docTitle').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); restoreSel(); } });

    // layout inputs
    var hfRelayout = debounce(function () { layout(); histCommit(); }, 200);
    var hfInput = function () {
      cur.settings.header = $('headerText').value;
      cur.settings.footer = $('footerText').value;
      markDirty();
      hfRelayout();
    };
    $('headerText').addEventListener('input', hfInput);
    $('footerText').addEventListener('input', hfInput);
    $('pageNumbers').addEventListener('change', function (e) { updateSettings(function (s) { s.pageNumbers = e.target.checked; }); });
    $('numberFirst').addEventListener('change', function (e) { updateSettings(function (s) { s.numberFirst = e.target.checked; }); });

    // find inputs
    $('findInput').addEventListener('input', function () { runFind(false); paintFind(true); });
    $('findInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); findStep(e.shiftKey ? -1 : 1); }
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    });
    $('replaceInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); replaceOne(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    });

    // zoom
    $('zoomRange').addEventListener('input', function (e) { setZoom(+e.target.value / 100); });
    canvas.addEventListener('wheel', function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(prefs.zoom + (e.deltaY < 0 ? 0.1 : -0.1));
    }, { passive: false });
    canvas.addEventListener('scroll', function () { updatePageIndicator(); });
    // clicking the gray canvas below the text puts the caret at the end
    canvas.addEventListener('mousedown', function (e) {
      if (e.target === canvas || e.target === zoomSizer) {
        e.preventDefault();
        editor.focus({ preventScroll: true });
        placeCaret(lastEditable(), false);
      }
    });

    // global keys
    document.addEventListener('keydown', onGlobalKey, true);
    document.addEventListener('keyup', onGlobalKeyUp, true);

    window.addEventListener('resize', function () { closePop(); positionOverlay(); });
    window.addEventListener('beforeunload', function () { histFlush(); if (dirty) saveNow(); });
    window.addEventListener('pagehide', function () { if (dirty) saveNow(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && dirty) saveNow(); });
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () { /* voices loaded lazily */ };
    if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (!prefs.theme) applyTheme(); }); } catch (e) { /* old browsers */ } }
  }
  function updateOnline() { $('sbOffline').hidden = navigator.onLine !== false; }

  function insertTab() {
    act(function () {
      var r = currentRange();
      if (!r) return;
      if (!r.collapsed) r.deleteContents();
      var sp = document.createElement('span');
      sp.className = 'tab';
      sp.setAttribute('contenteditable', 'false');
      sp.textContent = '\t';
      r.insertNode(sp);
      // keep typing outside the tab: an empty text node right after it holds the caret
      var after = sp.nextSibling;
      if (!after || after.nodeType !== 3) { after = document.createTextNode(''); sp.parentNode.insertBefore(after, sp.nextSibling); }
      var nr = document.createRange();
      nr.setStart(after, 0); nr.collapse(true);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(nr);
      savedRange = nr.cloneRange();
    });
  }
  function onEditorKey(e) {
    if (hooks.key && hooks.key(e)) return;
    if (e.key === 'Tab') {
      var cell = curCell();
      if (cell) {
        e.preventDefault();
        var cells = Array.prototype.slice.call(cell.closest('table').querySelectorAll('td,th'));
        var i = cells.indexOf(cell) + (e.shiftKey ? -1 : 1);
        if (i >= cells.length) { tableOp('rowBelow'); return; }
        if (i >= 0) { var r = document.createRange(); r.selectNodeContents(cells[i]); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
        return;
      }
      var r2 = currentRange();
      var b = r2 && closestBlock(r2.startContainer);
      e.preventDefault();
      if (b && b.closest('li')) { indent(e.shiftKey ? -1 : 1); return; }
      if (!e.shiftKey) insertTab();
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedImg) { e.preventDefault(); deleteImage(); return; }
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      // Enter on an empty list item leaves the list (Word behaviour)
      var rr = currentRange();
      var li = rr && rr.collapsed && closestBlock(rr.startContainer);
      if (li && li.tagName === 'LI' && !li.textContent.trim() && !li.querySelector('img,ul,ol')) {
        e.preventDefault();
        act(function () { exec(li.parentNode.tagName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList'); });
      }
    }
  }
  function onPaste(e) {
    var cd = e.clipboardData;
    if (!cd) return;
    var files = Array.prototype.filter.call(cd.files || [], function (f) { return /^image\//.test(f.type); });
    var html = cd.getData('text/html');
    var text = cd.getData('text/plain');
    if (files.length && !html) { e.preventDefault(); insertImageFiles(files); return; }
    if (html) {
      e.preventDefault();
      var clean = sanitizeHTML(html.replace(/<!--StartFragment-->|<!--EndFragment-->/g, ''));
      act(function () { exec('insertHTML', clean); });
      return;
    }
    if (text) {
      e.preventDefault();
      if (/\n/.test(text.trim())) {
        var parts = text.replace(/\r\n?/g, '\n').split('\n');
        var htmlT = parts.map(function (l) { return '<p>' + (l ? escHtml(l).replace(/ {2}/g, '  ') : '<br>') + '</p>'; }).join('');
        act(function () { exec('insertHTML', htmlT); });
      } else act(function () { exec('insertText', text.replace(/\r?\n$/, '')); });
    }
  }
  var shiftDirArm = null;
  function onGlobalKey(e) {
    var ctrl = e.ctrlKey || e.metaKey;
    // Word alignment keys collide with browser reload / address bar / search: never let them through
    if (ctrl && !e.altKey && /^Key[RLEJ]$/.test(e.code)) e.preventDefault();
    if (!$('modalBack').hidden) return;
    if (e.key === 'Escape') {
      if (openPop) { closePop(); e.preventDefault(); return; }
      if (mAnyOpen()) { mCloseAll(); e.preventDefault(); return; }
      if (findState.open) { closeFind(); e.preventDefault(); return; }
      if (document.body.classList.contains('focus-mode')) { toggleFocus(); e.preventDefault(); return; }
      if (!$('backstage').hidden) { closeBackstage(); e.preventDefault(); return; }
      if (selectedImg) { deselectImage(); return; }
    }
    // Ctrl + Right/Left Shift = paragraph direction (Word)
    if (ctrl && (e.code === 'ShiftRight' || e.code === 'ShiftLeft') && !e.altKey) { shiftDirArm = e.code; return; }
    if (e.key !== 'Shift') shiftDirArm = null;
    if (!ctrl || e.altKey) return;
    var inField = e.target.matches && e.target.matches('input, select, textarea') && e.target !== editor;
    var code = e.code;
    var handled = true;
    switch (code) {
      case 'KeyS': saveQuick(); break;
      case 'KeyP': doPrint(); break;
      case 'KeyO': runCmd('openFile'); break;
      case 'KeyF': openFind(false); break;
      case 'KeyH': openFind(true); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); e.stopPropagation(); return; }
    if (inField || !$('backstage').hidden) return;
    handled = true;
    switch (code) {
      case 'KeyB': runCmd('bold'); break;
      case 'KeyI': runCmd('italic'); break;
      case 'KeyU': runCmd('underline'); break;
      case 'KeyZ': if (e.shiftKey) redo(); else undo(); break;
      case 'KeyY': redo(); break;
      case 'KeyK': linkDialog(); break;
      case 'KeyE': setAlign('center'); break;
      case 'KeyJ': setAlign('justify'); break;
      case 'KeyR': setAlign('right'); break;
      case 'KeyL': if (e.shiftKey) runCmd('bulletList'); else setAlign('left'); break;
      case 'KeyM': runCmd('mathSpan'); break;
      case 'Enter': insertPageBreak(); break;
      case 'Period': if (e.shiftKey) stepFont(1); else handled = false; break;
      case 'Comma': if (e.shiftKey) stepFont(-1); else handled = false; break;
      case 'BracketRight': applyFontSize(currentFontSizePt() + 1); break;
      case 'BracketLeft': applyFontSize(Math.max(1, currentFontSizePt() - 1)); break;
      case 'Equal': if (e.shiftKey) runCmd('superscript'); else runCmd('subscript'); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }
  function onGlobalKeyUp(e) {
    if (shiftDirArm && e.code === shiftDirArm) {
      var which = shiftDirArm;
      shiftDirArm = null;
      if ($('backstage').hidden && $('modalBack').hidden && (document.activeElement === editor)) setDir(which === 'ShiftRight' ? 'rtl' : 'ltr');
    }
    if (e.key === 'Control' || e.key === 'Meta') { editor.classList.remove('ctrl-down'); shiftDirArm = null; }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Control' || e.key === 'Meta') editor.classList.add('ctrl-down'); });
  window.addEventListener('blur', function () { editor.classList.remove('ctrl-down'); });

  /* =========================================================
     Phone / touch UI
     (top app bar + menu drawer, bottom formatting bar, ribbon as a
     "more tools" sheet, fluid page, keyboard-aware sheets)
     ========================================================= */
  var PHONE_QUERY = '(max-width: 760px), (max-height: 520px) and (max-width: 1100px)';   // same query as the inline script in index.html
  var phoneMq = null;
  var mobileUI = false;
  var forceA4 = false;
  var mHistPushed = false;
  var root = document.documentElement;
  function isFluid() { return mobileUI && !viewSuspended && !forceA4; }
  function mAnyOpen() { return root.classList.contains('m-drawer-open') || root.classList.contains('m-more-open') || root.classList.contains('m-outline-open'); }
  var mHistTimer = null;
  function mSyncScrim() {
    $('mScrim').classList.toggle('show', mAnyOpen());
    // Android back gesture closes the sheet instead of leaving the app. Reconciled a tick later, so
    // closing one sheet and opening another in the same tap does not fight over the history entry.
    clearTimeout(mHistTimer);
    mHistTimer = setTimeout(function () {
      if (mAnyOpen() && !mHistPushed) {
        try { history.pushState({ ktvSheet: 1 }, ''); mHistPushed = true; } catch (e) { /* ignore */ }
      } else if (!mAnyOpen() && mHistPushed) {
        mHistPushed = false;
        try { history.back(); } catch (e) { /* ignore */ }
      }
    }, 0);
  }
  function mSetDrawer(open) {
    if (open) { closePop(); root.classList.remove('m-more-open'); mSetOutline(false, true); }
    root.classList.toggle('m-drawer-open', !!open);
    mSyncScrim();
  }
  function mSetMore(open, tab) {
    if (open) {
      closePop(); root.classList.remove('m-drawer-open'); mSetOutline(false, true);
      if (tab) switchTab(tab);
      // give the sheet the whole screen; the selection is kept and restored by the next command
      if (document.activeElement === editor) editor.blur();
      var rb = $('ribbon'); if (rb) rb.scrollTop = 0;
    }
    root.classList.toggle('m-more-open', !!open);
    mSyncScrim();
  }
  function mSetOutline(open, quiet) {
    var o = $('outline');
    if (open) {
      root.classList.remove('m-drawer-open', 'm-more-open');
      var keep = prefs.outline; prefs.outline = true; renderOutline(); prefs.outline = keep;   // render without changing the desktop preference
    }
    o.hidden = !open;
    root.classList.toggle('m-outline-open', !!open);
    if (!quiet) mSyncScrim();
  }
  function mCloseAll() {
    root.classList.remove('m-drawer-open', 'm-more-open');
    if (root.classList.contains('m-outline-open')) mSetOutline(false, true);
    mSyncScrim();
  }
  function applyMobileMode() {
    var on = !!(phoneMq && phoneMq.matches);
    root.classList.toggle('m-ui', on);
    if (on === mobileUI) return;
    mobileUI = on;
    closePop();
    mCloseAll();
    $('outline').hidden = on ? true : !prefs.outline;
    if (cur) layout();
  }
  function mViewport() {
    var vv = window.visualViewport;
    var st = root.style;
    if (!vv || vv.scale > 1.01) {   // pinch-zoomed: leave the layout alone
      st.removeProperty('--vv-h'); st.removeProperty('--vv-top'); st.removeProperty('--kb');
      return;
    }
    st.setProperty('--vv-h', Math.round(vv.height) + 'px');
    st.setProperty('--vv-top', Math.round(vv.offsetTop) + 'px');
    st.setProperty('--kb', Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) + 'px');
  }
  function initMobile() {
    var desktopToggleOutline = CMDS.toggleOutline;
    CMDS.toggleOutline = function () { if (mobileUI) mSetOutline($('outline').hidden); else desktopToggleOutline(); };
    CMDS.mDrawer = function () { mSetDrawer(!root.classList.contains('m-drawer-open')); };
    CMDS.mMore = function (tab) { mSetMore(tab ? true : !root.classList.contains('m-more-open'), tab); };

    // tapping a command in the drawer or the tools sheet closes it (the document click handler then runs the command)
    $('mDrawer').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cmd]');
      if (b && b.dataset.cmd !== 'mDrawer') { root.classList.remove('m-drawer-open'); mSyncScrim(); }
    });
    $('ribbonDock').addEventListener('click', function (e) {
      if (!mobileUI || e.target.closest('.m-sheet-head')) return;
      var b = e.target.closest('[data-cmd], [data-pop], .style-card');
      if (b && !b.disabled) { root.classList.remove('m-more-open'); mSyncScrim(); }
    });
    $('mScrim').addEventListener('click', mCloseAll);
    $('outlineList').addEventListener('click', function (e) { if (mobileUI && e.target.closest('.outline-item')) mSetOutline(false); });
    window.addEventListener('popstate', function () {
      if (!mHistPushed) return;
      mHistPushed = false;
      root.classList.remove('m-drawer-open', 'm-more-open');
      if (root.classList.contains('m-outline-open')) mSetOutline(false, true);
      $('mScrim').classList.remove('show');
    });

    // paragraph-style and alignment sheets of the bottom bar
    $('pop-mblock').addEventListener('click', function (e) { var b = e.target.closest('[data-block]'); if (b) { closePop(); setBlock(b.dataset.block); } });
    $('pop-malign').addEventListener('click', function (e) { if (e.target.closest('[data-cmd]')) closePop(); });

    // dialog fields stay visible above the on-screen keyboard
    $('modalBack').addEventListener('focusin', function (e) {
      if (!mobileUI) return;
      var t = e.target;
      if (!t.matches || !t.matches('input, textarea, select, math-field, [contenteditable="true"]')) return;
      setTimeout(function () { try { t.scrollIntoView({ block: 'nearest' }); } catch (err) { /* ignore */ } }, 320);
    });

    if (window.matchMedia) {
      phoneMq = matchMedia(PHONE_QUERY);
      var onMq = function () { applyMobileMode(); };
      if (phoneMq.addEventListener) phoneMq.addEventListener('change', onMq); else if (phoneMq.addListener) phoneMq.addListener(onMq);
    }
    applyMobileMode();
    var onResize = function () {
      mViewport();
      if (!mobileUI) return;
      scheduleLayout();
      var ae = document.activeElement;
      if (ae === editor) { wantCaret = true; }
      else if (ae && !$('modalBack').hidden && $('modalBack').contains(ae)) { setTimeout(function () { try { ae.scrollIntoView({ block: 'nearest' }); } catch (err) { /* ignore */ } }, 60); }
    };
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', onResize);
      visualViewport.addEventListener('scroll', mViewport);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', function () { setTimeout(onResize, 250); });
    mViewport();
  }

  /* offline use + installing as an app: only over http(s); file:// keeps working exactly as before */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) { console.warn('Service worker not registered:', err && err.message); });
    });
  }

  /* =========================================================
     Init
     ========================================================= */
  function init() {
    Icons.hydrate();
    applyTheme();
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* ignore */ }
    try { document.execCommand('styleWithCSS', false, true); } catch (e) { /* ignore */ }
    buildPopovers();
    wire();
    $('textColorBar').style.background = prefs.textColor;
    $('highlightBar').style.background = prefs.highlight;
    editor.spellcheck = prefs.spell !== false;
    if (prefs.ribbonCollapsed) document.body.classList.add('ribbon-collapsed');
    $('outline').hidden = !prefs.outline;
    updateOnline();
    initMobile();
    registerServiceWorker();

    var curId = ls.get(LS_CURRENT);
    var start = curId ? loadDocData(curId) : Promise.resolve(null);
    start.then(function (data) {
      if (data) {
        openDoc(data);
        setTimeout(function () { editor.focus({ preventScroll: true }); placeCaret(lastEditable(), false); }, 50);
      } else {
        openDoc({ id: uid(), html: '<p><br></p>' });
        openBackstage();
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleLayout(); });
      /* a file double-clicked in Windows (manifest file_handlers, installed app only); after the current doc so it isn't overwritten */
      if ('launchQueue' in window) window.launchQueue.setConsumer(function (params) {
        if (params.files && params.files.length) params.files[0].getFile().then(handleFile);
      });
    });

    setInterval(function () { if (dirty && !saving) { histFlush(); saveNow(); } }, 2500);
    // warm up CDN libraries in the background so export works later even if the connection drops
    setTimeout(function () {
      ['jszip', 'mammoth', 'jspdf'].forEach(function (n) { loadLib(n).catch(function () { /* marked in UI */ }); });
    }, 1200);
  }

  // test hook (read-only helpers for automated checks)
  window.Katvan = { cleanHTML: cleanHTML, layout: layout, buildDocxBlob: buildDocxBlob, saveNow: saveNow, run: runCmd, insertTable: insertTable, state: function () { return { cur: cur, pages: pageCount, hist: hist.idx }; } };

  /* internal API for js/extras.js (school, math and accessibility features) */
  window.KatvanAPI = {
    hooks: hooks, editor: editor, canvas: canvas, pageWrap: pageWrap, zoomSizer: zoomSizer,
    $: $, ls: ls, lsJson: lsJson, idbGet: idbGet, idbSet: idbSet, uid: uid, escHtml: escHtml, debounce: debounce, toast: toast, clamp: clamp,
    prefs: prefs, savePrefs: savePrefs, loadLib: loadLib,
    cur: function () { return cur; }, readIndex: readIndex, loadDocData: loadDocData, LS_DOC: LS_DOC,
    act: act, exec: exec, normalize: normalize, histCommit: histCommit, histFlush: histFlush, markDirty: markDirty, afterDomChange: afterDomChange,
    commit: function () { normalize(); histCommit(); afterDomChange(true); },
    currentRange: currentRange, restoreSel: restoreSel, placeCaret: placeCaret, setSavedRange: function (r) { savedRange = r; },
    closestBlock: closestBlock, topBlock: topBlock, inEditor: inEditor, insertBlockAfterCaret: insertBlockAfterCaret, tableOp: tableOp, curCell: curCell,
    selectImage: selectImage, selectedImg: function () { return selectedImg; }, contentWidth: contentWidth,
    cleanHTML: cleanHTML, sanitizeHTML: sanitizeHTML, docText: docText, countWords: countWords, newDoc: newDoc,
    modal: modal, closeModal: closeModal, cmds: CMDS, runCmd: runCmd, scheduleLayout: scheduleLayout, scheduleToolbar: scheduleToolbar,
    updateSelectionCount: updateSelectionCount, switchTab: switchTab,
    zoomNow: function () { return zoomNow(); }, isMobile: function () { return mobileUI; }
  };
  if (window.KatvanExtras) window.KatvanExtras(window.KatvanAPI);

  init();
})();
