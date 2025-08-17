const { google } = require('googleapis');
const fs = require('fs');

// Google Sheets API 認証
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json')); // ダウンロードしたJSON

const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: SCOPES
});

const sheets = google.sheets({ version: 'v4', auth });

// スプレッドシートから全英雄データを取得する関数
async function getHeroes(spreadsheetId, range) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    // 1行目をヘッダーとしてオブジェクトに変換
    const headers = rows[0];
    const heroes = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, idx) => {
            obj[header] = row[idx] || ''; // 空欄の場合は空文字
        });
        return obj;
    });

    return heroes; // [{名前: '関羽', 武力: '95', …}, …]
}

module.exports = { getHeroes };
