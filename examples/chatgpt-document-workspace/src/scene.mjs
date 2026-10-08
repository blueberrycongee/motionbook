import { documents, fileIds } from './documents.mjs';
import { layout, geometry, clamp, composerLayout } from './model.mjs';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paths = {
  back: 'M15 5 8 12l7 7M8 12h13', next: 'm9 5 7 7-7 7M3 12h13',
  side: 'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 0v16',
  split: 'M4 4h16v16H4Zm8 0v16', full: 'M9 4v5H4m11-5v5h5M4 15h5v5m6 0v-5h5',
  plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M18 6 6 18',
  down: 'm7 10 5 5 5-5', up: 'm7 14 5-5 5 5',
  chat: 'M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z',
  file: 'M6 3h8l4 4v14H6Zm8 0v5h4M9 12h6M9 15h6',
  search: 'M17 17 21 21M19 11a8 8 0 1 0-16 0 8 8 0 0 0 16 0',
  edit: 'm15 4 5 5M5 16l1-5L17 1l5 5-11 10Zm-1-8v13h15v-8',
  download: 'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',
  history: 'M3 12a9 9 0 1 0 4-7M3 4v5h5m4-3v6l4 2',
  home: 'm2 10 10-8 10 8M5 9v12h5v-7h4v7h5V9',
  folder: 'M3 7V4h7l2 3h9v14H3ZM3 10h18',
  files: 'M7 3h12v15H7ZM3 7v15h12',
  bell: 'M6 16V9a6 6 0 0 1 12 0v7l3 3H3Zm4 6h4',
  arrow: 'M12 19V5m-6 6 6-6 6 6',
  wave: 'M3 10v4m4-7v10m5-13v16m5-14v12m4-9v6',
  check: 'm5 12 4 4L20 5', more: 'M5 12h.01M12 12h.01M19 12h.01',
};
function icon(name, x, y, size = 20, color = '#797b7f') {
  return `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name] || paths.file}"/></g>`;
}
function rect(x, y, w, h, radius, fill, stroke = 'none', extra = '') {
  return `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" rx="${radius}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
}
function text(value, x, y, size = 14, fill = '#292b2e', weight = 400, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${escape(value)}</text>`;
}
let controlCounts = new Map();
function button(type, label, x, y, w, h, content, { id, value, active = false, fill, radius = 9, disabled = false, role = 'button' } = {}) {
  const stableLabel = ['sidebar', 'split', 'drawer', 'thumbnails'].includes(type) ? type : type === 'menu' && id === 'zoom' ? 'zoom-menu' : label;
  const baseKey = `${type}:${role}:${stableLabel}:${id || ''}:${value ?? ''}`;
  const ordinal = controlCounts.get(baseKey) || 0; controlCounts.set(baseKey, ordinal + 1);
  return `<g data-control-key="${escape(baseKey + ':' + ordinal)}" class="control ${active ? 'is-active' : ''}" role="${role}" ${role === 'tab' ? `aria-selected="${active}"` : ''} tabindex="${disabled ? -1 : 0}" aria-label="${escape(label)}" aria-disabled="${disabled}" data-type="${type}" ${id ? `data-id="${id}"` : ''} ${value !== undefined ? `data-value="${value}"` : ''}>` +
    `<title>${escape(label)}</title>` + rect(x, y, w, h, radius, fill || (active ? '#e9e9ea' : 'none'), 'none', 'class="hit"') + `<g opacity="${disabled ? 0.35 : 1}">${content}</g></g>`;
}
function iButton(type, label, name, x, y, opts = {}) {
  return button(type, label, x, y, 34, 34, icon(name, x + 8, y + 8, 18, opts.color), opts);
}
function pill(type, label, name, x, y, w, opts = {}) {
  return button(type, label, x, y, w, 38, `${name ? icon(name, x + 13, y + 10, 17, '#414449') : ''}${text(label, x + (name ? 38 : 16), y + 24, 14, '#303338')}`, { fill: '#ffffff', radius: 19, ...opts });
}
function wrap(value, max) {
  const lines = [];
  for (const paragraph of String(value).split('\n')) {
    let line = '';
    for (const original of paragraph.split(/\s+/)) {
      const pieces = original.match(new RegExp(`.{1,${max}}`, 'g')) || [''];
      for (const word of pieces) {
        if ((line + ' ' + word).trim().length > max && line) { lines.push(line); line = word; }
        else line = (line + ' ' + word).trim();
      }
    }
    lines.push(line);
  }
  return lines;
}
function paper(doc, page, g, state) {
  const x = g.paperX, y = g.paperY + page * (g.paperHeight + 24), scale = g.scale;
  let output = `<g transform="translate(${x} ${y}) scale(${scale})">${rect(0, 0, doc.width, doc.height, 0, '#ffffff', '#e2e4e6')}`;
  let cy = 75;
  const lines = page === 0 ? doc.lines : doc.pageTwo;
  for (const [kind, body] of lines) {
    if (kind === 'name') { output += text(body, 62, cy, 32, '#273e39', 600, 'font-family="Georgia, serif"'); cy += 33; }
    else if (kind === 'role' || kind === 'eyebrow') { output += text(body, 63, cy, 10, '#6f827d', 600, 'letter-spacing="1.7"'); cy += 31; }
    else if (kind === 'contact') { output += text(body, 63, cy, 11, '#737a78'); cy += 39; }
    else if (kind === 'summary') { output += text(body, 63, cy, 19, '#293f39', 500, 'font-family="Georgia, serif"'); cy += 32; }
    else if (kind === 'section') {
      cy += 26; output += text(body, 63, cy, 10.5, '#68867c', 600, 'letter-spacing="1.5"'); cy += 12;
      output += `<path d="M63 ${cy}H697" stroke="#d5dfdc"/>`; cy += 31;
    } else if (kind === 'job') { output += text(body, 63, cy, 16, '#2c3b35', 600, 'font-family="Georgia, serif"'); cy += 22; }
    else if (kind === 'meta') { output += text(body, 63, cy, 10.5, '#87908b'); cy += 28; }
    else if (kind === 'bullet') { output += text('•', 64, cy, 14, '#4b5550'); output += text(body, 79, cy, 11.5, '#58615c'); cy += 25; }
    else if (kind === 'quote') { cy += 10; output += `<path d="M63 ${cy - 15}v36" stroke="#a7c3b5" stroke-width="3"/>`; output += text(body, 82, cy + 2, 13, '#71887c', 400, 'font-family="Georgia, serif" font-style="italic"'); cy += 52; }
    else { output += text(body, 63, cy, 11.7, '#5d655f'); cy += 23; }
  }
  output += text(`${page + 1}  /  ${doc.pages}`, 696, doc.height - 36, 10, '#a3aaa7', 400, 'text-anchor="end"');
  output += '</g>'; return output;
}
function messages(state, l, { split = false, chat = false } = {}) {
  const list = state.messages[state.active];
  const x = split ? l.shellX + 22 : l.composerX + 22;
  const width = split ? l.splitTargetWidth - 44 : l.composerWidth - 44;
  let y = chat || split ? 152 : l.composerY - 270;
  let output = '';
  const clipX = split ? l.shellX : l.composerX;
  const clipY = split || chat ? 108 : l.composerY - 323;
  const clipWidth = split ? l.splitWidth : l.composerWidth;
  const clipHeight = Math.max(0, l.composerY - clipY - 8);
  // An explicit user-space clip is required: nested SVG overflow alone leaks in some renderers.
  const clip = content => `<svg x="${clipX}" y="${clipY}" width="${clipWidth}" height="${clipHeight}" viewBox="${clipX} ${clipY} ${clipWidth} ${clipHeight}" overflow="hidden"><defs><clipPath id="conversationClip" clipPathUnits="userSpaceOnUse"><rect x="${clipX}" y="${clipY}" width="${clipWidth}" height="${clipHeight}"/></clipPath></defs><g clip-path="url(#conversationClip)">${content}</g></svg>`;
  if (!split && !chat) {
    output += rect(l.composerX, l.composerY - 318, l.composerWidth, 308, 22, '#ffffff', '#e7e7e9', 'filter="url(#soft)"');
    output += text(documents[state.active]?.short || 'Conversation', x, y - 20, 13, '#75797f', 500);
    output += iButton('drawer', 'Hide conversation', 'close', x + width - 27, y - 44);
  }
  if (!list.length) {
    output += text(split ? 'What would you like to explore?' : 'Let’s make room for your next idea.', x, y + 55, split ? 18 : 27, '#333638', 500);
    if (chat) {
      output += button('open', 'Open portfolio', x, y + 93, 280, 100, `${icon('file', x + 18, y + 114, 27, '#627f70')}${text('Alex Morgan · Portfolio.pdf', x + 57, y + 124, 14, '#3d4640', 500)}${text('PDF · 2 pages', x + 57, y + 148, 12, '#8b918d')}`, { id: 'resume', fill: '#f4f5f4', radius: 15 });
      output += button('open', 'Open workspace notes', x + 298, y + 93, 280, 100, `${icon('file', x + 316, y + 114, 27, '#758297')}${text('A quieter workspace.md', x + 355, y + 124, 14, '#3d4640', 500)}${text('Notes · 1 page', x + 355, y + 148, 12, '#8b918d')}`, { id: 'notes', fill: '#f4f5f4', radius: 15 });
    }
    return clip(output);
  }
  for (const message of list.slice(-2)) {
    const wrapped = wrap(message.body, Math.max(16, Math.floor(width / 7)));
    const limit = message.role === 'user' ? 4 : 5;
    const lines = wrapped.slice(0, limit);
    if (wrapped.length > limit) lines[limit - 1] = lines[limit - 1].slice(0, -1) + '…';
    if (message.role === 'user') {
      output += rect(x - 2, y - 18, width + 4, lines.length * 21 + 20, 15, '#f0f2f0');
      lines.slice(0, 4).forEach((line, index) => { output += text(line, x + 12, y + index * 21 + 4, 13, '#3f4541'); });
    } else {
      lines.slice(0, 5).forEach((line, index) => { output += text(line, x + 2, y + index * 21, 13, '#565d58'); });
    }
    y += Math.min(lines.length, 4) * 21 + 44;
  }
  if (state.requests[state.active]) output += [0, 1, 2].map(i => `<circle cx="${x + 7 + i * 9}" cy="${y}" r="2.5" fill="#9baba1"/>`).join('');
  return clip(output);
}
export function renderScene(state, options = {}) {
  const width = options.width || 1280, height = options.height || 1180;
  const l = composerLayout(state, layout(width, height, options.sidebar ?? Number(state.sidebar), options.split ?? Number(state.split && state.active !== 'chat'), options.thumbnails ?? Number(state.thumbnails), state.active === 'chat'));
  const g = geometry(state, l);
  const activeDoc = documents[state.active];
  const topX = l.shellX;
  const tabsX = Math.max(topX, width < 650 ? 0 : 214);
  controlCounts = new Map();
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="application" aria-label="Document workspace" font-family="Arial, Helvetica, sans-serif">
  <defs><filter id="soft" x="-20%" y="-50%" width="140%" height="220%"><feGaussianBlur in="SourceAlpha" stdDeviation="9"/><feOffset dy="4"/><feColorMatrix type="matrix" values="0 0 0 0 0.12 0 0 0 0 0.15 0 0 0 0 0.18 0 0 0 0.065 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="bottom" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f7f7f8" stop-opacity="0"/><stop offset="1" stop-color="#f7f7f8" stop-opacity="0.96"/></linearGradient><clipPath id="chatPaneClip" clipPathUnits="userSpaceOnUse"><rect x="${l.shellX}" y="46" width="${l.splitWidth}" height="${height - 46}"/></clipPath><clipPath id="documentClip"><rect x="${l.readerX}" y="${l.top}" width="${l.readerWidth}" height="${l.viewHeight}"/></clipPath><clipPath id="sideClip"><rect x="${l.rail}" y="46" width="${l.side}" height="${height - 46}"/></clipPath><clipPath id="tabsClip"><rect x="${tabsX + 8}" y="0" width="${Math.max(30, width - tabsX - 133)}" height="51"/></clipPath></defs>
  ${rect(0, 0, width, height, 18, '#eeeff0')}`;
  // Window chrome and persistent primary rail.
  if (width >= 650) {
    svg += [0, 1, 2].map((v) => `<circle cx="${23 + v * 23}" cy="24" r="6.5" fill="${['#ff6259', '#ffbc2e', '#29c840'][v]}"/>`).join('');
    svg += iButton('history', 'Back', 'back', 96, 7, { value: -1, disabled: state.historyIndex === 0 });
    svg += iButton('history', 'Forward', 'next', 133, 7, { value: 1, disabled: state.historyIndex === state.history.length - 1 });
    svg += iButton('sidebar', state.sidebar ? 'Hide sidebar' : 'Show sidebar', 'side', 174, 7);
    for (const [name, y, type, label, id] of [
      ['home', 67, 'open', 'Home', 'chat'], ['files', 118, 'menu', 'Open files', 'files'],
      ['history', 169, 'menu', 'Recent files', 'files'], ['chat', 220, 'drawer', 'Conversation', null],
      ['more', 271, 'menu', 'Open files', 'files'], ['folder', 331, 'menu', 'Library', 'files'],
    ]) svg += iButton(type, label, name, 12, y, { id, active: name === 'home', color: name === 'home' ? '#292c2e' : '#8b8f93' });
    svg += `<path d="M16 318H43" stroke="#dcdfe1"/>`;
    svg += rect(17, height - 76, 25, 25, 8, '#c4cedf');
    svg += text('A', 25, height - 58, 12, '#596a8b', 500);
  }
  // Sidebar contents clip away, rather than shrinking their typography.
  const sideStart = svg.length;
  svg += `<g aria-hidden="${l.side < 1}" clip-path="url(#sideClip)">${rect(l.rail, 46, 275, height - 46, 17, '#f9f9fa')}`;
  svg += text('ChatGPT', l.rail + 22, 85, 19, '#35383b', 600);
  svg += icon('down', l.rail + 114, 71, 16);
  svg += iButton('menu', 'Notifications', 'bell', l.rail + 195, 61, { id: 'files' });
  svg += iButton('menu', 'Find a file', 'search', l.rail + 230, 61, { id: 'files' });
  svg += button('open', 'New conversation', l.rail + 10, 105, 255, 38, `${icon('edit', l.rail + 22, 115, 17, '#63676b')}${text('New chat', l.rail + 49, 131, 14, '#505357', 500)}`, { id: 'chat' });
  svg += `<circle cx="${l.rail + 30}" cy="166" r="9" fill="#aec6bb"/>` + text('Studio assistant', l.rail + 49, 171, 14, '#555a57', 500);
  svg += text('Recent', l.rail + 22, 231, 11, '#9b9ea1');
  const recents = [['Portfolio review', 'resume'], ['A quieter workspace', 'notes'], ['Reading list', 'notes'], ['Design details', 'notes'], ['A fresh perspective', 'chat']];
  recents.forEach(([label, id], i) => { svg += button('open', label, l.rail + 10, 245 + i * 37, 255, 33, text(label, l.rail + 23, 266 + i * 37, 13, '#64676b'), { id, active: (id === 'resume' && state.active === 'resume') || (i === 1 && state.active === 'notes') }); });
  svg += text('Files', l.rail + 22, 473, 11, '#9b9ea1');
  fileIds.forEach((id, i) => { svg += button('open', documents[id].title, l.rail + 10, 487 + i * 38, 255, 34, `${icon('file', l.rail + 22, 495 + i * 38, 17, '#899a92')}${text(documents[id].short, l.rail + 49, 509 + i * 38, 13, '#686e69')}`, { id }); });
  svg += text('Alex’s workspace', l.rail + 22, height - 28, 12, '#9c9fa3');
  svg += `</g>`;
  if (l.side < 1) svg = svg.slice(0, sideStart) + svg.slice(sideStart).replaceAll('tabindex="0"', 'tabindex="-1"');
  // Main work surface and tab strip.
  svg += rect(topX, 46, width - topX - 5, height - 51, 18, '#f7f7f8');
  svg += `<g role="tablist" aria-label="Open documents" clip-path="url(#tabsClip)">`;
  const available = width - tabsX - 180;
  const tabWidth = Math.min(258, available / Math.max(2, state.tabs.length));
  state.tabs.forEach((id, i) => {
    const x = tabsX + 9 + i * tabWidth, isActive = state.active === id;
    const title = id === 'chat' ? 'Portfolio review' : documents[id].short;
    const maxTitle = Math.max(0, Math.floor((tabWidth - (id === 'chat' ? 46 : 70)) / 7));
    const visibleTitle = maxTitle < 3 ? '' : title.length > maxTitle ? title.slice(0, maxTitle - 1) + '…' : title;
    svg += button('open', title, x, 6, tabWidth - 7, 36,
      `${icon(id === 'chat' ? 'chat' : 'file', x + 10, 15.5, 17, isActive ? '#637a6a' : '#96999c')}${text(visibleTitle, x + 37, 30, 13, isActive ? '#41474a' : '#8c9195', isActive ? 500 : 400)}`,
      { id, role: 'tab', active: isActive, fill: isActive ? '#fff' : 'none', radius: 9 });
    if (id !== 'chat') svg += iButton('close', `Close ${title}`, 'close', x + tabWidth - 42, 7, { id });
  });
  svg += iButton('menu', 'Open another file', 'plus', tabsX + 13 + state.tabs.length * tabWidth, 7, { id: 'files' });
  svg += '</g>';
  svg += iButton('drawer', 'Show conversation', 'chat', width - 120, 7, { active: state.drawer });
  svg += iButton('split', state.split ? 'Full document view' : 'Side-by-side view', state.split ? 'full' : 'split', width - 80, 7, { active: state.split });
  svg += iButton('sidebar', state.sidebar ? 'Hide sidebar' : 'Show sidebar', 'side', width - 41, 7);
  if (g) {
    // Document-specific toolbar stays stationary while content scrolls and magnifies.
    const fileW = Math.min(305, Math.max(195, l.mainWidth - 430));
    const fileCharacters = Math.max(14, Math.floor((fileW - 58) / 7));
    const fileLabel = activeDoc.title.length > fileCharacters ? activeDoc.title.slice(0, fileCharacters - 1) + '…' : activeDoc.title;
    svg += pill('menu', fileLabel, 'file', l.x + 16, 62, fileW, { id: 'files' });
    svg += icon('down', l.x + fileW - 12, 75, 14);
    if (l.mainWidth > 720) svg += pill('requestChanges', 'Request changes', null, l.x + fileW + 29, 62, 141);
    const percent = Math.round(g.scale * 100);
    svg += pill('menu', `${percent}%`, null, width - 147, 62, 88, { id: 'zoom' });
    svg += icon('down', width - 90, 74, 14);
    svg += button('download', 'Download current document', width - 49, 62, 38, 38, icon('download', width - 38, 72, 17, '#4e5155'), { fill: '#fff', radius: 19 });
    svg += `<g clip-path="url(#documentClip)">`;
    for (let page = 0; page < g.doc.pages; page++) svg += paper(g.doc, page, g, state);
    svg += '</g>';
    const scrollTrack = l.viewHeight - 26;
    const thumbHeight = Math.max(38, scrollTrack * l.viewHeight / g.totalHeight);
    const thumbY = l.top + 8 + (g.maxY ? g.view.scrollY / g.maxY * (scrollTrack - thumbHeight) : 0);
    svg += rect(width - 10, thumbY, 4, thumbHeight, 2, '#c8cacd', 'none', 'data-scroll-thumb="true"');
    if (l.splitWidth) {
      svg += rect(l.shellX + 1, 47, l.splitWidth - 1, height - 54, 0, '#fcfcfc');
      svg += `<path d="M${l.x} 47V${height - 8}" stroke="#e5e6e8"/>`;
      svg += `<g clip-path="url(#chatPaneClip)">`;
      svg += text('Portfolio review', l.shellX + 23, 89, 15, '#3f4347', 500);
      svg += messages(state, l, { split: true });
      svg += '</g>';
    }
    // Compact page indicators reveal a dockable thumbnail rail.
    const thumbTop = Math.max(l.top + 60, height / 2 - g.doc.pages * 18);
    for (let i = 0; i < g.doc.pages; i++) {
      const selected = g.page === i + 1;
      svg += button('page', `Page ${i + 1}`, l.x + 5, thumbTop + i * 28, 27, 26,
        rect(l.x + 10, thumbTop + i * 28 + 10, selected ? 16 : 10, 4, 2, selected ? '#9da6a0' : '#d1d5d2'), { value: i + 1 });
    }
    svg += button('thumbnails', 'Show page thumbnails', l.x + 3, thumbTop - 35, 30, 30,
      icon('files', l.x + 9, thumbTop - 28, 15, '#939d96'), { active: state.thumbnails });
    if (l.thumbnailProgress > 0) {
      svg += `<g opacity="${l.thumbnailProgress}">`;
      const tx = l.x + 8, ty = 114;
      svg += rect(tx, ty, 166, Math.min(height - ty - 124, g.doc.pages * 172 + 53), 14, '#fdfdfd', '#e5e8e6', 'filter="url(#soft)"');
      svg += text('Pages', tx + 15, ty + 28, 12, '#808a84');
      svg += iButton('thumbnails', 'Hide page thumbnails', 'close', tx + 122, ty + 5);
      for (let i = 0; i < g.doc.pages; i++) {
        const py = ty + 48 + i * 172;
        svg += button('page', `Go to page ${i + 1}`, tx + 25, py, 116, 145,
          rect(tx + 28, py + 3, 110, 139, 1, '#fff', g.page === i + 1 ? '#88a797' : '#dde3df') +
          text(i === 0 ? 'Alex Morgan' : 'Selected projects', tx + 40, py + 22, 7, '#638273', 500) +
          Array.from({length: 10}, (_, j) => rect(tx + 40, py + 35 + j * 8, j % 3 === 0 ? 61 : 84, 2, 0, '#d1d8d3')).join(''),
          { value: i + 1 });
        svg += text(String(i + 1), tx + 83, py + 160, 10, '#8c978f', 400, 'text-anchor="middle"');
      }
      svg += '</g>';
    }
  } else {
    svg += rect(l.x, 65, l.mainWidth - 6, height - 73, 0, '#fafafa');
    svg += messages(state, l, { chat: true });
  }
  // Floating composer, shared by full-reader, chat, and side-by-side modes.
  svg += rect(l.composerX - 24, l.composerY - 20, l.composerWidth + 48, 80, 0, 'url(#bottom)');
  if (state.drawer && g && !l.splitWidth) svg += messages(state, l);
  if (state.requestContext) {
    svg += rect(l.composerX + 12, l.composerY - 45, 200, 33, 16, '#fff', '#e4e7e5', 'filter="url(#soft)"');
    svg += icon('edit', l.composerX + 23, l.composerY - 35, 15, '#82978b');
    svg += text('Changes to this document', l.composerX + 45, l.composerY - 23, 11, '#65776c');
    svg += iButton('dismiss', 'Remove change request', 'close', l.composerX + 179, l.composerY - 45);
  }
  svg += rect(l.composerX, l.composerY, l.composerWidth, l.composerHeight, 22, '#ffffff', '#e5e6e7', 'filter="url(#soft)"');
  svg += iButton('menu', 'Attach an example file', 'plus', l.composerX + 11, l.composerY + 5, { id: 'attach', color: '#454a48' });
  if (!options.nativeInput) {
    const draft = state.drafts[state.active];
    const max = Math.max(15, Math.floor((l.composerWidth - 125) / 7));
    const rows = wrap(draft || 'Ask anything', max).slice(0, 4);
    rows.forEach((row, i) => { svg += text(row, l.composerX + 57, l.composerY + 28 + i * 22, 14, draft ? '#363e39' : '#a3a8a5'); });
  }
  const hasDraft = Boolean(state.drafts[state.active].trim());
  svg += button(hasDraft ? 'send' : 'voice', hasDraft ? 'Send message' : 'Voice preview', l.composerX + l.composerWidth - 39, l.composerY + 8, 28, 28,
    icon(hasDraft ? 'arrow' : 'wave', l.composerX + l.composerWidth - 34, l.composerY + 13, 18, '#fff'), { fill: '#222726', radius: 14, disabled: Boolean(state.requests[state.active]) });
  if (state.menu) {
    const zoom = state.menu === 'zoom';
    let x = zoom ? width - 181 : state.menu === 'attach' ? l.composerX : l.x + 16;
    const y = state.menu === 'attach' ? l.composerY - 117 : 108;
    const menuW = zoom ? 161 : 305;
    const choices = zoom ? [['Fit width', 'fit'], ['25%', 0.25], ['50%', 0.5], ['100%', 1], ['150%', 1.5], ['200%', 2]] : fileIds.map(id => [documents[id].title, id]);
    const menuH = 14 + choices.length * 42;
    svg += rect(x, y, menuW, menuH, 15, '#fff', '#e4e6e8', 'filter="url(#soft)"');
    choices.forEach(([title, value], i) => {
      svg += button(zoom ? 'zoom' : 'open', title, x + 6, y + 6 + i * 42, menuW - 12, 39,
        `${zoom ? '' : icon('file', x + 15, y + 18 + i * 42, 17, '#899d91')}${text(title, x + (zoom ? 18 : 42), y + 31 + i * 42, 13, '#525957')}`,
        zoom ? { value, active: value === 'fit' ? g?.view.fit : !g?.view.fit && Math.abs(g.scale - value) < 0.01 } : { id: value, active: state.active === value });
    });
  }
  if (state.notice) svg += rect(l.composerX + 65, l.composerY - 62, l.composerWidth - 130, 40, 20, '#313935') + text(state.notice, l.composerX + l.composerWidth / 2, l.composerY - 37, 12, '#fff', 400, 'text-anchor="middle"');
  if (options.pointer) {
    const p = options.pointer;
    if (p.down) svg += `<circle cx="${p.x}" cy="${p.y}" r="17" fill="#97b4a3" opacity=".2"/>`;
    svg += `<g transform="translate(${p.x} ${p.y})"><path d="M0 0 1 20l5-5 5 10 4-2-5-10h8Z" fill="#303834" stroke="#fff" stroke-width="1.5"/></g>`;
  }
  return svg + '</svg>';
}
