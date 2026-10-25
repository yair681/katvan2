/* DOCX writer: converts the live editor DOM into WordprocessingML (needs JSZip). */
(function () {
  'use strict';

  var NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  var NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  var REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
  var HEB = /[֐-׿יִ-ﭏ]/;
  var BLOCK_TAGS = { P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, BLOCKQUOTE: 1, UL: 1, OL: 1, TABLE: 1, HR: 1, PRE: 1, LI: 1, SECTION: 1, ARTICLE: 1, FIGURE: 1 };

  function esc(s) {
    return String(s)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function px2tw(px) { return Math.round(px * 15); }
  function cm2tw(cm) { return Math.round(cm * 567); }

  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16) + ':' + str.length;
  }

  function rgbToHex(c) {
    if (!c) return null;
    var m = c.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/);
    if (!m) return null;
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
    return [m[1], m[2], m[3]].map(function (n) { return ('0' + (+n).toString(16)).slice(-2); }).join('').toUpperCase();
  }
  function firstFamily(ff) {
    if (!ff) return null;
    var f = ff.split(',')[0].trim().replace(/^["']|["']$/g, '');
    return f || null;
  }

  function isBlock(node) { return node.nodeType === 1 && (BLOCK_TAGS[node.tagName] === 1); }

  function Ctx(opts) {
    this.opts = opts;
    this.rels = [];        // {id,type,target,mode}
    this.media = [];       // {name, data(Uint8Array), ext}
    this.relSeq = 10;
    this.docPrSeq = 1;
    this.footnotes = [];   // note texts, id = index + 1
    this.nums = [];        // {numId, abstract, start}
    this.numSeq = 2;       // 1 = shared bullets
    this.contentWidthPx = opts.contentWidthPx;
    this.defaultDir = opts.defaultDir || 'rtl';
    this.defaultFont = opts.defaultFont || 'Arial';
    this.defaultSizeHalfPt = 24;
  }
  Ctx.prototype.addRel = function (type, target, external) {
    var id = 'rId' + (this.relSeq++);
    this.rels.push({ id: id, type: type, target: target, mode: external ? 'External' : null });
    return id;
  };

  /* ---------- run formatting ---------- */
  function runProps(el, block, ctx, rtlRun) {
    var cs = getComputedStyle(el);
    var out = '';
    var fam = firstFamily(cs.fontFamily) || ctx.defaultFont;
    out += '<w:rFonts w:ascii="' + esc(fam) + '" w:hAnsi="' + esc(fam) + '" w:cs="' + esc(fam) + '" w:eastAsia="' + esc(fam) + '"/>';
    var w = parseInt(cs.fontWeight, 10) || (cs.fontWeight === 'bold' ? 700 : 400);
    if (w >= 600) out += '<w:b/><w:bCs/>';
    if (cs.fontStyle === 'italic' || cs.fontStyle === 'oblique') out += '<w:i/><w:iCs/>';
    var under = false, strike = false, bg = null;
    var n = el;
    while (n && n !== block.parentNode && n.nodeType === 1) {
      var d = getComputedStyle(n).textDecorationLine || '';
      if (d.indexOf('underline') >= 0) under = true;
      if (d.indexOf('line-through') >= 0) strike = true;
      if (!bg && n !== block && getComputedStyle(n).display.indexOf('inline') === 0) {
        bg = rgbToHex(getComputedStyle(n).backgroundColor);
      }
      if (n === block) break;
      n = n.parentNode;
    }
    if (strike) out += '<w:strike/>';
    var color = rgbToHex(cs.color);
    if (color && color !== '000000') out += '<w:color w:val="' + color + '"/>';
    var sizePx = parseFloat(cs.fontSize) || 16;
    var va = cs.verticalAlign;
    var isSup = va === 'super' || el.closest('sup');
    var isSub = va === 'sub' || el.closest('sub');
    if ((isSup || isSub)) {
      var parentSize = parseFloat(getComputedStyle((el.closest('sup,sub') || el).parentNode).fontSize) || sizePx;
      sizePx = parentSize;
    }
    var hp = Math.max(2, Math.round(sizePx * 0.75 * 2));
    out += '<w:sz w:val="' + hp + '"/><w:szCs w:val="' + hp + '"/>';
    if (under) out += '<w:u w:val="single"/>';
    if (bg) out += '<w:shd w:val="clear" w:color="auto" w:fill="' + bg + '"/>';
    if (isSup) out += '<w:vertAlign w:val="superscript"/>';
    else if (isSub) out += '<w:vertAlign w:val="subscript"/>';
    if (rtlRun) out += '<w:rtl/>';
    return out;
  }

  function textRuns(text, el, block, ctx, rStyle) {
    // split so runs containing Hebrew get <w:rtl/>, others don't
    var parts = text.match(/[֐-׿יִ-ﭏ][^A-Za-z]*|[^֐-׿יִ-ﭏ]+/g) || [];
    var out = '';
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i];
      var rtl = HEB.test(t);
      var pr = (rStyle ? '<w:rStyle w:val="' + rStyle + '"/>' : '') + runProps(el, block, ctx, rtl);
      var segs = t.split('\t');
      var body = '';
      for (var s = 0; s < segs.length; s++) {
        if (s > 0) body += '<w:tab/>';
        if (segs[s]) body += '<w:t xml:space="preserve">' + esc(segs[s]) + '</w:t>';
      }
      out += '<w:r><w:rPr>' + pr + '</w:rPr>' + body + '</w:r>';
    }
    return out;
  }

  function dataUrlToBytes(url) {
    var m = url.match(/^data:([^;,]+)(;base64)?,(.*)$/);
    if (!m) return null;
    var mime = m[1], data = m[3];
    var bin = m[2] ? atob(data) : decodeURIComponent(data);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime: mime, bytes: bytes };
  }

  function imageRun(img, ctx) {
    var src = img.getAttribute('src') || '';
    var info = src.indexOf('data:') === 0 ? dataUrlToBytes(src) : null;
    if (!info) return '';
    var ext = /png/.test(info.mime) ? 'png' : /gif/.test(info.mime) ? 'gif' : /jpe?g/.test(info.mime) ? 'jpeg' : null;
    if (!ext) return '';
    var idx = ctx.media.length + 1;
    var name = 'image' + idx + '.' + ext;
    ctx.media.push({ name: name, data: info.bytes, ext: ext, el: img });
    var rid = ctx.addRel(REL + 'image', 'media/' + name);
    var wpx = img.offsetWidth || img.naturalWidth || 200;
    var hpx = img.offsetHeight || img.naturalHeight || 150;
    var maxW = ctx.contentWidthPx;
    if (wpx > maxW) { hpx = hpx * maxW / wpx; wpx = maxW; }
    var cx = Math.round(wpx * 9525), cy = Math.round(hpx * 9525);
    var id = ctx.docPrSeq++;
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">' +
      '<wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
      '<wp:docPr id="' + id + '" name="Picture ' + id + '"/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="' + name + '"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
      '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }

  /* inline content -> runs xml */
  function inlineXml(node, block, ctx, rStyle) {
    var kids = [];
    for (var c = node.firstChild; c; c = c.nextSibling) kids.push(c);
    return inlineNodesXml(kids, block, ctx, rStyle);
  }
  function inlineNodesXml(nodes, block, ctx, rStyle) {
    var out = '';
    for (var i = 0; i < nodes.length; i++) {
      var c = nodes[i];
      if (c.nodeType === 3) {
        var t = c.nodeValue.replace(/[\r\n]+/g, ' ').replace(/ /g, ' ').replace(/​/g, '');
        if (!t) continue;
        var ws = getComputedStyle(c.parentNode).whiteSpace;
        if (ws.indexOf('pre') !== 0) t = t.replace(/ {2,}/g, ' ');
        if (!t.trim() && (i === 0 || i === nodes.length - 1) && nodes.length > 1 && /\n/.test(c.nodeValue)) continue;
        out += textRuns(t, c.parentNode, block, ctx, rStyle);
      } else if (c.nodeType === 1) {
        var tag = c.tagName;
        if (tag === 'BR') {
          if (c.nextSibling || c.previousSibling) out += '<w:r><w:br/></w:r>';
        } else if (tag === 'IMG') {
          out += imageRun(c, ctx);
        } else if (tag === 'SUP' && c.classList.contains('fn')) {
          var fid = ctx.footnotes.length + 1;
          ctx.footnotes.push(c.getAttribute('data-note') || '');
          out += '<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr><w:footnoteReference w:id="' + fid + '"/></w:r>';
        } else if (tag === 'A' && c.getAttribute('href')) {
          var href = c.getAttribute('href');
          var inner = inlineXml(c, block, ctx, 'Hyperlink');
          if (/^(https?:|mailto:|tel:)/i.test(href)) {
            var rid = ctx.addRel(REL + 'hyperlink', href, true);
            out += '<w:hyperlink r:id="' + rid + '">' + inner + '</w:hyperlink>';
          } else out += inner;
        } else if (tag === 'SCRIPT' || tag === 'STYLE') {
          continue;
        } else if (isBlock(c)) {
          if (out) out += '<w:r><w:br/></w:r>';
          out += inlineXml(c, block, ctx, rStyle);
        } else {
          out += inlineXml(c, block, ctx, rStyle);
        }
      }
    }
    return out;
  }

  /* ---------- paragraph properties ---------- */
  function paraProps(el, ctx, extra) {
    extra = extra || {};
    var cs = getComputedStyle(el);
    var rtl = cs.direction === 'rtl';
    var pr = '';
    if (extra.style) pr += '<w:pStyle w:val="' + extra.style + '"/>';
    if (extra.keepNext) pr += '<w:keepNext/>';
    if (extra.numId) pr += '<w:numPr><w:ilvl w:val="' + extra.ilvl + '"/><w:numId w:val="' + extra.numId + '"/></w:numPr>';
    if (extra.border) pr += '<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="9AA3B2"/></w:pBdr>';
    if (rtl) pr += '<w:bidi/>';
    var before = extra.noSpacing ? 0 : px2tw(parseFloat(cs.marginTop) || 0);
    var after = extra.noSpacing ? 0 : px2tw(parseFloat(cs.marginBottom) || 0);
    var lineAttr = '';
    var lhEl = el.closest('[style*="line-height"]');
    var lh = lhEl ? parseFloat(lhEl.style.lineHeight) : NaN;
    if (!isNaN(lh) && lh > 0 && lh < 10 && !/px|pt|%/.test(lhEl.style.lineHeight)) {
      lineAttr = ' w:line="' + Math.round(240 * lh / 1.2) + '" w:lineRule="auto"';
    } else {
      var lpx = parseFloat(cs.lineHeight), fpx = parseFloat(cs.fontSize);
      if (!isNaN(lpx) && fpx) lineAttr = ' w:line="' + Math.round(240 * (lpx / fpx) / 1.2) + '" w:lineRule="auto"';
    }
    pr += '<w:spacing w:before="' + before + '" w:after="' + after + '"' + lineAttr + '/>';
    if (!extra.numId) {
      var startPx = rtl ? parseFloat(cs.marginRight) : parseFloat(cs.marginLeft);
      var padStart = rtl ? parseFloat(cs.paddingRight) : parseFloat(cs.paddingLeft);
      var ind = (startPx || 0) + (extra.addIndentPx || 0) + (el.tagName === 'BLOCKQUOTE' ? (padStart || 0) : 0);
      if (ind > 0.5) pr += '<w:ind w:left="' + px2tw(ind) + '"/>';
    } else if (extra.addIndentPx) {
      pr += '<w:ind w:left="' + px2tw(extra.addIndentPx) + '"/>';
    }
    var ta = cs.textAlign;
    var visual = ta;
    if (ta === 'start' || ta === '-webkit-auto' || ta === 'auto') visual = rtl ? 'right' : 'left';
    else if (ta === 'end') visual = rtl ? 'left' : 'right';
    else if (ta === '-webkit-center') visual = 'center';
    else if (ta === '-webkit-right') visual = 'right';
    else if (ta === '-webkit-left') visual = 'left';
    var jc = null;
    if (visual === 'center') jc = 'center';
    else if (visual === 'justify') jc = 'both';
    else if (rtl && visual === 'left') jc = 'right';      // bidi paragraph: right == end
    else if (!rtl && visual === 'right') jc = 'right';
    if (jc) pr += '<w:jc w:val="' + jc + '"/>';
    return pr;
  }

  function paragraph(el, ctx, extra, runsXml) {
    var runs = runsXml !== undefined ? runsXml : inlineXml(el, el, ctx, null);
    var pPr = paraProps(el, ctx, extra);
    // paragraph mark size so empty lines keep their height
    var cs = getComputedStyle(el);
    var hp = Math.round((parseFloat(cs.fontSize) || 16) * 0.75 * 2);
    pPr += '<w:rPr><w:sz w:val="' + hp + '"/><w:szCs w:val="' + hp + '"/>' + (cs.direction === 'rtl' ? '<w:rtl/>' : '') + '</w:rPr>';
    return '<w:p><w:pPr>' + pPr + '</w:pPr>' + runs + '</w:p>';
  }

  var STYLE_FOR = { H1: 'Heading1', H2: 'Heading2', H3: 'Heading3', H4: 'Heading3', H5: 'Heading3', H6: 'Heading3', BLOCKQUOTE: 'Quote' };

  function blocksXml(container, ctx, level) {
    var out = '';
    var pendingInline = [];
    function flushInline() {
      if (!pendingInline.length) return;
      var hasContent = pendingInline.some(function (n) { return n.nodeType === 1 || /\S/.test(n.nodeValue); });
      if (hasContent) out += paragraph(container, ctx, {}, inlineNodesXml(pendingInline, container, ctx, null));
      pendingInline = [];
    }
    for (var c = container.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) { pendingInline.push(c); continue; }
      if (c.nodeType !== 1) continue;
      var tag = c.tagName;
      if (!isBlock(c) && tag !== 'BR' && !(tag === 'DIV')) { pendingInline.push(c); continue; }
      flushInline();
      if (tag === 'BR') { out += '<w:p/>'; continue; }
      if (c.classList && c.classList.contains('fn-notes')) continue;   // exported as real Word footnotes
      if (c.classList && c.classList.contains('page-break')) {
        out += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
        continue;
      }
      if (tag === 'HR') { out += paragraph(c, ctx, { border: true, noSpacing: true }, ''); continue; }
      if (tag === 'UL' || tag === 'OL') { out += listXml(c, ctx, 0); continue; }
      if (tag === 'TABLE') { out += tableXml(c, ctx); out += '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:rPr><w:sz w:val="4"/></w:rPr></w:pPr></w:p>'; continue; }
      if (tag === 'BLOCKQUOTE' || tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'FIGURE') {
        var hasBlockKids = false;
        for (var k = c.firstChild; k; k = k.nextSibling) if (isBlock(k)) { hasBlockKids = true; break; }
        if (hasBlockKids) { out += blocksXml(c, ctx, level); continue; }
      }
      var st = STYLE_FOR[tag];
      out += paragraph(c, ctx, { style: st, keepNext: /^H\d$/.test(tag) });
    }
    flushInline();
    return out;
  }

  function listXml(list, ctx, ilvl) {
    var numId;
    if (list.tagName === 'UL') numId = 1;
    else {
      numId = ctx.numSeq++;
      ctx.nums.push({ numId: numId, abstract: 1, start: parseInt(list.getAttribute('start'), 10) || 1, ilvl: ilvl });
    }
    var out = '';
    for (var li = list.firstChild; li; li = li.nextSibling) {
      if (li.nodeType !== 1) continue;
      if (li.tagName === 'UL' || li.tagName === 'OL') { out += listXml(li, ctx, Math.min(ilvl + 1, 8)); continue; }
      if (li.tagName !== 'LI') {
        // stray inline content directly inside a list (e.g. an image) still has to be exported
        out += isBlock(li) ? paragraph(li, ctx, {}) : paragraph(list, ctx, {}, inlineNodesXml([li], list, ctx, null));
        continue;
      }
      // split li: inline part (numbered), nested lists, extra blocks
      var inlineNodes = [], first = true;
      var flush = function () {
        if (!inlineNodes.length && !first) return;
        var runs = inlineNodesXml(inlineNodes, li, ctx, null);
        out += paragraph(li, ctx, first ? { numId: numId, ilvl: ilvl, style: 'ListParagraph' } : { style: 'ListParagraph', addIndentPx: 48 * (ilvl + 1) }, runs);
        first = false;
        inlineNodes = [];
      };
      for (var c = li.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 1 && (c.tagName === 'UL' || c.tagName === 'OL')) {
          flush();
          out += listXml(c, ctx, Math.min(ilvl + 1, 8));
        } else if (c.nodeType === 1 && isBlock(c)) {
          if (inlineNodes.length || first) {
            // block inside li (e.g. <p>): use its content as the item text
            var kids = [];
            for (var g = c.firstChild; g; g = g.nextSibling) kids.push(g);
            inlineNodes = inlineNodes.concat(kids);
            flush();
          } else {
            out += paragraph(c, ctx, { style: 'ListParagraph', addIndentPx: 48 * (ilvl + 1) });
          }
        } else inlineNodes.push(c);
      }
      if (inlineNodes.length || first) flush();
    }
    return out;
  }

  function tableXml(table, ctx) {
    var rows = [];
    var trs = table.querySelectorAll(':scope > tr, :scope > tbody > tr, :scope > thead > tr, :scope > tfoot > tr');
    for (var i = 0; i < trs.length; i++) rows.push(trs[i]);
    if (!rows.length) return '';
    var rtl = getComputedStyle(table).direction === 'rtl';
    // grid from the row with most columns
    var maxCols = 0, gridRow = rows[0];
    rows.forEach(function (r) {
      var n = 0;
      for (var c = 0; c < r.cells.length; c++) n += r.cells[c].colSpan || 1;
      if (n > maxCols) { maxCols = n; gridRow = r; }
    });
    var totalTw = px2tw(Math.min(table.offsetWidth || ctx.contentWidthPx, ctx.contentWidthPx));
    var widths = [];
    var tableW = table.offsetWidth || 1;
    for (var c2 = 0; c2 < gridRow.cells.length; c2++) {
      var cell = gridRow.cells[c2];
      var span = cell.colSpan || 1;
      var w = Math.round(totalTw * (cell.offsetWidth / tableW) / span);
      for (var s = 0; s < span; s++) widths.push(Math.max(200, w));
    }
    while (widths.length < maxCols) widths.push(Math.round(totalTw / maxCols));
    var sol = table.classList.contains('sol');   // step-by-step solution: borderless, centered, LTR
    var out = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/>' + (rtl ? '<w:bidiVisual/>' : '') +
      '<w:tblW w:w="' + totalTw + '" w:type="dxa"/>' + (sol ? '<w:jc w:val="center"/>' : '') +
      '<w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (b) {
        return sol ? '<w:' + b + ' w:val="nil"/>' : '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="8F98A8"/>';
      }).join('') + '</w:tblBorders>' +
      '<w:tblLayout w:type="fixed"/>' +
      '<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar>' +
      '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>' +
      '</w:tblPr><w:tblGrid>';
    widths.forEach(function (w) { out += '<w:gridCol w:w="' + w + '"/>'; });
    out += '</w:tblGrid>';
    rows.forEach(function (r) {
      var isHeader = r.parentNode.tagName === 'THEAD' || (r.cells.length && Array.prototype.every.call(r.cells, function (x) { return x.tagName === 'TH'; }));
      out += '<w:tr>' + (isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : '');
      var col = 0;
      for (var ci = 0; ci < r.cells.length; ci++) {
        var cell = r.cells[ci];
        var span = cell.colSpan || 1;
        var cw = 0;
        for (var s = 0; s < span; s++) cw += widths[col + s] || 0;
        col += span;
        var fill = rgbToHex(getComputedStyle(cell).backgroundColor);
        var tcPr = '<w:tcW w:w="' + cw + '" w:type="dxa"/>' + (span > 1 ? '<w:gridSpan w:val="' + span + '"/>' : '') +
          (fill && fill !== 'FFFFFF' ? '<w:shd w:val="clear" w:color="auto" w:fill="' + fill + '"/>' : '');
        var inner = blocksXml(cell, ctx, 0);
        if (!/<w:p[ >\/]/.test(inner) || /<\/w:tbl>$/.test(inner)) inner += '<w:p/>';
        out += '<w:tc><w:tcPr>' + tcPr + '</w:tcPr>' + inner + '</w:tc>';
      }
      out += '</w:tr>';
    });
    out += '</w:tbl>';
    return out;
  }

  /* ---------- package parts ---------- */
  function numberingXml(ctx) {
    var bullets = ['•', '◦', '▪', '•', '◦', '▪', '•', '◦', '▪'];
    var a0 = '<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>';
    var a1 = '<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>';
    for (var l = 0; l < 9; l++) {
      var ind = '<w:pPr><w:ind w:left="' + (720 * (l + 1)) + '" w:hanging="360"/></w:pPr>';
      a0 += '<w:lvl w:ilvl="' + l + '"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="' + bullets[l] + '"/><w:lvlJc w:val="left"/>' + ind +
        '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:hint="default"/></w:rPr></w:lvl>';
      a1 += '<w:lvl w:ilvl="' + l + '"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%' + (l + 1) + '."/><w:lvlJc w:val="left"/>' + ind + '</w:lvl>';
    }
    a0 += '</w:abstractNum>'; a1 += '</w:abstractNum>';
    var nums = '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>';
    ctx.nums.forEach(function (n) {
      nums += '<w:num w:numId="' + n.numId + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="' + n.ilvl + '"><w:startOverride w:val="' + n.start + '"/></w:lvlOverride></w:num>';
    });
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:numbering xmlns:w="' + NS_W + '">' + a0 + a1 + nums + '</w:numbering>';
  }

  function stylesXml(ctx) {
    var f = esc(ctx.defaultFont);
    function hstyle(id, name, lvl, sz, color) {
      return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/>' +
        '<w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="' + lvl + '"/></w:pPr>' +
        '<w:rPr><w:b/><w:bCs/><w:color w:val="' + color + '"/><w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/></w:rPr></w:style>';
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles xmlns:w="' + NS_W + '">' +
      '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="' + f + '" w:hAnsi="' + f + '" w:cs="' + f + '" w:eastAsia="' + f + '"/>' +
      '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="he-IL"/></w:rPr></w:rPrDefault>' +
      '<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/>' + (ctx.defaultDir === 'rtl' ? '<w:pPr><w:bidi/></w:pPr>' : '') + '</w:style>' +
      '<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/></w:style>' +
      hstyle('Heading1', 'heading 1', 0, 40, '1F3A8A') + hstyle('Heading2', 'heading 2', 1, 32, '2A4BA8') + hstyle('Heading3', 'heading 3', 2, 26, '3C5CC0') +
      '<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>' +
      '<w:rPr><w:i/><w:iCs/><w:color w:val="4B5563"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:contextualSpacing/></w:pPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="FootnoteText"><w:name w:val="footnote text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style>' +
      '<w:style w:type="character" w:styleId="FootnoteReference"><w:name w:val="footnote reference"/><w:basedOn w:val="DefaultParagraphFont"/><w:rPr><w:vertAlign w:val="superscript"/></w:rPr></w:style>' +
      '<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:basedOn w:val="DefaultParagraphFont"/><w:rPr><w:color w:val="1A56DB"/><w:u w:val="single"/></w:rPr></w:style>' +
      '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>' +
      '<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:tblPr><w:tblBorders>' +
      ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (b) { return '<w:' + b + ' w:val="single" w:sz="4" w:space="0" w:color="auto"/>'; }).join('') +
      '</w:tblBorders></w:tblPr></w:style>' +
      '</w:styles>';
  }

  function hfXml(kind, text, withPage, rtl) {
    var tag = kind === 'header' ? 'w:hdr' : 'w:ftr';
    var p = '';
    var pPr = '<w:pPr>' + (rtl ? '<w:bidi/>' : '') + '<w:spacing w:after="0"/><w:jc w:val="center"/></w:pPr>';
    var rPr = '<w:rPr><w:color w:val="6B7280"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr>';
    if (text) {
      p += '<w:p>' + pPr + '<w:r><w:rPr><w:color w:val="6B7280"/><w:sz w:val="20"/><w:szCs w:val="20"/>' + (HEB.test(text) ? '<w:rtl/>' : '') + '</w:rPr><w:t xml:space="preserve">' + esc(text) + '</w:t></w:r></w:p>';
    }
    if (withPage) {
      p += '<w:p>' + pPr + '<w:r>' + rPr + '<w:fldChar w:fldCharType="begin"/></w:r><w:r>' + rPr + '<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>' +
        '<w:r>' + rPr + '<w:fldChar w:fldCharType="separate"/></w:r><w:r>' + rPr + '<w:t>1</w:t></w:r><w:r>' + rPr + '<w:fldChar w:fldCharType="end"/></w:r></w:p>';
    }
    if (!p) p = '<w:p/>';
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<' + tag + ' xmlns:w="' + NS_W + '" xmlns:r="' + NS_R + '">' + p + '</' + tag + '>';
  }

  function footnotesXml(notes, rtl) {
    var sep = '<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote>' +
      '<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>';
    var body = notes.map(function (txt, i) {
      var heb = HEB.test(txt);
      return '<w:footnote w:id="' + (i + 1) + '"><w:p><w:pPr><w:pStyle w:val="FootnoteText"/>' + (rtl ? '<w:bidi/>' : '') + '</w:pPr>' +
        '<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr><w:footnoteRef/></w:r>' +
        '<w:r><w:rPr>' + (heb ? '<w:rtl/>' : '') + '</w:rPr><w:t xml:space="preserve"> ' + esc(txt) + '</w:t></w:r></w:p></w:footnote>';
    }).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:footnotes xmlns:w="' + NS_W + '" xmlns:r="' + NS_R + '">' + sep + body + '</w:footnotes>';
  }

  function build(opts) {
    if (!window.JSZip) return Promise.reject(new Error('JSZIP_MISSING'));
    var s = opts.settings;
    var ctx = new Ctx(opts);
    var body = blocksXml(opts.editor, ctx, 0);
    if (!body) body = '<w:p/>';

    var landscape = s.orientation === 'landscape';
    var pgW = landscape ? 16838 : 11906, pgH = landscape ? 11906 : 16838;
    var hasHeader = !!(s.header && s.header.trim());
    var hasFooter = !!((s.footer && s.footer.trim()) || s.pageNumbers);
    var sect = '<w:sectPr>';
    var hdrId, ftrId, ftrFirstId;
    if (hasHeader) { hdrId = ctx.addRel(REL + 'header', 'header1.xml'); sect += '<w:headerReference w:type="default" r:id="' + hdrId + '"/>'; }
    if (hasFooter) {
      ftrId = ctx.addRel(REL + 'footer', 'footer1.xml'); sect += '<w:footerReference w:type="default" r:id="' + ftrId + '"/>';
      if (s.pageNumbers && !s.numberFirst) { ftrFirstId = ctx.addRel(REL + 'footer', 'footer2.xml'); sect += '<w:footerReference w:type="first" r:id="' + ftrFirstId + '"/>'; }
    }
    var m = s.margins;
    sect += '<w:pgSz w:w="' + pgW + '" w:h="' + pgH + '"' + (landscape ? ' w:orient="landscape"' : '') + '/>' +
      '<w:pgMar w:top="' + cm2tw(m.top) + '" w:right="' + cm2tw(m.side) + '" w:bottom="' + cm2tw(m.bottom) + '" w:left="' + cm2tw(m.side) + '" w:header="709" w:footer="709" w:gutter="0"/>' +
      '<w:cols w:space="708"/>' + (ftrFirstId ? '<w:titlePg/>' : '') + (ctx.defaultDir === 'rtl' ? '<w:bidi/>' : '') + '<w:docGrid w:linePitch="360"/></w:sectPr>';

    var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:document xmlns:w="' + NS_W + '" xmlns:r="' + NS_R + '" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<w:body>' + body + sect + '</w:body></w:document>';

    var zip = new window.JSZip();
    var mediaExts = {};
    ctx.media.forEach(function (mm) { mediaExts[mm.ext] = 1; zip.file('word/media/' + mm.name, mm.data); });

    var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      (mediaExts.png ? '<Default Extension="png" ContentType="image/png"/>' : '') +
      (mediaExts.jpeg ? '<Default Extension="jpeg" ContentType="image/jpeg"/>' : '') +
      (mediaExts.gif ? '<Default Extension="gif" ContentType="image/gif"/>' : '') +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
      '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' +
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
      (ctx.footnotes.length ? '<Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>' : '') +
      (hasHeader ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' : '') +
      (hasFooter ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '') +
      (ftrFirstId ? '<Override PartName="/word/footer2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '') +
      (opts.sourceHtml ? '<Override PartName="/customXml/itemProps1.xml" ContentType="application/vnd.openxmlformats-officedocument.customXmlProperties+xml"/>' : '') +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
      '</Types>';
    zip.file('[Content_Types].xml', ct);
    zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="' + REL + 'officeDocument" Target="word/document.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="' + REL + 'extended-properties" Target="docProps/app.xml"/></Relationships>');

    var now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    zip.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + esc(opts.title || '') + '</dc:title><dc:creator></dc:creator>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified></cp:coreProperties>');
    zip.file('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Katvan</Application></Properties>');

    zip.file('word/styles.xml', stylesXml(ctx));
    zip.file('word/numbering.xml', numberingXml(ctx));
    zip.file('word/settings.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:settings xmlns:w="' + NS_W + '"><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/>' +
      (ctx.footnotes.length ? '<w:footnotePr><w:footnote w:id="-1"/><w:footnote w:id="0"/></w:footnotePr>' : '') +
      '<w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>');
    var rtl = ctx.defaultDir === 'rtl';
    if (ctx.footnotes.length) zip.file('word/footnotes.xml', footnotesXml(ctx.footnotes, rtl));
    if (hasHeader) zip.file('word/header1.xml', hfXml('header', s.header.trim(), false, rtl));
    if (hasFooter) zip.file('word/footer1.xml', hfXml('footer', (s.footer || '').trim(), !!s.pageNumbers, rtl));
    if (ftrFirstId) zip.file('word/footer2.xml', hfXml('footer', (s.footer || '').trim(), false, rtl));

    // Embed editable source so Katvan can reopen its own files with full fidelity
    if (opts.sourceHtml) {
      var cxId = ctx.addRel(REL + 'customXml', '../customXml/item1.xml');
      var src = opts.sourceHtml;
      ctx.media.forEach(function (mm) {
        var url = mm.el.getAttribute('src');
        src = src.split(url).join('katvan-media:' + mm.name);
      });
      var payload = JSON.stringify({ v: 1, hash: hash(documentXml), settings: s, title: opts.manualTitle || '', html: src });
      zip.file('customXml/item1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<katvan xmlns="urn:katvan:source">' + esc(payload) + '</katvan>');
      zip.file('customXml/itemProps1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<ds:datastoreItem ds:itemID="{6F1A2B3C-4D5E-4F60-8172-93A4B5C6D7E8}" xmlns:ds="http://schemas.openxmlformats.org/officeDocument/2006/customXml"><ds:schemaRefs><ds:schemaRef ds:uri="urn:katvan:source"/></ds:schemaRefs></ds:datastoreItem>');
      zip.file('customXml/_rels/item1.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'customXmlProps" Target="itemProps1.xml"/></Relationships>');
    }

    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="' + REL + 'styles" Target="styles.xml"/>' +
      '<Relationship Id="rId2" Type="' + REL + 'numbering" Target="numbering.xml"/>' +
      '<Relationship Id="rId3" Type="' + REL + 'settings" Target="settings.xml"/>' +
      (ctx.footnotes.length ? '<Relationship Id="rId4" Type="' + REL + 'footnotes" Target="footnotes.xml"/>' : '');
    ctx.rels.forEach(function (r) {
      rels += '<Relationship Id="' + r.id + '" Type="' + r.type + '" Target="' + esc(r.target) + '"' + (r.mode ? ' TargetMode="External"' : '') + '/>';
    });
    rels += '</Relationships>';
    zip.file('word/_rels/document.xml.rels', rels);
    zip.file('word/document.xml', documentXml);

    return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compression: 'DEFLATE' });
  }

  /* Read back a Katvan-embedded source, if the document body was not changed elsewhere. */
  function readSource(zip) {
    var item = zip.file('customXml/item1.xml');
    var docf = zip.file('word/document.xml');
    if (!item || !docf) return Promise.resolve(null);
    return Promise.all([item.async('string'), docf.async('string')]).then(function (res) {
      var m = res[0].match(/<katvan[^>]*>([\s\S]*)<\/katvan>/);
      if (!m) return null;
      var txt = new DOMParser().parseFromString('<x>' + m[1] + '</x>', 'application/xml').documentElement.textContent;
      var data;
      try { data = JSON.parse(txt); } catch (e) { return null; }
      if (!data || data.hash !== hash(res[1])) return null;
      var names = (data.html.match(/katvan-media:[\w.]+/g) || []).filter(function (v, i, a) { return a.indexOf(v) === i; });
      return Promise.all(names.map(function (ref) {
        var name = ref.slice('katvan-media:'.length);
        var f = zip.file('word/media/' + name);
        if (!f) return null;
        return f.async('base64').then(function (b64) {
          var mime = /png$/.test(name) ? 'image/png' : /gif$/.test(name) ? 'image/gif' : 'image/jpeg';
          data.html = data.html.split(ref).join('data:' + mime + ';base64,' + b64);
        });
      })).then(function () { return data; });
    });
  }

  window.DocxExport = { build: build, readSource: readSource, hash: hash };
})();
