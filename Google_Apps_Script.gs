/** ResumeLayer email waitlist -> Google Sheets. Deploy as a public web app. */
const SHEET_NAME = 'Waitlist';

function doPost(e) {
  let result = { type: 'resumelayer-waitlist', status: 'error', token: '' };
  try {
    const data = (e && e.parameter) || {};
    const token = String(data.request_token || '').slice(0, 100);
    result.token = token;
    // Bot honeypot. Pretend to succeed; avoid adding junk.
    if (data.website) {
      result.status = 'success';
      return respond(result);
    }
    const email = String(data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return respond(result);
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return respond(result);
    try {
      const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
      if (!spreadsheetId) throw new Error('SHEET_ID missing');
      const book = SpreadsheetApp.openById(spreadsheetId);
      let sheet = book.getSheetByName(SHEET_NAME);
      if (!sheet) {
        sheet = book.insertSheet(SHEET_NAME);
        sheet.appendRow(['Timestamp (UTC)', 'Email', 'Source']);
        sheet.setFrozenRows(1);
      }
      const last = sheet.getLastRow();
      if (last > 1) {
        const existing = sheet.getRange(2, 2, last - 1, 1).getDisplayValues();
        if (existing.some(row => String(row[0]).trim().toLowerCase() === email)) {
          result.status = 'duplicate';
          return respond(result);
        }
      }
      // Prefix formula-leading characters to keep spreadsheet cells safe.
      const safeEmail = /^[=+\-@]/.test(email) ? "'" + email : email;
      sheet.appendRow([new Date(), safeEmail, 'ResumeLayer website']);
      result.status = 'success';
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
  }
  return respond(result);
}

function respond(payload) {
  // Google Apps Script serves HtmlService responses from googleusercontent.com.
  // A hidden iframe sends this result back to the landing page.
  const encoded = JSON.stringify(payload).replace(/</g, '\\u003c');
  const html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + encoded + ', "*");' +
    '<' + '/script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
