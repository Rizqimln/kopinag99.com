// Util: generate random numeric string
function randDigits(len) {
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
}

function formatRupiah(num) {
    if (!num && num !== 0) return '-';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// Storage key
const KEY = 'redeem_codes_v1';

function loadCodes() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch (e) { return [] }
}
function saveCodes(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

// Render table
function renderTable() {
    const tbody = document.querySelector('#codesTable tbody');
    tbody.innerHTML = '';
    const codes = loadCodes();
    codes.sort((a, b) => b.createdAt - a.createdAt);
    const now = Date.now();
    codes.forEach((c, idx) => {
        const tr = document.createElement('tr');
        const expired = now > c.expiresAt;
        tr.innerHTML = `
          <td><code>${c.code}</code></td>
          <td>${formatRupiah(c.nominal)}</td>
          <td class="muted">${new Date(c.createdAt).toLocaleString()}</td>
          <td class="muted">${new Date(c.expiresAt).toLocaleString()}${expired ? '<div class="chip danger">EXPIRED</div>' : ''}</td>
          <td>${c.redeemed ? '<span class="chip success">TERPAKAI</span>' : (expired ? '<span class="chip danger">KADALUARSA</span>' : '<span class="chip">AKTIF</span>')}</td>
          <td><div class="row"><button data-idx="${idx}" class="redeemBtn">Tandai Terpakai</button><button data-idx="${idx}" class="delBtn">Hapus</button></div></td>
        `;
        tbody.appendChild(tr);
    });
    // attach listeners
    document.querySelectorAll('.redeemBtn').forEach(b => b.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        const arr = loadCodes();
        // idx is after sort — we used descending createdAt, so map accordingly
        // find by code
        const code = arr.sort((a, b) => b.createdAt - a.createdAt)[idx];
        if (!code) return alert('Kode tidak ditemukan');
        if (code.redeemed) return alert('Kode sudah ditandai terpakai');
        code.redeemed = true;
        saveCodes(arr);
        renderTable();
    }));
    document.querySelectorAll('.delBtn').forEach(b => b.addEventListener('click', e => {
        const idx = Number(e.currentTarget.dataset.idx);
        const arr = loadCodes();
        const code = arr.sort((a, b) => b.createdAt - a.createdAt)[idx];
        if (!code) return;
        const filtered = arr.filter(x => x.code !== code.code || x.createdAt !== code.createdAt);
        saveCodes(filtered);
        renderTable();
    }));
}

// UI elements
const codeDisplay = document.getElementById('codeDisplay');
const copyBtn = document.getElementById('copyBtn');
const printBtn = document.getElementById('printBtn');
const countdown = document.getElementById('countdown');
let countdownInterval = null;

function showGenerated(obj) {
    codeDisplay.textContent = obj.code;
    document.getElementById('qrcode').innerHTML = '';
    new QRCode(document.getElementById('qrcode'), { text: JSON.stringify({ code: obj.code, nominal: obj.nominal }), width: 128, height: 128 });
    try { JsBarcode('#barcode', obj.code, { format: 'CODE128', displayValue: true, width: 2, height: 40 }); } catch (e) { console.warn(e) }

    // countdown
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        const now = Date.now();
        const diff = obj.expiresAt - now;
        if (diff <= 0) { countdown.textContent = 'Kedaluwarsa'; clearInterval(countdownInterval); renderTable(); return; }
        const m = Math.floor(diff / 60000); const s = Math.floor((diff % 60000) / 1000);
        countdown.textContent = `Sisa waktu: ${m} menit ${s} detik (exp ${new Date(obj.expiresAt).toLocaleString()})`;
    }, 300);
}

// Generate single code
function generateOne() {
    const nominal = Number(document.getElementById('nominal').value) || 0;
    const len = Number(document.getElementById('length').value) || 8;
    const prefix = (document.getElementById('prefix').value || '').toString();
    const expiryMin = Number(document.getElementById('expiry').value) || 60;
    const body = randDigits(len);
    const code = prefix + body;
    const now = Date.now();
    const obj = { code, nominal, prefix, createdAt: now, expiresAt: now + expiryMin * 60000, redeemed: false };
    const arr = loadCodes();
    arr.push(obj); saveCodes(arr);
    renderTable();
    showGenerated(obj);
    return obj;
}

document.getElementById('generate').addEventListener('click', () => {
    generateOne();
});
document.getElementById('generate10').addEventListener('click', () => {
    const n = 10; const out = []; for (let i = 0; i < n; i++) out.push(generateOne()); alert(n + ' kode telah digenerate dan disimpan.');
});

copyBtn.addEventListener('click', () => {
    const txt = codeDisplay.textContent.trim();
    if (!txt || txt.startsWith('-')) return alert('Belum ada kode');
    navigator.clipboard.writeText(txt).then(() => alert('Kode disalin: ' + txt));
});

printBtn.addEventListener('click', () => {
    const txt = codeDisplay.textContent.trim();
    if (!txt || txt.startsWith('-')) return alert('Belum ada kode');
    const w = window.open('', '_blank');
    w.document.write(`<pre style="font-size:28px">Kode: ${txt}</pre>`);
    const svg = document.getElementById('barcode').outerHTML;
    w.document.write(svg);
    const qr = document.getElementById('qrcode').innerHTML;
    w.document.write(qr);
    w.document.close();
    w.print();
});

// export JSON/CSV
document.getElementById('exportJson').addEventListener('click', () => {
    const arr = loadCodes();
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'redeem_codes.json'; a.click(); URL.revokeObjectURL(url);
});

function toCSV(arr) {
    const lines = ['code,nominal,createdAt,expiresAt,redeemed'];
    arr.forEach(r => lines.push(`${r.code},${r.nominal},${r.createdAt},${r.expiresAt},${r.redeemed}`));
    return lines.join('\n');
}
document.getElementById('exportCsv').addEventListener('click', () => {
    const arr = loadCodes();
    const blob = new Blob([toCSV(arr)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'redeem_codes.csv'; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('clearStorage').addEventListener('click', () => {
    if (!confirm('Hapus semua kode yang tersimpan di browser?')) return;
    localStorage.removeItem(KEY); renderTable(); alert('Dihapus.');
});

// init
renderTable();