console.log('CREDENTIALS loaded:', !!process.env.GOOGLE_CREDENTIALS);
const { google } = require('googleapis');

// Railway用：環境変数から読み込む
const CREDENTIALS = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf-8')
);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const auth = new google.auth.GoogleAuth({ credentials: CREDENTIALS, scopes: SCOPES });
const sheets = google.sheets({ version: 'v4', auth });

async function getHeroes(spreadsheetId, range) {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];
    const headers = rows[0];
    return rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, idx) => obj[header] = row[idx] || '');
        return obj;
    });
}

module.exports = { getHeroes };
