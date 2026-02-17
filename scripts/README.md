# Scripts: Sync schools from Google Sheet

## How to crawl and see the data locally

### 1. Use the default Google Sheet (no setup)

From the project root:

```bash
npm run sync-schools
```

This will:

1. **Fetch** the CSV export from the Google Sheet (public export URL in the script).
2. **Convert** it to JSON using the column mapping.
3. **Write** `data/schools.json`.

Then open or inspect the result:

```bash
# Pretty-print first 50 lines
head -n 50 data/schools.json

# Or run the app and browse
npm run dev
# Open http://localhost:3000/ms (or /en)
```

### 2. Use your own Google Sheet

1. **Share the sheet**  
   In Google Sheets: Share → “Anyone with the link” can **View** (so the export URL is public).

2. **Get the export URL**  
   - Format:  
     `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={SHEET_GID}`
   - From the sheet’s address bar:  
     `https://docs.google.com/spreadsheets/d/ABC123xyz/edit#gid=0`  
     → Spreadsheet ID = `ABC123xyz`, first sheet gid = `0`.

3. **Run the script with your URL** (from project root):

   **Linux / macOS (bash/zsh):**

   ```bash
   SHEET_CSV_URL='https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv&gid=0' npm run sync-schools
   ```

   **Windows (PowerShell):**

   ```powershell
   $env:SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv&gid=0"; npm run sync-schools
   ```

   **Windows (CMD):**

   ```cmd
   set SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_ID/export?format=csv^&gid=0
   npm run sync-schools
   ```

4. **Check the result**  
   Same as above: look at `data/schools.json` or run `npm run dev` and use the app.

### 3. Preview without writing to file (dry run)

To fetch and **only print** a summary + first few rows (no `data/schools.json` write):

```bash
DRY_RUN=1 npm run sync-schools
```

(Requires the script to support `DRY_RUN`; see below.)

---

## Column mapping

The script expects CSV columns that match the keys in `scripts/convert-csv-to-json.js` (`HEADER_MAP`). If your sheet uses different headers, either rename columns in the sheet or update `HEADER_MAP` in that script.

## Troubleshooting

- **Fetch failed / 403**  
  - Sheet must be “Anyone with the link can view” (or public).  
  - Use the **export** URL (`/export?format=csv&gid=...`), not the normal `/edit` URL.

- **Empty or wrong data**  
  - Check that the first row of the sheet is the header and that header names match (case-sensitive) those in `HEADER_MAP`.  
  - For another sheet tab, change `gid=` in the URL (e.g. `gid=0` for first tab, `gid=123` for another).

- **Run script directly**  
  ```bash
  node scripts/convert-csv-to-json.js
  ```
  With custom URL:
  ```bash
  SHEET_CSV_URL='https://...' node scripts/convert-csv-to-json.js
  ```
