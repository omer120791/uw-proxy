import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ בדיקה שהטוקן מוגדר
const UW_TOKEN = process.env.UW_TOKEN;
if (!UW_TOKEN) {
    console.error("⚠️ שגיאה: משתנה הסביבה UW_TOKEN לא מוגדר!");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

// 🔹 יצירת נתיב ייחודי ל-Dark Pool
app.get('/api/darkpool/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const apiUrl = `https://api.unusualwhales.com/api/darkpool/${ticker}`;

        console.log(`🔗 Fetching: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Authorization": `Bearer ${UW_TOKEN}` }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.error(`❌ Proxy error:`, err);
        res.status(500).json({ error: "
