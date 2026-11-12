# ResumeLayer — GitHub Pages + Google Sheets

## 1. Google Sheets (one-time setup)

1. Create a Google Sheet, e.g. **ResumeLayer Waitlist**.
2. Copy the spreadsheet ID from its URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
3. Open **Extensions → Apps Script** in your Google Sheet.
4. Replace the content of `Code.gs` with the full content of `Google_Apps_Script.gs` from this ZIP. Save.
5. In Apps Script, go to **Project Settings → Script properties → Add script property**:
   - Property: `SHEET_ID`
   - Value: your copied spreadsheet ID.
6. Select **Deploy → New deployment → Web app**. Choose:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone
   - Click **Deploy**, then approve the permissions Google requests.
7. Copy the **Web app URL**, ending in `/exec` (NOT the `/dev` test URL).
8. Open **waitlist-config.js** and replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL, keeping the quotation marks. Save.

IMPORTANT: The Google Sheet should stay private. The publicly deployed Apps Script URL accepts form submissions and writes them to your private Sheet; it does not grant visitors access to view the Sheet.

## 2. GitHub Pages

1. Create a **public** repository on GitHub (e.g. `resumelayer`).
2. Unzip this package and upload **the files inside this folder** directly to the repository root, not the ZIP itself.
3. Confirm that `index.html`, `_next/`, `.nojekyll`, `waitlist.js`, and `waitlist-config.js` are in the repository root.
4. Go to **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main**, **/(root)**, and Save.
5. Open `https://YOUR_USERNAME.github.io/resumelayer/` after GitHub confirms deployment.

## 3. Test your signup

1. Enter your own test email and click **Get early access**.
2. Expect **You're on the list!** only if the Apps Script returns a successful response.
3. Open your private Google Sheet and look for a **Waitlist** tab with a timestamp, email, and source.
4. Submit the same email again: you should get an **already on the list** message and no duplicate row.
5. Test from a phone/incognito window to verify the live site.

## Important notes

- The archive includes a **ready-to-connect** integration; it cannot save emails until you deploy your own Apps Script and place the /exec URL in `waitlist-config.js`.
- Publishing the site exposes its HTML, JavaScript, and the endpoint URL (normal for a public form), but not your spreadsheet ID or sheet contents, which live in Apps Script settings.
- A public form may be targeted by spam despite its basic honeypot; consider CAPTCHA / a managed forms provider if spam becomes an issue.
- Waitlist signups are not proof of willingness to pay; measure traffic sources and email conversion separately.
- Add a privacy policy and provide a real unsubscribe/opt-out process before running a larger campaign. Do not promise automated email updates unless you implement sending them.
- Keep your script owner account secured with 2FA and check Sheet access permissions.
- Apps Script deployments can require re-deployment after edits; use **Manage deployments → Edit → New version** if updating the script.


## Configured endpoint
The public Apps Script web-app URL is already set in `waitlist-config.js`. No need to edit it. Publish all site files to GitHub Pages and submit a test email; verify the `Waitlist` tab in Google Sheets.
