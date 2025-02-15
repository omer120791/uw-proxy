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

// ✅ רשימת הנתיבים המלאים כולל darkpool
const endpoints = [
    "option-trades/flow-alerts",
    "stock/:ticker/option-contracts",
    "option-contract/:id/flow",
    "stock/:ticker/oi-change",
    "darkpool/recent",
    "darkpool/:ticker",
    "insider/:ticker/ticker-flow",
    "market/insider-buy-sells",
    "market/market-tide",
    "stock/:ticker/max-pain"
];

// ✅ יצירת נתיבים בשרת
endpoints.forEach(endpoint => {
    app.get(`/api/${endpoint}`, async (req, res) => {
        try {
            let apiUrl = `https://api.unusualwhales.com/api/${endpoint}`;

            // מחליף משתנים דינמיים (כגון :ticker ו-:id) בפרמטרים מהבקשה
            Object.keys(req.params).forEach(param => {
                apiUrl = apiUrl.replace(`:${param}`, req.params[param]);
            });

            console.log(`🔗 Fetching: ${apiUrl}`); // ✅ הדפסה לבדיקה

            const fetchOptions = {
                method: "GET",
                headers: { "Authorization": `Bearer ${UW_TOKEN}` }
            };

            const uwResponse = await fetch(apiUrl, fetchOptions);
            if (!uwResponse.ok) {
                throw new Error(`API request failed with status ${uwResponse.status}`);
            }

            const data = await uwResponse.json();
            res.status(uwResponse.status).json(data);
        } catch (err) {
            console.error(`❌ Proxy error on ${endpoint}:`, err);
            res.status(500).json({ error: "Proxy error: " + err.message });
        }
    });
});

// ✅ בריאות השרת
app.get("/", (req, res) => {
    res.json({ status: "✅ Proxy is running!" });
});

// ✅ הפעלת השרת
app.listen(PORT, () => {
    console.log(`🚀 Proxy server running on port ${PORT}`);
});
