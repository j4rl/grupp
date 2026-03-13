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
  'natur': { label: '🌿 Natur', words: ['Granen', 'Eken', 'Björken', 'Tallen', 'Aspen', 'Linden', 'Almens', 'Rönnen', 'Viden', 'Sälgens', 'Enens', 'Häggens', 'Forsens', 'Sjöns', 'Flodens', 'Bergets', 'Dalens', 'Slättens'] },
  'mat': { label: '🍕 Mat', words: ['Pizzan', 'Tacos', 'Sushis', 'Burgarn', 'Pastas', 'Waffle', 'Muffins', 'Tårtan', 'Noodles', 'Curryn', 'Falafel', 'Paninis', 'Ramen', 'Gazpacho', 'Risotton', 'Crêpen', 'Wonton', 'Burritos', 'Tzatziki', 'Fondue'] },
  'färger': { label: '🎨 Färger', words: ['Kobolt', 'Scarlet', 'Safran', 'Smaragd', 'Karmin', 'Indigo', 'Cerise', 'Amber', 'Lavendel', 'Korall', 'Turkos', 'Purpur', 'Citrin', 'Azur', 'Magenta', 'Ocker', 'Sepia', 'Jade', 'Perla', 'Karminröd'] },
  'sport': { label: '⚽ Sport', words: ['Sprinters', 'Titans', 'Eagles', 'Phoenix', 'Vipers', 'Wolves', 'Sharks', 'Falcons', 'Storm', 'Blazers', 'Knights', 'Raiders', 'Comets', 'Thunder', 'Legends', 'Rebels', 'Warriors', 'Rangers', 'Hunters', 'Strikers'] },
  'musik': { label: '🎵 Musik', words: ['Allegro', 'Fortissimo', 'Staccato', 'Vibrato', 'Crescendo', 'Adagio', 'Pizzicato', 'Fermata', 'Serenad', 'Overtyren', 'Balladen', 'Sonatens', 'Rapsodi', 'Preludium', 'Nocturne', 'Etyd', 'Kadensen', 'Fuga', 'Arion', 'Legato'] },
  'mytologi': { label: '⚡ Mytologi', words: ['Zevs', 'Ares', 'Hermes', 'Poseidon', 'Athena', 'Apollo', 'Artemis', 'Hestia', 'Hefaist', 'Demeter', 'Dionys', 'Hades', 'Nyx', 'Iris', 'Nemesis', 'Eros', 'Titan', 'Kronos', 'Helios', 'Selene'] },
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

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if (ext === 'json') {
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        const arr = Array.isArray(data) ? data : Object.values(data).flat();
        arr.forEach(v => { const s = String(v).trim(); if (s) addUnique(s); });
        showToast(`✓ ${file.name} importerad`);
        updatePredict();
      } catch { showToast('Ogiltig JSON-fil'); }
    };
    reader.readAsText(file);
  } else if (ext === 'txt') {
    reader.onload = e => {
      e.target.result.split(/[\n,]+/).forEach(n => { const s = n.trim(); if (s) addUnique(s); });
      showToast(`✓ ${file.name} importerad`);
      renderNames(); updatePredict();
    };
    reader.readAsText(file);
  } else if (ext === 'csv') {
    reader.onload = e => {
      const lines = e.target.result.split('\n');
      lines.forEach(line => {
        line.split(',').forEach(cell => { const s = cell.replace(/"/g, '').trim(); if (s) addUnique(s); });
      });
      showToast(`✓ ${file.name} importerad`);
      renderNames(); updatePredict();
    };
    reader.readAsText(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    reader.onload = e => {
      try {
        // Simple XLSX text extraction fallback (without library)
        showToast('Excel: använd CSV-export för bästa resultat');
      } catch { showToast('Kunde inte läsa Excel-fil'); }
    };
    reader.readAsArrayBuffer(file);

    // Try to load SheetJS dynamically
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => {
        const reader2 = new FileReader();
        reader2.onload = e2 => {
          const wb = XLSX.read(new Uint8Array(e2.target.result), { type: 'array' });
          wb.SheetNames.forEach(sn => {
            const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
            sheet.flat().forEach(v => { const s = String(v).trim(); if (s && s !== 'undefined') addUnique(s); });
          });
          showToast(`✓ ${file.name} importerad`);
          renderNames(); updatePredict();
        };
        reader2.readAsArrayBuffer(file);
      };
      document.head.appendChild(script);
    } else {
      const reader2 = new FileReader();
      reader2.onload = e2 => {
        const wb = XLSX.read(new Uint8Array(e2.target.result), { type: 'array' });
        wb.SheetNames.forEach(sn => {
          const sheet = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
          sheet.flat().forEach(v => { const s = String(v).trim(); if (s && s !== 'undefined') addUnique(s); });
        });
        showToast(`✓ ${file.name} importerad`);
        renderNames(); updatePredict();
      };
      reader2.readAsArrayBuffer(file);
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

function renderGroups(groups) {
  const area = document.getElementById('resultsArea');
  const grid = document.getElementById('groupsGrid');
  const badge = document.getElementById('resultsBadge');

  area.classList.add('visible');
  badge.textContent = `${groups.length} grupper`;
  grid.innerHTML = '';

  // Reset theme pool for fresh shuffle each generation
  const pool = THEMES[activeTheme]?.words || [];
  window._themePool = [...pool].sort(() => Math.random() - 0.5);

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
        ${members.map(m => `<div class="member"><div class="member-dot" style="background:${color};"></div>${m}</div>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });

  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// Init
buildThemePicker();
renderNames();
updatePredict();

});
