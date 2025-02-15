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

// ✅ פונקציה שמגבילה את כמות הנתונים המוחזרת ומאפשרת דפדוף
const limitResponseSize = (data, limit = 20, offset = 0) => {
    if (Array.isArray(data)) {
        return data.slice(offset, offset + limit); // מחזיר רק את החלק שביקש המשתמש
    }
    return data;
};

// ✅ רשימת ה-EndPoints הנתמכים
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

// ✅ יצירת הנתיבים הדינמיים בשרת עם תמיכה בסינון
endpoints.forEach(endpoint => {
    app.get(`/api/${endpoint}`, async (req, res) => {
        try {
            let apiUrl = `https://api.unusualwhales.com/api/${endpoint}`;

            // מחליף משתנים דינמיים (כגון :ticker ו-:id) בפרמטרים מהבקשה
            Object.keys(req.params).forEach(param => {
                apiUrl = apiUrl.replace(`:${param}`, req.params[param]);
            });

            console.log(`🔗 Fetching: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: { "Authorization": `Bearer ${UW_TOKEN}` }
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            let data = await response.json();

            // ✅ סינון חכם: משתמש יכול להגדיר limit ו-offset בבקשה
            const limit = parseInt(req.query.limit) || 20; // כברירת מחדל 20 תוצאות
            const offset = parseInt(req.query.offset) || 0; // ניתן לבקש דף שני וכו'
            data = limitResponseSize(data, limit, offset);

            res.status(response.status).json({
                results: data,
                limit,
                offset,
                next_offset: offset + limit, // למקרה שהמשתמש ירצה לבקש את ההמשך
            });
        } catch (err) {
            console.error(`❌ Proxy error:`, err);
            res.status(500).json({ error: "Proxy error: " + err.message });
        }
    });
});

// ✅ בריאות השרת
app.get("/", (req, res) => {
    res.j
