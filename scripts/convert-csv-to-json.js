#!/usr/bin/env node
/**
 * Fetches the KPM school list from Google Sheets (CSV export) and converts to JSON.
 * Usage: node scripts/convert-csv-to-json.js
 * Env: SHEET_CSV_URL (optional) - default is the public export URL for the plan sheet.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Must use /export?format=csv&gid=... (not /edit) to get CSV. gid = sheet tab id from the edit URL.
const SHEET_CSV_URL =
  process.env.SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/18Uh1UtPHDoo7WM38ax8A1BzH7fvQOnKKr4V0P9w1QfU/export?format=csv&gid=1678771376';

const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'schools.json');

// Map sheet column names to normalized keys
const HEADER_MAP = {
  NEGERI: 'negeri',
  PPD: 'ppd',
  PARLIMEN: 'parlimen',
  DUN: 'dun',
  PERINGKAT: 'peringkat',
  'JENIS/LABEL': 'jenis',
  KODSEKOLAH: 'kodSekolah',
  NAMASEKOLAH: 'namaSekolah',
  ALAMATSURAT: 'alamat',
  POSKODSURAT: 'poskod',
  BANDARSURAT: 'bandar',
  NOTELEFON: 'telefon',
  NOFAX: 'fax',
  EMAIL: 'email',
  LOKASI: 'lokasi',
  GRED: 'gred',
  BANTUAN: 'bantuan',
  BILSESI: 'bilSesi',
  SESI: 'sesi',
  'ENROLMEN PRASEKOLAH': 'enrolmenPrasekolah',
  ENROLMEN: 'enrolmen',
  'ENROLMEN KHAS': 'enrolmenKhas',
  GURU: 'guru',
  PRASEKOLAH: 'prasekolah',
  INTEGRASI: 'integrasi',
  KOORDINATXX: 'lng',
  KOORDINATYY: 'lat',
  'SKM<=150': 'skmUnder150',
};

function resolveRedirectUrl(base, location) {
  if (location.startsWith('http://') || location.startsWith('https://')) return location;
  try {
    const u = new URL(base);
    return new URL(location, u.origin).href;
  } catch {
    return location;
  }
}

function fetchCsv(url, redirectCount = 0) {
  const maxRedirects = 5;
  if (redirectCount > maxRedirects) {
    return Promise.reject(new Error('Too many redirects'));
  }
  const protocol = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const req = protocol.get(url, { headers: { 'User-Agent': 'KPM-School-Sync/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = resolveRedirectUrl(url, res.headers.location);
        return fetchCsv(next, redirectCount + 1).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
  });
}

/**
 * Split CSV text into logical rows. Newlines inside double-quoted fields are not treated as row breaks.
 */
function splitCsvIntoRows(csvText) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];
    if (c === '"') {
      inQuotes = !inQuotes;
      cur += c;
    } else if (!inQuotes && (c === '\n' || (c === '\r' && next === '\n'))) {
      if (c === '\r') i++;
      rows.push(cur);
      cur = '';
    } else if (!inQuotes && c === '\r') {
      rows.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) rows.push(cur);
  return rows;
}

function unquote(val) {
  if (val === undefined || val === null) return val;
  const s = String(val).trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/""/g, '"').trim();
  }
  return s;
}

function parseCsv(csvText) {
  const lines = splitCsvIntoRows(csvText).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const rawHeaders = parseCsvLine(lines[0]).map(unquote);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]).map(unquote);
    const row = {};
    rawHeaders.forEach((h, idx) => {
      const key = HEADER_MAP[h?.trim()] || h?.trim()?.replace(/\s+/g, '_') || `col_${idx}`;
      row[key] = values[idx];
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function normalizeRow(row) {
  const num = (v) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(String(v).replace(/,/g, ''));
    return Number.isNaN(n) ? undefined : n;
  };
  return {
    ...row,
    enrolmenPrasekolah: num(row.enrolmenPrasekolah),
    enrolmen: num(row.enrolmen),
    enrolmenKhas: num(row.enrolmenKhas),
    guru: num(row.guru),
    lat: num(row.lat),
    lng: num(row.lng),
  };
}

function filterValidSchools(rows) {
  return rows.filter((r) => r.kodSekolah && String(r.kodSekolah).trim());
}

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function main() {
  console.log('Fetching CSV from', SHEET_CSV_URL);
  let csvText;
  try {
    csvText = await fetchCsv(SHEET_CSV_URL);
  } catch (e) {
    console.error('Fetch failed:', e.message);
    process.exit(1);
  }
  const rows = parseCsv(csvText);
  const normalized = filterValidSchools(rows.map(normalizeRow));
  console.log('Raw CSV:', csvText.length, 'chars');
  console.log('Parsed', rows.length, 'rows,', normalized.length, 'schools with code.');
  if (rows.length > 0 && normalized.length < rows.length && normalized.length < 100) {
    const sample = rows.find((r) => !r.kodSekolah || !String(r.kodSekolah).trim());
    if (sample) {
      console.warn('Sample row without kodSekolah (will be skipped):', Object.keys(sample).slice(0, 5).join(', '), '...');
    }
  }

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: first 3 schools (no file written) ---\n');
    console.log(JSON.stringify(normalized.slice(0, 3), null, 2));
    console.log('\n--- Use without DRY_RUN to write data/schools.json ---');
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Wrote', OUTPUT_FILE);
}

main();
