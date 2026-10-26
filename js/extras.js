/* Katvan extras: math, school and writing-aid features.
   Loaded before app.js; app.js calls KatvanExtras(api) before it initialises. */
(function () {
  'use strict';

  /* ---------- built-in subject vocabularies for word completion ---------- */
  var SUBJECT_TERMS = {
    'מתמטיקה': ['פרבולה', 'פירוק לגורמים', 'משוואה', 'משוואה ריבועית', 'אי-שוויון', 'נוסחת השורשים', 'דיסקרימיננטה', 'קודקוד', 'קודקוד הפרבולה',
      'ציר הסימטריה', 'נקודת חיתוך', 'נקודות חיתוך עם הצירים', 'שיפוע', 'ישר', 'פונקציה', 'פונקציה קווית', 'פונקציה ריבועית', 'תחום הגדרה',
      'מערכת משוואות', 'נעלם', 'נעלמים', 'מקדם', 'איבר חופשי', 'ביטוי אלגברי', 'כינוס איברים דומים', 'הוצאת גורם משותף', 'נוסחאות הכפל המקוצר',
      'הפרש ריבועים', 'ריבוע הסכום', 'ריבוע ההפרש', 'שברים אלגבריים', 'מכנה משותף', 'מונה', 'מכנה', 'חזקה', 'חזקות', 'שורש ריבועי', 'משפט פיתגורס',
      'יתר', 'ניצב', 'משולש ישר-זווית', 'משולש שווה-שוקיים', 'משולש שווה-צלעות', 'זוויות מתאימות', 'זוויות מתחלפות', 'זוויות קודקודיות',
      'זוויות צמודות', 'היקף', 'שטח', 'נפח', 'מקבילית', 'טרפז', 'מעוין', 'מלבן', 'מעגל', 'רדיוס', 'קוטר', 'אחוזים', 'פרופורציה', 'ממוצע',
      'חציון', 'שכיח', 'הסתברות', 'סטטיסטיקה', 'דמיון משולשים', 'חפיפת משולשים', 'תיכון', 'חוצה זווית', 'אנך אמצעי', 'ערך מוחלט',
      'שיטת ההצבה', 'שיטת השוואת מקדמים', 'מערכת צירים', 'ראשית הצירים', 'פתרון', 'הצבה', 'בדיקה'],
    'מדעים': ['נויטרונים', 'פרוטונים', 'אלקטרונים', 'אטום', 'מולקולה', 'יסוד', 'תרכובת', 'תערובת', 'תמיסה', 'ממס', 'מומס', 'ריכוז',
      'הטבלה המחזורית', 'מספר אטומי', 'מסה אטומית', 'איזוטופ', 'יון', 'קשר קוולנטי', 'קשר יוני', 'תגובה כימית', 'מגיבים', 'תוצרים',
      'משוואה כימית', 'חומצה', 'בסיס', 'תגובת סתירה', 'חמצון', 'בעירה', 'אנרגיה', 'אנרגיה קינטית', 'אנרגיה פוטנציאלית', 'שימור אנרגיה', 'כוח',
      'תאוצה', 'מהירות', 'חיכוך', 'כוח הכובד', 'מסה', 'משקל', 'צפיפות', 'לחץ', 'טמפרטורה', 'מוליכות', 'זרם חשמלי', 'מתח חשמלי',
      'התנגדות', 'מעגל חשמלי', 'קרום התא', 'גרעין התא', 'ציטופלסמה', 'מיטוכונדריה', 'כלורופלסט', 'פוטוסינתזה', 'נשימה תאית', 'כרומוזום',
      'תורשה', 'אבולוציה', 'ברירה טבעית', 'מערכת אקולוגית', 'שרשרת מזון', 'יצרנים', 'צרכנים', 'מפרקים', 'מערכת העיכול', 'מערכת הנשימה',
      'מערכת הדם', 'השערה', 'ניסוי', 'משתנה תלוי', 'משתנה בלתי תלוי', 'קבוצת בקרה', 'מסקנה', 'מצבי צבירה', 'התאדות', 'התעבות', 'התכה',
      'קיפאון', 'רתיחה'],
    'תנ"ך': ['קורבן עולה', 'קורבן חטאת', 'קורבן אשם', 'קורבן שלמים', 'מנחה', 'משכן', 'בית המקדש', 'כהן גדול', 'כהנים', 'לויים', 'נביא',
      'נבואה', 'בראשית', 'שמות', 'ויקרא', 'במדבר', 'דברים', 'יהושע', 'שופטים', 'שמואל', 'מלכים', 'ישעיהו', 'ירמיהו', 'יחזקאל',
      'תרי עשר', 'תהילים', 'משלי', 'איוב', 'מגילת אסתר', 'מגילת רות', 'איכה', 'קהלת', 'שיר השירים', 'דניאל', 'עזרא', 'נחמיה',
      'דברי הימים', 'שיבת ציון', 'גלות בבל', 'חורבן הבית', 'כורש', 'נבוכדנצר', 'אברהם', 'יצחק', 'יעקב', 'יוסף', 'משה', 'אהרן',
      'דוד המלך', 'שלמה המלך', 'שאול', 'אליהו', 'אלישע', 'ברית', 'ברית בין הבתרים', 'עשרת הדיברות', 'מצוות', 'פרשנות', 'רש"י', 'רמב"ן',
      'אבן עזרא', 'מצודת דוד', 'פשט', 'דרש', 'פסוק', 'פרשה', 'חומש', 'מילה מנחה', 'הקבלה', 'משל ונמשל', 'תוכחה', 'ממלכת יהודה',
      'ממלכת ישראל', 'זרובבל', 'בית שני'],
    'היסטוריה': ['שיבת ציון', 'הצהרת בלפור', 'הספר הלבן', 'המנדט הבריטי', 'הכרזת העצמאות', 'מלחמת העצמאות', 'מלחמת ששת הימים',
      'מלחמת יום הכיפורים', 'העלייה הראשונה', 'העלייה השנייה', 'העלייה השלישית', 'הציונות', 'הרצל', 'הקונגרס הציוני', 'ההגנה', 'האצ"ל',
      'הלח"י', 'הפלמ"ח', 'תוכנית החלוקה', 'האו"ם', 'השואה', 'גטו', 'יודנרט', 'הפתרון הסופי', 'מחנות ריכוז', 'מחנות השמדה',
      'חסידי אומות העולם', 'מרד גטו ורשה', 'המשטר הנאצי', 'חוקי נירנברג', 'ליל הבדולח', 'מלחמת העולם הראשונה', 'מלחמת העולם השנייה',
      'בעלות הברית', 'מדינות הציר', 'המהפכה הצרפתית', 'המהפכה התעשייתית', 'לאומיות', 'אנטישמיות', 'אמנציפציה', 'תנועת ההשכלה', 'דמוקרטיה',
      'טוטליטריות', 'קומוניזם', 'פשיזם', 'המלחמה הקרה', 'תקופת בית שני', 'החשמונאים', 'המרד הגדול', 'מרד בר כוכבא', 'האימפריה הרומית',
      'האימפריה העות\'מאנית', 'ימי הביניים', 'מסעי הצלב', 'הרנסנס', 'גירוש ספרד', 'ציר זמן', 'מקור ראשוני', 'מקור משני', 'גורמים ותוצאות',
      'בן-גוריון', 'ז\'בוטינסקי', 'וייצמן', 'עליית הנוער', 'מעפילים', 'ההעפלה', 'קיבוץ גלויות', 'מעברות', 'מגילת העצמאות']
  };
  var HEB_PREFIX = /^[והבכלמש]+$/;
  var FINAL_TO_REG = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
  var REG_TO_FINAL = { 'מ': 'ם', 'נ': 'ן', 'צ': 'ץ', 'פ': 'ף', 'כ': 'ך' };
  var REPEAT_OK = { 'לאט': 1, 'יום': 1, 'שנה': 1, 'קצת': 1, 'מאוד': 1, 'אחד': 1, 'אחת': 1, 'דור': 1, 'איש': 1, 'פעם': 1, 'ממש': 1, 'טיפה': 1, 'שוב': 1 };
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', 'n': 'ⁿ', '+': '⁺', '-': '⁻' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };

  window.KatvanExtras = function (K) {
    var $ = K.$, editor = K.editor, hooks = K.hooks, ls = K.ls, prefs = K.prefs, esc = K.escHtml;
    var hasHL = !!(window.CSS && CSS.highlights && window.Highlight);

    var DEFAULTS = { complete: true, autoReplace: true, mathShortcuts: true, mathEverywhere: false, typoCheck: true, lineFocus: true, speechRate: 1, readingMode: false };
    Object.keys(DEFAULTS).forEach(function (k) { if (prefs[k] === undefined) prefs[k] = DEFAULTS[k]; });

    /* ---------- storage (new keys only) ---------- */
    var LS_REPLACE = 'ktv.replace', LS_DICT = 'ktv.dict', LS_WORDS = 'ktv.words';
    var replaceList = K.lsJson(LS_REPLACE, null);
    if (!Array.isArray(replaceList)) {
      replaceList = [{ from: 'פרב', to: 'פרבולה', kind: 'abbr' }, { from: 'משוו', to: 'משוואה', kind: 'abbr' }];
      ls.set(LS_REPLACE, JSON.stringify(replaceList));
    }
    var dictList = K.lsJson(LS_DICT, []);
    if (!Array.isArray(dictList)) dictList = [];
    var learned = K.lsJson(LS_WORDS, {});
    if (!learned || typeof learned !== 'object' || Array.isArray(learned)) learned = {};
    var replaceMapCache = null, dictSetCache = null;
    function saveReplace() { replaceMapCache = null; ls.set(LS_REPLACE, JSON.stringify(replaceList)); rebuildTerms(); }
    function saveDict() { dictSetCache = null; ls.set(LS_DICT, JSON.stringify(dictList)); rebuildTerms(); }
    function replaceMap() {
      if (!replaceMapCache) { replaceMapCache = {}; replaceList.forEach(function (r) { if (r.from) replaceMapCache[r.from] = r.to; }); }
      return replaceMapCache;
    }
    function dictSet() { if (!dictSetCache) dictSetCache = new Set(dictList); return dictSetCache; }

    /* ---------- small DOM helpers ---------- */
    function caretText() {
      var sel = window.getSelection();
      if (!sel.rangeCount || !sel.isCollapsed) return null;
      var r = sel.getRangeAt(0);
      if (!K.inEditor(r.startContainer)) return null;
      var n = r.startContainer, o = r.startOffset;
      if (n.nodeType !== 3) {
        var prev = n.childNodes[o - 1];
        if (prev && prev.nodeType === 3) { n = prev; o = prev.length; } else return null;
      }
      return { node: n, offset: o, before: n.data.slice(0, o) };
    }
    function setCaret(node, off) {
      var r = document.createRange();
      r.setStart(node, off); r.collapse(true);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      K.setSavedRange(r.cloneRange());
    }
    function elOf(node) { return node && (node.nodeType === 1 ? node : node.parentNode); }
    function inMath(node) { var el = elOf(node); return !!(el && el.closest && el.closest('.math, table.sol')); }
    function setX(name, on) { document.querySelectorAll('[data-xstate="' + name + '"]').forEach(function (b) { b.classList.toggle('on', !!on); }); }
    function heDate(iso) { try { return new Date(iso + 'T12:00').toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' }); } catch (e) { return iso || ''; } }
    function fmtStamp(ts) {
      try { return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts)); }
      catch (e) { return new Date(ts).toLocaleString(); }
    }
    function info(title, html) { K.modal({ title: title, body: '<p style="margin:0">' + html + '</p>', actions: [{ label: 'הבנתי', primary: true }] }); }

    /* =========================================================
       Math: inline formula, shortcuts, solution blocks
       ========================================================= */
    var lastConv = null;
    var MATH_RULES = [
      { re: /\^([0-9n+\-])$/, rep: function (m) { return SUP[m[1]]; }, kind: 'sup' },
      { re: /(^|[^A-Za-z])([A-Za-z])(\d)$/, rep: function (m) { return m[1] + m[2] + SUB[m[3]]; }, kind: 'sub' },
      { re: /sqrt$/, rep: '√' },
      { re: />=$/, rep: '≥' },
      { re: /<=$/, rep: '≤' },
      { re: /!=$/, rep: '≠' },
      { re: /\+-$/, rep: '±' },
      { re: /(^|[^A-Za-z])pi$/, rep: function (m) { return m[1] + 'π'; } },
      { re: /\*$/, rep: '×' }
    ];
    function applyConv(c, len, rep, kind) {
      K.histCommit();   // the raw text becomes an undo step, so Ctrl+Z brings it back
      var start = c.offset - len;
      c.node.replaceData(start, len, rep);
      var end = start + rep.length;
      setCaret(c.node, end);
      lastConv = kind ? { node: c.node, end: end, kind: kind } : null;
      return true;
    }
    function mathConvert(ch) {
      var c = caretText();
      if (!c) return false;
      if (!(prefs.mathEverywhere || inMath(c.node))) { lastConv = null; return false; }
      if (lastConv && lastConv.node === c.node && lastConv.end === c.offset - 1 && /^\d$/.test(ch)) {
        return applyConv(c, 1, (lastConv.kind === 'sup' ? SUP : SUB)[ch], lastConv.kind);
      }
      lastConv = null;
      for (var i = 0; i < MATH_RULES.length; i++) {
        var rule = MATH_RULES[i];
        var m = c.before.match(rule.re);
        if (m) return applyConv(c, m[0].length, typeof rule.rep === 'function' ? rule.rep(m) : rule.rep, rule.kind);
      }
      return false;
    }
    /* Hebrew typed at the very end of a formula belongs after it */
    function mathExitOnHebrew(ch) {
      if (!/[א-ת]/.test(ch)) return;
      var c = caretText();
      if (!c) return;
      var span = elOf(c.node).closest && elOf(c.node).closest('span.math');
      if (!span) return;
      var tail = document.createRange();
      tail.setStart(c.node, c.offset); tail.setEndAfter(span.lastChild || span);
      if (tail.toString().replace(/​/g, '')) return;
      c.node.deleteData(c.offset - ch.length, ch.length);
      var t = document.createTextNode(ch);
      span.parentNode.insertBefore(t, span.nextSibling);
      setCaret(t, t.length);
      if (!span.textContent.replace(/​/g, '')) span.remove();
    }
    function stripZwsp(c) {
      if (!c || c.node.data.indexOf('​') < 0 || c.node.data.length < 2) return;
      var before = c.node.data.slice(0, c.offset).replace(/​/g, '');
      c.node.data = c.node.data.replace(/​/g, '');
      setCaret(c.node, before.length);
    }
    function mathSpan() {
      K.restoreSel();
      var r = K.currentRange();
      if (!r) return;
      var inside = elOf(r.startContainer).closest('span.math');
      if (inside && r.collapsed) {
        // second press leaves the formula
        K.act(function () {
          var t = document.createTextNode('​');
          inside.parentNode.insertBefore(t, inside.nextSibling);
          setCaret(t, 1);
        });
        return;
      }
      K.act(function () {
        var rr = K.currentRange();
        var span = document.createElement('span');
        span.className = 'math';
        span.setAttribute('dir', 'ltr');
        if (rr.collapsed) {
          span.textContent = '​';
          rr.insertNode(span);
          setCaret(span.firstChild, 1);
        } else {
          span.appendChild(rr.extractContents());
          rr.insertNode(span);
          var sr = document.createRange(); sr.selectNodeContents(span);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(sr); K.setSavedRange(sr.cloneRange());
        }
      });
    }

    function solTable(sys, rows) {
      var t = document.createElement('table');
      t.className = sys ? 'sol sys' : 'sol';
      t.setAttribute('dir', 'ltr');
      var tb = document.createElement('tbody');
      for (var i = 0; i < rows; i++) tb.appendChild(solRow(sys));
      t.appendChild(tb);
      if (sys) fixBrace(t);
      return t;
    }
    function solRow(sys) {
      var tr = document.createElement('tr');
      if (sys) { var b = document.createElement('td'); b.className = 'br'; b.setAttribute('contenteditable', 'false'); tr.appendChild(b); }
      ['l', 'e', 'r'].forEach(function (c) {
        var td = document.createElement('td'); td.className = c;
        if (c === 'e') td.textContent = '='; else td.innerHTML = '<br>';
        tr.appendChild(td);
      });
      return tr;
    }
    function bracePiece(i, n) {
      if (n === 1) return '{';
      if (i === 0) return '⎧';
      if (i === n - 1) return '⎩';
      if (n > 2 && i === Math.floor((n - 1) / 2)) return '⎨';
      return '⎪';
    }
    function fixBrace(t) {
      var rows = t.rows, n = rows.length;
      for (var i = 0; i < n; i++) {
        var c = rows[i].cells[0];
        if (!c) continue;
        if (!c.classList.contains('br')) {
          c = document.createElement('td'); c.className = 'br';
          rows[i].insertBefore(c, rows[i].firstChild);
        }
        if (c.getAttribute('contenteditable') !== 'false') c.setAttribute('contenteditable', 'false');
        var p = bracePiece(i, n);
        if (c.textContent !== p) c.textContent = p;
      }
    }
    function insertSol(sys) {
      K.act(function () {
        var t = solTable(sys, sys ? 2 : 1);
        var p = document.createElement('p'); p.innerHTML = '<br>';
        K.insertBlockAfterCaret([t, p], null);
        K.placeCaret(t.rows[0].querySelector('td.l'), true);
      });
    }
    function solNewRow(cell) {
      var row = cell.parentNode, table = cell.closest('table');
      K.act(function () {
        var tr = solRow(table.classList.contains('sys'));
        row.parentNode.insertBefore(tr, row.nextSibling);
        if (table.classList.contains('sys')) fixBrace(table);
        K.placeCaret(tr.querySelector('td.l'), true);
      });
    }

    /* =========================================================
       Auto-replace: abbreviations + recurring typos
       ========================================================= */
    var TRIGGER = /^[\s .,;:!?)\]]$/;
    function lookupReplace(w) {
      var map = replaceMap();
      if (Object.prototype.hasOwnProperty.call(map, w)) return map[w];
      for (var k = 1; k <= 3 && k < w.length - 1; k++) {
        var pre = w.slice(0, k), rest = w.slice(k);
        if (HEB_PREFIX.test(pre) && Object.prototype.hasOwnProperty.call(map, rest)) return pre + map[rest];
      }
      return null;
    }
    function autoReplace(trigLen) {
      var c = caretText();
      if (!c || inMath(c.node)) return false;
      var before = c.before.slice(0, c.before.length - trigLen);
      var m = before.match(/(?:^|[\s (\[{])([^\s (\[{]+)$/);
      if (!m) return false;
      var w = m[1];
      var trail = (w.match(/[.,;:!?)\]]*$/) || [''])[0];
      var core = w.slice(0, w.length - trail.length);
      if (!core) return false;
      var rep = lookupReplace(core);
      if (rep == null || rep === core) return false;
      K.histCommit();
      var start = before.length - w.length;
      c.node.replaceData(start, core.length, rep);
      setCaret(c.node, c.offset - core.length + rep.length);
      return true;
    }

    /* =========================================================
       Word completion
       ========================================================= */
    var terms = [];          // [{t, w}]
    var sessionWords = {};   // words found in the stored documents this session
    function wordsOf(text, into) {
      var m = text.match(/[א-ת][א-ת"״׳']*[א-ת]|[A-Za-z]{3,}/g) || [];
      m.forEach(function (w) { if (w.length >= 3) into[w] = (into[w] || 0) + 1; });
      return into;
    }
    function rebuildTerms() {
      var w = {};
      Object.keys(SUBJECT_TERMS).forEach(function (s) { SUBJECT_TERMS[s].forEach(function (t) { w[t] = Math.max(w[t] || 0, 4); }); });
      Object.keys(learned).forEach(function (t) { w[t] = (w[t] || 0) + Math.min(40, learned[t]); });
      Object.keys(sessionWords).forEach(function (t) { w[t] = (w[t] || 0) + Math.min(40, sessionWords[t]); });
      dictList.forEach(function (t) { w[t] = (w[t] || 0) + 3; });
      replaceList.forEach(function (r) { if (r.to && r.to.length > 2) w[r.to] = (w[r.to] || 0) + 3; });
      terms = Object.keys(w).map(function (t) { return { t: t, w: w[t] }; });
    }
    function learnStoredDocs() {
      try {
        K.readIndex().forEach(function (e) {
          var raw = ls.get(K.LS_DOC + e.id);
          if (!raw) return;
          try { var d = JSON.parse(raw); wordsOf(String(d.html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' '), sessionWords); } catch (err) { /* skip */ }
        });
      } catch (e) { /* ignore */ }
      rebuildTerms();
    }
    var learnCurrent = K.debounce(function () {
      var cw = wordsOf(K.docText(), {});
      Object.keys(cw).forEach(function (t) { learned[t] = Math.max(learned[t] || 0, cw[t]); });
      var keys = Object.keys(learned);
      if (keys.length > 4000) {
        keys.sort(function (a, b) { return learned[b] - learned[a]; });
        var keep = {}; keys.slice(0, 4000).forEach(function (k) { keep[k] = learned[k]; }); learned = keep;
      }
      ls.set(LS_WORDS, JSON.stringify(learned));
      rebuildTerms();
    }, 20000);
    rebuildTerms();

    var comp = { open: false, items: [], idx: 0, node: null, offset: 0, tok: '' };
    var popEl = $('completePop');
    function suggest(tok) {
      var res = [], seen = {};
      function scan(pre, core) {
        if (core.length < 2) return;
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i].t;
          if (t.length > core.length + 1 && t.lastIndexOf(core, 0) === 0) {
            var full = pre + t;
            if (!seen[full]) { seen[full] = 1; res.push({ text: full, w: terms[i].w - (pre ? 1 : 0), pre: pre.length + core.length }); }
          }
        }
      }
      scan('', tok);
      for (var k = 1; k <= 2 && res.length < 5; k++) {
        var pre = tok.slice(0, k);
        if (tok.length - k >= 2 && HEB_PREFIX.test(pre)) scan(pre, tok.slice(k));
      }
      res.sort(function (a, b) { return b.w - a.w || a.text.length - b.text.length; });
      return res.slice(0, 5);
    }
    function updateComplete() {
      if (!prefs.complete) { hideComplete(); return; }
      var c = caretText();
      if (!c || inMath(c.node)) { hideComplete(); return; }
      var next = c.node.data.charAt(c.offset);
      if (next && /[א-תA-Za-z]/.test(next)) { hideComplete(); return; }
      var m = c.before.match(/([א-תA-Za-z][א-תA-Za-z"״׳'-]*)$/);
      if (!m || m[1].length < 2) { hideComplete(); return; }
      var items = suggest(m[1]);
      if (!items.length) { hideComplete(); return; }
      comp = { open: true, items: items, idx: 0, node: c.node, offset: c.offset, tok: m[1] };
      renderComplete();
    }
    function renderComplete() {
      popEl.innerHTML = comp.items.map(function (it, i) {
        return '<button class="complete-item' + (i === comp.idx ? ' on' : '') + '" data-i="' + i + '" role="option" tabindex="-1"><span><b>' + esc(it.text.slice(0, it.pre)) + '</b>' + esc(it.text.slice(it.pre)) + '</span>' +
          (i === comp.idx ? '<span class="ci-key">Tab</span>' : '') + '</button>';
      }).join('');
      popEl.hidden = false;
      var r = document.createRange();
      r.setStart(comp.node, comp.offset); r.collapse(true);
      var rect = r.getClientRects()[0] || elOf(comp.node).getBoundingClientRect();
      var pw = popEl.offsetWidth, ph = popEl.offsetHeight;
      var left = K.clamp(rect.right - pw, 8, window.innerWidth - pw - 8);
      var top = rect.bottom + 6;
      var bottomRoom = K.isMobile && K.isMobile() ? 72 : 36;   // phones: keep clear of the bottom formatting bar
      if (top + ph > window.innerHeight - bottomRoom) top = Math.max(8, rect.top - ph - 6);
      popEl.style.left = left + 'px';
      popEl.style.top = top + 'px';
    }
    function hideComplete() { if (!comp.open && popEl.hidden) return; comp.open = false; popEl.hidden = true; }
    function acceptComplete(i) {
      var it = comp.items[i == null ? comp.idx : i];
      var c = caretText();
      if (!it || !c || c.node !== comp.node || c.offset !== comp.offset) { hideComplete(); return; }
      hideComplete();
      K.histCommit();
      var start = c.offset - comp.tok.length;
      c.node.replaceData(start, comp.tok.length, it.text);
      setCaret(c.node, start + it.text.length);
      K.commit();
    }
    popEl.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var b = e.target.closest('.complete-item');
      if (b) acceptComplete(+b.dataset.i);
    });
    /* touch: accept on the tap itself; cancelling touchend keeps the keyboard and the caret in the text */
    popEl.addEventListener('touchend', function (e) {
      var b = e.target.closest('.complete-item');
      if (!b) return;
      if (e.cancelable) e.preventDefault();
      acceptComplete(+b.dataset.i);
    });

    /* =========================================================
       Typo layer (on top of the browser's spellcheck)
       ========================================================= */
    var typos = [];
    var ignoredTypos = new Set();
    var ignoredSpaces = [];   // live ranges of double spaces the user chose to keep
    function textSegments() {
      // text of each block with a node map, skipping formulas and read-only parts
      var segs = [], seg = null, lastBlock = null, gap = false;
      var walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      var n;
      while ((n = walker.nextNode())) {
        if (n.nodeType === 1) {
          // tabs, notes, formulas, images and line breaks separate words
          if (n.tagName === 'BR' || n.tagName === 'IMG' || n.matches('[contenteditable="false"], .math, table.sol')) gap = true;
          continue;
        }
        if (n.parentNode.closest('[contenteditable="false"], .math, table.sol')) { gap = true; continue; }
        var b = K.closestBlock(n) || editor;
        if (b !== lastBlock) { seg = { nodes: [], text: '' }; segs.push(seg); lastBlock = b; gap = false; }
        if (gap && seg.text) seg.text += '\n';
        gap = false;
        seg.nodes.push({ node: n, start: seg.text.length });
        seg.text += n.nodeValue;
      }
      return segs;
    }
    function segPoint(seg, pos) {
      var lo = 0, hi = seg.nodes.length - 1;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (seg.nodes[mid].start <= pos) lo = mid; else hi = mid - 1; }
      var e = seg.nodes[lo];
      return { node: e.node, offset: Math.min(pos - e.start, e.node.length) };
    }
    function segRange(seg, a, b) {
      var p = segPoint(seg, a), q = segPoint(seg, b);
      var r = document.createRange();
      try { r.setStart(p.node, p.offset); r.setEnd(q.node, q.offset); } catch (e) { return null; }
      return r;
    }
    function knownWord(w) {
      var d = dictSet();
      if (d.has(w)) return true;
      for (var k = 1; k <= 3 && k < w.length - 1; k++) if (HEB_PREFIX.test(w.slice(0, k)) && d.has(w.slice(k))) return true;
      return false;
    }
    function runTypo() {
      typos = [];
      if (!hasHL) return;
      if (!prefs.typoCheck) { CSS.highlights.delete('typo'); return; }
      textSegments().forEach(function (seg) {
        var t = seg.text, m;
        var reW = /[א-ת]+(?:["״'׳][א-ת]+)*["״'׳]?/g;
        while ((m = reW.exec(t))) {
          var w = m[0];
          if (/["״'׳]/.test(w) || knownWord(w) || ignoredTypos.has('w:' + w)) continue;
          var next = t.charAt(m.index + w.length);
          var issue = null;
          if (/[םןץףך](?=[א-ת])/.test(w)) {
            issue = { kind: 'final-mid', why: 'אות סופית באמצע מילה', fix: w.replace(/[םןץףך](?=[א-ת])/g, function (ch) { return FINAL_TO_REG[ch]; }) };
          } else if (w.length >= 2 && REG_TO_FINAL[w.charAt(w.length - 1)] && !/[-־]/.test(next)) {
            issue = { kind: 'final-end', why: 'בסוף מילה כותבים אות סופית', fix: w.slice(0, -1) + REG_TO_FINAL[w.charAt(w.length - 1)] };
          }
          if (issue) {
            var r = segRange(seg, m.index, m.index + w.length);
            if (r) { issue.range = r; issue.word = w; typos.push(issue); }
          }
        }
        var reS = /[^\s \t]([  ]{2,})(?=[^\s \t])/g;
        while ((m = reS.exec(t))) {
          var rs = segRange(seg, m.index + 1, m.index + m[0].length);
          if (rs && ignoredSpaces.some(function (ig) { return ig.startContainer === rs.startContainer && ig.startOffset === rs.startOffset; })) continue;
          if (rs) typos.push({ kind: 'spaces', why: 'שני רווחים ברצף', fix: ' ', range: rs, word: '' });
        }
        var reR = /([א-תA-Za-z]+)([  ]+)\1(?![א-תA-Za-z])/g;
        while ((m = reR.exec(t))) {
          var prevCh = t.charAt(m.index - 1);
          if (prevCh && /[א-תA-Za-z]/.test(prevCh)) { reR.lastIndex = m.index + 1; continue; }
          if (REPEAT_OK[m[1]] || knownWord(m[1] + ' ' + m[1]) || ignoredTypos.has('r:' + m[1])) continue;
          var rr = segRange(seg, m.index + m[1].length, m.index + m[0].length);
          if (rr) typos.push({ kind: 'repeat', why: 'אותה מילה פעמיים ברצף', fix: '', range: rr, word: m[1] });
        }
      });
      if (typos.length) CSS.highlights.set('typo', new Highlight(...typos.map(function (x) { return x.range; })));
      else CSS.highlights.delete('typo');
    }
    var scheduleTypo = K.debounce(runTypo, 500);

    var ctxEl = $('ctxMenu');
    function hideCtx() { ctxEl.hidden = true; }
    function applyTypoFix(t) {
      K.histFlush();
      var r = t.range;
      if (!K.inEditor(r.startContainer)) return;
      r.deleteContents();
      if (t.fix) r.insertNode(document.createTextNode(t.fix));
      var after = document.createRange(); after.setStart(r.endContainer, r.endOffset); after.collapse(true);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(after); K.setSavedRange(after.cloneRange());
      editor.normalize();
      K.commit();
      runTypo();
    }
    function showCtx(t, x, y) {
      var items = [];
      items.push('<div class="ctx-why">' + esc(t.why) + '</div>');
      if (t.kind === 'repeat') items.push('<button class="menu-item fix" data-act="fix">מחיקת המילה הכפולה</button>');
      else if (t.kind === 'spaces') items.push('<button class="menu-item fix" data-act="fix">רווח אחד</button>');
      else items.push('<button class="menu-item fix" data-act="fix">' + esc(t.fix) + '</button>');
      items.push('<div class="ctx-sep"></div>');
      if (t.word && t.kind !== 'repeat') items.push('<button class="menu-item" data-act="dict">הוספה למילון האישי</button>');
      items.push('<button class="menu-item" data-act="ignore">התעלמות</button>');
      ctxEl.innerHTML = items.join('');
      ctxEl.hidden = false;
      var w = ctxEl.offsetWidth, h = ctxEl.offsetHeight;
      ctxEl.style.left = K.clamp(x - w, 8, window.innerWidth - w - 8) + 'px';
      ctxEl.style.top = K.clamp(y, 8, window.innerHeight - h - 8) + 'px';
      ctxEl.onclick = function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        hideCtx();
        if (b.dataset.act === 'fix') applyTypoFix(t);
        else if (b.dataset.act === 'dict') { if (dictList.indexOf(t.word) < 0) { dictList.push(t.word); saveDict(); } runTypo(); K.toast('"' + t.word + '" נוסף למילון האישי'); }
        else {
          if (t.kind === 'repeat') ignoredTypos.add('r:' + t.word);
          else if (t.kind === 'spaces') ignoredSpaces.push(t.range.cloneRange());
          else ignoredTypos.add('w:' + t.word);
          runTypo();
        }
      };
    }
    editor.addEventListener('contextmenu', function (e) {
      if (!prefs.typoCheck || !hasHL) return;
      runTypo();
      if (!typos.length) return;
      var pos = document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
      if (!pos) return;
      var hit = typos.find(function (t) { try { return t.range.isPointInRange(pos.startContainer, pos.startOffset); } catch (err) { return false; } });
      if (!hit) return;
      e.preventDefault();
      showCtx(hit, e.clientX, e.clientY);
    });
    /* touch: long-press on an underlined word opens the same menu */
    (function initTouchTypoMenu() {
      var lp = null, lpShownAt = 0, lpGuard = 0;
      function typoAt(x, y) {
        var pos = document.caretRangeFromPoint && document.caretRangeFromPoint(x, y);
        if (!pos) return null;
        var hit = typos.find(function (t) { try { return t.range.isPointInRange(pos.startContainer, pos.startOffset); } catch (err) { return false; } });
        return hit ? { typo: hit, pos: pos } : null;
      }
      function dropSelection(pos) {
        // Android selects the pressed word; put the caret back so its copy/paste bar does not cover the menu
        try { var s = window.getSelection(); s.removeAllRanges(); var r = document.createRange(); r.setStart(pos.startContainer, pos.startOffset); r.collapse(true); s.addRange(r); } catch (err) { /* ignore */ }
      }
      editor.addEventListener('touchstart', function (e) {
        if (lp) clearTimeout(lp.timer);
        lp = null;
        if (e.touches.length !== 1 || !prefs.typoCheck || !hasHL) return;
        var x = e.touches[0].clientX, y = e.touches[0].clientY;
        lp = { x: x, y: y, timer: setTimeout(function () {
          runTypo();
          var h = typoAt(x, y);
          if (!h) return;
          lpShownAt = lpGuard = Date.now();
          showCtx(h.typo, x + 10, y + 18);
          try { if (navigator.vibrate) navigator.vibrate(10); } catch (err) { /* ignore */ }
          setTimeout(function () { dropSelection(h.pos); }, 40);
          setTimeout(function () { dropSelection(h.pos); }, 260);
        }, 480) };
      }, { passive: true });
      editor.addEventListener('touchmove', function (e) {
        if (!lp) return;
        var t = e.touches[0];
        if (Math.abs(t.clientX - lp.x) > 10 || Math.abs(t.clientY - lp.y) > 10) { clearTimeout(lp.timer); lp = null; }
      }, { passive: true });
      editor.addEventListener('touchend', function (e) {
        if (lp) clearTimeout(lp.timer);
        lp = null;
        // the finger lifting after a long-press must not close the menu it just opened
        if (lpShownAt && Date.now() - lpShownAt < 1500 && e.cancelable) e.preventDefault();
        lpShownAt = 0;
      });
      editor.addEventListener('touchcancel', function () { if (lp) clearTimeout(lp.timer); lp = null; });
      // the same long-press also fires contextmenu on Android: keep our menu instead of the system one
      editor.addEventListener('contextmenu', function (e) {
        if (Date.now() - lpGuard < 1500) { e.preventDefault(); e.stopImmediatePropagation(); }
      }, true);
    })();
    document.addEventListener('mousedown', function (e) { if (!ctxEl.hidden && !e.target.closest('.ctx-menu')) hideCtx(); if (comp.open && !e.target.closest('.complete-pop')) hideComplete(); }, true);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ctxEl.hidden) { hideCtx(); e.preventDefault(); } }, true);
    window.addEventListener('resize', function () { hideCtx(); hideComplete(); });
    K.canvas.addEventListener('scroll', function () { hideCtx(); if (comp.open) renderComplete(); positionFocus(); });

    /* =========================================================
       Footnotes and sources
       ========================================================= */
    function syncNotes() {
      var sups = editor.querySelectorAll('sup.fn');
      var box = editor.querySelector('.fn-notes');
      var changed = false;
      sups.forEach(function (s, i) {
        if (s.textContent !== String(i + 1)) { s.textContent = String(i + 1); changed = true; }
        if (s.getAttribute('contenteditable') !== 'false') s.setAttribute('contenteditable', 'false');
      });
      if (!sups.length) { if (box) { box.remove(); changed = true; } return changed; }
      var notes = Array.prototype.map.call(sups, function (s) { return s.getAttribute('data-note') || ''; });
      var sig = notes.join('\u0001');
      if (!box) {
        box = document.createElement('div');
        box.className = 'fn-notes';
        box.setAttribute('contenteditable', 'false');
        editor.appendChild(box);
        changed = true;
      }
      if (box !== editor.lastElementChild) { editor.appendChild(box); changed = true; }
      if (box._sig !== sig) {
        box.innerHTML = '<div class="fn-title">הערות</div><ol>' + notes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>';
        box._sig = sig;
        changed = true;
      }
      editor.querySelectorAll('.fn-notes').forEach(function (b) { if (b !== box) { b.remove(); changed = true; } });
      return changed;
    }
    function footnoteDialog(sup) {
      K.restoreSel();
      var keep = K.currentRange() ? K.currentRange().cloneRange() : null;
      K.modal({
        title: sup ? 'עריכת הערת שוליים' : 'הערת שוליים',
        body: '<label>טקסט ההערה<textarea id="fnText" rows="3"></textarea></label>',
        onOpen: function () { var ta = $('fnText'); ta.value = sup ? sup.getAttribute('data-note') || '' : ''; ta.focus(); },
        actions: [
          { label: sup ? 'עדכון' : 'הוספה', primary: true, run: function () {
            var txt = $('fnText').value.replace(/\s+/g, ' ').trim();
            if (!txt) { $('fnText').focus(); return false; }
            if (keep) K.setSavedRange(keep);
            K.act(function () {
              if (sup) { sup.setAttribute('data-note', txt); return; }
              var r = K.currentRange();
              r.collapse(false);
              var s = document.createElement('sup');
              s.className = 'fn'; s.setAttribute('contenteditable', 'false'); s.setAttribute('data-note', txt); s.textContent = '0';
              r.insertNode(s);
              var t = document.createTextNode('');
              s.parentNode.insertBefore(t, s.nextSibling);
              setCaret(t, 0);
            });
          } },
          sup ? { label: 'מחיקת ההערה', danger: true, run: function () { K.act(function () { sup.remove(); }); } } : null,
          { label: 'ביטול' }
        ]
      });
    }
    editor.addEventListener('click', function (e) {
      var s = e.target.closest && e.target.closest('sup.fn');
      if (s && K.inEditor(s)) { e.preventDefault(); footnoteDialog(s); }
    });
    function sourceDialog() {
      K.restoreSel();
      K.modal({
        title: 'הוספת מקור',
        cls: 'mid',
        body: '<div class="dlg-row"><label>מחבר או מחברים<input type="text" id="srcAuthor"></label><label style="flex:0 0 90px">שנה<input type="text" id="srcYear" dir="ltr" inputmode="numeric"></label></div>' +
          '<label>שם הספר, המאמר או הדף<input type="text" id="srcTitle"></label>' +
          '<label>הוצאה לאור או שם האתר<input type="text" id="srcPub"></label>' +
          '<label>קישור<input type="url" id="srcUrl" dir="ltr"></label>',
        onOpen: function () { $('srcAuthor').focus(); },
        actions: [
          { label: 'הוספה', primary: true, run: function () {
            var a = $('srcAuthor').value.trim(), y = $('srcYear').value.trim(), t = $('srcTitle').value.trim(), p = $('srcPub').value.trim(), u = $('srcUrl').value.trim();
            if (!t && !a) { $('srcTitle').focus(); return false; }
            var parts = [];
            if (a) parts.push(esc(a) + (y ? ' (' + esc(y) + ')' : '') + '.');
            else if (y) parts.push('(' + esc(y) + ').');
            if (t) parts.push('<i>' + esc(t) + '</i>.');
            if (p) parts.push(esc(p) + '.');
            var html = parts.join(' ');
            if (u) { var href = /^https?:/i.test(u) ? u : 'https://' + u; html += ' <a href="' + esc(href) + '" dir="ltr">' + esc(u) + '</a>'; }
            addSource(html);
          } },
          { label: 'ביטול' }
        ]
      });
    }
    function addSource(html) {
      K.act(function () {
        var ol = editor.querySelector('ol.sources');
        if (!ol) {
          ol = document.createElement('ol');
          ol.className = 'sources';
          var heads = Array.prototype.filter.call(editor.querySelectorAll('h1,h2,h3'), function (h) { return /^(מקורות|ביבליוגרפיה|רשימת מקורות)$/.test(h.textContent.trim()); });
          var notes = editor.querySelector('.fn-notes');
          if (heads.length) {
            var h = heads[heads.length - 1], nx = h.nextElementSibling;
            if (nx && nx.tagName === 'P' && !nx.textContent.trim() && !nx.querySelector('img')) nx.parentNode.replaceChild(ol, nx);
            else h.parentNode.insertBefore(ol, h.nextSibling);
          } else {
            var h2 = document.createElement('h2'); h2.textContent = 'מקורות';
            editor.insertBefore(h2, notes); editor.insertBefore(ol, notes);
          }
        }
        var li = document.createElement('li');
        li.innerHTML = html;
        ol.appendChild(li);
      });
      K.toast('המקור נוסף לרשימת המקורות');
    }

    /* =========================================================
       Equation editor (MathLive) -> editable image
       ========================================================= */
    var mlReady = false;
    function prepMathLive() {
      return K.loadLib('mathlive').then(function (ML) {
        if (!mlReady) {
          try {
            window.MathfieldElement.soundsDirectory = null;
            window.MathfieldElement.keypressSound = null;
            window.MathfieldElement.plonkSound = null;
          } catch (e) { /* older API */ }
          mlReady = true;
        }
        return ML;
      });
    }
    var EQ_TOOLS = [
      ['שבר', '\\frac{#@}{#?}'], ['√', '\\sqrt{#0}'], ['ⁿ√', '\\sqrt[#?]{#0}'], ['x²', '#@^{2}'], ['xⁿ', '#@^{#?}'], ['xₙ', '#@_{#?}'],
      ['±', '\\pm'], ['×', '\\times'], ['÷', '\\div'], ['≤', '\\le'], ['≥', '\\ge'], ['≠', '\\ne'], ['π', '\\pi'], ['( )', '\\left(#0\\right)'], ['|x|', '\\left|#0\\right|']
    ];
    function equationDialog(img) {
      K.restoreSel();
      var keep = K.currentRange() ? K.currentRange().cloneRange() : null;
      prepMathLive().then(function () {
        K.modal({
          title: img ? 'עריכת משוואה' : 'משוואה',
          cls: 'mid',
          body: '<div class="eq-tools" id="eqTools">' + EQ_TOOLS.map(function (t, i) { return '<button type="button" data-i="' + i + '">' + esc(t[0]) + '</button>'; }).join('') + '</div>' +
            '<math-field class="eq-field" id="eqField" math-virtual-keyboard-policy="manual"></math-field>' +
            '<p class="dlg-hint">כותבים כמו במחשבון: / יוצר שבר, ^ יוצר חזקה, sqrt יוצר שורש. החצים זזים בין החלקים.</p>',
          onOpen: function () {
            var mf = $('eqField');
            mf.value = img ? img.getAttribute('data-latex') || '' : '';
            $('eqTools').addEventListener('mousedown', function (e) { e.preventDefault(); });
            $('eqTools').addEventListener('click', function (e) {
              var b = e.target.closest('button[data-i]');
              if (!b) return;
              mf.executeCommand(['insert', EQ_TOOLS[+b.dataset.i][1]]);
              mf.focus();
            });
            setTimeout(function () { mf.focus(); }, 60);
          },
          onClose: function () { try { if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide(); } catch (e) { /* ignore */ } },
          actions: [
            { label: img ? 'עדכון' : 'הוספה', primary: true, run: function () {
              var latex = ($('eqField').value || '').trim();
              if (!latex) return false;
              renderLatex(latex).then(function (res) {
                if (keep) K.setSavedRange(keep);
                placeImage(img, res, { cls: 'eq', attr: 'data-latex', val: latex, alt: latex });
              }).catch(function (err) { console.error(err); K.toast('לא הצלחתי ליצור את המשוואה.', true); });
            } },
            { label: 'ביטול' }
          ]
        });
      }).catch(function () { K.toast('עורך המשוואות לא נטען מתיקיית התוכנה (vendor).', true, 6000); });
    }
    function svgToPng(svg, w, h, scale) {
      return new Promise(function (resolve, reject) {
        var im = new Image();
        im.onload = function () {
          var c = document.createElement('canvas');
          c.width = Math.round(w * scale); c.height = Math.round(h * scale);
          var cx = c.getContext('2d');
          cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
          cx.drawImage(im, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/png'));
        };
        im.onerror = function () { reject(new Error('EQ_RENDER')); };
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      });
    }
    function renderLatex(latex) {
      var mathml = window.MathLive.convertLatexToMathMl(latex);
      var host = document.createElement('div');
      host.setAttribute('style', 'display:inline-block;padding:3px 5px;font-size:19px;line-height:1.2;color:#000;background:#fff;direction:ltr;white-space:nowrap;font-family:"Cambria Math","Times New Roman",serif');
      host.innerHTML = '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" style="font-family:\'Cambria Math\',serif">' + mathml + '</math>';
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:-10000px;top:0';
      probe.appendChild(host);
      document.body.appendChild(probe);
      var rect = host.getBoundingClientRect();
      var w = Math.max(8, Math.ceil(rect.width)), h = Math.max(8, Math.ceil(rect.height));
      var xml = new XMLSerializer().serializeToString(host);
      probe.remove();
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject x="0" y="0" width="' + w + '" height="' + h + '">' + xml + '</foreignObject></svg>';
      return svgToPng(svg, w, h, 3).then(function (src) { return { src: src, w: w, h: h }; });
    }
    function placeImage(img, res, o) {
      K.act(function () {
        var el = img;
        if (!el) {
          el = document.createElement('img');
          var r = K.currentRange();
          if (!r) return;
          if (!r.collapsed) r.deleteContents();
          r.insertNode(el);
          var t = document.createTextNode('');
          el.parentNode.insertBefore(t, el.nextSibling);
          setCaret(t, 0);
        }
        el.className = o.cls;
        el.setAttribute('src', res.src);
        el.setAttribute(o.attr, o.val);
        el.setAttribute('alt', o.alt);
        el.style.width = Math.round(res.w) + 'px';
        el.style.height = '';
      });
      if (img) K.selectImage(img);
    }

    /* =========================================================
       Function graph (linear / quadratic)
       ========================================================= */
    function compileExpr(src) {
      var s = String(src).replace(/\s+/g, '').replace(/[−–—]/g, '-').replace(/[×·∙]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').replace(/,/g, '.').replace(/X/g, 'x');
      s = s.replace(/^(y|f\(x\))=/i, '');
      if (!s) throw new Error('empty');
      var i = 0;
      function peek() { return s.charAt(i); }
      function expr() {
        var f = term();
        while (peek() === '+' || peek() === '-') {
          var op = s.charAt(i++), g = term(), a = f;
          f = op === '+' ? (function (a, g) { return function (x) { return a(x) + g(x); }; })(a, g) : (function (a, g) { return function (x) { return a(x) - g(x); }; })(a, g);
        }
        return f;
      }
      function term() {
        var f = unary();
        for (;;) {
          var c = peek();
          if (c === '*' || c === '/') {
            i++;
            var g = unary(), a = f;
            f = c === '*' ? (function (a, g) { return function (x) { return a(x) * g(x); }; })(a, g) : (function (a, g) { return function (x) { return a(x) / g(x); }; })(a, g);
          } else if (c === 'x' || c === '(' || /[0-9.]/.test(c)) {
            var g2 = power(), a2 = f;
            f = (function (a, g) { return function (x) { return a(x) * g(x); }; })(a2, g2);
          } else break;
        }
        return f;
      }
      function unary() {
        if (peek() === '-') { i++; var f = unary(); return function (x) { return -f(x); }; }
        if (peek() === '+') { i++; return unary(); }
        return power();
      }
      function power() {
        var b = atom();
        if (peek() === '^') {
          i++;
          var e = unary();
          return function (x) { return Math.pow(b(x), e(x)); };
        }
        return b;
      }
      function atom() {
        var c = peek();
        if (c === 'x') { i++; return function (x) { return x; }; }
        if (c === '(') {
          i++;
          var f = expr();
          if (peek() !== ')') throw new Error('paren');
          i++;
          return f;
        }
        var m = s.slice(i).match(/^\d*\.?\d+|^\d+\.?/);
        if (m) { i += m[0].length; var v = parseFloat(m[0]); return function () { return v; }; }
        throw new Error('token');
      }
      var fn = expr();
      if (i < s.length) throw new Error('trailing');
      return { fn: fn, clean: s };
    }
    function analyse(src) {
      var comp = compileExpr(src), f = comp.fn;
      var c = f(0), b = (f(1) - f(-1)) / 2, a = (f(1) + f(-1)) / 2 - c;
      [2, -3, 0.5, 7, -11].forEach(function (x) {
        var exp = a * x * x + b * x + c, got = f(x);
        if (!isFinite(got) || Math.abs(got - exp) > 1e-7 * Math.max(1, Math.abs(exp))) throw new Error('degree');
      });
      var clean = function (v) { return Math.abs(v) < 1e-10 ? 0 : v; };
      a = clean(a); b = clean(b); c = clean(c);
      var res = { f: f, a: a, b: b, c: c, src: comp.clean, roots: [], vertex: null };
      if (a === 0 && b === 0) res.kind = 'const';
      else if (a === 0) { res.kind = 'linear'; res.roots = [-c / b]; }
      else {
        res.kind = 'quad';
        var d = b * b - 4 * a * c, vx = -b / (2 * a);
        res.vertex = [vx, f(vx)];
        if (Math.abs(d) < 1e-12) res.roots = [vx];
        else if (d > 0) res.roots = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].sort(function (p, q) { return p - q; });
      }
      return res;
    }
    function fmtNum(v) {
      if (Math.abs(v) < 1e-9) v = 0;
      var r = Math.round(v * 100) / 100;
      return String(r).replace('-', '−');
    }
    function prettyExpr(s) {
      return 'y = ' + s.replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\*/g, '·')
        .replace(/([0-9x)²³])([+\-])/g, '$1 $2 ').replace(/-/g, '−');
    }
    function niceStep(range) {
      var raw = range / 10, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
      return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * p;
    }
    function graphWindow(g) {
      var xs = [0].concat(g.roots), ys = [0, g.c];
      if (g.vertex) { xs.push(g.vertex[0]); ys.push(g.vertex[1]); }
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
      var span = Math.max(8, (x1 - x0) * 1.5);
      var cx = (x0 + x1) / 2;
      x0 = cx - span / 2; x1 = cx + span / 2;
      if (g.kind !== 'quad') { ys.push(g.f(x0), g.f(x1)); }
      else { ys.push(g.f(x0 + span * 0.15), g.f(x1 - span * 0.15)); }
      var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var ys2 = Math.max(6, (y1 - y0) * 1.25);
      var cy = (y0 + y1) / 2;
      return { x0: x0, x1: x1, y0: cy - ys2 / 2, y1: cy + ys2 / 2 };
    }
    function drawGraph(cv, g, W, H, scale) {
      cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
      var cx = cv.getContext('2d');
      cx.setTransform(scale, 0, 0, scale, 0, 0);
      cx.direction = 'ltr';   // the page is RTL; coordinates and numbers must not be mirrored
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, W, H);
      var win = graphWindow(g), pad = 26;
      var X = function (x) { return pad + (x - win.x0) / (win.x1 - win.x0) * (W - 2 * pad); };
      var Y = function (y) { return H - pad - (y - win.y0) / (win.y1 - win.y0) * (H - 2 * pad); };
      var sx = niceStep(win.x1 - win.x0), sy = niceStep(win.y1 - win.y0);
      cx.font = '11px Arial, sans-serif';
      cx.lineWidth = 1;
      var k, v;
      // grid
      cx.strokeStyle = '#e4e8f0';
      for (v = Math.ceil(win.x0 / sx) * sx; v <= win.x1; v += sx) { cx.beginPath(); cx.moveTo(X(v), pad); cx.lineTo(X(v), H - pad); cx.stroke(); }
      for (v = Math.ceil(win.y0 / sy) * sy; v <= win.y1; v += sy) { cx.beginPath(); cx.moveTo(pad, Y(v)); cx.lineTo(W - pad, Y(v)); cx.stroke(); }
      // axes
      var ax = K.clamp(Y(0), pad, H - pad), ay = K.clamp(X(0), pad, W - pad);
      cx.strokeStyle = '#2b3445'; cx.lineWidth = 1.4;
      cx.beginPath(); cx.moveTo(pad - 6, ax); cx.lineTo(W - pad + 8, ax); cx.stroke();
      cx.beginPath(); cx.moveTo(ay, H - pad + 6); cx.lineTo(ay, pad - 8); cx.stroke();
      cx.fillStyle = '#2b3445';
      cx.beginPath(); cx.moveTo(W - pad + 12, ax); cx.lineTo(W - pad + 4, ax - 4); cx.lineTo(W - pad + 4, ax + 4); cx.fill();
      cx.beginPath(); cx.moveTo(ay, pad - 12); cx.lineTo(ay - 4, pad - 4); cx.lineTo(ay + 4, pad - 4); cx.fill();
      cx.font = 'italic 13px "Times New Roman", serif';
      cx.textAlign = 'right'; cx.textBaseline = 'top';
      cx.fillText('x', W - 4, ax + 4);
      cx.textAlign = 'left'; cx.textBaseline = 'top';
      cx.fillText('y', ay + 6, 2);
      // tick labels
      cx.font = '10.5px Arial, sans-serif'; cx.fillStyle = '#4b5563';
      var everyX = Math.max(1, Math.round(28 / Math.max(1, X(sx) - X(0))));
      k = 0;
      for (v = Math.ceil(win.x0 / sx) * sx; v <= win.x1; v += sx, k++) {
        if (Math.abs(v) < sx / 2 || k % everyX) continue;
        cx.textAlign = 'center'; cx.textBaseline = 'top';
        cx.fillText(fmtNum(v), X(v), ax + 4);
        cx.beginPath(); cx.moveTo(X(v), ax - 3); cx.lineTo(X(v), ax + 3); cx.strokeStyle = '#2b3445'; cx.lineWidth = 1; cx.stroke();
      }
      var everyY = Math.max(1, Math.round(18 / Math.max(1, Y(0) - Y(sy))));
      k = 0;
      for (v = Math.ceil(win.y0 / sy) * sy; v <= win.y1; v += sy, k++) {
        if (Math.abs(v) < sy / 2 || k % everyY) continue;
        cx.textAlign = 'right'; cx.textBaseline = 'middle';
        cx.fillText(fmtNum(v), ay - 5, Y(v));
        cx.beginPath(); cx.moveTo(ay - 3, Y(v)); cx.lineTo(ay + 3, Y(v)); cx.strokeStyle = '#2b3445'; cx.lineWidth = 1; cx.stroke();
      }
      cx.textAlign = 'right'; cx.textBaseline = 'top'; cx.fillText('0', ay - 4, ax + 3);
      // curve
      cx.save();
      cx.beginPath(); cx.rect(pad, pad, W - 2 * pad, H - 2 * pad); cx.clip();
      cx.strokeStyle = '#1a56db'; cx.lineWidth = 2.4; cx.lineJoin = 'round';
      cx.beginPath();
      var N = 600, started = false;
      for (var i = 0; i <= N; i++) {
        var x = win.x0 + (win.x1 - win.x0) * i / N, y = g.f(x);
        var py = Y(y);
        if (!isFinite(py) || py < -H || py > 2 * H) { started = false; continue; }
        if (!started) { cx.moveTo(X(x), py); started = true; } else cx.lineTo(X(x), py);
      }
      cx.stroke();
      cx.restore();
      // key points
      var pts = [[0, g.c]];
      g.roots.forEach(function (r) { if (Math.abs(r) > 1e-9 || Math.abs(g.c) > 1e-9) pts.push([r, 0]); });
      if (g.vertex && !pts.some(function (p) { return Math.abs(p[0] - g.vertex[0]) < 1e-9 && Math.abs(p[1] - g.vertex[1]) < 1e-9; })) pts.push(g.vertex);
      cx.font = 'bold 11.5px Arial, sans-serif';
      pts.forEach(function (p, idx) {
        var px = X(p[0]), py = Y(p[1]);
        if (px < pad - 1 || px > W - pad + 1 || py < pad - 1 || py > H - pad + 1) return;
        cx.fillStyle = p === g.vertex ? '#c62828' : '#0d652d';
        cx.beginPath(); cx.arc(px, py, 4, 0, Math.PI * 2); cx.fill();
        var label = '(' + fmtNum(p[0]) + ', ' + fmtNum(p[1]) + ')';
        var tw = cx.measureText(label).width;
        var lx = px + 7, ly = py - 16;
        if (p === g.vertex) { lx = px - tw / 2; ly = g.a > 0 ? py + 7 : py - 21; }
        else if (idx > 0) {
          // x-intercepts: label on the outer side, on the side of the axis away from the curve near the vertex
          var leftRoot = g.roots.length > 1 && p[0] === g.roots[0];
          lx = leftRoot ? px - 7 - tw : px + 7;
          ly = g.kind === 'quad' ? (g.a > 0 ? py - 18 : py + 5) : py + 5;
        }
        if (lx + tw > W - 4) lx = px - 7 - tw;
        if (lx < 2) lx = px + 7;
        if (ly < 2) ly = py + 6;
        if (ly > H - 16) ly = py - 18;
        cx.fillStyle = 'rgba(255,255,255,.85)'; cx.fillRect(lx - 2, ly - 1, tw + 4, 15);
        cx.fillStyle = p === g.vertex ? '#c62828' : '#0d652d';
        cx.textAlign = 'left'; cx.textBaseline = 'top';
        cx.fillText(label, lx, ly);
      });
      // equation label
      var eq = prettyExpr(g.src);
      cx.font = 'italic 14px "Cambria Math", "Times New Roman", serif';
      var ew = cx.measureText(eq).width;
      cx.fillStyle = 'rgba(255,255,255,.92)'; cx.fillRect(pad + 4, pad + 2, ew + 12, 22);
      cx.strokeStyle = '#c7cfe0'; cx.lineWidth = 1; cx.strokeRect(pad + 4, pad + 2, ew + 12, 22);
      cx.fillStyle = '#1a56db'; cx.textAlign = 'left'; cx.textBaseline = 'middle';
      cx.fillText(eq, pad + 10, pad + 13);
    }
    function graphInfo(g) {
      var b = function (s) { return '<bdi dir="ltr">' + s + '</bdi>'; };
      var pt = function (p) { return b('(' + fmtNum(p[0]) + ', ' + fmtNum(p[1]) + ')'); };
      var rows = ['<div>' + b(esc(prettyExpr(g.src))) + '</div>'];
      if (g.kind === 'linear' || g.kind === 'const') rows.push('<div>שיפוע: ' + b(fmtNum(g.b)) + '</div>');
      rows.push('<div>חיתוך עם ציר y: ' + pt([0, g.c]) + '</div>');
      if (g.kind !== 'const') rows.push('<div>חיתוך עם ציר x: ' + (g.roots.length ? g.roots.map(function (r) { return pt([r, 0]); }).join(' , ') : 'אין') + '</div>');
      if (g.vertex) rows.push('<div>קודקוד: ' + pt(g.vertex) + (g.a > 0 ? ' (מינימום)' : ' (מקסימום)') + '</div>');
      return rows.join('');
    }
    function graphDialog(img) {
      K.restoreSel();
      var keep = K.currentRange() ? K.currentRange().cloneRange() : null;
      var cur = null;
      K.modal({
        title: img ? 'עריכת גרף' : 'גרף פונקציה',
        wide: true,
        body: '<div class="graph-wrap"><div class="graph-side">' +
          '<label>הפונקציה<input type="text" id="gExpr" dir="ltr" autocomplete="off" spellcheck="false"></label>' +
          '<p class="dlg-hint">למשל: <bdi dir="ltr">y = 2x + 1</bdi> , <bdi dir="ltr">y = x^2 - 4x + 3</bdi> , <bdi dir="ltr">y = 2(x - 1)^2 - 8</bdi></p>' +
          '<div class="graph-err" id="gErr"></div><div class="graph-info" id="gInfo"></div></div>' +
          '<canvas class="graph-canvas" id="gCanvas" width="360" height="270"></canvas></div>',
        onOpen: function () {
          var inp = $('gExpr');
          inp.value = img ? img.getAttribute('data-graph') || '' : '';
          var redraw = function () {
            var v = inp.value.trim();
            var cv = $('gCanvas');
            $('gErr').textContent = '';
            if (!v) { cur = null; $('gInfo').innerHTML = ''; drawBlank(cv); return; }
            try {
              cur = analyse(v);
              drawGraph(cv, cur, 360, 270, window.devicePixelRatio || 1);
              $('gInfo').innerHTML = graphInfo(cur);
            } catch (e) {
              cur = null;
              $('gErr').textContent = e.message === 'degree' ? 'אפשר לשרטט כאן פונקציה קווית או ריבועית.' : 'הביטוי לא ברור. בדוק סוגריים וסימנים.';
              $('gInfo').innerHTML = '';
            }
          };
          inp.addEventListener('input', redraw);
          redraw();
          inp.focus();
        },
        actions: [
          { label: img ? 'עדכון' : 'הוספה למסמך', primary: true, run: function () {
            if (!cur) { $('gExpr').focus(); return false; }
            var cv = document.createElement('canvas');
            drawGraph(cv, cur, 480, 360, 2.5);
            if (keep) K.setSavedRange(keep);
            placeImage(img, { src: cv.toDataURL('image/png'), w: Math.min(480, K.contentWidth()) }, { cls: 'graph', attr: 'data-graph', val: $('gExpr').value.trim(), alt: prettyExpr(cur.src) });
          } },
          { label: 'ביטול' }
        ]
      });
    }
    function drawBlank(cv) { var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); }
    editor.addEventListener('dblclick', function (e) {
      var im = e.target.closest && e.target.closest('img');
      if (!im) return;
      if (im.hasAttribute('data-latex')) { e.preventDefault(); equationDialog(im); }
      else if (im.hasAttribute('data-graph')) { e.preventDefault(); graphDialog(im); }
    });
    hooks.context = function () {
      var im = K.selectedImg();
      var kind = im ? (im.hasAttribute('data-latex') ? 'eq' : im.hasAttribute('data-graph') ? 'graph' : null) : null;
      $('objEditGroup').hidden = !kind;
      if (kind) $('objEditLabel').textContent = kind === 'eq' ? 'עריכת המשוואה' : 'עריכת הגרף';
    };

    /* =========================================================
       Dictation (Web Speech API)
       ========================================================= */
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = null, dictating = false;
    function setDictateUi(on) {
      dictating = on;
      document.querySelectorAll('.dictate-btn').forEach(function (b) { b.classList.toggle('rec', on); });
      document.querySelectorAll('.dictate-label').forEach(function (l) { l.textContent = on ? 'עצירת הכתבה' : 'הכתבה'; });
      $('sbRec').hidden = !on;
      $('dictateBar').hidden = !on;
      $('dictateText').textContent = 'מקשיב…';
    }
    function stopDictate(msg) {
      var r = rec;
      rec = null;
      setDictateUi(false);
      if (r) { try { r.onend = null; r.stop(); } catch (e) { /* ignore */ } }
      if (msg) K.toast(msg, true, 7000);
    }
    function insertDictated(text) {
      text = text.replace(/\s+/g, ' ').trim();
      if (!text || !$('modalBack').hidden) return;
      K.act(function () {
        var c = caretText();
        var prev = c ? c.before.slice(-1) : '';
        K.exec('insertText', (prev && !/[\s (]/.test(prev) ? ' ' : '') + text);
      });
    }
    function toggleDictate() {
      if (dictating) { stopDictate(); return; }
      if (!SR) {
        info('הכתבה לא זמינה בדפדפן הזה', 'הכתבה קולית עובדת ב-Google Chrome וב-Microsoft Edge, עם חיבור לאינטרנט. אפשר להמשיך להקליד כרגיל.');
        return;
      }
      if (navigator.onLine === false) { K.toast('ההכתבה דורשת חיבור לאינטרנט: הדפדפן שולח את הקול לשרת לזיהוי.', true, 6000); return; }
      K.restoreSel();
      try {
        rec = new SR();
        rec.lang = 'he-IL';
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = function (ev) {
          var interim = '';
          for (var i = ev.resultIndex; i < ev.results.length; i++) {
            var res = ev.results[i];
            if (res.isFinal) insertDictated(res[0].transcript);
            else interim += res[0].transcript;
          }
          $('dictateText').textContent = interim.trim() || 'מקשיב…';
        };
        rec.onerror = function (ev) {
          if (ev.error === 'no-speech' || ev.error === 'aborted') return;
          var msgs = {
            'not-allowed': 'אין הרשאה למיקרופון. אפשר לאשר אותו בסמל שליד כתובת הדף ולנסות שוב.',
            'service-not-allowed': 'אין הרשאה למיקרופון. אפשר לאשר אותו בסמל שליד כתובת הדף ולנסות שוב.',
            'network': 'אין חיבור לשירות הזיהוי. ההכתבה דורשת חיבור לאינטרנט.',
            'audio-capture': 'לא נמצא מיקרופון במחשב.',
            'language-not-supported': 'זיהוי דיבור בעברית לא זמין בדפדפן הזה.'
          };
          stopDictate(msgs[ev.error] || 'ההכתבה הופסקה.');
        };
        rec.onend = function () {
          if (dictating && rec) { try { rec.start(); } catch (e) { stopDictate(); } }
        };
        rec.start();
        setDictateUi(true);
      } catch (e) {
        rec = null;
        setDictateUi(false);
        K.toast('לא הצלחתי להפעיל את ההכתבה.', true);
      }
    }

    /* =========================================================
       Read aloud with word highlighting
       ========================================================= */
    var sp = { active: false, paused: false, text: '', nodes: [], chunks: [], voice: null, chunk: 0, pos: 0, cur: null };
    function hebVoice() {
      return new Promise(function (resolve) {
        var find = function () { return speechSynthesis.getVoices().find(function (v) { return /^(he|iw)/i.test(v.lang); }) || null; };
        if (speechSynthesis.getVoices().length) { resolve(find()); return; }
        var done = false;
        var fin = function () { if (done) return; done = true; resolve(find()); };
        speechSynthesis.addEventListener('voiceschanged', fin, { once: true });
        setTimeout(fin, 1500);
      });
    }
    function voiceHelp() {
      K.modal({
        title: 'אין קול עברי במחשב',
        body: '<p style="margin:0">כדי שהמחשב יקריא בעברית צריך להתקין קול עברי של Windows:</p>' +
          '<ol style="margin:0;padding-inline-start:22px;line-height:1.8"><li>פותחים הגדרות (מקש Windows ו-I).</li><li>זמן ושפה ← דיבור.</li><li>בשורה "ניהול קולות" לוחצים "הוספת קולות".</li><li>בוחרים עברית ומתקינים.</li><li>סוגרים את הדפדפן לגמרי ופותחים אותו מחדש.</li></ol>',
        actions: [{ label: 'הבנתי', primary: true }]
      });
    }
    function buildSpeechText() {
      var sel = window.getSelection();
      var range = null;
      if (sel.rangeCount && K.inEditor(sel.getRangeAt(0).commonAncestorContainer)) range = sel.getRangeAt(0).cloneRange();
      else if (K.currentRange()) range = K.currentRange().cloneRange();
      if (!range) { range = document.createRange(); range.selectNodeContents(editor); }
      if (range.collapsed) range.setEndAfter(editor.lastChild || editor);
      var text = '', nodes = [], lastBlock = null;
      var walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      var n;
      while ((n = walker.nextNode())) {
        if (n.nodeType === 1) { if (n.tagName === 'BR' && text && range.intersectsNode(n)) text += '\n'; continue; }
        if (n.parentNode.closest('sup.fn, .fn-notes')) continue;
        if (!range.intersectsNode(n)) continue;
        var a = 0, b = n.length;
        if (n === range.startContainer) a = range.startOffset;
        if (n === range.endContainer) b = range.endOffset;
        if (b <= a) continue;
        var blk = K.closestBlock(n);
        if (blk !== lastBlock && text) text += '\n';
        lastBlock = blk;
        nodes.push({ node: n, start: text.length, base: a });
        text += n.nodeValue.slice(a, b);
      }
      return { text: text, nodes: nodes };
    }
    function chunkText(text) {
      var out = [], re = /[^.!?\n]+[.!?]*[\s"״]*|\n+/g, m, cur = null;
      while ((m = re.exec(text))) {
        if (!m[0].trim()) { cur = null; continue; }
        if (cur && cur.end - cur.start + m[0].length < 180) cur.end = m.index + m[0].length;
        else { cur = { start: m.index, end: m.index + m[0].length }; out.push(cur); }
      }
      return out;
    }
    function spPoint(pos) {
      var ns = sp.nodes, lo = 0, hi = ns.length - 1;
      while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (ns[mid].start <= pos) lo = mid; else hi = mid - 1; }
      var e = ns[lo];
      var off = Math.min(pos - e.start, e.node.length - e.base);
      return { node: e.node, offset: e.base + Math.max(0, off) };
    }
    function markWord(pos, len) {
      sp.pos = pos;
      if (!hasHL || !sp.nodes.length) return;
      if (!len) { var mm = sp.text.slice(pos).match(/^[^\s]+/); len = mm ? mm[0].length : 1; }
      var a = spPoint(pos), b = spPoint(pos + len);
      var r = document.createRange();
      try { r.setStart(a.node, a.offset); r.setEnd(b.node, b.offset); } catch (e) { return; }
      CSS.highlights.set('speak', new Highlight(r));
      var rect = r.getBoundingClientRect(), cr = K.canvas.getBoundingClientRect();
      if (rect.height && (rect.top < cr.top + 40 || rect.bottom > cr.bottom - 60)) K.canvas.scrollTop += rect.top - cr.top - cr.height / 3;
    }
    function speakChunk(i, from) {
      if (!sp.active) return;
      if (i >= sp.chunks.length) { stopSpeech(); return; }
      var ch = sp.chunks[i], start = from != null ? Math.max(ch.start, Math.min(from, ch.end)) : ch.start;
      var u = new SpeechSynthesisUtterance(sp.text.slice(start, ch.end));
      u.voice = sp.voice; u.lang = sp.voice.lang; u.rate = +prefs.speechRate || 1;
      u.onboundary = function (ev) { if (u !== sp.cur || (ev.name && ev.name !== 'word')) return; markWord(start + ev.charIndex, ev.charLength); };
      u.onend = function () { if (u !== sp.cur) return; speakChunk(i + 1); };
      u.onerror = function (ev) { if (u !== sp.cur || ev.error === 'interrupted' || ev.error === 'canceled') return; stopSpeech(); };
      sp.cur = u; sp.chunk = i; sp.pos = start;
      markWord(start);
      speechSynthesis.speak(u);
    }
    function setSpeechUi() {
      $('speechBar').hidden = !sp.active;
      var lbl = $('speakLabel');
      if (lbl) lbl.textContent = sp.active ? 'עצירת הקראה' : 'הקראה';
      document.querySelectorAll('[data-cmd="speak"]').forEach(function (b) { b.classList.toggle('on', sp.active); });
      var pb = $('speechPause');
      pb.innerHTML = Icons.svg(sp.paused ? 'play' : 'pause');
      pb.title = sp.paused ? 'המשך' : 'השהיה';
      pb.setAttribute('aria-label', pb.title);
      $('speechRate').value = prefs.speechRate;
      $('speechRateVal').textContent = (+prefs.speechRate).toFixed(1) + '×';
    }
    function stopSpeech() {
      sp.active = false; sp.paused = false; sp.cur = null;
      try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
      if (hasHL) CSS.highlights.delete('speak');
      setSpeechUi();
    }
    function speakCmd() {
      if (!window.speechSynthesis) { K.toast('הדפדפן הזה אינו תומך בהקראה.', true); return; }
      if (sp.active) { stopSpeech(); return; }
      var built = buildSpeechText();
      if (!built.text.trim()) { K.toast('אין טקסט להקראה. שים את הסמן לפני הטקסט שרוצים לשמוע, או סמן אותו.'); return; }
      hebVoice().then(function (v) {
        if (!v) { voiceHelp(); return; }
        speechSynthesis.cancel();
        sp.active = true; sp.paused = false; sp.voice = v;
        sp.text = built.text; sp.nodes = built.nodes; sp.chunks = chunkText(built.text);
        setSpeechUi();
        speakChunk(0);
      });
    }
    $('speechStop').addEventListener('click', stopSpeech);
    $('speechPause').addEventListener('click', function () {
      if (!sp.active) return;
      if (sp.paused) { sp.paused = false; speechSynthesis.resume(); }
      else { sp.paused = true; speechSynthesis.pause(); }
      setSpeechUi();
    });
    $('speechRate').addEventListener('input', function (e) {
      prefs.speechRate = +e.target.value; K.savePrefs();
      $('speechRateVal').textContent = (+prefs.speechRate).toFixed(1) + '×';
    });
    $('speechRate').addEventListener('change', function () {
      if (!sp.active) return;
      // restart from the current word at the new speed
      var i = sp.chunk, pos = sp.pos;
      sp.cur = null; sp.paused = false;
      speechSynthesis.cancel();
      setTimeout(function () { if (sp.active) { setSpeechUi(); speakChunk(i, pos); } }, 80);
    });

    /* =========================================================
       Reading mode with a line focus band
       ========================================================= */
    var band = document.createElement('div');
    band.className = 'line-focus';
    band.hidden = true;
    K.zoomSizer.appendChild(band);
    var bandQueued = false;
    function positionFocus() {
      if (bandQueued) return;
      bandQueued = true;
      requestAnimationFrame(function () {
        bandQueued = false;
        var on = document.body.classList.contains('reading-mode') && prefs.lineFocus;
        if (!on) { band.hidden = true; return; }
        var r = K.currentRange();
        if (!r) { band.hidden = true; return; }
        var rr = r.cloneRange(); rr.collapse(false);
        var rect = rr.getClientRects()[0];
        if (!rect || !rect.height) {
          var b = K.closestBlock(rr.startContainer);
          if (!b) { band.hidden = true; return; }
          var br = b.getBoundingClientRect();
          var lh = parseFloat(getComputedStyle(b).lineHeight) || 28;
          rect = { top: br.top, height: Math.min(br.height, lh * (K.zoomNow ? K.zoomNow() : K.prefs.zoom)) };
        }
        var zr = K.zoomSizer.getBoundingClientRect();
        var padY = rect.height * 0.35;
        band.style.top = (rect.top - zr.top - padY) + 'px';
        band.style.height = (rect.height + padY * 2) + 'px';
        band.hidden = false;
      });
    }
    function applyReading() {
      var on = !!prefs.readingMode;
      document.body.classList.toggle('reading-mode', on);
      setX('reading', on);
      K.scheduleLayout();
      positionFocus();
    }
    function toggleReading() { prefs.readingMode = !prefs.readingMode; K.savePrefs(); applyReading(); K.restoreSel(); }
    hooks.suspendView = function () { document.body.classList.remove('reading-mode'); band.hidden = true; };
    hooks.resumeView = function () { if (prefs.readingMode) document.body.classList.add('reading-mode'); positionFocus(); };

    /* =========================================================
       Lesson import from שולחן הלימודים backup files
       ========================================================= */
    function lessonHtml(subject, lesson) {
      var body = String(lesson.html || '').replace(/<mark\b[^>]*>/gi, '<span style="background-color:#ffe58a">').replace(/<\/mark>/gi, '</span>');
      var holder = document.createElement('div');
      holder.innerHTML = K.sanitizeHTML(body);
      if (lesson.dir === 'ltr') Array.prototype.forEach.call(holder.children, function (c) { c.setAttribute('dir', 'ltr'); });
      return '<h1>' + esc(lesson.title || 'שיעור') + '</h1>' +
        '<p>' + esc(subject.name || '') + (lesson.date ? ' · ' + esc(heDate(lesson.date)) : '') + '</p>' +
        (holder.innerHTML || '<p><br></p>');
    }
    function lessonPicker(data) {
      var subjects = data.subjects.filter(function (s) { return s && Array.isArray(s.lessons); });
      var withLessons = subjects.filter(function (s) { return s.lessons.length; });
      if (!withLessons.length) { info('אין שיעורים בקובץ', 'קובץ הגיבוי תקין, אבל אין בו עדיין שיעורים.'); return; }
      var selS = withLessons[0], selL = null;
      var sorted = function (s) { return s.lessons.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.updatedAt || 0) - (a.updatedAt || 0); }); };
      function render() {
        $('lsSubjects').innerHTML = subjects.map(function (s, i) {
          return '<button data-s="' + i + '" class="' + (s === selS ? 'on' : '') + '"><span class="lesson-dot" style="background:' + esc(s.color || '#6b7280') + '"></span>' + esc(s.name || '') + '<small>' + s.lessons.length + '</small></button>';
        }).join('');
        var ls2 = sorted(selS);
        $('lsLessons').innerHTML = ls2.length ? ls2.map(function (l) {
          return '<button data-l="' + esc(l.id) + '" class="' + (l === selL ? 'on' : '') + '">' + esc(l.title || 'שיעור') + '<small>' + esc(heDate(l.date)) + '</small></button>';
        }).join('') : '<div class="ver-empty">אין שיעורים במקצוע הזה.</div>';
      }
      function pick() {
        if (!selL) { K.toast('בחר שיעור מהרשימה'); return null; }
        return lessonHtml(selS, selL);
      }
      K.modal({
        title: 'ייבוא שיעור ממחברת',
        wide: true,
        body: '<div class="lesson-wrap"><div class="lesson-subjects" id="lsSubjects"></div><div class="lesson-list" id="lsLessons"></div></div>',
        onOpen: function () {
          render();
          $('lsSubjects').addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (!b) return; selS = subjects[+b.dataset.s]; selL = null; render(); });
          $('lsLessons').addEventListener('click', function (e) { var b = e.target.closest('[data-l]'); if (!b) return; selL = selS.lessons.find(function (l) { return String(l.id) === b.dataset.l; }); render(); });
          $('lsLessons').addEventListener('dblclick', function (e) { if (e.target.closest('[data-l]') && selL) { var h = pick(); K.closeModal(); K.newDoc(h, null, selL.title || ''); } });
        },
        actions: [
          { label: 'פתיחה כמסמך חדש', primary: true, run: function () { var h = pick(); if (!h) return false; K.newDoc(h, null, selL.title || ''); K.toast('השיעור יובא'); } },
          { label: 'הוספה במקום הסמן', run: function () {
            var h = pick(); if (!h) return false;
            K.act(function () {
              var holder = document.createElement('div');
              holder.innerHTML = h;
              K.insertBlockAfterCaret(Array.prototype.slice.call(holder.childNodes), null);
            });
            K.toast('השיעור נוסף למסמך');
          } },
          { label: 'ביטול' }
        ]
      });
    }
    $('lessonOpen').addEventListener('change', function (e) {
      var f = e.target.files[0];
      e.target.value = '';
      if (!f) return;
      f.text().then(function (t) {
        var data = JSON.parse(t);
        if (!data || !Array.isArray(data.subjects)) throw new Error('format');
        lessonPicker(data);
      }).catch(function () { K.toast('הקובץ הזה לא נראה כמו גיבוי מחברות של שולחן הלימודים.', true, 6000); });
    });

    /* =========================================================
       Version history (IndexedDB, new keys "ver.<docId>")
       ========================================================= */
    var VER_MAX = 20, VER_EVERY = 10 * 60 * 1000;
    var editMs = 0, lastEdit = 0;
    function noteEditing() {
      var now = Date.now();
      if (lastEdit && now - lastEdit < 60000) editMs += now - lastEdit;
      lastEdit = now;
      if (editMs >= VER_EVERY) { editMs = 0; snapshotVersion(); }
    }
    function snapshotVersion(force) {
      var cur = K.cur();
      if (!cur) return Promise.resolve();
      var html = K.cleanHTML(), text = K.docText();
      if (!text.trim() && !editor.querySelector('img,table') && !force) return Promise.resolve();
      var key = 'ver.' + cur.id;
      return K.idbGet(key).then(function (list) {
        list = Array.isArray(list) ? list : [];
        var last = list[list.length - 1];
        if (last && last.html === html) return;
        list.push({ t: Date.now(), html: html, words: K.countWords(text) });
        while (list.length > VER_MAX) list.shift();
        return K.idbSet(key, list);
      });
    }
    function versionsDialog() {
      var cur = K.cur();
      if (!cur) return;
      K.histFlush();
      K.idbGet('ver.' + cur.id).then(function (list) {
        list = (Array.isArray(list) ? list : []).slice().reverse();
        var sel = 0;
        K.modal({
          title: 'גרסאות קודמות',
          wide: true,
          body: list.length
            ? '<div class="ver-wrap"><div class="ver-list" id="verList"></div><div class="ver-preview" id="verPreview"></div></div>'
            : '<div class="ver-empty">עדיין אין גרסאות שמורות למסמך הזה. גרסה נשמרת בכל פתיחה של המסמך ואחרי כל 10 דקות של כתיבה.</div>',
          onOpen: function () {
            if (!list.length) return;
            var render = function () {
              $('verList').innerHTML = list.map(function (v, i) {
                return '<button class="ver-item' + (i === sel ? ' on' : '') + '" data-v="' + i + '">' + esc(fmtStamp(v.t)) + '<small>' + (v.words === 1 ? 'מילה אחת' : (v.words || 0).toLocaleString('he-IL') + ' מילים') + '</small></button>';
              }).join('');
              $('verPreview').innerHTML = K.sanitizeHTML(list[sel].html);
            };
            $('verList').addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (!b) return; sel = +b.dataset.v; render(); });
            render();
          },
          actions: [
            list.length ? { label: 'שחזור הגרסה הזו', primary: true, run: function () {
              var v = list[sel];
              snapshotVersion(true).then(function () {
                K.act(function () { editor.innerHTML = v.html; });
                syncNotes();
                runTypo();
                K.toast('הגרסה שוחזרה. אפשר לבטל עם Ctrl+Z.');
              });
            } } : null,
            { label: 'סגירה' }
          ]
        });
      });
    }

    /* =========================================================
       Managers: abbreviations / typo fixes, personal dictionary, settings
       ========================================================= */
    function abbrDialog(startKind) {
      var kind = startKind || 'abbr';
      K.modal({
        title: 'קיצורים ותיקונים',
        cls: 'mid',
        body: '<div class="tabs-row" id="abTabs"><button data-k="abbr">קיצורים</button><button data-k="fix">תיקון שגיאות קבועות</button></div>' +
          '<p class="dlg-hint" id="abHint"></p>' +
          '<div class="dlg-row"><label><span id="abFromLbl"></span><input type="text" id="abFrom" autocomplete="off"></label><label><span id="abToLbl"></span><input type="text" id="abTo" autocomplete="off"></label>' +
          '<button class="btn primary" id="abAdd" type="button">הוספה</button></div>' +
          '<div class="pair-list" id="abList"></div>',
        onOpen: function () {
          var render = function () {
            document.querySelectorAll('#abTabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.k === kind); });
            $('abHint').textContent = kind === 'abbr'
              ? 'כותבים את הקיצור ואחריו רווח או סימן פיסוק, והוא מתרחב למילה המלאה. Ctrl+Z מבטל את ההרחבה.'
              : 'שגיאה שחוזרת אצלך מתוקנת לבד אחרי רווח או סימן פיסוק. Ctrl+Z מבטל את התיקון.';
            $('abFromLbl').textContent = kind === 'abbr' ? 'קיצור' : 'כך אני כותב בטעות';
            $('abToLbl').textContent = kind === 'abbr' ? 'המילה המלאה' : 'הכתיב הנכון';
            var rows = replaceList.map(function (r, i) { return { r: r, i: i }; }).filter(function (x) { return (x.r.kind || 'abbr') === kind; });
            $('abList').innerHTML = rows.length ? rows.map(function (x) {
              return '<div class="pair-row"><span class="pr-from">' + esc(x.r.from) + '</span><span class="pr-arrow">←</span><span class="pr-to">' + esc(x.r.to) + '</span>' +
                '<button class="icon-btn sm" data-del="' + x.i + '" title="מחיקה" aria-label="מחיקה">' + Icons.svg('trash') + '</button></div>';
            }).join('') : '<div class="pair-empty">הרשימה ריקה.</div>';
          };
          var add = function () {
            var f = $('abFrom').value.trim(), t = $('abTo').value.trim();
            if (!f || !t) { (f ? $('abTo') : $('abFrom')).focus(); return; }
            if (/\s/.test(f)) { K.toast('הקיצור צריך להיות מילה אחת, בלי רווחים.', true); return; }
            replaceList = replaceList.filter(function (r) { return r.from !== f; });
            replaceList.push({ from: f, to: t, kind: kind });
            saveReplace();
            $('abFrom').value = ''; $('abTo').value = '';
            $('abFrom').focus();
            render();
          };
          $('abTabs').addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { kind = b.dataset.k; render(); } });
          $('abAdd').addEventListener('click', add);
          $('abFrom').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); $('abTo').focus(); } });
          $('abTo').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); add(); } });
          $('abList').addEventListener('click', function (e) {
            var b = e.target.closest('[data-del]');
            if (!b) return;
            replaceList.splice(+b.dataset.del, 1);
            saveReplace();
            render();
          });
          render();
          $('abFrom').focus();
        },
        actions: [{ label: 'סגירה' }]
      });
    }
    function dictDialog() {
      K.modal({
        title: 'מילון אישי',
        cls: 'mid',
        body: '<p class="dlg-hint">מילים במילון לא יסומנו כשגיאת הקלדה ויופיעו בהשלמת המילים. אפשר להוסיף מילה גם בלחיצה ימנית על מילה מסומנת.</p>' +
          '<div class="dlg-row"><label>מילה חדשה<input type="text" id="dcWord" autocomplete="off"></label><button class="btn primary" id="dcAdd" type="button">הוספה</button></div>' +
          '<div class="pair-list" id="dcList"></div>',
        onOpen: function () {
          var render = function () {
            var words = dictList.slice().sort(function (a, b) { return a.localeCompare(b, 'he'); });
            $('dcList').innerHTML = words.length ? words.map(function (w) {
              return '<div class="pair-row"><span class="pr-to">' + esc(w) + '</span><button class="icon-btn sm" data-w="' + esc(w) + '" title="הסרה" aria-label="הסרה">' + Icons.svg('trash') + '</button></div>';
            }).join('') : '<div class="pair-empty">המילון ריק.</div>';
          };
          var add = function () {
            var w = $('dcWord').value.trim();
            if (!w) { $('dcWord').focus(); return; }
            if (dictList.indexOf(w) < 0) { dictList.push(w); saveDict(); }
            $('dcWord').value = ''; $('dcWord').focus();
            render(); runTypo();
          };
          $('dcAdd').addEventListener('click', add);
          $('dcWord').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); add(); } });
          $('dcList').addEventListener('click', function (e) {
            var b = e.target.closest('[data-w]');
            if (!b) return;
            dictList = dictList.filter(function (w) { return w !== b.dataset.w; });
            saveDict(); render(); runTypo();
          });
          render();
          $('dcWord').focus();
        },
        actions: [{ label: 'סגירה' }]
      });
    }
    var SETTINGS = [
      ['complete', 'השלמת מילים בזמן הקלדה', 'Tab או Enter בוחרים הצעה, Esc סוגר'],
      ['autoReplace', 'הרחבת קיצורים ותיקון שגיאות קבועות', ''],
      ['typoCheck', 'סימון שגיאות הקלדה נפוצות', 'אותיות סופיות, רווח כפול, מילה כפולה'],
      ['mathShortcuts', 'קיצורי מתמטיקה בתוך נוסחאות ושלבי פתרון', '<bdi dir="ltr">x^2 → x²</bdi> · <bdi dir="ltr">sqrt → √</bdi> · <bdi dir="ltr">&gt;= → ≥</bdi> · <bdi dir="ltr">x1 → x₁</bdi>'],
      ['mathEverywhere', 'קיצורי מתמטיקה גם בטקסט רגיל', ''],
      ['lineFocus', 'פס מיקוד על השורה במצב קריאה', '']
    ];
    function settingsDialog() {
      K.modal({
        title: 'הגדרות העזרים',
        cls: 'mid',
        body: SETTINGS.map(function (s) {
          return '<label class="switch-row"><input type="checkbox" data-pref="' + s[0] + '"' + (prefs[s[0]] ? ' checked' : '') + '><span class="switch"></span><span>' + esc(s[1]) +
            (s[2] ? '<br><small style="color:var(--text-3)">' + s[2] + '</small>' : '') + '</span></label>';   // s[2] is a fixed string from SETTINGS
        }).join('') +
          '<div class="dlg-row" style="margin-top:6px"><button class="btn" id="stAbbr" type="button">ניהול קיצורים ותיקונים</button><button class="btn" id="stDict" type="button">מילון אישי</button></div>',
        onOpen: function (box) {
          box.querySelectorAll('[data-pref]').forEach(function (inp) {
            inp.addEventListener('change', function () {
              prefs[inp.dataset.pref] = inp.checked;
              K.savePrefs();
              if (inp.dataset.pref === 'typoCheck') runTypo();
              if (inp.dataset.pref === 'complete' && !inp.checked) hideComplete();
              if (inp.dataset.pref === 'lineFocus') positionFocus();
            });
          });
          $('stAbbr').addEventListener('click', function () { abbrDialog(); });
          $('stDict').addEventListener('click', function () { dictDialog(); });
        },
        actions: [{ label: 'סגירה', primary: true }]
      });
    }

    /* =========================================================
       Hooks into the editor core
       ========================================================= */
    hooks.input = function (e) {
      if (e.isComposing) return;
      var t = e.inputType;
      if (t === 'insertText' && e.data) {
        stripZwsp(caretText());
        var done = false;
        if (prefs.mathShortcuts && e.data.length === 1) done = mathConvert(e.data);
        if (!done && prefs.autoReplace && TRIGGER.test(e.data)) done = autoReplace(e.data.length);
        mathExitOnHebrew(e.data);
      } else lastConv = null;
      noteEditing();
      if (prefs.complete && (t === 'insertText' || t === 'deleteContentBackward')) updateComplete();
      else hideComplete();
    };
    hooks.key = function (e) {
      if (comp.open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          comp.idx = (comp.idx + (e.key === 'ArrowDown' ? 1 : -1) + comp.items.length) % comp.items.length;
          renderComplete();
          return true;
        }
        // phones: Enter on the on-screen keyboard means a new line; a suggestion is taken by tapping it
        if ((e.key === 'Tab' || (e.key === 'Enter' && !(K.isMobile && K.isMobile()))) && !e.shiftKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); acceptComplete(); return true; }
        if (e.key === 'Escape') { e.preventDefault(); hideComplete(); return true; }
        if (e.key !== 'Shift') hideComplete();
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        if (prefs.autoReplace) autoReplace(0);
        var cell = K.curCell();
        if (cell && cell.closest('table.sol')) { e.preventDefault(); solNewRow(cell); return true; }
      }
      return false;
    };
    hooks.normalize = function () {
      editor.querySelectorAll('span.tab:not([contenteditable]), sup.fn:not([contenteditable]), td.br:not([contenteditable])').forEach(function (el) { el.setAttribute('contenteditable', 'false'); });
      editor.querySelectorAll('table.sol:not([dir])').forEach(function (t) { t.setAttribute('dir', 'ltr'); });
      editor.querySelectorAll('table.sys').forEach(fixBrace);
      syncNotes();
    };
    hooks.prepareDoc = function () { syncNotes(); };
    var afterChange = K.debounce(function () {
      if (syncNotes()) { K.markDirty(); K.scheduleLayout(); }
      scheduleTypo();
      positionFocus();
    }, 250);
    hooks.changed = function () { afterChange(); };
    hooks.saved = function () { learnCurrent(); };
    hooks.docOpened = function () {
      hideComplete(); hideCtx();
      if (sp.active) stopSpeech();
      editMs = 0; lastEdit = 0;
      ignoredTypos.clear();
      ignoredSpaces = [];
      runTypo();
      setTimeout(function () { snapshotVersion(); }, 1500);
      positionFocus();
    };
    document.addEventListener('selectionchange', function () {
      var r = K.currentRange();
      setX('math', !!(r && elOf(r.startContainer).closest && elOf(r.startContainer).closest('span.math')));
      if (comp.open) {
        var c = caretText();
        if (!c || c.node !== comp.node || c.offset !== comp.offset) hideComplete();
      }
      positionFocus();
    });
    editor.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== editor) hideComplete(); }, 0); });

    /* ---------- secret answer: select a question, tap Ctrl twice, the selection becomes the answer ----------
       No UI at all: nothing shows while waiting, and any failure leaves the text as it was. Ctrl+Z brings the question back.
       The Gemini key is never in the code (the repo is public): type the key into a document, select it and tap Ctrl twice,
       and it is stored in this browser only and removed from the document. */
    var SQ_LS = 'ktv.sq';
    var SQ_KEY_RE = /^(AIza[\w-]{30,}|AQ\.[\w.-]{20,})$/;
    function sqKey() { try { return localStorage.getItem(SQ_LS) || ''; } catch (e) { return ''; } }
    var SQ_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
    /* tried in order: the free tier caps each model per day (2.5-flash at 20), so a 429 moves on to the next one */
    var SQ_MODELS = [
      { id: 'gemini-3.5-flash-lite' },
      { id: 'gemini-2.5-flash-lite' },
      { id: 'gemini-2.5-flash', cfg: { thinkingConfig: { thinkingBudget: 0 } } }
    ];
    var SQ_PROMPT = 'ענה על השאלה הבאה בעברית, במשפט אחד בשורה אחת ובטקסט רגיל בלבד: בלי Markdown, בלי כוכביות, בלי ירידת שורה ובלי לחזור על השאלה.\n\n';
    var sqLast = 0, sqClean = false, sqBusy = false;
    /* a "clean" Ctrl tap is Ctrl pressed and released with no other key or click in between */
    document.addEventListener('keydown', function (e) { sqClean = e.key === 'Control' && (e.repeat ? sqClean : true); }, true);
    document.addEventListener('mousedown', function () { sqClean = false; sqLast = 0; }, true);
    document.addEventListener('keyup', function (e) {
      if (e.key !== 'Control') return;
      if (!sqClean) { sqLast = 0; return; }
      sqClean = false;
      var now = Date.now();
      if (now - sqLast < 400) { sqLast = 0; secretAnswer(); } else sqLast = now;
    }, true);

    function secretAnswer() {
      if (sqBusy) return;
      var sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return;
      var range = sel.getRangeAt(0).cloneRange();
      if (!K.inEditor(range.commonAncestorContainer)) return;
      var q = range.toString().trim();
      if (!q) return;
      if (SQ_KEY_RE.test(q)) {
        try { localStorage.setItem(SQ_LS, q); } catch (e) { return; }
        K.act(function () { K.exec('delete'); });
        return;
      }
      var key = sqKey();
      if (!key) return;
      sqBusy = true;
      function ask(i) {
        if (i >= SQ_MODELS.length) return Promise.resolve(null);
        var m = SQ_MODELS[i];
        var ctl = window.AbortController ? new AbortController() : null;
        var timer = ctl ? setTimeout(function () { ctl.abort(); }, 15000) : 0;
        var body = { contents: [{ parts: [{ text: SQ_PROMPT + q }] }] };
        if (m.cfg) body.generationConfig = m.cfg;
        return fetch(SQ_URL + m.id + ':generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(body),
          signal: ctl ? ctl.signal : undefined
        }).then(function (r) { return r.ok ? r.json() : null; }, function () { return null; }).then(function (j) {
          clearTimeout(timer);
          return j && j.candidates ? j : ask(i + 1);
        });
      }
      ask(0).then(function (j) {
        var parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
        var text = parts ? parts.map(function (p) { return p.text || ''; }).join('') : '';
        text = text.replace(/\*\*|__|^#+\s*/gm, '').replace(/\s*\n\s*/g, ' ').trim();
        /* only replace if the question is still there, untouched */
        if (!text || !K.inEditor(range.commonAncestorContainer) || range.toString().trim() !== q) return;
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(range);
        K.setSavedRange(range);
        K.act(function () { K.exec('insertText', text); });
      }).catch(function () { /* silent by design */ }).then(function () {
        sqBusy = false;
      });
    }

    /* ---------- commands ---------- */
    var C = K.cmds;
    C.mathSpan = mathSpan;
    C.equation = function () { equationDialog(null); };
    C.solution = function () { insertSol(false); };
    C.system = function () { insertSol(true); };
    C.graph = function () { graphDialog(null); };
    C.footnote = function () { footnoteDialog(null); };
    C.source = sourceDialog;
    C.importLesson = function () { $('lessonOpen').click(); };
    C.dictate = toggleDictate;
    C.speak = speakCmd;
    C.toggleReading = toggleReading;
    C.abbreviations = function () { abbrDialog(); };
    C.dictionary = dictDialog;
    C.versions = versionsDialog;
    C.settings = settingsDialog;
    C.editObject = function () {
      var im = K.selectedImg();
      if (!im) return;
      if (im.hasAttribute('data-latex')) equationDialog(im);
      else if (im.hasAttribute('data-graph')) graphDialog(im);
    };

    applyReading();
    setSpeechUi();
    setTimeout(learnStoredDocs, 1500);
    window.addEventListener('beforeunload', function () { if (dictating) stopDictate(); if (sp.active) stopSpeech(); });
  };
})();
