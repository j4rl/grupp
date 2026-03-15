document.addEventListener('DOMContentLoaded', () => {

// --- Theme ---
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  document.querySelectorAll('#themeToggle button').forEach((btn, i) => {
    btn.classList.toggle('active', ['light', 'auto', 'dark'][i] === t);
  });
}
(function initTheme() {
  const saved = localStorage.getItem('theme') || 'auto';
  setTheme(saved);
})();

// --- State ---
let names = [];
let mode = 'antal'; // 'antal' | 'storlek'
let numValue = 4;
let nameStyle = 'nummer'; // 'nummer' | 'tema' | 'eget'
let activeTheme = 'djur';

const THEMES = {
  'djur': { label: '🐾 Djur', words: ['Räven', 'Björnen', 'Vargen', 'Örnen', 'Tigern', 'Lejonet', 'Delfinen', 'Falken', 'Lodjuret', 'Älgen', 'Hajen', 'Korpen', 'Puman', 'Gazelln', 'Bävern', 'Igelkotten', 'Flodhästen', 'Geparden', 'Zebran', 'Pingvinen'] },
  'rymden': { label: '🚀 Rymden', words: ['Orion', 'Nebula', 'Cassini', 'Hubble', 'Apollo', 'Sirius', 'Vega', 'Polaris', 'Andromeda', 'Titan', 'Aurora', 'Cosmos', 'Lyra', 'Cygnus', 'Altair', 'Rigel', 'Antares', 'Deneb', 'Proxima', 'Quasar'] },
  'latin': { label: '🏛️ Latin', words: ['Aquila', 'Lupus', 'Leo', 'Draco', 'Vulpes', 'Corvus', 'Orbis', 'Lumen', 'Nexus', 'Vox', 'Terra', 'Ignis', 'Aqua', 'Ventus', 'Stella', 'Luna', 'Sol', 'Astra', 'Magnus', 'Fortis'] },
  'mat': { label: '🍕 Mat', words: ['Pizzan', 'Tacos', 'Sushis', 'Burgarn', 'Pastas', 'Waffle', 'Muffins', 'Tårtan', 'Noodles', 'Curryn', 'Falafel', 'Paninis', 'Ramen', 'Gazpacho', 'Risotton', 'Crêpen', 'Wonton', 'Burritos', 'Tzatziki', 'Fondue'] },
  'färger': { label: '🎨 Färger', words: ['Kobolt', 'Scarlet', 'Safran', 'Smaragd', 'Karmin', 'Indigo', 'Cerise', 'Amber', 'Lavendel', 'Korall', 'Turkos', 'Purpur', 'Citrin', 'Azur', 'Magenta', 'Ocker', 'Sepia', 'Jade', 'Perla', 'Karminröd'] },
  'sport': { label: '⚽ Sport', words: ['Sprinters', 'Titans', 'Eagles', 'Phoenix', 'Vipers', 'Wolves', 'Sharks', 'Falcons', 'Storm', 'Blazers', 'Knights', 'Raiders', 'Comets', 'Thunder', 'Legends', 'Rebels', 'Warriors', 'Rangers', 'Hunters', 'Strikers'] },
  'musik': { label: '🎵 Musik', words: ['Allegro', 'Fortissimo', 'Staccato', 'Vibrato', 'Crescendo', 'Adagio', 'Pizzicato', 'Fermata', 'Serenad', 'Rapsodi', 'Preludium', 'Nocturne', 'Etyd', 'Kadens', 'Fuga', 'Arion', 'Legato'] },
  'mytologi': { label: '⚡ Mytologi', words: ['Zeus', 'Ares', 'Hermes', 'Poseidon', 'Athena', 'Apollo', 'Artemis', 'Hestia', 'Hefaist', 'Demeter', 'Dionys', 'Hades', 'Nyx', 'Iris', 'Nemesis', 'Eros', 'Titan', 'Kronos', 'Helios', 'Selene'] },
  'nordiskMytologi': { label: '🪓 Nordisk mytologi', words: ['Oden', 'Tor', 'Freja', 'Loki', 'Balder', 'Frigg', 'Tyr', 'Heimdall', 'Vidar', 'Brage', 'Idun', 'Skade', 'Njord', 'Ran', 'Mimer', 'Fenrir', 'Jormungand', 'Sleipner', 'Yggdrasil', 'Asgard'] },
};

function setNameStyle(style) {
  nameStyle = style;
  const idMap = { 'nummer': 'nameStyleNum', 'tema': 'nameStyleTheme', 'eget': 'nameStyleCustom' };
  Object.values(idMap).forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById(idMap[style]).classList.add('active');
  document.getElementById('themePickerWrap').style.display = style === 'tema' ? 'block' : 'none';
  document.getElementById('customPrefixWrap').style.display = style === 'eget' ? 'block' : 'none';
}

function buildThemePicker() {
  const picker = document.getElementById('themePicker');
  Object.entries(THEMES).forEach(([key, val]) => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn' + (key === activeTheme ? ' active' : '');
    btn.textContent = val.label;
    btn.onclick = () => {
      activeTheme = key;
      picker.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
    picker.appendChild(btn);
  });
}

function getGroupName(i, total) {
  if (nameStyle === 'nummer') return `GRUPP ${i + 1}`;
  if (nameStyle === 'eget') {
    const prefix = document.getElementById('customPrefix').value.trim() || 'Grupp';
    return `${prefix} ${i + 1}`;
  }
  if (nameStyle === 'tema') {
    const pool = THEMES[activeTheme].words;
    // Pre-shuffle pool for this generation, stored in window._themePool
    if (!window._themePool) window._themePool = [...pool].sort(() => Math.random() - 0.5);
    return window._themePool[i % pool.length];
  }
  return `GRUPP ${i + 1}`;
}

// --- Name Management ---
function addName(n) {
  const input = document.getElementById('nameInput');
  const name = (n || input.value).trim();
  if (!name) return;
  if (names.includes(name)) { showToast(`"${name}" finns redan`); input.value = ''; return; }
  names.push(name);
  input.value = '';
  renderNames();
  updatePredict();
}

function removeName(i) {
  names.splice(i, 1);
  renderNames();
  updatePredict();
}

function clearAll() {
  if (!names.length) return;
  names = [];
  renderNames();
  updatePredict();
  document.getElementById('resultsArea').classList.remove('visible');
}

function renderNames() {
  const list = document.getElementById('nameList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('nameCount');
  list.innerHTML = '';
  if (!names.length) {
    list.appendChild(empty);
    count.innerHTML = '';
    return;
  }
  names.forEach((n, i) => {
    const tag = document.createElement('div');
    tag.className = 'name-tag';
    tag.innerHTML = `${n}<button onclick="removeName(${i})" title="Ta bort">×</button>`;
    list.appendChild(tag);
  });
  count.innerHTML = `Totalt: <span>${names.length}</span> deltagare`;
}

// --- Import ---
document.getElementById('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') addName(); });

document.getElementById('fileInput').addEventListener('change', e => {
  Array.from(e.target.files).forEach(handleFile);
  e.target.value = '';
});

const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  Array.from(e.dataTransfer.files).forEach(handleFile);
});

// --- Import Analysis & Modal ---
let _pendingImport = null;

const NAME_KW  = ['namn','name','förnamn','efternamn','firstname','lastname','first','last','elev','student','deltagare','person','fullname','full','givenname','surname','familyname'];
const FIRST_KW = ['förnamn','firstname','first name','first','givenname','given','för'];
const LAST_KW  = ['efternamn','lastname','last name','last','surname','familyname','family','efter'];

function scoreCol(header, samples) {
  let score = 0;
  const h = (header || '').toLowerCase().trim();
  if (NAME_KW.some(k => h === k || h.includes(k))) score += 10;
  for (const v of samples) {
    const s = String(v ?? '').trim();
    if (!s || s === 'undefined') continue;
    if (/^\d+$/.test(s)) { score -= 2; continue; }
    if (/[A-ZÅÄÖ]/.test(s[0]) && s.length > 1 && s.length < 40) score += 2;
  }
  return score;
}

function analyzeRows(rows) {
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map(r => r.length));
  if (!colCount) return null;
  const firstRow = rows[0].map(c => String(c ?? '').trim());
  const hasHeaders = rows.length > 1 && firstRow.every(c => c && !/^\d+(\.\d+)?$/.test(c));
  const headers  = hasHeaders ? firstRow : Array.from({ length: colCount }, (_, i) => `Kolumn ${i + 1}`);
  const dataRows = hasHeaders ? rows.slice(1) : rows;
  if (!dataRows.length) return null;
  const scores = headers.map((header, col) => ({
    col, header,
    score: scoreCol(header, dataRows.slice(0, 8).map(r => r[col])),
    samples: dataRows.slice(0, 5).map(r => String(r[col] ?? '').trim())
  }));
  let firstCol = null, lastCol = null;
  if (hasHeaders) {
    headers.forEach((h, col) => {
      const hl = h.toLowerCase();
      if (FIRST_KW.some(k => hl === k || hl.includes(k))) firstCol = col;
      if (LAST_KW.some(k => hl === k || hl.includes(k)))  lastCol  = col;
    });
  }
  const mergeFirstLast = firstCol !== null && lastCol !== null && firstCol !== lastCol;
  const bestCol = [...scores].sort((a, b) => b.score - a.score)[0]?.col ?? 0;
  return { hasHeaders, headers, dataRows, scores, bestCol, mergeFirstLast, firstCol, lastCol, colCount };
}

function showImportModal(filename, analysis) {
  const { headers, dataRows, scores, mergeFirstLast, firstCol, lastCol, colCount, hasHeaders } = analysis;
  const initSel = mergeFirstLast ? [firstCol, lastCol].sort((a, b) => a - b) : [analysis.bestCol];
  _pendingImport = { analysis, filename, selected: [...initSel] };

  const colCards = scores.map(({ col, header, samples }) => {
    const badge = col === firstCol ? '<span class="ia-badge ia-first">Förnamn</span>'
                : col === lastCol  ? '<span class="ia-badge ia-last">Efternamn</span>' : '';
    const sHtml = samples.filter(Boolean).slice(0, 3).map(s => `<span class="ia-sample">${s}</span>`).join('');
    return `<div class="ia-col-card${initSel.includes(col) ? ' selected' : ''}" data-col="${col}" onclick="toggleColCard(${col})">
      <div class="ia-col-head"><span class="ia-col-name">${header}</span>${badge}</div>
      <div class="ia-col-samples">${sHtml || '<span class="ia-sample ia-muted">–</span>'}</div>
    </div>`;
  }).join('');

  const previewRows = dataRows.slice(0, 5).map(row =>
    `<tr>${headers.map((_, i) => `<td>${String(row[i] ?? '').trim()}</td>`).join('')}</tr>`
  ).join('');

  document.getElementById('importModalBody').innerHTML = `
    <div class="ia-filename">${filename}</div>
    <div class="ia-meta">${hasHeaders ? '✓ Rubriker hittades' : 'Inga rubriker'} &nbsp;·&nbsp; ${colCount} kolumn${colCount !== 1 ? 'er' : ''} &nbsp;·&nbsp; ${dataRows.length} rader</div>
    <div class="ia-hint">Klicka för att välja kolumn(er) — välj flera för att slå ihop med mellanslag</div>
    <div class="ia-merge-note" id="iaMergeNote" style="display:none;"></div>
    <div class="ia-col-cards" id="iaColCards">${colCards}</div>
    <div class="ia-preview-wrap"><table class="ia-preview">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${previewRows}</tbody>
    </table></div>
  `;
  document.getElementById('importModal').style.display = 'flex';
  updateMergeNote();
}

function updateMergeNote() {
  const el = document.getElementById('iaMergeNote');
  if (!el || !_pendingImport) return;
  const sel = _pendingImport.selected;
  if (sel.length > 1) {
    const colNames = sel.map(c => `"${_pendingImport.analysis.headers[c]}"`).join(' + ');
    el.textContent = `↔ ${colNames} slås ihop med mellanslag`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

function toggleColCard(col) {
  if (!_pendingImport) return;
  const sel = _pendingImport.selected;
  const idx = sel.indexOf(col);
  if (idx === -1) {
    sel.push(col);
  } else if (sel.length > 1) {
    sel.splice(idx, 1);
  }
  sel.sort((a, b) => a - b);
  document.querySelectorAll('#iaColCards .ia-col-card').forEach(el =>
    el.classList.toggle('selected', sel.includes(+el.dataset.col))
  );
  updateMergeNote();
}

function confirmImport() {
  if (!_pendingImport) return;
  const { analysis, selected, filename } = _pendingImport;
  const { dataRows } = analysis;
  dataRows.forEach(row => {
    const parts = selected.map(col => String(row[col] ?? '').trim()).filter(s => s && s !== 'undefined');
    const full = parts.join(' ');
    if (full) addUnique(full);
  });
  renderNames(); updatePredict();
  showToast(`✓ ${filename} importerad`);
  closeImportModal();
}

function closeImportModal() {
  document.getElementById('importModal').style.display = 'none';
  _pendingImport = null;
}

function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  const sep = (lines[0] || '').includes(';') ? ';' : ',';
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else { inQ = !inQ; } }
      else if (ch === sep && !inQ) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    if (cells.some(c => c)) rows.push(cells);
  }
  return rows;
}

function decodeFileBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF)
    return new TextDecoder('utf-8').decode(bytes.subarray(3));
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE)
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF)
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    try { return new TextDecoder('windows-1252').decode(buffer); }
    catch { return new TextDecoder('iso-8859-1').decode(buffer); }
  }
}

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if (ext === 'json') {
    reader.onload = e => {
      try {
        const text = decodeFileBuffer(e.target.result);
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length && data[0] !== null && typeof data[0] === 'object') {
          const headers = Object.keys(data[0]);
          const rows = [headers, ...data.map(obj => headers.map(k => obj[k] ?? ''))];
          const analysis = analyzeRows(rows);
          if (analysis && (analysis.colCount > 1 || analysis.hasHeaders)) return showImportModal(file.name, analysis);
        }
        const arr = Array.isArray(data) ? data : Object.values(data).flat();
        arr.forEach(v => { const s = String(v).trim(); if (s) addUnique(s); });
        renderNames(); updatePredict();
        showToast(`✓ ${file.name} importerad`);
      } catch { showToast('Ogiltig JSON-fil'); }
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'txt') {
    reader.onload = e => {
      const text = decodeFileBuffer(e.target.result);
      text.split(/[\n,]+/).forEach(n => { const s = n.trim(); if (s) addUnique(s); });
      renderNames(); updatePredict();
      showToast(`✓ ${file.name} importerad`);
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'csv') {
    reader.onload = e => {
      const text = decodeFileBuffer(e.target.result);
      const analysis = analyzeRows(parseCSV(text));
      if (!analysis) return showToast('Tom fil');
      if (analysis.colCount === 1 && !analysis.hasHeaders) {
        analysis.dataRows.forEach(r => { const s = String(r[0] ?? '').trim(); if (s) addUnique(s); });
        renderNames(); updatePredict();
        showToast(`✓ ${file.name} importerad`);
      } else {
        showImportModal(file.name, analysis);
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    const processXLSX = buffer => {
      const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
      const analysis = analyzeRows(rows);
      if (!analysis) return showToast('Tom fil');
      if (analysis.colCount === 1 && !analysis.hasHeaders) {
        analysis.dataRows.forEach(r => { const s = String(r[0] ?? '').trim(); if (s) addUnique(s); });
        renderNames(); updatePredict();
        showToast(`✓ ${file.name} importerad`);
      } else {
        showImportModal(file.name, analysis);
      }
    };
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => { const r2 = new FileReader(); r2.onload = e2 => processXLSX(e2.target.result); r2.readAsArrayBuffer(file); };
      document.head.appendChild(script);
    } else {
      reader.onload = e => processXLSX(e.target.result);
      reader.readAsArrayBuffer(file);
    }
  } else {
    showToast('Filformat stöds ej');
  }
}

function addUnique(name) {
  if (name && !names.includes(name)) names.push(name);
}

function togglePaste() {
  const area = document.getElementById('pasteArea');
  area.style.display = area.style.display === 'none' ? 'block' : 'none';
}

function importPaste() {
  const text = document.getElementById('pasteInput').value;
  text.split(/[\n,]+/).forEach(n => { const s = n.trim(); if (s) addUnique(s); });
  document.getElementById('pasteInput').value = '';
  togglePaste();
  renderNames(); updatePredict();
  showToast(`✓ Namn importerade`);
}

// --- Settings ---
function setMode(m) {
  mode = m;
  document.getElementById('modeAntal').classList.toggle('active', m === 'antal');
  document.getElementById('modeStorlek').classList.toggle('active', m === 'storlek');
  document.getElementById('numLabel').textContent = m === 'antal' ? 'ANTAL GRUPPER' : 'STORLEK PER GRUPP';
  updatePredict();
}

function changeNum(d) {
  numValue = Math.max(1, numValue + d);
  document.getElementById('numDisplay').textContent = numValue;
  updatePredict();
}

function updatePredict() {
  const p = document.getElementById('predictText');
  const n = names.length;
  if (!n) { p.textContent = ''; return; }
  if (mode === 'antal') {
    if (numValue > n) { p.innerHTML = `⚠ Fler grupper än deltagare`; return; }
    const base = Math.floor(n / numValue);
    const rem = n % numValue;
    if (rem === 0) p.innerHTML = `→ <strong>${numValue} grupper</strong> med <strong>${base} pers</strong> var`;
    else p.innerHTML = `→ <strong>${numValue} grupper</strong>: ${numValue - rem}×${base} och ${rem}×${base + 1} pers`;
  } else {
    if (numValue > n) { p.innerHTML = `⚠ Storlek större än antal deltagare`; return; }
    const g = Math.ceil(n / numValue);
    p.innerHTML = `→ <strong>${g} grupper</strong> med upp till <strong>${numValue} pers</strong>`;
  }
}

// --- Generate ---
function generateGroups() {
  if (!names.length) { showToast('Lägg till namn först!'); return; }

  const shuffled = [...names].sort(() => Math.random() - 0.5);
  let groups = [];

  if (mode === 'antal') {
    if (numValue > shuffled.length) { showToast('Fler grupper än deltagare!'); return; }
    const base = Math.floor(shuffled.length / numValue);
    const rem = shuffled.length % numValue;
    let idx = 0;
    for (let i = 0; i < numValue; i++) {
      const size = base + (i < rem ? 1 : 0);
      groups.push(shuffled.slice(idx, idx + size));
      idx += size;
    }
  } else {
    if (numValue > shuffled.length) { showToast('Storlek större än antal deltagare!'); return; }
    const numGroups = Math.ceil(shuffled.length / numValue);
    const keep = document.getElementById('keepRemainder').checked;
    if (keep) {
      // Distribute evenly like mode=antal but with numGroups
      const base = Math.floor(shuffled.length / numGroups);
      const rem = shuffled.length % numGroups;
      let idx = 0;
      for (let i = 0; i < numGroups; i++) {
        const size = base + (i < rem ? 1 : 0);
        groups.push(shuffled.slice(idx, idx + size));
        idx += size;
      }
    } else {
      for (let i = 0; i < shuffled.length; i += numValue) {
        groups.push(shuffled.slice(i, i + numValue));
      }
    }
  }

  renderGroups(groups);
}

function renderGroups(groups, preserveTheme = false) {
  const area = document.getElementById('resultsArea');
  const grid = document.getElementById('groupsGrid');
  const badge = document.getElementById('resultsBadge');

  area.classList.add('visible');
  badge.textContent = `${groups.length} grupper`;
  grid.innerHTML = '';

  // Reset theme pool for fresh shuffle each generation (skip on drag-swap re-render)
  if (!preserveTheme) {
    const pool = THEMES[activeTheme]?.words || [];
    window._themePool = [...pool].sort(() => Math.random() - 0.5);
    window._lastThemePool = [...window._themePool];
  }

  const colors = ['#c8f03c', '#7b61ff', '#ff9d3c', '#3cf0e0', '#ff5a9d', '#3c9dff', '#ff3c3c', '#a3ff8a'];

  groups.forEach((members, i) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const color = colors[i % colors.length];
    const groupName = getGroupName(i, groups.length);
    card.innerHTML = `
      <div class="group-header" style="border-left: 3px solid ${color};">
        <span class="group-num">${groupName}</span>
        <span class="group-size">${members.length} pers</span>
      </div>
      <div class="group-members">
        ${members.map((m, mi) => `<div class="member" draggable="true" data-group="${i}" data-member="${mi}"><div class="member-dot" style="background:${color};"></div>${m}</div>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });

  if (!preserveTheme) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window._lastGroups = groups;
}

// --- Export ---
function copyResult() {
  if (!window._lastGroups) return;
  // Rebuild names using same pool
  const pool = THEMES[activeTheme]?.words || [];
  window._themePool = [...(window._lastThemePool || pool)];
  const text = window._lastGroups.map((g, i) => `${getGroupName(i, window._lastGroups.length)}:\n${g.join('\n')}`).join('\n\n');
  navigator.clipboard.writeText(text).then(() => showToast('✓ Kopierat till urklipp'));
}

function downloadResult() {
  if (!window._lastGroups) return;
  const text = window._lastGroups.map((g, i) => `${getGroupName(i, window._lastGroups.length)}:\n${g.join('\n')}`).join('\n\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'grupper.txt';
  a.click();
  showToast('✓ Fil nedladdad');
}

function downloadPDF() {
  if (!window._lastGroups) return;
  document.getElementById('printDate').textContent = new Date().toLocaleDateString('sv-SE');
  window.print();
}
// --- Drag-to-swap ---
let _drag = null;

function initDragSwap() {
  const grid = document.getElementById('groupsGrid');

  grid.addEventListener('dragstart', e => {
    const el = e.target.closest('.member[draggable]');
    if (!el) return;
    _drag = { groupIdx: +el.dataset.group, memberIdx: +el.dataset.member };
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  grid.addEventListener('dragend', () => {
    grid.querySelectorAll('.member.dragging, .member.drag-over').forEach(el => {
      el.classList.remove('dragging', 'drag-over');
    });
    _drag = null;
  });

  grid.addEventListener('dragover', e => {
    const el = e.target.closest('.member[draggable]');
    if (!el || !_drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    grid.querySelectorAll('.member.drag-over').forEach(m => m.classList.remove('drag-over'));
    if (+el.dataset.group !== _drag.groupIdx || +el.dataset.member !== _drag.memberIdx) {
      el.classList.add('drag-over');
    }
  });

  grid.addEventListener('dragleave', e => {
    const el = e.target.closest('.member[draggable]');
    if (el) el.classList.remove('drag-over');
  });

  grid.addEventListener('drop', e => {
    e.preventDefault();
    const el = e.target.closest('.member[draggable]');
    if (!el || !_drag) return;
    const toGroup = +el.dataset.group;
    const toMember = +el.dataset.member;
    if (toGroup === _drag.groupIdx && toMember === _drag.memberIdx) return;
    // Swap in _lastGroups
    const groups = window._lastGroups;
    const tmp = groups[_drag.groupIdx][_drag.memberIdx];
    groups[_drag.groupIdx][_drag.memberIdx] = groups[toGroup][toMember];
    groups[toGroup][toMember] = tmp;
    renderGroups(groups, true);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

Object.assign(window, {
  setTheme,
  addName,
  removeName,
  clearAll,
  togglePaste,
  importPaste,
  setMode,
  changeNum,
  setNameStyle,
  generateGroups,
  copyResult,
  downloadResult,
  downloadPDF,
  toggleColCard,
  confirmImport,
  closeImportModal,
});

// Init
buildThemePicker();
renderNames();
updatePredict();
initDragSwap();

});
