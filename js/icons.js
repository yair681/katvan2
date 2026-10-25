/* Inline SVG icon set (24x24, stroke based). */
(function () {
  'use strict';
  var P = {
    feather: '<path d="M20.2 3.8a5.5 5.5 0 0 0-7.8 0L5 11.2V19h7.8l7.4-7.4a5.5 5.5 0 0 0 0-7.8z"/><path d="M16 8 3 21"/><path d="M17.5 15H9"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    save: '<path d="M15.2 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.8L15.2 3z"/><path d="M17 21v-7H7v7"/><path d="M7 3v4h7"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    fontGrow: '<path d="M3 19 8 6l5 13"/><path d="M4.6 15h6.8"/><path d="M18 5v6M15 8h6"/>',
    fontShrink: '<path d="M3 19 8 6l5 13"/><path d="M4.6 15h6.8"/><path d="M15 8h6"/>',
    bold: '<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z"/><path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z"/>',
    italic: '<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
    underline: '<path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/>',
    strike: '<path d="M16 6.5C15.3 5 13.8 4 12 4c-2.5 0-4.2 1.4-4.2 3.3 0 1.2.6 2.1 1.8 2.7"/><path d="M4 12h16"/><path d="M8 17.5c.8 1.6 2.3 2.5 4.3 2.5 2.6 0 4.4-1.4 4.4-3.5 0-.9-.3-1.7-.9-2.3"/>',
    superscript: '<path d="m4 19 8-8M12 19l-8-8"/><path d="M20 12h-4c0-1.5.44-2 1.5-2.5S20 8.33 20 7.3c0-.6-.24-1.03-.6-1.3a2.3 2.3 0 0 0-2.8.1"/>',
    subscript: '<path d="m4 5 8 8M12 5l-8 8"/><path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14.3c0-.6-.24-1.03-.6-1.3a2.3 2.3 0 0 0-2.8.1"/>',
    textColor: '<path d="M5 16 10.5 3h1L17 16"/><path d="M7.2 11h8.6"/>',
    highlighter: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
    eraser: '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    listBullet: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
    listNumber: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 4h1v5M4 9h2"/><path d="M6.5 20H3.5c0-1 2.6-1.8 2.6-3.2 0-.7-.5-1.3-1.3-1.3-.6 0-1.1.3-1.3.8"/>',
    indent: '<path d="M21 4H3M21 20H3M21 12h-9M21 8h-9M21 16h-9"/><path d="m3 8 4 4-4 4"/>',
    outdent: '<path d="M21 4H3M21 20H3M21 12h-9M21 8h-9M21 16h-9"/><path d="m7 8-4 4 4 4"/>',
    pilcrowRtl: '<path d="M10 4v12M14 4v12M16 4H9.5a3.5 3.5 0 0 0 0 7H10"/><path d="M20 20H4M7 17l-3 3 3 3"/>',
    pilcrowLtr: '<path d="M10 4v12M14 4v12M16 4H9.5a3.5 3.5 0 0 0 0 7H10"/><path d="M4 20h16M17 17l3 3-3 3"/>',
    alignRight: '<path d="M21 6H3M21 12H9M21 18H7"/>',
    alignCenter: '<path d="M21 6H3M17 12H7M19 18H5"/>',
    alignLeft: '<path d="M3 6h18M3 12h12M3 18h14"/>',
    alignJustify: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    lineSpacing: '<path d="M11 6h10M11 12h10M11 18h10"/><path d="m3 7 3-3 3 3M3 17l3 3 3-3M6 4v16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    replace: '<path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M17 14v3a3 3 0 0 1-3 3h-1M7 10V7a3 3 0 0 1 3-3h1"/><path d="m15 18-2 2 2 2M9 6l2-2-2-2"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    omega: '<path d="M4 20h4.5v-2.2A7 7 0 0 1 5 11.5 7 7 0 0 1 12 4.5a7 7 0 0 1 7 7 7 7 0 0 1-3.5 6.3V20H20"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    pageBreak: '<path d="M6 9V4a1 1 0 0 1 1-1h7l4 4v2"/><path d="M18 15v5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-5"/><path d="M3 12h2M8 12h2M14 12h2M19 12h2"/>',
    margins: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 7h18M3 17h18" stroke-dasharray="2 2"/>',
    orientation: '<rect x="4" y="2" width="11" height="15" rx="1.5"/><path d="M9 21h10.5a1.5 1.5 0 0 0 1.5-1.5V12"/><path d="m18 9 3 3 3-3" transform="translate(-3 0)"/>',
    sidebar: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/><path d="M18 8h0M18 11h0" stroke-width="2.4"/>',
    focus: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M8 11h6"/>',
    zoomReset: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="M9 9h1.5v5M9 14h3"/>',
    fitWidth: '<path d="M3 5v14M21 5v14"/><path d="M7 12h10M10 9l-3 3 3 3M14 9l3 3-3 3"/>',
    spell: '<path d="m3 15 4-11 4 11M4.5 11h5"/><path d="m13 17 3 3 6-7"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    rowAbove: '<rect x="3" y="12" width="18" height="9" rx="1.5"/><path d="M3 16.5h18"/><path d="M12 2v7M8.5 5.5h7"/>',
    rowBelow: '<rect x="3" y="3" width="18" height="9" rx="1.5"/><path d="M3 7.5h18"/><path d="M12 15v7M8.5 18.5h7"/>',
    colRight: '<rect x="3" y="3" width="9" height="18" rx="1.5"/><path d="M7.5 3v18"/><path d="M15 12h7M18.5 8.5v7"/>',
    colLeft: '<rect x="12" y="3" width="9" height="18" rx="1.5"/><path d="M16.5 3v18"/><path d="M2 12h7M5.5 8.5v7"/>',
    rowDelete: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="m9.5 10 5 4M14.5 10l-5 4"/>',
    colDelete: '<rect x="8" y="3" width="8" height="18" rx="1.5"/><path d="m10 9.5 4 5M14 9.5l-4 5"/>',
    trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    tableHeader: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M15 9v12"/><path d="M3 6h18" stroke-width="5" stroke-opacity=".35"/>',
    paintBucket: '<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0z"/><path d="m5 2 5 5M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    filePlus: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/>',
    folderOpen: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.2 10H20a2 2 0 0 1 1.9 2.5l-1.5 6A2 2 0 0 1 18.4 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.7.9l.8 1.2a2 2 0 0 0 1.7.9H18a2 2 0 0 1 2 2v2"/>',
    fileWord: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="m8 12 1.5 6 2.5-4.5 2.5 4.5L16 12"/>',
    filePdf: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="M8 18v-5h1.5a1.5 1.5 0 0 1 0 3H8M13 13v5h1a2.5 2.5 0 0 0 0-5z"/>',
    fileCode: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6"/><path d="m10 13-2 2 2 2M14 13l2 2-2 2"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
    unlink: '<path d="m18.8 13.4 1.7-1.7a5 5 0 0 0-7.1-7.1l-1.7 1.7M5.2 10.6l-1.7 1.7a5 5 0 0 0 7.1 7.1l1.7-1.7M8 2v3M2 8h3M16 22v-3M22 16h-3"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8"/>',
    pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/>',
    sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    fraction: '<path d="M4 12h16"/><path d="M9 3.5h4.5M11.2 3.5v5"/><path d="M8.5 15.5h7l-4 5"/>',
    steps: '<path d="M3 6h6M3 12h6M3 18h6"/><path d="M12 5h3M12 7h3M12 11h3M12 13h3M12 17h3M12 19h3"/><path d="M18 6h3M18 12h3M18 18h3"/>',
    brace: '<path d="M9 3c-2 0-3 1-3 3v3c0 1.5-1 3-3 3 2 0 3 1.5 3 3v3c0 2 1 3 3 3"/><path d="M12 8h9M12 16h9"/>',
    graph: '<path d="M3 3v18h18"/><path d="M6 16c2.5-9 5-10 7.5-6s4 4 6.5-4"/>',
    footnote: '<path d="M4 6h10M4 10h10M4 14h6"/><path d="M17 4.5 19 3v6"/><path d="M4 19h16" stroke-dasharray="2 2"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H20"/><path d="M8 7h8M8 11h6"/>',
    notebook: '<rect x="5" y="2" width="15" height="20" rx="2"/><path d="M2 6h4M2 10h4M2 14h4M2 18h4"/><path d="M10 7h6M10 11h6"/>',
    bookOpen: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
    wand: '<path d="m15 4 1.5-1.5M20 9l1.5-1.5M15 9l6.5-6.5"/><path d="m3 21 10-10M11 3v2M5 7H3M7 3 5.6 1.6"/><path d="m13 11 2 2"/>',
    dictionary: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H20"/><path d="m9 10 2 2 4-4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 3"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    pencil: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/><path d="m15 5 4 4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>'
  };

  function svg(name) {
    var body = P[name] || '';
    return '<svg class="ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function hydrate(root) {
    var els = (root || document).querySelectorAll('i[data-i]');
    for (var k = 0; k < els.length; k++) {
      var el = els[k];
      if (el.dataset.done) continue;
      el.innerHTML = svg(el.dataset.i);
      el.dataset.done = '1';
    }
  }

  window.Icons = { svg: svg, hydrate: hydrate };
})();
